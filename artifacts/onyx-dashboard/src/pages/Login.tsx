import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Zap, User, Lock, LogIn, ShieldCheck, Wrench } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { detectRole } from "@/lib/auth";

export default function Login() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const detectedRole = useMemo(
    () => (identifier.trim().length > 0 ? detectRole(identifier.trim()) : null),
    [identifier],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = login(identifier, password);
    if (err) setError(err);
  };

  return (
    <div
      className="min-h-[100dvh] w-full flex items-center justify-center px-6 py-10"
      style={{ backgroundColor: "#0b0e14" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <Zap size={32} className="text-primary" strokeWidth={2.5} fill="currentColor" />
            <span className="text-3xl font-bold tracking-tight text-glow">ОНИКС</span>
          </div>
          <p className="text-[11px] tracking-widest uppercase text-muted-foreground font-mono">
            Вход в систему
          </p>
        </div>

        <form onSubmit={submit} className="glass-card rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-2">
              Идентификатор / VIN
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="0000 / VIN / ONX-..."
                autoCapitalize="characters"
                autoComplete="off"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-sm font-mono outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-2">
              Пароль
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••"
                autoComplete="current-password"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-sm font-mono outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {detectedRole && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-white/5 rounded-xl px-3 py-2">
              {detectedRole === "owner" ? (
                <ShieldCheck size={14} className="text-primary" />
              ) : (
                <Wrench size={14} className="text-primary" />
              )}
              <span>
                Определено как:{" "}
                <span className="text-foreground font-medium">
                  {detectedRole === "owner" ? "Владелец" : "Механик / организация"}
                </span>
              </span>
            </div>
          )}

          {error && (
            <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
          >
            <LogIn size={16} />
            Войти
          </button>
        </form>

        <div className="mt-4 px-1 text-[10px] text-muted-foreground/70 leading-relaxed font-mono">
          Тестовые данные:
          <br />
          0000 / 0000 — Skoda Octavia (Иван Петров)
          <br />
          2222 / 2222 — Audi A6 (Сергей Иванов)
          <br />
          3333 / 3333 — BMW X5 (Дмитрий Соколов)
          <br />
          11111 / 11111 — Механик (Алексей Смирнов)
        </div>
      </motion.div>
    </div>
  );
}
