import { CARS } from "@/lib/cars";
import { secureSet, secureGet, secureRemove } from "@/lib/secureStorage";

const KEY = "onix_auth_v1";
const LAST_LOGIN_KEY = "onix_last_login_v1";
// Plaintext session pointer: just {login, role}. The full encrypted user
// blob (with display name etc.) lives in secure storage under KEY. The
// pointer lets synchronous storage code resolve the current owner namespace
// without awaiting decryption.
const SESSION_POINTER_KEY = "onix_session_v1";

export type Role = "owner" | "mechanic";

export type AuthUser = {
  role: Role;
  login: string;
  name: string;
  org?: string;
};

const ownerCreds: Record<string, { password: string; user: AuthUser }> = Object.fromEntries(
  CARS.map((c) => [
    c.login,
    {
      password: c.password,
      user: { role: "owner" as const, login: c.login, name: c.ownerName },
    },
  ]),
);

const credentials: Record<string, { password: string; user: AuthUser }> = {
  ...ownerCreds,
  "11111": {
    password: "11111",
    user: { role: "mechanic", login: "11111", name: "Алексей Смирнов", org: "ОНИКС-СЕРВИС СПб" },
  },
};

export function tryLogin(login: string, password: string): AuthUser | null {
  const cred = credentials[login];
  if (cred && cred.password === password) return cred.user;
  return null;
}

export function userByLogin(login: string): AuthUser | null {
  return credentials[login]?.user ?? null;
}

export async function loadUser(): Promise<AuthUser | null> {
  if (typeof window === "undefined") return null;
  try {
    // Allow one-time legacy plaintext migration: any plaintext blob is
    // re-encrypted in place and the value is then forgotten by the wrapper.
    const raw = await secureGet(KEY, { allowPlaintextLegacy: true });
    if (!raw) return null;
    const u = JSON.parse(raw) as AuthUser;
    // Refresh the session pointer in case it was lost / out of date.
    if (u?.login && u?.role) {
      window.localStorage.setItem(
        SESSION_POINTER_KEY,
        JSON.stringify({ login: u.login, role: u.role }),
      );
    }
    return u;
  } catch {
    return null;
  }
}

export async function saveUser(u: AuthUser): Promise<void> {
  await secureSet(KEY, JSON.stringify(u));
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LAST_LOGIN_KEY, u.login);
    window.localStorage.setItem(
      SESSION_POINTER_KEY,
      JSON.stringify({ login: u.login, role: u.role }),
    );
  }
}

export function clearUser(): void {
  secureRemove(KEY);
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_POINTER_KEY);
  }
}

export function getLastLogin(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_LOGIN_KEY);
}

export function getSessionPointer(): { login: string; role: Role } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_POINTER_KEY);
    return raw ? (JSON.parse(raw) as { login: string; role: Role }) : null;
  } catch {
    return null;
  }
}

export function detectRole(identifier: string): Role | null {
  const id = identifier.trim();
  if (!id) return null;
  if (id === "11111") return "mechanic";
  if (CARS.some((c) => c.login === id)) return "owner";
  return null;
}
