import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Activity, Gauge, Thermometer, Bluetooth } from "lucide-react";
import { loadAppData, updateTelemetry, formatMileage, addHistoryEvent } from "@/lib/storage";
import { useAppData } from "@/hooks/useAppData";
import SchedulingModal from "@/components/SchedulingModal";

const TICK_MS = 1000;

type Notice = { id: number; text: string; reminderText?: string };

function pickNextSpeed(prev: number): number {
  const drift = Math.round((Math.random() - 0.45) * 12);
  const next = prev + drift;
  return Math.max(0, Math.min(120, next));
}

function rpmFor(speed: number): number {
  if (speed === 0) return 800 + Math.floor(Math.random() * 50);
  return Math.min(4500, 900 + speed * 35 + Math.floor(Math.random() * 200));
}

function tempStep(prev: number): number {
  const target = 92;
  const diff = target - prev;
  return Math.round((prev + diff * 0.1 + (Math.random() - 0.5)) * 10) / 10;
}

export default function OBDEmulator() {
  const data = useAppData();
  const [running, setRunning] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [scheduleFor, setScheduleFor] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const noticeId = useRef(1);
  const announced = useRef<Set<number>>(new Set());
  const tripRef = useRef<{ startedAt: number; startMileage: number; samples: number[] } | null>(null);

  const pushNotice = (text: string, reminderText?: string) => {
    const id = noticeId.current++;
    setNotices((n) => [...n, { id, text, reminderText }]);
    window.setTimeout(() => {
      setNotices((n) => n.filter((x) => x.id !== id));
    }, 5500);
  };

  const dismissNotice = (id: number) => {
    setNotices((n) => n.filter((x) => x.id !== id));
  };

  const stop = () => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    updateTelemetry({ speed: 0, rpm: 0 });

    const trip = tripRef.current;
    tripRef.current = null;
    if (trip) {
      const cur = loadAppData();
      const endMileage = Math.floor(cur.telemetry.mileage);
      const distance = Math.max(0, endMileage - trip.startMileage);
      const moving = trip.samples.filter((s) => s > 0);
      const avgSpeed = moving.length
        ? Math.round(moving.reduce((a, b) => a + b, 0) / moving.length)
        : 0;
      if (distance > 0) {
        const dateIso = new Date().toISOString().slice(0, 10);
        addHistoryEvent({
          type: "Поездка",
          desc: `Поездка ${distance} км · средняя ${avgSpeed} км/ч`,
          place: "OBD-эмуляция",
          mileage: endMileage,
          date: dateIso,
          icon: "trip",
        });
        pushNotice(`Поездка сохранена: ${distance} км`);
      } else {
        pushNotice("Эмуляция остановлена");
      }
    }
  };

  const start = () => {
    if (timerRef.current != null) return;
    setRunning(true);
    pushNotice("OBD-эмуляция запущена");
    const cur = loadAppData();
    tripRef.current = {
      startedAt: Date.now(),
      startMileage: Math.floor(cur.telemetry.mileage),
      samples: [],
    };

    timerRef.current = window.setInterval(() => {
      const cur = loadAppData();
      const t = cur.telemetry;

      const speed = pickNextSpeed(t.speed || 0);
      const rpm = rpmFor(speed);
      const temperature = tempStep(t.temperature || 90);
      const addedKm = speed / 3600;
      const mileageFloat = (t.mileage || 0) + addedKm;
      const mileage = Math.round(mileageFloat * 1000) / 1000;

      const next = updateTelemetry({
        speed,
        rpm,
        temperature,
        mileage,
      });

      if (tripRef.current) tripRef.current.samples.push(speed);

      const flooredMileage = Math.floor(mileage);
      next.reminders.forEach((r) => {
        if (r.dueMileage == null) return;
        const remaining = r.dueMileage - flooredMileage;
        if (remaining <= 1000 && remaining > 0 && !announced.current.has(r.id)) {
          announced.current.add(r.id);
          pushNotice(`Скоро ТО: ${r.text} (через ${remaining} км)`, r.text);
        }
        if (remaining <= 0 && !announced.current.has(-r.id)) {
          announced.current.add(-r.id);
          pushNotice(`Срок: ${r.text}`, r.text);
        }
      });
    }, TICK_MS);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearInterval(timerRef.current);
    };
  }, []);

  const t = data.telemetry;
  const displayMileage = Math.floor(t.mileage);

  return (
    <div className="glass-card rounded-2xl p-5 border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bluetooth size={16} className={running ? "text-primary" : "text-muted-foreground"} />
          <h2 className="text-xs font-bold uppercase tracking-widest">OBD-эмуляция</h2>
        </div>
        <span
          className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
            running
              ? "bg-primary/15 text-primary border-primary/30"
              : "bg-white/5 text-muted-foreground border-white/10"
          }`}
        >
          {running && (
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [1, 0.25, 1], scale: [1, 1.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          {running ? "В эфире" : "Остановлено"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <LiveStat icon={Gauge} label="Скорость" value={String(t.speed)} unit="км/ч" pulse={running} />
        <LiveStat icon={Activity} label="Обороты" value={String(t.rpm)} unit="об/мин" pulse={running} />
        <LiveStat icon={Thermometer} label="Темп." value={t.temperature.toFixed(1)} unit="°C" pulse={running} />
      </div>

      <div className="flex justify-between items-baseline mb-4 px-1">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Текущий пробег</span>
        <span className={`text-sm font-mono font-bold ${running ? "text-primary text-glow" : ""}`}>
          {formatMileage(displayMileage)} км
        </span>
      </div>

      {!running ? (
        <button
          onClick={start}
          className="w-full bg-primary text-primary-foreground rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
        >
          <Play size={16} />
          Старт эмуляции
        </button>
      ) : (
        <button
          onClick={stop}
          className="w-full glass-card rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform border-primary/30 text-primary"
        >
          <Square size={16} />
          Стоп
        </button>
      )}

      <div className="fixed top-4 inset-x-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
        <AnimatePresence>
          {notices.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="glass-card border-primary/30 rounded-2xl px-4 py-2 text-xs font-medium shadow-lg max-w-sm pointer-events-auto flex items-center gap-3"
            >
              <span className="flex-1">{n.text}</span>
              {n.reminderText && (
                <button
                  onClick={() => {
                    setScheduleFor(n.reminderText!);
                    dismissNotice(n.id);
                  }}
                  className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider shrink-0"
                >
                  Записаться
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <SchedulingModal
        open={!!scheduleFor}
        onOpenChange={(v) => !v && setScheduleFor(null)}
        workName={scheduleFor || ""}
      />
    </div>
  );
}

function LiveStat({
  icon: Icon,
  label,
  value,
  unit,
  pulse,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  unit: string;
  pulse: boolean;
}) {
  return (
    <div className="bg-black/30 rounded-xl p-2.5">
      <div className="flex items-center gap-1 mb-1.5">
        <Icon size={11} className={pulse ? "text-primary" : "text-muted-foreground"} />
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-base font-bold font-mono leading-none ${pulse ? "text-primary text-glow" : ""}`}>
          {value}
        </span>
        <span className="text-[9px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
