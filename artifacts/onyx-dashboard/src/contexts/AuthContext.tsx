import React, { createContext, useContext, useEffect, useState } from "react";
import { type AuthUser, loadUser, saveUser, clearUser, tryLogin } from "@/lib/auth";

type Ctx = {
  user: AuthUser | null;
  login: (login: string, password: string) => string | null;
  logout: () => void;
};

const AuthCtx = createContext<Ctx>({
  user: null,
  login: () => "Не инициализировано",
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(loadUser());
  }, []);

  const ctx: Ctx = {
    user,
    login: (loginVal, password) => {
      const u = tryLogin(loginVal.trim(), password);
      if (!u) return "Неверный логин или пароль";
      saveUser(u);
      setUser(u);
      return null;
    },
    logout: () => {
      clearUser();
      setUser(null);
    },
  };

  return <AuthCtx.Provider value={ctx}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
