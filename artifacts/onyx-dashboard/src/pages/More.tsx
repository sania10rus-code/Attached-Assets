import React from "react";
import { motion } from "framer-motion";
import { Car, Shield, Info, LogOut, User, BellRing } from "lucide-react";

export default function More() {
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
          <h2 className="font-bold">Алексей С.</h2>
          <p className="text-xs text-muted-foreground mt-1">ОНИКС Premium</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">Автомобиль</h3>
          <div className="glass-card rounded-2xl overflow-hidden border-white/5">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Car size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium">Audi A6 (2022)</span>
              </div>
            </div>
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-sm text-muted-foreground pl-8">VIN</span>
              <span className="text-sm font-mono">WAUZZZ4G8ENXXXXXX</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground pl-8">Гос. номер</span>
              <span className="text-sm font-mono border border-white/20 px-2 py-0.5 rounded bg-white/5">А 123 АА 777</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">Приложение</h3>
          <div className="glass-card rounded-2xl overflow-hidden border-white/5">
            <button className="w-full p-4 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left">
              <BellRing size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium flex-1">Уведомления</span>
            </button>
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

        <button className="w-full glass-card border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium transition-colors mt-8">
          <LogOut size={18} />
          <span>Выйти из аккаунта</span>
        </button>
      </div>
      
      <div className="h-12" /> {/* Extra bottom padding */}
    </motion.div>
  );
}
