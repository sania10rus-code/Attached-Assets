/**
 * Secure Storage layer.
 *
 * Strategy (PWA-friendly, no Capacitor available in this environment):
 *  - Async API: AES-GCM via Web Crypto SubtleCrypto. Master key is generated
 *    once and stored as a non-extractable CryptoKey in IndexedDB. Used for the
 *    auth user blob (token equivalent).
 *  - Sync API: XOR-stream obfuscation against a 256-bit master key persisted
 *    in localStorage. Used for synchronous storage paths (per-login app data
 *    containing VIN). Adequate "encrypted-at-rest" for a demo PWA; on real
 *    devices wrap this module with Capacitor SecureStorage for hardware-backed
 *    protection.
 */

const MK_KEY = "__onix_mk_v1";
const IDB_NAME = "onix-secure";
const IDB_STORE = "keys";
const IDB_KEY_NAME = "master-aes-gcm";
const VERSION_PREFIX = "ENC1:";

// ===== Sync XOR layer =====

function getOrCreateSyncMasterKey(): Uint8Array {
  if (typeof window === "undefined") return new Uint8Array(32);
  const existing = window.localStorage.getItem(MK_KEY);
  if (existing) {
    try {
      return Uint8Array.from(atob(existing), (c) => c.charCodeAt(0));
    } catch {
      // fall through to regenerate
    }
  }
  const fresh = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(fresh);
  } else {
    for (let i = 0; i < fresh.length; i++) fresh[i] = Math.floor(Math.random() * 256);
  }
  window.localStorage.setItem(MK_KEY, btoa(String.fromCharCode(...fresh)));
  return fresh;
}

function xorStream(input: Uint8Array, key: Uint8Array): Uint8Array {
  const out = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++) out[i] = input[i] ^ key[i % key.length];
  return out;
}

function toB64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromB64(s: string): Uint8Array {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

export function secureSetSync(key: string, value: string): void {
  if (typeof window === "undefined") return;
  const mk = getOrCreateSyncMasterKey();
  const bytes = new TextEncoder().encode(value);
  const enc = xorStream(bytes, mk);
  window.localStorage.setItem(key, VERSION_PREFIX + toB64(enc));
}

export function secureGetSync(key: string): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (raw === null) return null;
  if (!raw.startsWith(VERSION_PREFIX)) {
    // One-time migration: re-write legacy plaintext through the secure
    // wrapper immediately so the next read goes through the encrypted path.
    try {
      secureSetSync(key, raw);
    } catch {
      // ignore — return the value so existing flows still work this tick.
    }
    return raw;
  }
  try {
    const mk = getOrCreateSyncMasterKey();
    const enc = fromB64(raw.slice(VERSION_PREFIX.length));
    const dec = xorStream(enc, mk);
    return new TextDecoder().decode(dec);
  } catch {
    return null;
  }
}

export function secureRemoveSync(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

// ===== Async AES-GCM via Web Crypto + IndexedDB =====

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(name: string): Promise<T | undefined> {
  const db = await openIdb();
  return new Promise<T | undefined>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(name);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(name: string, value: unknown): Promise<void> {
  const db = await openIdb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(value, name);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

let cachedAesKey: CryptoKey | null = null;

async function getAesKey(): Promise<CryptoKey | null> {
  if (cachedAesKey) return cachedAesKey;
  if (typeof window === "undefined" || !window.crypto?.subtle || !window.indexedDB) return null;
  try {
    const existing = await idbGet<CryptoKey>(IDB_KEY_NAME);
    if (existing) {
      cachedAesKey = existing;
      return existing;
    }
    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, [
      "encrypt",
      "decrypt",
    ]);
    await idbPut(IDB_KEY_NAME, key);
    cachedAesKey = key;
    return key;
  } catch {
    return null;
  }
}

export async function secureSet(key: string, value: string): Promise<void> {
  if (typeof window === "undefined") return;
  const aes = await getAesKey();
  if (!aes) {
    secureSetSync(key, value);
    return;
  }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aes, new TextEncoder().encode(value)),
  );
  const combined = new Uint8Array(iv.length + ct.length);
  combined.set(iv, 0);
  combined.set(ct, iv.length);
  window.localStorage.setItem(key, "AESG1:" + toB64(combined));
}

export async function secureGet(
  key: string,
  options: { allowPlaintextLegacy?: boolean } = {},
): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (raw === null) return null;
  if (raw.startsWith("AESG1:")) {
    const aes = await getAesKey();
    if (!aes) return null;
    try {
      const combined = fromB64(raw.slice("AESG1:".length));
      const iv = combined.slice(0, 12);
      const ct = combined.slice(12);
      const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aes, ct);
      return new TextDecoder().decode(pt);
    } catch {
      return null;
    }
  }
  if (raw.startsWith(VERSION_PREFIX)) return secureGetSync(key);
  if (options.allowPlaintextLegacy) {
    // Caller opted in to one-time legacy migration: read plaintext, then
    // immediately re-encrypt and overwrite.
    void secureSet(key, raw);
    return raw;
  }
  // Refuse to leak plaintext for callers that demanded encrypted storage.
  // Treat unprefixed legacy values as missing and erase them.
  window.localStorage.removeItem(key);
  return null;
}

export function secureRemove(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}
