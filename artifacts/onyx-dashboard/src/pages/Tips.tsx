import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, Snowflake, Sun, Leaf, Flower2, Wrench } from "lucide-react";

const SAPPHIRE = "#1a3a5c";
const SAPPHIRE_GLOW = "#2a5a8a";

type Season = {
  key: string;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>;
  color: string;
  items: string[];
};

const SEASONS: Season[] = [
  {
    key: "spring",
    title: "Весна",
    icon: Flower2,
    color: "#22c55e",
    items: [
      "Проверить кондиционер и заправить хладагент",
      "Заменить щётки стеклоочистителя",
      "Проверить ходовую после зимы (сайлентблоки, шаровые)",
      "Промыть днище от реагентов",
    ],
  },
  {
    key: "summer",
    title: "Лето",
    icon: Sun,
    color: "#eab308",
    items: [
      "Следить за уровнем и температурой масла",
      "Проверить давление в шинах при жаре",
      "Контроль уровня охлаждающей жидкости",
      "Очистить радиатор от тополиного пуха",
    ],
  },
  {
    key: "autumn",
    title: "Осень",
    icon: Leaf,
    color: "#f97316",
    items: [
      "Сменить резину на зимнюю при +7°C",
      "Проверить АКБ и клеммы",
      "Заменить антифриз при необходимости",
      "Обработать резинки дверей силиконом",
    ],
  },
  {
    key: "winter",
    title: "Зима",
    icon: Snowflake,
    color: "#38bdf8",
    items: [
      "Прогревать двигатель 1–2 минуты перед поездкой",
      "Поддерживать давление в шинах (зимой падает)",
      "Проверить высоковольтные провода и свечи",
      "Использовать зимний омыватель −25°C",
    ],
  },
];

const MILEAGE_REGS: { km: number; items: string[] }[] = [
  {
    km: 15000,
    items: ["Замена моторного масла и масляного фильтра", "Проверка тормозной системы", "Диагностика подвески"],
  },
  {
    km: 30000,
    items: ["Замена воздушного и салонного фильтров", "Замена тормозной жидкости", "Чистка дроссельной заслонки"],
  },
  {
    km: 60000,
    items: ["Замена свечей зажигания", "Замена топливного фильтра", "Проверка ремня ГРМ", "Замена масла в АКПП/МКПП"],
  },
  {
    km: 90000,
    items: ["Замена ремня ГРМ с роликами и помпой", "Замена антифриза", "Диагностика турбины (если есть)"],
  },
  {
    km: 120000,
    items: ["Капитальная диагностика двигателя", "Замена приводных ремней", "Проверка катализатора и лямбда-зонда"],
  },
];

export default function Tips() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-12 min-h-full"
    >
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb size={20} style={{ color: SAPPHIRE_GLOW }} />
        <h1 className="text-2xl font-bold">Памятка</h1>
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
        Сезонные советы и регламент
      </p>

      <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
        По сезонам
      </h2>
      <div className="space-y-3 mb-8">
        {SEASONS.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="rounded-2xl border p-4"
            style={{ backgroundColor: "#0d1726", borderColor: `${SAPPHIRE}aa` }}
            data-testid={`season-${s.key}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${s.color}22` }}
              >
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <h3 className="text-base font-bold">{s.title}</h3>
            </div>
            <ul className="space-y-1.5">
              {s.items.map((it, j) => (
                <li key={j} className="flex items-start gap-2 text-[13px] text-muted-foreground leading-snug">
                  <span
                    className="w-1 h-1 rounded-full mt-2 shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
        Регламент по пробегу
      </h2>
      <div className="space-y-3">
        {MILEAGE_REGS.map((r, i) => (
          <motion.div
            key={r.km}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="rounded-2xl border p-4"
            style={{ backgroundColor: "#0d1726", borderColor: `${SAPPHIRE}aa` }}
            data-testid={`reg-${r.km}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${SAPPHIRE_GLOW}22` }}
                >
                  <Wrench size={18} style={{ color: SAPPHIRE_GLOW }} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    каждые
                  </div>
                  <div className="text-lg font-bold font-mono" style={{ color: SAPPHIRE_GLOW }}>
                    {r.km.toLocaleString("ru-RU")} км
                  </div>
                </div>
              </div>
            </div>
            <ul className="space-y-1.5">
              {r.items.map((it, j) => (
                <li key={j} className="flex items-start gap-2 text-[13px] text-muted-foreground leading-snug">
                  <span
                    className="w-1 h-1 rounded-full mt-2 shrink-0"
                    style={{ backgroundColor: SAPPHIRE_GLOW }}
                  />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="h-12" />
    </motion.div>
  );
}
