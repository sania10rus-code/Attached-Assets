import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Check } from "lucide-react";
import type { CarHotspotKey } from "@/lib/cars";
import { findCarByVin } from "@/lib/cars";
import { addDefectByVin, type DefectSeverity } from "@/lib/storage";

const NODE_OPTIONS: { key: CarHotspotKey; label: string }[] = [
  { key: "engine", label: "Двигатель / Масло" },
  { key: "front-wheels", label: "Передние колёса / тормоза" },
  { key: "rear-wheels", label: "Задние колёса / тормоза" },
  { key: "grille", label: "Воздушный фильтр" },
  { key: "underbody", label: "Ремень ГРМ / днище" },
  { key: "cabin", label: "Салонный фильтр" },
];

export default function DefectForm({
  open,
  onClose,
  vin,
  mechanicName,
  mechanicOrg,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  vin: string;
  mechanicName: string;
  mechanicOrg?: string;
  onCreated?: () => void;
}) {
  const [nodeKey, setNodeKey] = useState<CarHotspotKey>("engine");
  const [severity, setSeverity] = useState<DefectSeverity>("warn");
  const [wear, setWear] = useState(50);
  const [description, setDescription] = useState("");
  const [recommendation, setRecommendation] = useState("");

  useEffect(() => {
    if (open) {
      setNodeKey("engine");
      setSeverity("warn");
      setWear(50);
      setDescription("");
      setRecommendation("");
    }
  }, [open]);

  // Auto-bump severity from wear
  useEffect(() => {
    if (wear > 80) setSeverity("critical");
    else setSeverity("warn");
  }, [wear]);

  const submit = () => {
    const car = findCarByVin(vin);
    if (!car) return;
    const nodeLabel = NODE_OPTIONS.find((n) => n.key === nodeKey)?.label || nodeKey;
    addDefectByVin(vin, {
      nodeKey,
      nodeLabel,
      severity,
      wearPercent: wear,
      description: description.trim() || `${nodeLabel} — износ ${wear}%`,
      recommendation:
        recommendation.trim() ||
        (severity === "critical" ? "Срочная замена." : "Рекомендована замена в ближайшее ТО."),
      createdBy: mechanicName,
      createdByOrg: mechanicOrg,
    });
    onCreated?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
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
            className="w-full max-w-[430px] bg-background border-t rounded-t-3xl p-6 max-h-[85dvh] overflow-y-auto"
            style={{ borderColor: severity === "critical" ? "#ef4444" : "#eab308" }}
            data-testid="defect-form"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-400" />
                  Обнаружена неисправность
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  VIN {vin}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-2">
                  Узел
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {NODE_OPTIONS.map((n) => (
                    <button
                      key={n.key}
                      onClick={() => setNodeKey(n.key)}
                      data-testid={`defect-node-${n.key}`}
                      className={`text-[11px] py-2 px-2 rounded-lg border text-left ${
                        nodeKey === n.key
                          ? "border-amber-400 bg-amber-400/10 text-amber-300"
                          : "border-white/10 bg-white/5 text-muted-foreground"
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-2">
                  Степень износа: <span className="text-white font-mono">{wear}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={wear}
                  onChange={(e) => setWear(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400"
                  data-testid="defect-wear"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground/70 font-mono mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>80%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-2">
                  Критичность
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSeverity("warn")}
                    className={`py-2.5 rounded-lg border text-xs font-semibold ${
                      severity === "warn"
                        ? "border-amber-400 bg-amber-400/15 text-amber-300"
                        : "border-white/10 bg-white/5 text-muted-foreground"
                    }`}
                  >
                    🟡 Требует внимания
                  </button>
                  <button
                    onClick={() => setSeverity("critical")}
                    className={`py-2.5 rounded-lg border text-xs font-semibold ${
                      severity === "critical"
                        ? "border-red-500 bg-red-500/15 text-red-400"
                        : "border-white/10 bg-white/5 text-muted-foreground"
                    }`}
                  >
                    🔴 Срочно
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-2">
                  Описание
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="например: Передние амортизаторы — стук при проезде неровностей"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-400/50 resize-none"
                  data-testid="defect-description"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-2">
                  Рекомендация
                </label>
                <textarea
                  rows={2}
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  placeholder="например: Требуется замена передних амортизаторов KYB"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-400/50 resize-none"
                  data-testid="defect-recommendation"
                />
              </div>
            </div>

            <button
              onClick={submit}
              className="mt-5 w-full bg-amber-400 text-black rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
              data-testid="defect-submit"
            >
              <Check size={16} />
              Зафиксировать неисправность
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
