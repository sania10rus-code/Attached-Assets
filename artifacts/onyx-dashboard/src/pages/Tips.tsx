import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, Snowflake, Sun, Leaf, Flower2, Wrench } from "lucide-react";
import { useTranslation, getCurrentLocale } from "@/i18n";

const SAPPHIRE = "#1a3a5c";
const SAPPHIRE_GLOW = "#2a5a8a";

type Season = {
  key: string;
  titleKey: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>;
  color: string;
  itemKeys: string[];
};

const SEASONS: Season[] = [
  {
    key: "spring",
    titleKey: "tips.season.spring",
    icon: Flower2,
    color: "#22c55e",
    itemKeys: ["tips.spring.1", "tips.spring.2", "tips.spring.3", "tips.spring.4"],
  },
  {
    key: "summer",
    titleKey: "tips.season.summer",
    icon: Sun,
    color: "#eab308",
    itemKeys: ["tips.summer.1", "tips.summer.2", "tips.summer.3", "tips.summer.4"],
  },
  {
    key: "autumn",
    titleKey: "tips.season.autumn",
    icon: Leaf,
    color: "#f97316",
    itemKeys: ["tips.autumn.1", "tips.autumn.2", "tips.autumn.3", "tips.autumn.4"],
  },
  {
    key: "winter",
    titleKey: "tips.season.winter",
    icon: Snowflake,
    color: "#38bdf8",
    itemKeys: ["tips.winter.1", "tips.winter.2", "tips.winter.3", "tips.winter.4"],
  },
];

const MILEAGE_REGS: { km: number; itemKeys: string[] }[] = [
  { km: 15000, itemKeys: ["tips.reg.15.1", "tips.reg.15.2", "tips.reg.15.3"] },
  { km: 30000, itemKeys: ["tips.reg.30.1", "tips.reg.30.2", "tips.reg.30.3"] },
  { km: 60000, itemKeys: ["tips.reg.60.1", "tips.reg.60.2", "tips.reg.60.3", "tips.reg.60.4"] },
  { km: 90000, itemKeys: ["tips.reg.90.1", "tips.reg.90.2", "tips.reg.90.3"] },
  { km: 120000, itemKeys: ["tips.reg.120.1", "tips.reg.120.2", "tips.reg.120.3"] },
];

export default function Tips() {
  const { t } = useTranslation();
  const localeCode = getCurrentLocale() === "en" ? "en-US" : "ru-RU";
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-12 min-h-full"
    >
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb size={20} style={{ color: SAPPHIRE_GLOW }} />
        <h1 className="text-2xl font-bold">{t("tips.title")}</h1>
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
        {t("tips.subtitle")}
      </p>

      <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
        {t("tips.bySeasons")}
      </h2>
      <div className="space-y-3 mb-8">
        {SEASONS.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="rounded-2xl border p-4"
            style={{ backgroundColor: "#0d1726", borderColor: `${SAPPHIRE}aa` }}
            data-testid={`season-${s.key}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${s.color}22` }}
              >
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <h3 className="text-base font-bold">{t(s.titleKey)}</h3>
            </div>
            <ul className="space-y-1.5">
              {s.itemKeys.map((k) => (
                <li key={k} className="flex items-start gap-2 text-[13px] text-muted-foreground leading-snug">
                  <span
                    className="w-1 h-1 rounded-full mt-2 shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>{t(k)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
        {t("tips.byMileage")}
      </h2>
      <div className="space-y-3">
        {MILEAGE_REGS.map((r, i) => (
          <motion.div
            key={r.km}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="rounded-2xl border p-4"
            style={{ backgroundColor: "#0d1726", borderColor: `${SAPPHIRE}aa` }}
            data-testid={`reg-${r.km}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${SAPPHIRE_GLOW}22` }}
                >
                  <Wrench size={18} style={{ color: SAPPHIRE_GLOW }} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t("tips.every")}
                  </div>
                  <div className="text-lg font-bold font-mono" style={{ color: SAPPHIRE_GLOW }}>
                    {r.km.toLocaleString(localeCode)} {t("common.km")}
                  </div>
                </div>
              </div>
            </div>
            <ul className="space-y-1.5">
              {r.itemKeys.map((k) => (
                <li key={k} className="flex items-start gap-2 text-[13px] text-muted-foreground leading-snug">
                  <span
                    className="w-1 h-1 rounded-full mt-2 shrink-0"
                    style={{ backgroundColor: SAPPHIRE_GLOW }}
                  />
                  <span>{t(k)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="h-12" />
    </motion.div>
  );
}
