import React, { createContext, useContext, useEffect, useState } from "react";
import { type AuthUser, loadUser, saveUser, clearUser, tryLogin } from "@/lib/auth";

type Ctx = {
  user: AuthUser | null;
  justLoggedIn: boolean;
  login: (login: string, password: string) => string | null;
  logout: () => void;
  markOnboardingDone: () => void;
};

const AuthCtx = createContext<Ctx>({
  user: null,
  justLoggedIn: false,
  login: () => "Не инициализировано",
  logout: () => {},
  markOnboardingDone: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    setUser(loadUser());
  }, []);

  const ctx: Ctx = {
    user,
    justLoggedIn,
    login: (loginVal, password) => {
      const u = tryLogin(loginVal.trim(), password);
      if (!u) return "Неверный логин или пароль";
      saveUser(u);
      setUser(u);
      setJustLoggedIn(true);
      return null;
    },
    logout: () => {
      clearUser();
      setUser(null);
      setJustLoggedIn(false);
    },
    markOnboardingDone: () => setJustLoggedIn(false),
  };

  return <AuthCtx.Provider value={ctx}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
