import React from "react";
import { motion } from "framer-motion";
import { Droplet, Disc3, Zap, LogOut, CalendarClock } from "lucide-react";

type Urgency = "high" | "medium" | "low";

type Reminder = {
  id: number;
  title: string;
  desc: string;
  due: string;
  progress: number; // 0-100, higher = more urgent
  urgency: Urgency;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const reminders: Reminder[] = [
  {
    id: 1,
    title: "Замена масла",
    desc: "Двигатель · Castrol Edge 5W-30",
    due: "через 5 000 км",
    progress: 85,
    urgency: "high",
    icon: Droplet,
  },
  {
    id: 2,
    title: "Замена тормозных колодок",
    desc: "Передняя ось · TRW",
    due: "через 2 000 км",
    progress: 92,
    urgency: "high",
    icon: Disc3,
  },
  {
    id: 3,
    title: "Замена свечей",
    desc: "4 шт. · NGK Iridium",
    due: "через 7 000 км",
    progress: 60,
    urgency: "medium",
    icon: Zap,
  },
  {
    id: 4,
    title: "Выезд из дилера",
    desc: "Москва · отметка пробега",
    due: "52 560 км",
    progress: 30,
    urgency: "low",
    icon: LogOut,
  },
  {
    id: 5,
    title: "Запишитесь в сервис",
    desc: "21 день после ТО · ОНИКС-СЕРВИС",
    due: "через 21 день",
    progress: 70,
    urgency: "medium",
    icon: CalendarClock,
  },
];

const urgencyMeta: Record<Urgency, { label: string; chip: string; bar: string; iconWrap: string; icon: string; cardBorder: string }> = {
  high: {
    label: "Срочно",
    chip: "bg-primary/15 text-primary border-primary/30",
    bar: "bg-primary",
    iconWrap: "bg-primary/20",
    icon: "text-primary",
    cardBorder: "border-primary/30",
  },
  medium: {
    label: "Скоро",
    chip: "bg-amber-400/15 text-amber-400 border-amber-400/30",
    bar: "bg-amber-400",
    iconWrap: "bg-amber-400/15",
    icon: "text-amber-400",
    cardBorder: "border-white/5",
  },
  low: {
    label: "Запланировано",
    chip: "bg-white/10 text-muted-foreground border-white/10",
    bar: "bg-white/40",
    iconWrap: "bg-white/10",
    icon: "text-muted-foreground",
    cardBorder: "border-white/5",
  },
};

export default function Reminders() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-12 min-h-full"
    >
      <h1 className="text-2xl font-bold mb-1">Напоминания</h1>
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">Регламентные работы</p>

      <div className="space-y-3">
        {reminders.map((r, i) => {
          const m = urgencyMeta[r.urgency];
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              key={r.id}
              className={`glass-card rounded-2xl p-4 ${m.cardBorder}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${m.iconWrap}`}>
                  <r.icon size={20} className={m.icon} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <h3 className="font-semibold text-sm leading-tight">{r.title}</h3>
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.chip} shrink-0`}>
                      {m.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{r.desc}</p>

                  <div className="mt-3">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Остаток ресурса</span>
                      <span className={`text-xs font-mono font-medium ${r.urgency === "high" ? "text-primary text-glow" : r.urgency === "medium" ? "text-amber-400" : "text-muted-foreground"}`}>
                        {r.due}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.07, ease: "easeOut" }}
                        className={`h-full rounded-full ${m.bar}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
