import React from "react";
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
} from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";

export default function More() {
  const { ownerName, ownerPhone, carModel, carYear, carVin, carPlate } = useAppData();
  const { logout, user } = useAuth();

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
            Приложение
          </h3>
          <div className="glass-card rounded-2xl overflow-hidden border-white/5">
            <button className="w-full p-4 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left">
              <Shield size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium flex-1">Конфиденциальность</span>
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
