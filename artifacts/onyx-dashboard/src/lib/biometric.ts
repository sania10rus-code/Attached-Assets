/**
 * Biometric authentication via WebAuthn (platform authenticator).
 *
 * Stores the registered credential id per login in localStorage. The actual
 * private key never leaves the secure enclave / TPM.
 */

const KEY = "onix_biometric_v1";

export type BiometricRecord = {
  login: string;
  credentialId: string; // base64url
  createdAt: string;
};

function readAll(): BiometricRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BiometricRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: BiometricRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export async function isBiometricSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!window.PublicKeyCredential) return false;
  try {
    const fn = (PublicKeyCredential as unknown as {
      isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean>;
    }).isUserVerifyingPlatformAuthenticatorAvailable;
    if (!fn) return false;
    return await fn.call(PublicKeyCredential);
  } catch {
    return false;
  }
}

export function isBiometricEnabled(login: string): boolean {
  return readAll().some((r) => r.login === login);
}

export function listBiometricLogins(): string[] {
  return readAll().map((r) => r.login);
}

function b64urlEncode(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): ArrayBuffer {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const norm = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(norm);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

const RP_ID = typeof window !== "undefined" ? window.location.hostname : "localhost";
const RP_NAME = "ОНИКС";

export async function enableBiometric(login: string, displayName: string): Promise<void> {
  if (typeof window === "undefined") throw new Error("no window");
  if (!window.PublicKeyCredential) throw new Error("WebAuthn недоступен в этом браузере");

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = new TextEncoder().encode(`onix-${login}`);

  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { id: RP_ID, name: RP_NAME },
      user: { id: userId, name: login, displayName },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!cred) throw new Error("Регистрация биометрии отменена");

  const list = readAll().filter((r) => r.login !== login);
  list.push({
    login,
    credentialId: b64urlEncode(cred.rawId),
    createdAt: new Date().toISOString(),
  });
  writeAll(list);
}

export function disableBiometric(login: string): void {
  writeAll(readAll().filter((r) => r.login !== login));
}

export async function verifyBiometric(login: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!window.PublicKeyCredential) return false;
  const rec = readAll().find((r) => r.login === login);
  if (!rec) return false;
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const result = (await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: RP_ID,
        allowCredentials: [
          {
            type: "public-key",
            id: b64urlDecode(rec.credentialId),
            transports: ["internal"],
          },
        ],
        userVerification: "required",
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;
    return !!result;
  } catch {
    return false;
  }
}
