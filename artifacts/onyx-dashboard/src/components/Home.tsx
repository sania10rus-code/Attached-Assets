import React, { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { useLightbulb } from "@/hooks/useLightbulb";
import { SEASONAL_TIPS, getCurrentSeason } from "@/lib/seasonalTips";
import { formatMileage, saveAppData, loadAppData } from "@/lib/storage";
import OBDEmulator from "@/components/OBDEmulator";
import { motion } from "framer-motion";

const Home: React.FC = () => {
  const data = useAppData();
  const tel = data.telemetry;
  const lightbulbGlows = useLightbulb();
  const [showSeasonalTips, setShowSeasonalTips] = useState(false);
  const currentSeason = getCurrentSeason();

  // Считаем, через сколько км замена масла (просто демо)
  const oilChangeDue = 105000;
  const remainingOil = oilChangeDue - Math.floor(tel.mileage);

  // Сегодняшний пробег (из хранилища)
  const todayDistance = data.todayDistance || 0;

  return (
    <div className="min-h-full bg-[#0b0e14] text-white px-4 pt-6 pb-24 space-y-6">
      {/* Шапка */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            ⚡ ОНИКС
          </h1>
          <p className="text-xs text-muted-foreground">
            {data.carModel} {data.carYear}
          </p>
        </div>
        {lightbulbGlows && (
          <button
            onClick={() => setShowSeasonalTips(true)}
            className="relative text-2xl"
            style={{ animation: "pulse 1.5s infinite" }}
          >
            💡
          </button>
        )}
      </div>

      {/* Карточки телеметрии */}
      <div className="grid grid-cols-2 gap-3">
        <TelemetryCard
          label="Пробег"
          value={formatMileage(Math.floor(tel.mileage))}
          unit="км"
          color="text-white"
        />
        <TelemetryCard
          label="Ошибки"
          value={tel.errors || 0}
          unit=""
          color="text-green-400"
        />
        <TelemetryCard
          label="Заправка"
          value={tel.fuelLastDays || 7}
          unit="дней"
          color="text-white"
        />
        <TelemetryCard
          label="Температура"
          value={tel.temperature?.toFixed(1) || "—"}
          unit="°C"
          color="text-white"
        />
      </div>

      {/* Кнопка Подробнее */}
      <button className="w-full glass-card rounded-2xl py-4 text-sm font-semibold text-center text-muted-foreground hover:text-white transition">
        Подробнее
      </button>

      {/* OBD‑эмулятор */}
      <OBDEmulator />

      {/* Баннер замены масла */}
      {remainingOil > 0 && (
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3 border-l-4 border-primary/70">
          <span className="text-lg">🛢️</span>
          <div>
            <p className="text-xs text-muted-foreground">Замена масла</p>
            <p className="text-sm font-semibold">
              через {formatMileage(remainingOil)} км
            </p>
          </div>
        </div>
      )}

      {/* Сегодняшняя дистанция */}
      <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Сегодня</span>
        <span className="text-lg font-bold font-mono">
          {todayDistance.toFixed(1)} км
        </span>
      </div>

      {/* Модальное окно с сезонными советами */}
      {showSeasonalTips && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card rounded-3xl p-6 max-w-[360px] w-[90%] border border-white/10"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>{SEASONAL_TIPS[currentSeason].icon}</span>
              {SEASONAL_TIPS[currentSeason].title} — рекомендации
            </h2>
            <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
              {SEASONAL_TIPS[currentSeason].tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowSeasonalTips(false)}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-3 text-sm font-semibold"
            >
              Понятно
            </button>
          </motion.div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

// Вспомогательный компонент для карточек телеметрии
function TelemetryCard({
  label,
  value,
  unit,
  color = "text-white",
}: {
  label: string;
  value: string | number;
  unit: string;
  color?: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold font-mono ${color}`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
}

export default Home;