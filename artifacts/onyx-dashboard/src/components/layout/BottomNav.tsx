import React from "react";
import { Link, useLocation } from "wouter";
import { Gauge, History, Bell, FileText, Settings } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { path: "/", label: "Главная", icon: Gauge },
  { path: "/history", label: "История", icon: History },
  { path: "/reminders", label: "Напом.", icon: Bell },
  { path: "/orders", label: "Заказы", icon: FileText },
  { path: "/more", label: "Ещё", icon: Settings },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center w-full pointer-events-none">
      <div className="w-full max-w-[430px] bg-background/80 backdrop-blur-xl border-t border-white/10 pointer-events-auto pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const isActive = location === tab.path;
            const Icon = tab.icon;

            return (
              <Link key={tab.path} href={tab.path} className="relative flex flex-col items-center justify-center w-16 h-full gap-1 text-xs">
                <Icon
                  size={22}
                  className={`transition-colors duration-300 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`transition-colors duration-300 font-medium ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute top-0 w-8 h-[2px] bg-primary shadow-[0_0_8px_rgba(255,0,0,0.8)] rounded-b-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
