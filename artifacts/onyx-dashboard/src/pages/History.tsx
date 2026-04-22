import React from "react";
import { motion } from "framer-motion";
import { MapPin, Wrench, AlertOctagon, Disc3, AlertTriangle, LogOut, Droplet } from "lucide-react";

type HistoryEvent = {
  id: number;
  date: string;
  title: string;
  city: string;
  meta: string;
  desc?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: "neutral" | "primary" | "warn" | "danger" | "ok";
};

const historyData: HistoryEvent[] = [
  {
    id: 1,
    date: "12.03.2024",
    title: "ТО у дилера",
    city: "Москва",
    meta: "80 000 км",
    desc: "Плановое техническое обслуживание",
    icon: Wrench,
    tone: "primary",
  },
  {
    id: 2,
    date: "08.07.2021",
    title: "ДТП",
    city: "Москва",
    meta: "Передний бампер",
    desc: "Кузовной ремонт, окраска",
    icon: AlertOctagon,
    tone: "danger",
  },
  {
    id: 3,
    date: "04.11.2023",
    title: "Замена тормозных колодок",
    city: "Москва",
    meta: "75 280 км",
    desc: "Передняя ось",
    icon: Disc3,
    tone: "neutral",
  },
  {
    id: 4,
    date: "02.01.2020",
    title: "Ошибка P0141",
    city: "Бортовая диагностика",
    meta: "Кислородный датчик 2",
    desc: "Неисправность нагревателя λ-зонда",
    icon: AlertTriangle,
    tone: "warn",
  },
  {
    id: 5,
    date: "18.06.2022",
    title: "Выезд из дилера",
    city: "Москва",
    meta: "52 560 км",
    desc: "Передача автомобиля владельцу",
    icon: LogOut,
    tone: "ok",
  },
  {
    id: 6,
    date: "14.05.2021",
    title: "Замена масла",
    city: "Москва",
    meta: "40 000 км",
    desc: "Castrol Edge 5W-30",
    icon: Droplet,
    tone: "neutral",
  },
];

const toneStyles: Record<HistoryEvent["tone"], { dot: string; iconWrap: string; icon: string; chip: string }> = {
  neutral: { dot: "bg-white/40", iconWrap: "bg-white/10", icon: "text-foreground", chip: "text-muted-foreground" },
  primary: { dot: "bg-primary", iconWrap: "bg-primary/20", icon: "text-primary", chip: "text-primary" },
  warn: { dot: "bg-amber-400", iconWrap: "bg-amber-400/15", icon: "text-amber-400", chip: "text-amber-400" },
  danger: { dot: "bg-red-500", iconWrap: "bg-red-500/15", icon: "text-red-500", chip: "text-red-500" },
  ok: { dot: "bg-green-500", iconWrap: "bg-green-500/15", icon: "text-green-500", chip: "text-green-500" },
};

export default function History() {
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
        {historyData.map((item, i) => {
          const t = toneStyles[item.tone];
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              key={item.id}
              className="relative pl-6"
            >
              <div className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full ${t.dot}`} />

              <div className="text-[11px] font-mono text-muted-foreground mb-1.5 tracking-wider">{item.date}</div>

              <div className="glass-card rounded-2xl p-4 border-white/5">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.iconWrap}`}>
                    <item.icon size={18} className={t.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
                      <span className={`text-[10px] font-mono font-medium uppercase tracking-wider ${t.chip} shrink-0`}>
                        {item.meta}
                      </span>
                    </div>
                    {item.desc && (
                      <p className="text-xs text-muted-foreground leading-snug mb-2">{item.desc}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <MapPin size={12} />
                      <span>{item.city}</span>
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
