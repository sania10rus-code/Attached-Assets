import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Wrench, AlertOctagon, Disc3, AlertTriangle, Key, Droplet } from "lucide-react";
import { loadAppData, formatMileage, formatDateRu, type HistoryEvent, type HistoryIcon } from "@/lib/storage";

type Tone = "neutral" | "primary" | "warn" | "danger" | "ok";

const iconMap: Record<HistoryIcon, React.ComponentType<{ size?: number; className?: string }>> = {
  wrench: Wrench,
  "car-crash": AlertOctagon,
  brake: Disc3,
  engine: AlertTriangle,
  key: Key,
  oil: Droplet,
};

const toneByType = (type: string): Tone => {
  if (type === "ДТП") return "danger";
  if (type === "Ошибка") return "warn";
  if (type === "Покупка") return "ok";
  if (type === "ТО") return "primary";
  return "neutral";
};

const toneStyles: Record<Tone, { dot: string; iconWrap: string; icon: string; chip: string }> = {
  neutral: { dot: "bg-white/40", iconWrap: "bg-white/10", icon: "text-foreground", chip: "text-muted-foreground" },
  primary: { dot: "bg-primary", iconWrap: "bg-primary/20", icon: "text-primary", chip: "text-primary" },
  warn: { dot: "bg-amber-400", iconWrap: "bg-amber-400/15", icon: "text-amber-400", chip: "text-amber-400" },
  danger: { dot: "bg-red-500", iconWrap: "bg-red-500/15", icon: "text-red-500", chip: "text-red-500" },
  ok: { dot: "bg-green-500", iconWrap: "bg-green-500/15", icon: "text-green-500", chip: "text-green-500" },
};

export default function History() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);

  useEffect(() => {
    const data = loadAppData();
    const sorted = [...data.history].sort((a, b) => b.date.localeCompare(a.date));
    setEvents(sorted);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-12 min-h-full"
    >
      <h1 className="text-2xl font-bold mb-1">История</h1>
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">События автомобиля</p>

      <div className="relative border-l border-white/10 ml-3 space-y-6 pb-4">
        {events.map((item, i) => {
          const tone = toneByType(item.type);
          const t = toneStyles[tone];
          const Icon = iconMap[item.icon] ?? Wrench;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              key={`${item.date}-${i}`}
              className="relative pl-6"
            >
              <div className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full ${t.dot}`} />

              <div className="text-[11px] font-mono text-muted-foreground mb-1.5 tracking-wider">
                {formatDateRu(item.date)}
              </div>

              <div className="glass-card rounded-2xl p-4 border-white/5">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.iconWrap}`}>
                    <Icon size={18} className={t.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm leading-tight">{item.desc}</h3>
                      <span className={`text-[10px] font-mono font-medium uppercase tracking-wider ${t.chip} shrink-0`}>
                        {formatMileage(item.mileage)} км
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        {item.place && <MapPin size={12} />}
                        <span>{item.place || "Бортовая диагностика"}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                        {item.type}
                      </span>
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
