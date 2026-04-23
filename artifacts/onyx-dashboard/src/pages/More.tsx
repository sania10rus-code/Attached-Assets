import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Car,
  Shield,
  Info,
  LogOut,
  User,
  BellRing,
  FileText,
  Wrench,
  ChevronRight,
  Fingerprint,
  Lock,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import {
  isBiometricSupported,
  isBiometricEnabled,
  enableBiometric,
  disableBiometric,
} from "@/lib/biometric";
import { isSecureContext } from "@/lib/security";
import { revokePolicy } from "@/lib/privacy";
import PrivacyPolicy from "@/pages/PrivacyPolicy";

export default function More() {
  const { ownerName, ownerPhone, carModel, carYear, carVin, carPlate } = useAppData();
  const { logout, user } = useAuth();
  const [showPolicy, setShowPolicy] = useState(false);
  const [bioSupported, setBioSupported] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  const secure = isSecureContext();

  useEffect(() => {
    isBiometricSupported().then(setBioSupported);
    if (user) setBioEnabled(isBiometricEnabled(user.login));
  }, [user]);

  const toggleBio = async () => {
    if (!user) return;
    setBioError(null);
    setBioBusy(true);
    try {
      if (bioEnabled) {
        disableBiometric(user.login);
        setBioEnabled(false);
      } else {
        await enableBiometric(user.login, user.name);
        setBioEnabled(true);
      }
    } catch (e) {
      setBioError(e instanceof Error ? e.message : "Не удалось настроить биометрию");
    } finally {
      setBioBusy(false);
    }
  };

  if (showPolicy) {
    return <PrivacyPolicy mode="view" onClose={() => setShowPolicy(false)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-12 min-h-full"
    >
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>

      <div className="glass-card rounded-2xl p-5 border-white/5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
          <User size={24} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold">{ownerName}</h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{ownerPhone}</p>
          {user && (
            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest mt-0.5">
              ОНИКС · {user.role === "owner" ? "Владелец" : "Механик"}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">
            Разделы
          </h3>
          <div className="glass-card rounded-2xl overflow-hidden border-white/5">
            <NavRow href="/reminders" icon={BellRing} label="Напоминания" />
            <NavRow href="/parts" icon={Wrench} label="Запчасти" />
            <NavRow href="/orders" icon={FileText} label="Заказ-наряды" />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">
            Автомобиль
          </h3>
          <div className="glass-card rounded-2xl overflow-hidden border-white/5">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Car size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium">
                  {carModel} ({carYear})
                </span>
              </div>
            </div>
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-sm text-muted-foreground pl-8">VIN</span>
              <span className="text-sm font-mono">{carVin}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground pl-8">Гос. номер</span>
              <span className="text-sm font-mono border border-white/20 px-2 py-0.5 rounded bg-white/5">
                {carPlate}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">
            Безопасность
          </h3>
          <div className="glass-card rounded-2xl overflow-hidden border-white/5">
            <div className="p-4 border-b border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Fingerprint size={18} className="text-muted-foreground" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">Вход по биометрии</div>
                  <div className="text-[11px] text-muted-foreground">
                    {bioSupported
                      ? "Face ID / Touch ID для быстрого входа"
                      : "Биометрия недоступна на этом устройстве"}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleBio}
                disabled={!bioSupported || bioBusy}
                data-testid="more-biometric-toggle"
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors disabled:opacity-50 ${
                  bioEnabled
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-white/5 border-white/15 text-muted-foreground"
                }`}
              >
                {bioBusy ? "…" : bioEnabled ? "Включено" : "Включить"}
              </button>
            </div>
            {bioError && (
              <div className="px-4 pb-3 text-[11px] text-red-400">{bioError}</div>
            )}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {secure ? (
                  <ShieldCheck size={18} className="text-green-400" />
                ) : (
                  <ShieldAlert size={18} className="text-red-400" />
                )}
                <div>
                  <div className="text-sm font-medium">Защищённое соединение</div>
                  <div className="text-[11px] text-muted-foreground">
                    {secure ? "HTTPS активен" : "Соединение не защищено — HTTPS отсутствует"}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 flex items-center gap-3">
              <Lock size={18} className="text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Защищённое хранилище</div>
                <div className="text-[11px] text-muted-foreground">
                  Токен и VIN зашифрованы (AES-GCM / Secure Storage)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">
            Приложение
          </h3>
          <div className="glass-card rounded-2xl overflow-hidden border-white/5">
            <button
              onClick={() => setShowPolicy(true)}
              data-testid="more-policy"
              className="w-full p-4 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
            >
              <Shield size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium flex-1">Политика конфиденциальности</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <button
              onClick={() => {
                if (!user) return;
                if (!confirm("Отозвать согласие? При следующем входе экран политики появится снова.")) return;
                revokePolicy(user.login);
                logout();
              }}
              data-testid="more-policy-revoke"
              className="w-full p-4 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
            >
              <ShieldAlert size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium flex-1">Отозвать согласие</span>
            </button>
            <button className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left">
              <Info size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium flex-1">О сервисе ОНИКС</span>
              <span className="text-xs text-muted-foreground">v2.1.0</span>
            </button>
          </div>
        </div>

        <button
          onClick={logout}
          data-testid="more-logout"
          className="w-full glass-card border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium transition-colors mt-8"
        >
          <LogOut size={18} />
          <span>Выйти из аккаунта</span>
        </button>
      </div>

      <div className="h-12" />
    </motion.div>
  );
}

function NavRow({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="w-full p-4 border-b last:border-b-0 border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
    >
      <Icon size={18} className="text-muted-foreground" />
      <span className="text-sm font-medium flex-1">{label}</span>
      <ChevronRight size={16} className="text-muted-foreground" />
    </Link>
  );
}
