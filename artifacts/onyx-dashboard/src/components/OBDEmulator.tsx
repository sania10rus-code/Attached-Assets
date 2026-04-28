import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Activity, Gauge, Thermometer, Bluetooth, Fuel, MapPin, X } from "lucide-react";
import {
  loadAppData,
  updateTelemetry,
  formatMileage,
  addHistoryEvent,
  addTodayDistance,
} from "@/lib/storage";
import { useAppData } from "@/hooks/useAppData";
import SchedulingModal from "@/components/SchedulingModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useTranslation } from "@/i18n";

const TICK_MS = 1000;
const FUEL_CONSUMPTION_L_PER_100KM = 8;

type Notice = {
  id: number;
  text: string;
  reminderText?: string;
  fuelAlert?: boolean;
};

const NEARBY_STATIONS = [
  { name: "Лукойл", address: "Невский пр., 88", distance: "0.8 км" },
  { name: "Газпромнефть", address: "Лиговский пр., 50", distance: "1.4 км" },
  { name: "Shell", address: "Кременчугская ул., 9", distance: "2.1 км" },
];

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
  const { t } = useTranslation();
  const [running, setRunning] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [scheduleFor, setScheduleFor] = useState<string | null>(null);
  const [stationsOpen, setStationsOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const noticeId = useRef(1);
  const announced = useRef<Set<number>>(new Set());
  const lowFuelAlerted = useRef(false);
  const tripRef = useRef<{ startedAt: number; startMileage: number; samples: number[] } | null>(null);

  const pushNotice = (n: Omit<Notice, "id">) => {
    const id = noticeId.current++;
    setNotices((arr) => [...arr, { ...n, id }]);
    window.setTimeout(() => {
      setNotices((arr) => arr.filter((x) => x.id !== id));
    }, 6000);
  };

  const dismissNotice = (id: number) => {
    setNotices((arr) => arr.filter((x) => x.id !== id));
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
          desc: t("obd.tripDesc", { km: distance, avg: avgSpeed }),
          place: t("obd.tripPlace"),
          mileage: endMileage,
          date: dateIso,
          icon: "trip",
        });
        pushNotice({ text: t("obd.tripSaved", { km: distance }) });
      } else {
        pushNotice({ text: t("obd.stopped2") });
      }
    }
  };

  const start = () => {
    if (timerRef.current != null) return;
    setRunning(true);
    pushNotice({ text: t("obd.started") });
    const cur = loadAppData();
    tripRef.current = {
      startedAt: Date.now(),
      startMileage: Math.floor(cur.telemetry.mileage),
      samples: [],
    };
    lowFuelAlerted.current = cur.telemetry.fuelLiters < 10;

    timerRef.current = window.setInterval(() => {
      const cur = loadAppData();
      const tel = cur.telemetry;

      const speed = pickNextSpeed(tel.speed || 0);
      const rpm = rpmFor(speed);
      const temperature = tempStep(tel.temperature || 90);
      const addedKm = speed / 3600;
      const mileageFloat = (tel.mileage || 0) + addedKm;
      const mileage = Math.round(mileageFloat * 1000) / 1000;
      const fuelDelta = (addedKm * FUEL_CONSUMPTION_L_PER_100KM) / 100;
      const fuelLiters = Math.max(0, Math.round(((tel.fuelLiters ?? 50) - fuelDelta) * 100) / 100);

      const next = updateTelemetry({
        speed,
        rpm,
        temperature,
        mileage,
        fuelLiters,
      });

      if (addedKm > 0) addTodayDistance(addedKm);
      if (tripRef.current) tripRef.current.samples.push(speed);

      if (fuelLiters < 10 && !lowFuelAlerted.current) {
        lowFuelAlerted.current = true;
        pushNotice({ text: t("obd.lowFuel"), fuelAlert: true });
      }

      const flooredMileage = Math.floor(mileage);
      next.reminders.forEach((r) => {
        if (r.dueMileage == null) return;
        const remaining = r.dueMileage - flooredMileage;
        if (remaining <= 1000 && remaining > 0 && !announced.current.has(r.id)) {
          announced.current.add(r.id);
          pushNotice({ text: t("obd.soonReminder", { text: r.text, km: remaining }), reminderText: r.text });
        }
        if (remaining <= 0 && !announced.current.has(-r.id)) {
          announced.current.add(-r.id);
          pushNotice({ text: t("obd.dueReminder", { text: r.text }), reminderText: r.text });
        }
      });
    }, TICK_MS);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearInterval(timerRef.current);
    };
  }, []);

  const tel = data.telemetry;
  const displayMileage = Math.floor(tel.mileage);
  const fuelLiters = tel.fuelLiters ?? 50;
  const fuelPct = Math.max(0, Math.min(100, (fuelLiters / 50) * 100));
  const fuelLow = fuelLiters < 10;

  return (
    <div className="glass-card rounded-2xl p-5 border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bluetooth size={16} className={running ? "text-primary" : "text-muted-foreground"} />
          <h2 className="text-xs font-bold uppercase tracking-widest">{t("obd.title")}</h2>
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
          {running ? t("obd.onAir") : t("obd.stopped")}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <LiveStat icon={Gauge} label={t("obd.speed")} value={String(tel.speed)} unit={t("common.kmh")} pulse={running} />
        <LiveStat icon={Activity} label={t("obd.rpmShort")} value={String(tel.rpm)} unit={t("common.rpm")} pulse={running} />
        <LiveStat icon={Thermometer} label={t("obd.tempShort")} value={tel.temperature.toFixed(1)} unit="°C" pulse={running} />
      </div>

      <div className="bg-black/30 rounded-xl p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Fuel size={12} className={fuelLow ? "text-primary" : "text-muted-foreground"} />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("obd.fuel")}</span>
          </div>
          <span
            className={`text-xs font-mono font-bold ${fuelLow ? "text-primary text-glow" : "text-foreground"}`}
          >
            {fuelLiters.toFixed(1)} {t("common.liters")} / 50 {t("common.liters")}
          </span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${fuelPct}%` }}
            transition={{ duration: 0.4 }}
            className={`h-full rounded-full ${fuelLow ? "bg-primary" : "bg-green-500/70"}`}
          />
        </div>
        {fuelLow && (
          <button
            onClick={() => setStationsOpen(true)}
            className="mt-2 text-[10px] text-primary font-semibold uppercase tracking-wider flex items-center gap-1"
          >
            <MapPin size={11} />
            {t("obd.findStation")}
          </button>
        )}
      </div>

      <div className="flex justify-between items-baseline mb-4 px-1">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("obd.currentMileage")}</span>
        <span className={`text-sm font-mono font-bold ${running ? "text-primary text-glow" : ""}`}>
          {formatMileage(displayMileage)} {t("common.km")}
        </span>
      </div>

      {!running ? (
        <button
          onClick={start}
          className="w-full bg-primary text-primary-foreground rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
        >
          <Play size={16} />
          {t("obd.start")}
        </button>
      ) : (
        <button
          onClick={stop}
          className="w-full glass-card rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform border-primary/30 text-primary"
        >
          <Square size={16} />
          {t("obd.stop")}
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
                  {t("obd.book")}
                </button>
              )}
              {n.fuelAlert && (
                <button
                  onClick={() => {
                    setStationsOpen(true);
                    dismissNotice(n.id);
                  }}
                  className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1"
                >
                  <MapPin size={10} />
                  {t("obd.find")}
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

      <Sheet open={stationsOpen} onOpenChange={setStationsOpen}>
        <SheetContent side="bottom" className="bg-background border-white/10 rounded-t-3xl">
          <SheetHeader className="text-left">
            <SheetTitle className="text-xl tracking-tight flex items-center gap-2">
              <Fuel size={18} className="text-primary" />
              {t("obd.nearbyStations")}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {t("obd.fuelInTank", { liters: fuelLiters.toFixed(1) })}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 py-4 space-y-2">
            {NEARBY_STATIONS.map((s) => (
              <div
                key={s.name}
                className="glass-card rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <Fuel size={16} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">{s.address}</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-primary">{s.distance}</span>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
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