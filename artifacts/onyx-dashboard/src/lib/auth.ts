const KEY = "onix_auth_v1";

export type Role = "owner" | "mechanic";

export type AuthUser = {
  role: Role;
  login: string;
  name: string;
  org?: string;
};

const credentials: Record<string, { password: string; user: AuthUser }> = {
  "0000": {
    password: "0000",
    user: { role: "owner", login: "0000", name: "Иван Петров" },
  },
  "11111": {
    password: "11111",
    user: { role: "mechanic", login: "11111", name: "Алексей Смирнов", org: "ОНИКС-СЕРВИС СПб" },
  },
};

export function detectRole(login: string): Role {
  if (login === "0000") return "owner";
  if (login === "11111") return "mechanic";
  if (login.toUpperCase().startsWith("ONX-")) return "mechanic";
  if (login.length === 17) return "owner";
  return "owner";
}

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
