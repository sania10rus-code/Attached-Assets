import React, { createContext, useContext, useEffect, useState } from "react";
import {
  type AuthUser,
  loadUser,
  saveUser,
  clearUser,
  tryLogin,
  userByLogin,
} from "@/lib/auth";

type Ctx = {
  user: AuthUser | null;
  ready: boolean;
  justLoggedIn: boolean;
  login: (login: string, password: string) => Promise<string | null>;
  loginAs: (login: string) => Promise<string | null>;
  logout: () => void;
  markOnboardingDone: () => void;
};

const AuthCtx = createContext<Ctx>({
  user: null,
  ready: false,
  justLoggedIn: false,
  login: async () => "Не инициализировано",
  loginAs: async () => "Не инициализировано",
  logout: () => {},
  markOnboardingDone: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await loadUser();
        setUser(u);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const resetRoute = () => {
    if (typeof window === "undefined") return;
    const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") || "/";
    window.history.replaceState(null, "", base + "/");
  };

  const ctx: Ctx = {
    user,
    ready,
    justLoggedIn,
    login: async (loginVal, password) => {
      const u = tryLogin(loginVal.trim(), password);
      if (!u) return "Неверный логин или пароль";
      await saveUser(u);
      resetRoute();
      setUser(u);
      setJustLoggedIn(true);
      return null;
    },
    loginAs: async (loginVal) => {
      const u = userByLogin(loginVal);
      if (!u) return "Профиль не найден";
      await saveUser(u);
      resetRoute();
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
