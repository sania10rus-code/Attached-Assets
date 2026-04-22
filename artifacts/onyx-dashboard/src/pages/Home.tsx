import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Settings2, Activity, Fuel, Thermometer, Gauge, LineChart, Droplet, CalendarCheck } from "lucide-react";
import { Link } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

const statCards = [
  { id: "mileage", label: "Пробег", value: "102 345", unit: "км", icon: Settings2 },
  { id: "errors", label: "Ошибки", value: "0", unit: "", icon: Activity, success: true },
  { id: "fuel", label: "Заправка", value: "7", unit: "дней", icon: Fuel },
  { id: "temp", label: "Температура", value: "90", unit: "°C", icon: Thermometer },
];

export default function Home() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [oilOpen, setOilOpen] = useState(false);

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
            <h1 className="text-3xl font-bold tracking-tight text-glow">Audi A6</h1>
            <p className="text-muted-foreground text-sm tracking-wider font-mono mt-1">ОНИКС ТЕЛЕМЕТРИЯ</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
        
        {/* Car Visual */}
        <div className="relative w-full aspect-[16/9] -mt-4 mb-6">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <img 
            src="/audi-a6.png" 
            alt="Audi A6" 
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
          <span>Подробнее</span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        {/* Reminders Banner */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setOilOpen(true)}
          className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 cursor-pointer relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Settings2 size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold">Замена масла</h3>
            <p className="text-xs text-primary font-mono mt-1">через 5 000 км</p>
          </div>
          <ChevronRight size={20} className="text-muted-foreground shrink-0" />
        </motion.div>

        {/* Recent Order */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Последний заказ-наряд</h2>
            <Link href="/orders" className="text-xs text-primary font-medium">Все</Link>
          </div>
          <div className="glass-card rounded-2xl p-5 border-white/5">
            <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-bold text-sm">ОНИКС-СЕРВИС</h3>
                <p className="text-xs text-muted-foreground mt-1">21.10.2025 • СПб</p>
              </div>
              <div className="bg-white/10 text-white text-[10px] px-2 py-1 rounded font-mono font-medium">
                № 49281
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Масляный фильтр MANN</span>
                <span className="font-mono">1 300 ₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Масло моторное Castrol</span>
                <span className="font-mono">5 000 ₽</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <span className="text-sm font-bold uppercase tracking-wider">Итого</span>
              <span className="text-lg font-bold font-mono">6 300 ₽</span>
            </div>
          </div>
        </div>
      </div>

      {/* Подробнее — расширенная диагностика */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="bottom" className="bg-background border-white/10 rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle className="text-xl tracking-tight">Расширенная диагностика</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Показатели бортовых датчиков · в режиме реального времени
            </SheetDescription>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-3 mt-4 px-4">
            {[
              { icon: Gauge, label: "Обороты", value: "820", unit: "об/мин" },
              { icon: Thermometer, label: "Охл. жидкость", value: "90", unit: "°C" },
              { icon: Droplet, label: "Давл. масла", value: "3.4", unit: "бар" },
              { icon: Activity, label: "Напряжение АКБ", value: "14.1", unit: "В" },
              { icon: Fuel, label: "Расход", value: "8.2", unit: "л/100" },
              { icon: LineChart, label: "Нагрузка ДВС", value: "23", unit: "%" },
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
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Темп. за сутки</span>
                <span className="text-xs text-primary font-mono">90 °C</span>
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
              Замена масла
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Рекомендована через <span className="text-primary font-mono">5 000 км</span> или до <span className="text-primary font-mono">21.04.2026</span>.
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 mt-4 space-y-3">
            <div className="glass-card rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Тип масла</span>
                <span className="font-mono">Castrol Edge 5W-30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Объём</span>
                <span className="font-mono">5.2 л</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Прошлая замена</span>
                <span className="font-mono">96 845 км · 21.10.25</span>
              </div>
            </div>
          </div>

          <SheetFooter className="px-4 pb-2 pt-4 flex-col gap-2 sm:flex-col">
            <button
              onClick={() => setOilOpen(false)}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
            >
              <CalendarCheck size={16} />
              Записаться в ОНИКС-СЕРВИС
            </button>
            <button
              onClick={() => setOilOpen(false)}
              className="w-full glass-card rounded-2xl py-4 text-sm font-medium text-muted-foreground"
            >
              Напомнить позже
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
