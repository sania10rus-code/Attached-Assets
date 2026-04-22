import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Wrench, ShieldCheck, Thermometer } from "lucide-react";

const reminders = [
  { id: 1, title: "Замена масла", desc: "Двигатель", due: "через 5 000 км", icon: Wrench, urgent: true },
  { id: 2, title: "Тормозные колодки", desc: "Передняя ось", due: "через 12 000 км", icon: AlertTriangle, urgent: false },
  { id: 3, title: "Плановое ТО", desc: "ОНИКС-СЕРВИС", due: "Октябрь 2026", icon: ShieldCheck, urgent: false },
  { id: 4, title: "Антифриз", desc: "Проверка уровня", due: "через 20 000 км", icon: Thermometer, urgent: false },
];

export default function Reminders() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-12 min-h-full"
    >
      <h1 className="text-2xl font-bold mb-6">Напоминания</h1>

      <div className="space-y-4">
        {reminders.map((r, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            key={r.id}
            className={`glass-card rounded-2xl p-4 flex items-center gap-4 ${r.urgent ? 'border-primary/30 bg-primary/5' : 'border-white/5'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${r.urgent ? 'bg-primary/20' : 'bg-white/10'}`}>
              <r.icon size={22} className={r.urgent ? 'text-primary' : 'text-muted-foreground'} />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{r.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
            </div>
            
            <div className={`text-xs font-mono font-medium text-right ${r.urgent ? 'text-primary text-glow' : 'text-muted-foreground'}`}>
              {r.due}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
