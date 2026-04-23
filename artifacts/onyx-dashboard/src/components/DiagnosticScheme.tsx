import { useState } from "react";
import { Car as CarIcon } from "lucide-react";
import type { CarHotspotKey, CarProfile } from "@/lib/cars";

export type HotspotStatus = {
  key: CarHotspotKey;
  color: string;
  label: string;
  remainingKm: number | null;
  hasDefect: boolean;
  wearPercent?: number;
};

type Props = {
  car: CarProfile;
  statusByKey: Record<CarHotspotKey, HotspotStatus>;
  onPick: (key: CarHotspotKey) => void;
  selectedKey: CarHotspotKey | null;
};

const SAPPHIRE_GLOW = "#2a5a8a";

export default function DiagnosticScheme({ car, statusByKey, onPick, selectedKey }: Props) {
  const [imgError, setImgError] = useState(false);
  const [hoverKey, setHoverKey] = useState<CarHotspotKey | null>(null);
  const points = car.schemeHotspots ?? [];
  const showImage = !!car.schemeImage && !imgError;

  // The PNGs are 3:4 portrait. We render an aspect-locked frame that fits
  // inside the parent and is centered both ways, then anchor hotspots to
  // THAT frame (not the outer container). This guarantees that a hotspot
  // placed at e.g. x=50% always lands on the centerline of the actual car
  // image, regardless of letterboxing.
  const ASPECT = 3 / 4;
  return (
    <div className="absolute inset-0 flex items-center justify-center" data-testid="diagnostic-scheme">
      <div
        className="relative h-full"
        style={{ aspectRatio: `${ASPECT}`, maxWidth: "100%" }}
      >
        {showImage ? (
          <img
            src={car.schemeImage}
            alt={car.model}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
            draggable={false}
          />
        ) : (
          <FallbackSilhouette style={car.style} />
        )}

        {points.map((p) => {
        const st = statusByKey[p.key];
        if (!st) return null;
        const isActive = selectedKey === p.key;
        const isHover = hoverKey === p.key;
        return (
          <button
            key={p.key}
            type="button"
            data-testid={`hotspot-${p.key}`}
            onClick={() => onPick(p.key)}
            onMouseEnter={() => setHoverKey(p.key)}
            onMouseLeave={() => setHoverKey((k) => (k === p.key ? null : k))}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            aria-label={st.label}
          >
            <span
              className="block rounded-full"
              style={{
                width: isActive ? 22 : 18,
                height: isActive ? 22 : 18,
                backgroundColor: st.color,
                boxShadow: `0 0 ${isActive ? 18 : 12}px ${st.color}, 0 0 0 2px rgba(11,20,36,0.85)`,
                transition: "all 180ms ease",
              }}
            />
            <span
              className="absolute left-1/2 -translate-x-1/2 -top-1 rounded-full opacity-60"
              style={{
                width: isActive ? 34 : 26,
                height: isActive ? 34 : 26,
                backgroundColor: st.color,
                filter: "blur(6px)",
                transform: "translate(-50%,-30%)",
                animation: st.hasDefect || st.color === "#ef4444"
                  ? "scheme-pulse 1.6s ease-in-out infinite"
                  : "none",
              }}
            />
            {(isHover || isActive) && (
              <span
                className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap pointer-events-none"
                style={{
                  top: "100%",
                  backgroundColor: "rgba(11,20,36,0.95)",
                  border: `1px solid ${st.color}`,
                  color: "#e6edf7",
                  boxShadow: `0 4px 14px rgba(0,0,0,0.5)`,
                }}
              >
                {st.label}
                <span className="block font-mono text-[9px] text-muted-foreground mt-0.5">
                  {st.hasDefect
                    ? `износ ${st.wearPercent ?? 0}%`
                    : st.remainingKm == null
                      ? "нет данных"
                      : st.remainingKm <= 0
                        ? `просрочено`
                        : `осталось ${formatKm(st.remainingKm)} км`}
                </span>
              </span>
            )}
          </button>
        );
      })}
      </div>

      <style>{`
        @keyframes scheme-pulse {
          0%, 100% { transform: translate(-50%, -30%) scale(1); opacity: 0.55; }
          50% { transform: translate(-50%, -30%) scale(1.4); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}

function formatKm(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n));
}

function FallbackSilhouette({ style }: { style: CarProfile["style"] }) {
  const isSuv = style === "suv";
  const isSedan = style === "sedan";
  const bodyW = isSuv ? 56 : 48;
  const bodyH = isSedan ? 78 : isSuv ? 80 : 72;
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="silhouetteGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1a3a5c" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0e1a2e" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <rect
          x={(100 - bodyW) / 2}
          y={(100 - bodyH) / 2}
          width={bodyW}
          height={bodyH}
          rx={isSuv ? 8 : 14}
          ry={isSuv ? 8 : 14}
          fill="url(#silhouetteGrad)"
          stroke={SAPPHIRE_GLOW}
          strokeWidth={0.6}
        />
        <rect x={36} y={28} width={28} height={20} rx={4} fill="#0b1424" opacity={0.8} />
        <rect x={36} y={54} width={28} height={22} rx={4} fill="#0b1424" opacity={0.8} />
      </svg>
      <div className="absolute bottom-3 left-0 right-0 text-center">
        <CarIcon size={14} className="inline-block opacity-50" />
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground/70 mt-1">
          схема узлов
        </div>
      </div>
    </div>
  );
}
