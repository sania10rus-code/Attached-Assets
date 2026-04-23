import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Settings2, Activity, Fuel, Thermometer, Gauge, LineChart, Droplet, CalendarCheck, Route, AlertCircle, LogOut, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { formatMileage, formatRub, formatDateRu } from "@/lib/storage";
import { useAppData } from "@/hooks/useAppData";
import OBDEmulator from "@/components/OBDEmulator";
import { useTranslation } from "@/i18n";

export default function Home() {
  const data = useAppData();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [oilOpen, setOilOpen] = useState(false);

  const { telemetry, carModel, carYear, orders, reminders, todayDistance, history } = data;
  const hasUnackDiscrepancy = history.some(
    (h) => h.discrepancy && !h.discrepancy.acknowledged,
  );
  const displayMileage = Math.floor(telemetry.mileage);
  const oilReminder = reminders.find((r) => r.text.toLowerCase().includes("масл"));
  const kmToOil = oilReminder?.dueMileage ? Math.max(0, oilReminder.dueMileage - displayMileage) : 5000;

  const lastOrder = orders[0];
  const unpaid = orders.filter((o) => o.paid === false);
  const unpaidTotal = unpaid.reduce((s, o) => s + o.total, 0);

  const statCards = [
    { id: "mileage", label: t("home.stats.mileage"), value: formatMileage(displayMileage), unit: t("common.km"), icon: Settings2 },
    { id: "today", label: t("home.stats.today"), value: todayDistance.toFixed(1), unit: t("common.km"), icon: Route },
    { id: "errors", label: t("home.stats.errors"), value: String(telemetry.errors), unit: "", icon: Activity, success: telemetry.errors === 0 },
    { id: "fuel", label: t("home.stats.fuel"), value: String(telemetry.fuelDays), unit: t("common.days"), icon: Fuel },
    { id: "temp", label: t("home.stats.temp"), value: String(telemetry.temperature), unit: "°C", icon: Thermometer },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-full"
    >
      {/* Header / Hero */}
      <div className="relative pt-12 pb-6 px-6">
        <div className="flex justify-between items-end mb-6 relative z-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-glow">{carModel}</h1>
            <p className="text-muted-foreground text-sm tracking-wider font-mono mt-1">
              {t("home.telemetryLabel", { year: carYear })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <button
              onClick={logout}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground"
              title={t("home.logoutTitle")}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {hasUnackDiscrepancy && (
          <Link href="/history">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 bg-amber-400/10 border border-amber-400/40 rounded-2xl px-4 py-3 flex items-start gap-2 cursor-pointer"
              data-testid="banner-discrepancy"
            >
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-400 font-medium leading-snug">
                {t("home.discrepancyBanner")}
              </div>
            </motion.div>
          </Link>
        )}

        {unpaid.length > 0 && (
          <Link href="/orders">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-primary/10 border border-primary/30 rounded-2xl px-4 py-2.5 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs">
                <AlertCircle size={14} className="text-primary" />
                <span className="text-primary font-semibold">
                  {t("home.unpaid", { count: unpaid.length })}
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-primary text-glow">
                {formatRub(unpaidTotal)}
              </span>
            </motion.div>
          </Link>
        )}

        {/* Car Visual */}
        <div className="relative w-full aspect-[16/9] -mt-4 mb-6">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <img
            src={import.meta.env.BASE_URL + "skoda-octavia.png"}
            alt={carModel}
            className="w-full h-full object-cover rounded-xl opacity-90 mix-blend-screen"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 relative z-20">
          {statCards.map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              key={stat.id}
              className={`glass-card p-4 rounded-2xl flex flex-col justify-between ${
                stat.success ? "border-green-500/20" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <stat.icon size={16} className={stat.success ? "text-green-500" : "text-muted-foreground"} />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${stat.success ? "text-green-500 text-glow" : "text-foreground"}`}>
                  {stat.value}
                </span>
                {stat.unit && <span className="text-xs text-muted-foreground">{stat.unit}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-6 flex flex-col gap-4 pb-8">
        <button
          onClick={() => setDetailsOpen(true)}
          className="w-full glass-card hover:bg-white/5 active:bg-white/10 transition-colors py-4 rounded-2xl flex justify-center items-center gap-2 text-sm font-medium"
        >
          <span>{t("home.details")}</span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        <OBDEmulator />

        {/* Reminders Banner */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setOilOpen(true)}
          className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 cursor-pointer relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Droplet size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold">{t("home.oilTitle")}</h3>
            <p className="text-xs text-primary font-mono mt-1">{t("home.oilIn", { km: formatMileage(kmToOil) })}</p>
          </div>
          <ChevronRight size={20} className="text-muted-foreground shrink-0" />
        </motion.div>

        {/* Recent Order */}
        {lastOrder && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("home.lastOrder")}</h2>
              <Link href="/orders" className="text-xs text-primary font-medium">{t("common.all")}</Link>
            </div>
            <div className="glass-card rounded-2xl p-5 border-white/5">
              <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-bold text-sm">{lastOrder.service}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDateRu(lastOrder.date)} • {lastOrder.city}
                  </p>
                </div>
                <div className="bg-white/10 text-white text-[10px] px-2 py-1 rounded font-mono font-medium">
                  № {lastOrder.id}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {lastOrder.items.slice(0, 3).map((it, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate pr-2">{it.name}</span>
                    <span className="font-mono shrink-0">{formatRub(it.price)}</span>
                  </div>
                ))}
                {lastOrder.items.length > 3 && (
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {t("home.morePositions", { n: lastOrder.items.length - 3 })}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <span className="text-sm font-bold uppercase tracking-wider">{t("common.total")}</span>
                <span className="text-lg font-bold font-mono">{formatRub(lastOrder.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Подробнее — расширенная диагностика */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="bottom" className="bg-background border-white/10 rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle className="text-xl tracking-tight">{t("home.advancedDiag")}</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {t("home.advancedSubtitle", { model: carModel })}
            </SheetDescription>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-3 mt-4 px-4">
            {[
              { icon: Gauge, label: t("home.adv.rpm"), value: telemetry.rpm > 0 ? String(telemetry.rpm) : "820", unit: t("common.rpm") },
              { icon: Thermometer, label: t("home.adv.coolant"), value: String(telemetry.temperature), unit: "°C" },
              { icon: Droplet, label: t("home.adv.oilP"), value: "3.4", unit: t("home.adv.bar") },
              { icon: Activity, label: t("home.adv.battery"), value: telemetry.batteryVoltage.toFixed(1), unit: t("home.adv.volts") },
              { icon: Fuel, label: t("home.adv.consumption"), value: "8.2", unit: t("home.adv.lph") },
              { icon: LineChart, label: t("home.adv.load"), value: "23", unit: "%" },
            ].map((m) => (
              <div key={m.label} className="glass-card p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <m.icon size={14} className="text-muted-foreground" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold">{m.value}</span>
                  <span className="text-xs text-muted-foreground">{m.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 mt-5 mb-4">
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("home.tempLast24")}</span>
                <span className="text-xs text-primary font-mono">{telemetry.temperature} °C</span>
              </div>
              <div className="flex items-end gap-1 h-20">
                {[40, 55, 62, 78, 84, 88, 90, 91, 89, 90, 87, 90].map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/30 rounded-sm"
                    style={{ height: `${v}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Замена масла — запись в сервис */}
      <Sheet open={oilOpen} onOpenChange={setOilOpen}>
        <SheetContent side="bottom" className="bg-background border-white/10 rounded-t-3xl">
          <SheetHeader className="text-left">
            <SheetTitle className="text-xl tracking-tight flex items-center gap-2">
              <Droplet size={18} className="text-primary" />
              {t("home.oilTitle")}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {t("home.oil.recommended")} <span className="text-primary font-mono">{formatMileage(kmToOil)} {t("common.km")}</span>.
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 mt-4 space-y-3">
            <div className="glass-card rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("home.oil.type")}</span>
                <span className="font-mono">Castrol Edge 5W-30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("home.oil.volume")}</span>
                <span className="font-mono">4.5 {t("common.liters")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("home.oil.last")}</span>
                <span className="font-mono">40 000 {t("common.km")} · 01.01.2017</span>
              </div>
            </div>
          </div>

          <SheetFooter className="px-4 pb-2 pt-4 flex-col gap-2 sm:flex-col">
            <button
              onClick={() => setOilOpen(false)}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
            >
              <CalendarCheck size={16} />
              {t("home.oil.book")}
            </button>
            <button
              onClick={() => setOilOpen(false)}
              className="w-full glass-card rounded-2xl py-4 text-sm font-medium text-muted-foreground"
            >
              {t("home.oil.later")}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
