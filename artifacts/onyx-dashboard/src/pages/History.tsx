import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Wrench,
  AlertOctagon,
  Disc3,
  AlertTriangle,
  Key,
  Droplet,
  Route,
  Download,
  Pencil,
  Lock,
  X,
  Check,
  Info,
} from "lucide-react";
import {
  formatMileage,
  formatDateRu,
  type HistoryIcon,
  type HistoryEvent,
  canEdit,
  updateHistoryEvent,
  acknowledgeDiscrepancy,
} from "@/lib/storage";
import { useAppData } from "@/hooks/useAppData";
import { useTranslation, getCurrentLocale } from "@/i18n";

type Tone = "neutral" | "primary" | "warn" | "danger" | "ok";

const iconMap: Record<HistoryIcon, React.ComponentType<{ size?: number; className?: string }>> = {
  wrench: Wrench,
  "car-crash": AlertOctagon,
  brake: Disc3,
  engine: AlertTriangle,
  key: Key,
  oil: Droplet,
  trip: Route,
  check: Wrench,
  alert: AlertTriangle,
};

const toneByType = (type: string): Tone => {
  if (type === "ДТП") return "danger";
  if (type === "Ошибка" || type === "Расхождение") return "warn";
  if (type === "Покупка") return "ok";
  if (type === "ТО") return "primary";
  if (type === "Поездка") return "ok";
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
  const data = useAppData();
  const { t } = useTranslation();
  const localeCode = getCurrentLocale() === "en" ? "en-US" : "ru-RU";
  const events = useMemo(
    () => [...data.history].sort((a, b) => b.date.localeCompare(a.date)),
    [data.history],
  );

  const [editing, setEditing] = useState<HistoryEvent | null>(null);
  const [locked, setLocked] = useState<HistoryEvent | null>(null);

  const handleExport = () => {
    const lines: string[] = [];
    lines.push(t("history.exportTitle"));
    lines.push(`${data.carModel} (${data.carYear})`);
    lines.push(t("history.exportCurrent", { km: formatMileage(Math.floor(data.telemetry.mileage)) }));
    lines.push(t("history.exportGenerated", { ts: new Date().toLocaleString(localeCode) }));
    lines.push("");
    lines.push("=".repeat(50));
    lines.push("");
    events.forEach((e) => {
      lines.push(`[${formatDateRu(e.date)}] ${e.type} — ${e.desc}`);
      lines.push(`  ${t("home.stats.mileage")}: ${formatMileage(e.mileage)} ${t("common.km")}${e.place ? ` · ${e.place}` : ""}`);
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `onix-history-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-12 min-h-full"
    >
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t("history.title")}</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">{t("history.subtitle")}</p>
        </div>
        <button
          onClick={handleExport}
          className="glass-card border-primary/30 text-primary rounded-full px-3 py-2 text-xs font-semibold flex items-center gap-1.5 active:scale-[.98] transition-transform shrink-0"
        >
          <Download size={14} />
          {t("history.export")}
        </button>
      </div>

      <div className="relative border-l border-white/10 ml-3 space-y-6 pb-4">
        {events.map((item, i) => {
          const tone = toneByType(item.type);
          const ts = toneStyles[tone];
          const Icon = iconMap[item.icon] ?? Wrench;
          const editable = canEdit(item.createdAt);
          const isDiscrepancy = !!item.discrepancy;
          const needsAck = isDiscrepancy && !item.discrepancy?.acknowledged;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              key={item.id}
              className="relative pl-6"
            >
              <div className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full ${ts.dot}`} />

              <div className="text-[11px] font-mono text-muted-foreground mb-1.5 tracking-wider">
                {formatDateRu(item.date)}
              </div>

              <div
                className={`glass-card rounded-2xl p-4 ${
                  needsAck ? "border-amber-400/40 bg-amber-400/[0.04]" : "border-white/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${ts.iconWrap}`}>
                    <Icon size={18} className={ts.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm leading-tight">
                        {isDiscrepancy && <span className="mr-1">⚠️</span>}
                        {item.desc}
                      </h3>
                      <span
                        className={`text-[10px] font-mono font-medium uppercase tracking-wider ${ts.chip} shrink-0`}
                      >
                        {formatMileage(item.mileage)} {t("common.km")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        {item.place && <MapPin size={12} />}
                        <span>{item.place || t("history.diagnosticPlace")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                          {item.type}
                        </span>
                        {editable ? (
                          <button
                            onClick={() => setEditing(item)}
                            className="text-muted-foreground hover:text-primary"
                            data-testid={`edit-${item.id}`}
                            title={t("history.editTooltip")}
                          >
                            <Pencil size={13} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setLocked(item)}
                            className="text-muted-foreground/60"
                            data-testid={`lock-${item.id}`}
                            title={t("history.lockTooltip")}
                          >
                            <Lock size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                    {isDiscrepancy && item.discrepancy && (
                      <div className="mt-3 bg-amber-400/10 border border-amber-400/30 rounded-xl p-2.5 text-[11px] text-amber-400 space-y-1.5">
                        <div className="font-mono leading-snug">
                          {t("history.discrepancyDesc", {
                            reported: formatMileage(item.discrepancy.reportedMileage),
                            actual: formatMileage(item.discrepancy.actualMileage),
                            diff: formatMileage(item.discrepancy.diff),
                          })}
                        </div>
                        {needsAck && (
                          <button
                            onClick={() => acknowledgeDiscrepancy(item.id)}
                            data-testid={`ack-${item.id}`}
                            className="w-full bg-amber-400/15 border border-amber-400/40 rounded-lg py-1.5 text-[11px] font-semibold flex items-center justify-center gap-1.5 mt-1"
                          >
                            <Check size={12} />
                            {t("history.acknowledge")}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <EditEventSheet event={editing} onClose={() => setEditing(null)} />
      <LockedSheet event={locked} onClose={() => setLocked(null)} />
    </motion.div>
  );
}

function EditEventSheet({ event, onClose }: { event: HistoryEvent | null; onClose: () => void }) {
  const { t } = useTranslation();
  const [desc, setDesc] = useState("");
  const [mileage, setMileage] = useState<string>("");

  React.useEffect(() => {
    if (event) {
      setDesc(event.desc);
      setMileage(String(event.mileage));
    }
  }, [event]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] bg-black/70 flex items-end justify-center"
        >
          <motion.div
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            exit={{ y: 60 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-background border-t border-white/10 rounded-t-3xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <Pencil size={16} className="text-primary" />
                  {t("history.editTitle")}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {t("history.editHint")}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-1.5">
                  {t("history.editDesc")}
                </span>
                <input
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm outline-none focus:border-primary/50"
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-1.5">
                  {t("history.editMileage")}
                </span>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm outline-none focus:border-primary/50 font-mono"
                />
              </label>
            </div>

            <button
              onClick={() => {
                updateHistoryEvent(event.id, {
                  desc: desc.trim() || event.desc,
                  mileage: parseInt(mileage) || event.mileage,
                });
                onClose();
              }}
              className="mt-5 w-full bg-primary text-primary-foreground rounded-2xl py-4 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
            >
              <Check size={16} />
              {t("common.save")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LockedSheet({ event, onClose }: { event: HistoryEvent | null; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] bg-black/70 flex items-end justify-center"
        >
          <motion.div
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            exit={{ y: 60 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-background border-t border-white/10 rounded-t-3xl p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <Lock size={18} className="text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">{t("history.lockedTitle")}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {t("history.lockedBody")}
                </p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-[12px] text-muted-foreground flex items-start gap-2">
              <Info size={14} className="text-primary shrink-0 mt-0.5" />
              <span>{t("history.lockedHelp")}</span>
            </div>
            <button
              onClick={onClose}
              className="mt-4 w-full glass-card rounded-2xl py-3.5 text-sm font-medium"
            >
              {t("common.understood")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
