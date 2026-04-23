import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";

type Stage = "start" | "anim" | "text" | "done";

type Props = {
  role: "owner" | "mechanic";
  onDone: () => void;
};

export default function Onboarding({ role, onDone }: Props) {
  const [stage, setStage] = useState<Stage>("start");
  const speed = useMotionValue(0);
  const angle = useTransform(speed, [0, 100], [-135, 135]);
  const speedRounded = useTransform(speed, (v) => Math.round(v));

  useEffect(() => {
    if (stage !== "anim") return;
    const controls = animate(speed, 100, {
      duration: 1.5,
      ease: [0.22, 1, 0.36, 1],
    });
    const t = setTimeout(() => setStage("text"), 1600);
    return () => {
      controls.stop();
      clearTimeout(t);
    };
  }, [stage, speed]);

  useEffect(() => {
    if (stage !== "text") return;
    const t = setTimeout(() => setStage("done"), 3500);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "done") return;
    const t = setTimeout(onDone, 600);
    return () => clearTimeout(t);
  }, [stage, onDone]);

  const lines =
    role === "mechanic"
      ? [
          "Я ОНИКС — ваша панель управления сервисом.",
          "Объективная Независимая Интеллектуальная Контрольная Система.",
          "Я помогу принимать заявки, вести заказ-наряды и хранить историю работ.",
          "Все автомобили в ОНИКС имеют чистую и неизменяемую историю — это повышает доверие клиентов.",
        ]
      : [
          "Я ОНИКС — ваш персональный автомобильный ассистент.",
          "Объективная Независимая Интеллектуальная Контрольная Система.",
          "Я помогу следить за автомобилем, напомню о записи в сервис и сохраню всю историю обслуживания.",
          "Все автомобили в ОНИКС имеют чистую и неизменяемую историю. Это повышает доверие и упрощает продажу.",
        ];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: stage === "done" ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{ backgroundColor: "#0b0e14" }}
    >
      <AnimatePresence mode="wait">
        {stage === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <button
              onClick={() => setStage("anim")}
              data-testid="onboarding-start"
              className="relative w-44 h-44 rounded-full bg-primary text-primary-foreground text-2xl font-bold tracking-widest uppercase active:scale-95 transition-transform"
              style={{
                boxShadow:
                  "0 0 60px rgba(255,0,0,.45), 0 0 0 0 rgba(255,0,0,.35) inset",
              }}
            >
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-primary"
                animate={{ scale: [1, 1.25, 1.5], opacity: [0.6, 0.2, 0] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-primary"
                animate={{ scale: [1, 1.25, 1.5], opacity: [0.6, 0.2, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: 0.6 }}
              />
              <span className="relative">Начать</span>
            </button>
            <p className="mt-8 text-[11px] text-muted-foreground/70 uppercase tracking-widest font-mono">
              {role === "mechanic" ? "Панель механика" : "Цифровой паспорт"}
            </p>
          </motion.div>
        )}

        {(stage === "anim" || stage === "text") && (
          <motion.div
            key="anim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center w-full max-w-sm"
          >
            <Speedometer angle={angle} speedRounded={speedRounded} />
            <AnimatePresence>
              {stage === "text" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mt-8 text-center space-y-3"
                >
                  {lines.map((l, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.15 * i }}
                      className={
                        i === 0
                          ? "text-xl font-bold tracking-tight text-glow"
                          : i === 1
                            ? "text-xs uppercase tracking-widest text-primary font-mono"
                            : "text-sm text-muted-foreground leading-relaxed"
                      }
                    >
                      {l}
                    </motion.p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Speedometer({
  angle,
  speedRounded,
}: {
  angle: ReturnType<typeof useTransform<number, number>>;
  speedRounded: ReturnType<typeof useTransform<number, number>>;
}) {
  return (
    <div className="relative w-56 h-56">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <linearGradient id="arc-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ff0033" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        <path
          d="M 35 152 A 80 80 0 1 1 165 152"
          fill="none"
          stroke="url(#arc-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
        {Array.from({ length: 11 }).map((_, i) => {
          const a = (-135 + (270 / 10) * i) * (Math.PI / 180);
          const x1 = 100 + Math.sin(a) * 78;
          const y1 = 100 - Math.cos(a) * 78;
          const x2 = 100 + Math.sin(a) * 88;
          const y2 = 100 - Math.cos(a) * 88;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={i % 5 === 0 ? 2 : 1}
            />
          );
        })}
      </svg>
      <motion.div
        className="absolute left-1/2 top-1/2 origin-bottom"
        style={{
          width: 3,
          height: 78,
          marginLeft: -1.5,
          marginTop: -78,
          background: "linear-gradient(to top, #ff0033, #ff6680)",
          borderRadius: 2,
          boxShadow: "0 0 12px rgba(255,0,51,.8)",
          rotate: angle,
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.div className="text-5xl font-bold font-mono text-glow tabular-nums">
          <motion.span>{speedRounded}</motion.span>
        </motion.div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">км/ч</span>
      </div>
    </div>
  );
}
