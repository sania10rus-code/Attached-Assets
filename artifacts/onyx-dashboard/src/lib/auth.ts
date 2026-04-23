import { CARS } from "@/lib/cars";

const KEY = "onix_auth_v1";

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

export function loadUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function saveUser(u: AuthUser): void {
  window.localStorage.setItem(KEY, JSON.stringify(u));
}

export function clearUser(): void {
  window.localStorage.removeItem(KEY);
}

export function detectRole(identifier: string): Role | null {
  const id = identifier.trim();
  if (!id) return null;
  if (id === "11111") return "mechanic";
  if (CARS.some((c) => c.login === id)) return "owner";
  return null;
}
