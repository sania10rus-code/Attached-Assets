import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wrench, Disc3, Zap, GitBranch, Filter, Droplet, ShoppingCart, Car as CarIcon, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useAppData } from "@/hooks/useAppData";
import { formatMileage, type Defect } from "@/lib/storage";
import { findCarByVin, type CarHotspotKey, type CarProfile } from "@/lib/cars";
import Car3D, { type HotspotStatus } from "@/components/Car3D";

function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

const SAPPHIRE = "#1a3a5c";
const SAPPHIRE_GLOW = "#2a5a8a";

const NODE_ICONS: Record<CarHotspotKey, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>> = {
  engine: Droplet,
  "front-wheels": Disc3,
  "rear-wheels": Disc3,
  grille: Filter,
  underbody: GitBranch,
  cabin: Zap,
};

function statusColorFor(remainingKm: number | null, defect?: Defect): string {
  if (defect) {
    if (defect.severity === "critical" || defect.wearPercent > 80) return "#ef4444";
    if (defect.wearPercent >= 50) return "#eab308";
    return "#f97316";
  }
  if (remainingKm == null) return "#64748b";
  if (remainingKm < 500) return "#ef4444";
  if (remainingKm < 2000) return "#eab308";
  return "#22c55e";
}

export default function Diagnostics() {
  const data = useAppData();
  const car: CarProfile = useMemo(() => {
    return (
      findCarByVin(data.carVin) || {
        login: "0000",
        password: "0000",
        vin: data.carVin,
        plate: data.carPlate,
        model: data.carModel,
        year: data.carYear,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        initialMileage: data.telemetry.mileage,
        bodyColor: "#1f3854",
        bodyAccent: SAPPHIRE_GLOW,
        style: "hatchback",
        hotspots: [],
      }
    );
  }, [data.carVin, data.carModel, data.carYear, data.carPlate, data.ownerName, data.ownerPhone, data.telemetry.mileage]);

  const mileage = Math.floor(data.telemetry.mileage);

  const statuses: HotspotStatus[] = useMemo(() => {
    return car.hotspots.map((h) => {
      const defect = data.defects.find((d) => d.nodeKey === h.key && !d.resolved);
      const rem = data.reminders.find((r) =>
        r.text.toLowerCase().includes(h.reminderText.toLowerCase().split(" ")[1] || h.reminderText.toLowerCase()),
      );
      const remainingKm = rem?.dueMileage != null ? rem.dueMileage - mileage : null;
      return {
        key: h.key,
        color: statusColorFor(remainingKm, defect),
        label: h.label,
        remainingKm,
        hasDefect: !!defect,
        wearPercent: defect?.wearPercent,
      };
    });
  }, [car.hotspots, data.defects, data.reminders, mileage]);

  const statusByKey = useMemo(() => {
    const m = {} as Record<CarHotspotKey, HotspotStatus>;
    statuses.forEach((s) => (m[s.key] = s));
    return m;
  }, [statuses]);

  const [activeKey, setActiveKey] = useState<CarHotspotKey | null>(null);
  const activeHotspot = car.hotspots.find((h) => h.key === activeKey);
  const activeStatus = activeKey ? statusByKey[activeKey] : null;
  const activeDefect = activeKey ? data.defects.find((d) => d.nodeKey === activeKey && !d.resolved) : null;

  const counts = useMemo(() => {
    const c = { ok: 0, warn: 0, danger: 0 };
    statuses.forEach((s) => {
      if (s.color === "#22c55e") c.ok++;
      else if (s.color === "#ef4444") c.danger++;
      else if (s.color === "#eab308" || s.color === "#f97316") c.warn++;
    });
    return c;
  }, [statuses]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-12 min-h-full"
    >
      <h1 className="text-2xl font-bold mb-1">Диагностика</h1>
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-5">
        {car.model} ({car.year}) · 3D-схема узлов
      </p>

      <div
        className="rounded-2xl mb-4 border overflow-hidden relative"
        style={{ backgroundColor: "#0b1424", borderColor: SAPPHIRE, height: 320 }}
        data-testid="car-3d-canvas"
      >
        {useMemo(() => detectWebGL(), [])
          ? <Car3D car={car} statusByKey={statusByKey} onPick={setActiveKey} selectedKey={activeKey} />
          : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <CarIcon size={48} className="mb-3" style={{ color: SAPPHIRE_GLOW }} />
              <p className="text-sm font-semibold mb-1">3D-схема недоступна</p>
              <p className="text-xs text-muted-foreground">
                В браузере отключён WebGL. Узлы доступны в списке ниже.
              </p>
            </div>
          )}
      </div>

      <p className="text-[10px] text-center text-muted-foreground/70 uppercase tracking-widest mb-4 font-mono">
        Поверните пальцем · нажмите узел для деталей
      </p>

      <div className="grid grid-cols-3 gap-2 mb-5 text-center">
        <SummaryChip label="Норма" value={counts.ok} color="#22c55e" />
        <SummaryChip label="Внимание" value={counts.warn} color="#eab308" />
        <SummaryChip label="Срочно" value={counts.danger} color="#ef4444" />
      </div>

      <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
        Узлы
      </h2>
      <div className="space-y-2">
        {car.hotspots.map((h) => {
          const st = statusByKey[h.key];
          const Icon = NODE_ICONS[h.key] || Wrench;
          const defect = data.defects.find((d) => d.nodeKey === h.key && !d.resolved);
          return (
            <button
              key={h.key}
              onClick={() => setActiveKey(h.key)}
              data-testid={`node-${h.key}`}
              className="w-full glass-card rounded-2xl px-3 py-3 flex items-center gap-3 active:scale-[.99] transition-transform text-left"
              style={{ borderColor: `${SAPPHIRE}66` }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${st.color}22` }}
              >
                <Icon size={18} style={{ color: st.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-tight">{h.label}</div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  {defect
                    ? `${defect.severity === "critical" ? "Срочно" : "Внимание"} · износ ${defect.wearPercent}%`
                    : st.remainingKm == null
                      ? "нет данных"
                      : st.remainingKm <= 0
                        ? `просрочено ${formatMileage(-st.remainingKm)} км`
                        : `осталось ${formatMileage(st.remainingKm)} км`}
                </div>
              </div>
              {defect && <AlertTriangle size={14} style={{ color: st.color }} />}
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: st.color, boxShadow: `0 0 8px ${st.color}` }}
              />
            </button>
          );
        })}
      </div>

      <div className="h-12" />

      <NodeSheet
        hotspot={activeHotspot}
        status={activeStatus}
        defect={activeDefect}
        onClose={() => setActiveKey(null)}
      />
    </motion.div>
  );
}

function SummaryChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="rounded-xl py-3 border"
      style={{ borderColor: `${color}40`, backgroundColor: `${color}10` }}
    >
      <div className="text-2xl font-bold font-mono" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
}

function NodeSheet({
  hotspot,
  status,
  defect,
  onClose,
}: {
  hotspot?: { key: CarHotspotKey; label: string; recommendation: string; partId: string };
  status: HotspotStatus | null;
  defect: Defect | null | undefined;
  onClose: () => void;
}) {
  const open = !!hotspot && !!status;
  const color = status?.color || "#64748b";
  const Icon = hotspot ? NODE_ICONS[hotspot.key] || Wrench : CarIcon;
  return (
    <AnimatePresence>
      {open && hotspot && status && (
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
            className="w-full max-w-[430px] bg-background border-t rounded-t-3xl p-6"
            style={{ borderColor: color }}
            data-testid="node-sheet"
          >
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${color}22` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">{hotspot.label}</h3>
                  <p
                    className="text-[11px] font-mono mt-0.5"
                    style={{ color }}
                  >
                    {defect
                      ? `${defect.severity === "critical" ? "Срочно" : "Внимание"} · износ ${defect.wearPercent}%`
                      : status.remainingKm == null
                        ? "Нет данных"
                        : status.remainingKm <= 0
                          ? `Просрочено · ${formatMileage(-status.remainingKm)} км`
                          : `Осталось ${formatMileage(status.remainingKm)} км`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>

            {defect && (
              <div
                className="rounded-xl p-3 mb-3 border"
                style={{ borderColor: `${color}66`, backgroundColor: `${color}10` }}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color }} />
                  <div className="flex-1">
                    <div className="text-xs font-bold mb-0.5" style={{ color }}>
                      {defect.description}
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-snug">
                      {defect.recommendation}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mt-2 font-mono">
                      {defect.createdByOrg || "ОНИКС-СЕРВИС"} · {defect.createdBy}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl p-3 text-[12px] text-muted-foreground border border-white/10 bg-white/5 flex items-start gap-2 mb-3">
              <Wrench size={14} className="shrink-0 mt-0.5" style={{ color: SAPPHIRE_GLOW }} />
              <span>{hotspot.recommendation}</span>
            </div>

            <Link href="/parts">
              <button
                className="w-full text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
                style={{ backgroundColor: SAPPHIRE, boxShadow: `0 0 16px ${SAPPHIRE_GLOW}55` }}
                data-testid="order-part-btn"
              >
                <ShoppingCart size={16} />
                Заказать запчасть
              </button>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
