import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wrench, Disc3, Zap, GitBranch, Filter, Droplet } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { formatMileage } from "@/lib/storage";

const SAPPHIRE = "#1a3a5c";
const SAPPHIRE_GLOW = "#2a5a8a";

type NodeKey = "engine" | "brakes" | "spark" | "belt" | "filter";

type NodeDef = {
  key: NodeKey;
  label: string;
  reminderMatch: (text: string) => boolean;
  // position in % of svg viewBox (top-down silhouette)
  x: number;
  y: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>;
  rec: string;
};

const NODES: NodeDef[] = [
  {
    key: "engine",
    label: "Двигатель / Масло",
    reminderMatch: (t) => /масл/i.test(t),
    x: 50,
    y: 22,
    icon: Droplet,
    rec: "Замена моторного масла и масляного фильтра каждые 10–15 тыс. км.",
  },
  {
    key: "filter",
    label: "Воздушный фильтр",
    reminderMatch: (t) => /воздуш/i.test(t),
    x: 30,
    y: 32,
    icon: Filter,
    rec: "Замена воздушного фильтра каждые 30 тыс. км.",
  },
  {
    key: "spark",
    label: "Свечи зажигания",
    reminderMatch: (t) => /свеч/i.test(t),
    x: 70,
    y: 32,
    icon: Zap,
    rec: "Замена свечей зажигания NGK каждые 60 тыс. км.",
  },
  {
    key: "belt",
    label: "Ремень ГРМ",
    reminderMatch: (t) => /грм|ремен/i.test(t),
    x: 50,
    y: 45,
    icon: GitBranch,
    rec: "Проверка/замена ремня ГРМ каждые 60–90 тыс. км. Обрыв грозит капремонтом.",
  },
  {
    key: "brakes",
    label: "Тормозные колодки",
    reminderMatch: (t) => /тормоз|колод/i.test(t),
    x: 50,
    y: 78,
    icon: Disc3,
    rec: "Замена передних колодок TRW при остатке менее 3 мм.",
  },
];

type NodeStatus = {
  node: NodeDef;
  remainingKm: number | null;
  status: "ok" | "warn" | "danger" | "unknown";
};

function statusColor(s: NodeStatus["status"]) {
  if (s === "ok") return "#22c55e";
  if (s === "warn") return "#eab308";
  if (s === "danger") return "#ef4444";
  return "#64748b";
}

export default function Diagnostics() {
  const { reminders, telemetry, carModel, carYear } = useAppData();
  const mileage = Math.floor(telemetry.mileage);

  const nodes: NodeStatus[] = useMemo(() => {
    return NODES.map((n) => {
      const rem = reminders.find((r) => n.reminderMatch(r.text));
      if (!rem || !rem.dueMileage) {
        return { node: n, remainingKm: null, status: "unknown" as const };
      }
      const remainingKm = rem.dueMileage - mileage;
      let status: NodeStatus["status"] = "ok";
      if (remainingKm < 500) status = "danger";
      else if (remainingKm < 2000) status = "warn";
      return { node: n, remainingKm, status };
    });
  }, [reminders, mileage]);

  const [active, setActive] = useState<NodeStatus | null>(null);

  const counts = useMemo(() => {
    const c = { ok: 0, warn: 0, danger: 0 };
    nodes.forEach((n) => {
      if (n.status === "ok") c.ok++;
      else if (n.status === "warn") c.warn++;
      else if (n.status === "danger") c.danger++;
    });
    return c;
  }, [nodes]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-12 min-h-full"
    >
      <h1 className="text-2xl font-bold mb-1">Диагностика</h1>
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-5">
        Состояние узлов · {carModel} ({carYear})
      </p>

      <div
        className="rounded-2xl p-4 mb-4 border"
        style={{ backgroundColor: "#0d1726", borderColor: SAPPHIRE }}
      >
        <CarSchematic nodes={nodes} onPick={setActive} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5 text-center">
        <SummaryChip label="Норма" value={counts.ok} color="#22c55e" />
        <SummaryChip label="Внимание" value={counts.warn} color="#eab308" />
        <SummaryChip label="Срочно" value={counts.danger} color="#ef4444" />
      </div>

      <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
        Узлы
      </h2>
      <div className="space-y-2">
        {nodes.map((n) => (
          <button
            key={n.node.key}
            onClick={() => setActive(n)}
            data-testid={`node-${n.node.key}`}
            className="w-full glass-card rounded-2xl px-3 py-3 flex items-center gap-3 active:scale-[.99] transition-transform text-left"
            style={{ borderColor: `${SAPPHIRE}66` }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${statusColor(n.status)}22` }}
            >
              <n.node.icon size={18} style={{ color: statusColor(n.status) }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold leading-tight">{n.node.label}</div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {n.remainingKm == null
                  ? "нет данных"
                  : n.remainingKm <= 0
                    ? `просрочено на ${formatMileage(-n.remainingKm)} км`
                    : `осталось ${formatMileage(n.remainingKm)} км`}
              </div>
            </div>
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: statusColor(n.status), boxShadow: `0 0 8px ${statusColor(n.status)}` }}
            />
          </button>
        ))}
      </div>

      <div className="h-12" />

      <NodeSheet status={active} onClose={() => setActive(null)} />
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

function CarSchematic({
  nodes,
  onPick,
}: {
  nodes: NodeStatus[];
  onPick: (n: NodeStatus) => void;
}) {
  return (
    <div className="relative w-full" style={{ aspectRatio: "1 / 1.7" }}>
      <svg viewBox="0 0 100 170" className="w-full h-full">
        {/* Top-down Skoda Octavia silhouette */}
        <defs>
          <linearGradient id="bodyGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#1a2a44" />
            <stop offset="50%" stopColor="#243b5c" />
            <stop offset="100%" stopColor="#1a2a44" />
          </linearGradient>
        </defs>
        {/* Wheels */}
        <rect x="6" y="30" width="6" height="14" rx="2" fill="#0a0f18" />
        <rect x="88" y="30" width="6" height="14" rx="2" fill="#0a0f18" />
        <rect x="6" y="125" width="6" height="14" rx="2" fill="#0a0f18" />
        <rect x="88" y="125" width="6" height="14" rx="2" fill="#0a0f18" />
        {/* Body */}
        <path
          d="M 22 8
             C 28 4, 72 4, 78 8
             L 84 28
             C 88 40, 88 90, 86 130
             C 84 150, 78 162, 70 164
             L 30 164
             C 22 162, 16 150, 14 130
             C 12 90, 12 40, 16 28 Z"
          fill="url(#bodyGrad)"
          stroke={SAPPHIRE_GLOW}
          strokeWidth="0.6"
        />
        {/* Windshield */}
        <path
          d="M 24 28 L 76 28 L 80 52 L 20 52 Z"
          fill="#0a1424"
          stroke={SAPPHIRE_GLOW}
          strokeWidth="0.4"
          opacity="0.85"
        />
        {/* Roof */}
        <path
          d="M 22 52 L 78 52 L 78 110 L 22 110 Z"
          fill="#162538"
          stroke={SAPPHIRE_GLOW}
          strokeWidth="0.4"
          opacity="0.7"
        />
        {/* Rear window */}
        <path
          d="M 22 110 L 78 110 L 80 132 L 20 132 Z"
          fill="#0a1424"
          stroke={SAPPHIRE_GLOW}
          strokeWidth="0.4"
          opacity="0.85"
        />
        {/* Hood line */}
        <line x1="20" y1="22" x2="80" y2="22" stroke={SAPPHIRE_GLOW} strokeWidth="0.3" opacity="0.5" />
        {/* Logo */}
        <text
          x="50"
          y="84"
          textAnchor="middle"
          fill={SAPPHIRE_GLOW}
          fontSize="6"
          fontFamily="ui-monospace, monospace"
          fontWeight="700"
          opacity="0.4"
          letterSpacing="2"
        >
          SKODA
        </text>
        <text
          x="50"
          y="92"
          textAnchor="middle"
          fill={SAPPHIRE_GLOW}
          fontSize="4"
          fontFamily="ui-monospace, monospace"
          opacity="0.3"
          letterSpacing="2"
        >
          OCTAVIA A5
        </text>
      </svg>

      {/* Node dots */}
      {nodes.map((n) => {
        const c = statusColor(n.status);
        return (
          <button
            key={n.node.key}
            onClick={() => onPick(n)}
            data-testid={`schematic-${n.node.key}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 active:scale-90 transition-transform"
            style={{ left: `${n.node.x}%`, top: `${n.node.y}%` }}
          >
            <span
              className="block w-5 h-5 rounded-full"
              style={{
                backgroundColor: c,
                boxShadow: `0 0 12px ${c}, 0 0 0 3px ${c}33`,
              }}
            />
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ border: `1.5px solid ${c}` }}
              animate={{ scale: [1, 1.8, 2.4], opacity: [0.7, 0.2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </button>
        );
      })}
    </div>
  );
}

function NodeSheet({ status, onClose }: { status: NodeStatus | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {status && (
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
            style={{ borderColor: statusColor(status.status) }}
          >
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${statusColor(status.status)}22` }}
                >
                  <status.node.icon size={20} style={{ color: statusColor(status.status) }} />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">{status.node.label}</h3>
                  <p
                    className="text-[11px] font-mono mt-0.5"
                    style={{ color: statusColor(status.status) }}
                  >
                    {status.remainingKm == null
                      ? "Нет данных"
                      : status.remainingKm <= 0
                        ? `Просрочено · ${formatMileage(-status.remainingKm)} км`
                        : status.status === "danger"
                          ? `Срочно · осталось ${formatMileage(status.remainingKm)} км`
                          : status.status === "warn"
                            ? `Скоро · осталось ${formatMileage(status.remainingKm)} км`
                            : `Норма · осталось ${formatMileage(status.remainingKm)} км`}
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
            <div className="rounded-xl p-3 text-[12px] text-muted-foreground border border-white/10 bg-white/5 flex items-start gap-2">
              <Wrench size={14} className="shrink-0 mt-0.5" style={{ color: SAPPHIRE_GLOW }} />
              <span>{status.node.rec}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
