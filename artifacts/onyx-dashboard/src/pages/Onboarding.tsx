import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";

type Stage = "start" | "anim" | "text" | "done";

type Props = {
  role: "owner" | "mechanic";
  onDone: () => void;
};

const SAPPHIRE = "#1a3a5c";
const SAPPHIRE_GLOW = "#2a5a8a";

export default function Onboarding({ role, onDone }: Props) {
  const [stage, setStage] = useState<Stage>("start");
  const rpm = useMotionValue(0);
  const angle = useTransform(rpm, [0, 8000], [-135, 135]);
  const rpmRounded = useTransform(rpm, (v) => Math.round(v / 100) * 100);

  // Animate RPM: rev to 3500 then idle oscillation
  useEffect(() => {
    if (stage !== "anim" && stage !== "text") return;
    let cancelled = false;
    const seq = async () => {
      const c1 = animate(rpm, 3500, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
      await c1;
      if (cancelled) return;
      // Idle oscillation around 800 rpm
      const c2 = animate(rpm, 800, { duration: 0.8, ease: "easeOut" });
      await c2;
      if (cancelled) return;
      while (!cancelled) {
        const c3 = animate(rpm, 950, { duration: 1.4, ease: "easeInOut" });
        await c3;
        if (cancelled) return;
        const c4 = animate(rpm, 750, { duration: 1.4, ease: "easeInOut" });
        await c4;
      }
    };
    seq();
    return () => {
      cancelled = true;
    };
  }, [stage, rpm]);

  // Reveal text after 1.4s of revving
  useEffect(() => {
    if (stage !== "anim") return;
    const t = setTimeout(() => setStage("text"), 1400);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "done") return;
    const t = setTimeout(onDone, 500);
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
              className="relative w-44 h-44 rounded-full text-white text-2xl font-bold tracking-widest uppercase active:scale-95 transition-transform"
              style={{
                backgroundColor: SAPPHIRE,
                boxShadow: `0 0 60px ${SAPPHIRE_GLOW}aa, inset 0 0 0 1px ${SAPPHIRE_GLOW}`,
              }}
            >
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${SAPPHIRE_GLOW}` }}
                animate={{ scale: [1, 1.25, 1.5], opacity: [0.7, 0.25, 0] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ border: `2px solid ${SAPPHIRE_GLOW}` }}
                animate={{ scale: [1, 1.25, 1.5], opacity: [0.7, 0.25, 0] }}
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
            <Tachometer angle={angle} rpmRounded={rpmRounded} />
            <AnimatePresence>
              {stage === "text" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mt-7 text-center space-y-3 w-full"
                >
                  {lines.map((l, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.15 * i }}
                      className={
                        i === 0
                          ? "text-xl font-bold tracking-tight"
                          : i === 1
                            ? "text-xs uppercase tracking-widest font-mono"
                            : "text-sm text-muted-foreground leading-relaxed"
                      }
                      style={i === 1 ? { color: SAPPHIRE_GLOW } : undefined}
                    >
                      {l}
                    </motion.p>
                  ))}

                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 * lines.length + 0.2 }}
                    onClick={() => setStage("done")}
                    data-testid="onboarding-continue"
                    className="mt-6 w-full text-white rounded-2xl py-3.5 text-sm font-semibold uppercase tracking-widest active:scale-[.98] transition-transform"
                    style={{
                      backgroundColor: SAPPHIRE,
                      boxShadow: `0 0 24px ${SAPPHIRE_GLOW}66, inset 0 0 0 1px ${SAPPHIRE_GLOW}`,
                    }}
                  >
                    Продолжить
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Tachometer({
  angle,
  rpmRounded,
}: {
  angle: ReturnType<typeof useTransform<number, number>>;
  rpmRounded: ReturnType<typeof useTransform<number, number>>;
}) {
  return (
    <div className="relative w-56 h-56">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <linearGradient id="tach-arc" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={SAPPHIRE_GLOW} />
            <stop offset="60%" stopColor={SAPPHIRE_GLOW} />
            <stop offset="80%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ff3344" />
          </linearGradient>
          <radialGradient id="tach-bg" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#0e1828" />
            <stop offset="100%" stopColor="#070b14" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="92" fill="url(#tach-bg)" stroke={SAPPHIRE} strokeWidth="1.5" />
        <path
          d="M 35 152 A 80 80 0 1 1 165 152"
          fill="none"
          stroke="url(#tach-arc)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.85"
        />
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (-135 + (270 / 8) * i) * (Math.PI / 180);
          const x1 = 100 + Math.sin(a) * 78;
          const y1 = 100 - Math.cos(a) * 78;
          const x2 = 100 + Math.sin(a) * 88;
          const y2 = 100 - Math.cos(a) * 88;
          const lx = 100 + Math.sin(a) * 66;
          const ly = 100 - Math.cos(a) * 66 + 3;
          const num = i; // 0..8 -> ×1000
          const isRedline = i >= 6;
          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isRedline ? "#ff3344" : "rgba(180,200,230,0.6)"}
                strokeWidth={2}
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                fill={isRedline ? "#ff3344" : "rgba(180,200,230,0.7)"}
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fontWeight="700"
              >
                {num}
              </text>
            </g>
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
          background: `linear-gradient(to top, ${SAPPHIRE_GLOW}, #ffffff)`,
          borderRadius: 2,
          boxShadow: `0 0 12px ${SAPPHIRE_GLOW}`,
          rotate: angle,
        }}
      />
      <div className="absolute left-1/2 top-1/2 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 pointer-events-none">
        <motion.div
          className="text-3xl font-bold font-mono tabular-nums"
          style={{ color: SAPPHIRE_GLOW }}
        >
          <motion.span>{rpmRounded}</motion.span>
        </motion.div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
          об/мин
        </span>
      </div>
    </div>
  );
}
