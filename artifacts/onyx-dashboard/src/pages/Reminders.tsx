import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Droplet, Disc3, Zap, Wrench, Filter, AlertTriangle } from "lucide-react";
import { loadAppData, formatMileage, formatDateRu, type Reminder, type Urgency, type Telemetry } from "@/lib/storage";

const urgencyMeta: Record<Urgency, { label: string; chip: string; bar: string; iconWrap: string; icon: string; cardBorder: string; due: string }> = {
  high: {
    label: "Срочно",
    chip: "bg-primary/15 text-primary border-primary/30",
    bar: "bg-primary",
    iconWrap: "bg-primary/20",
    icon: "text-primary",
    cardBorder: "border-primary/30",
    due: "text-primary text-glow",
  },
  medium: {
    label: "Скоро",
    chip: "bg-amber-400/15 text-amber-400 border-amber-400/30",
    bar: "bg-amber-400",
    iconWrap: "bg-amber-400/15",
    icon: "text-amber-400",
    cardBorder: "border-white/5",
    due: "text-amber-400",
  },
  low: {
    label: "Запланировано",
    chip: "bg-white/10 text-muted-foreground border-white/10",
    bar: "bg-white/40",
    iconWrap: "bg-white/10",
    icon: "text-muted-foreground",
    cardBorder: "border-white/5",
    due: "text-muted-foreground",
  },
};

function pickIcon(text: string) {
  const t = text.toLowerCase();
  if (t.includes("масл")) return Droplet;
  if (t.includes("колод")) return Disc3;
  if (t.includes("свеч")) return Zap;
  if (t.includes("ремн") || t.includes("грм")) return Wrench;
  if (t.includes("фильтр")) return Filter;
  if (t.includes("тормозной жидкости")) return AlertTriangle;
  return Wrench;
}

function dueText(r: Reminder, mileage: number): string {
  if (r.dueMileage != null) {
    const km = r.dueMileage - mileage;
    if (km <= 0) return "просрочено";
    return `через ${formatMileage(km)} км`;
  }
  if (r.dueDate) {
    return `до ${formatDateRu(r.dueDate)}`;
  }
  return "";
}

function progressFor(r: Reminder, mileage: number): number {
  if (r.dueMileage != null && r.interval > 0) {
    const remaining = r.dueMileage - mileage;
    const used = r.interval - remaining;
    const pct = Math.max(0, Math.min(100, (used / r.interval) * 100));
    return pct;
  }
  if (r.dueDate) {
    const now = Date.now();
    const due = new Date(r.dueDate).getTime();
    const yearMs = 365 * 24 * 3600 * 1000;
    const totalMs = (r.interval || 1) * yearMs;
    const remaining = due - now;
    const used = totalMs - remaining;
    return Math.max(0, Math.min(100, (used / totalMs) * 100));
  }
  return 0;
}

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);

  useEffect(() => {
    const data = loadAppData();
    const order: Record<Urgency, number> = { high: 0, medium: 1, low: 2 };
    setReminders([...data.reminders].sort((a, b) => order[a.urgency] - order[b.urgency]));
    setTelemetry(data.telemetry);
  }, []);

  if (!telemetry) return null;

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
          const Icon = pickIcon(r.text);
          const due = dueText(r, telemetry.mileage);
          const pct = progressFor(r, telemetry.mileage);
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
                  <Icon size={20} className={m.icon} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <h3 className="font-semibold text-sm leading-tight">{r.text}</h3>
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.chip} shrink-0`}>
                      {m.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {r.dueMileage != null
                      ? `Регламент: каждые ${formatMileage(r.interval)} км`
                      : `Регламент: каждые ${r.interval} года`}
                  </p>

                  <div className="mt-3">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Остаток ресурса</span>
                      <span className={`text-xs font-mono font-medium ${m.due}`}>{due}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
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
