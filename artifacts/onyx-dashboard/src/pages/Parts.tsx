import React, { useState } from "react";
import { motion } from "framer-motion";
import { Droplet, Filter, Disc3, Zap, Wrench, ShoppingCart, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { addOrder, formatRub, type OrderItem } from "@/lib/storage";
import { useAppData } from "@/hooks/useAppData";
import { useTranslation } from "@/i18n";

type Part = {
  id: string;
  name: string;
  brand: string;
  qty: number;
  price: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  desc: string;
};

const catalog: Part[] = [
  { id: "oil", name: "Масло моторное", brand: "Castrol Edge 5W-30", qty: 1, price: 5000, icon: Droplet, desc: "Канистра 4 л" },
  { id: "oil-filter", name: "Масляный фильтр", brand: "MANN W712/52", qty: 1, price: 1300, icon: Filter, desc: "Оригинал OEM" },
  { id: "air-filter", name: "Воздушный фильтр", brand: "Bosch S0080", qty: 1, price: 1200, icon: Filter, desc: "Бумажный элемент" },
  { id: "pads", name: "Тормозные колодки", brand: "TRW GDB1622", qty: 1, price: 7000, icon: Disc3, desc: "Передняя ось, комплект" },
  { id: "spark", name: "Свечи зажигания", brand: "NGK BKR6E-11", qty: 4, price: 1100, icon: Zap, desc: "Иридиевые, цена за шт." },
  { id: "timing-belt", name: "Ремень ГРМ", brand: "Gates K015569XS", qty: 1, price: 8500, icon: Wrench, desc: "Комплект с роликами" },
];

export default function Parts() {
  const { t } = useTranslation();
  const { carModel } = useAppData();
  const [selected, setSelected] = useState<Part | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const onConfirm = () => {
    if (!selected) return;
    const item: OrderItem = {
      name: `${selected.name} ${selected.brand}`,
      qty: selected.qty,
      price: selected.price * selected.qty,
    };
    addOrder({
      id: String(50000 + Math.floor(Math.random() * 9000)),
      date: new Date().toISOString().slice(0, 10),
      service: "ОНИКС-МАГАЗИН",
      city: "Санкт-Петербург",
      status: "Принят в обработку",
      items: [item],
      total: item.price,
    });
    setConfirmed(true);
    window.setTimeout(() => {
      setSelected(null);
      setConfirmed(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-12 min-h-full"
    >
      <h1 className="text-2xl font-bold mb-1">{t("parts.title")}</h1>
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
        {t("parts.subtitle", { model: carModel })}
      </p>

      <div className="space-y-3">
        {catalog.map((p, i) => {
          const Icon = p.icon;
          const total = p.price * p.qty;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              key={p.id}
              className="glass-card rounded-2xl p-4 border-white/5"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight">{p.name}</h3>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">{p.brand}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{p.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-sm">{formatRub(total)}</div>
                  {p.qty > 1 && (
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      {p.qty} × {formatRub(p.price)}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelected(p)}
                className="w-full bg-primary/15 text-primary border border-primary/30 rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
              >
                <ShoppingCart size={14} />
                {t("parts.order")}
              </button>
            </motion.div>
          );
        })}
      </div>

      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent side="bottom" className="bg-background border-white/10 rounded-t-3xl">
          <SheetHeader className="text-left">
            <SheetTitle className="text-xl tracking-tight flex items-center gap-2">
              {confirmed ? <Check size={18} className="text-green-500" /> : <ShoppingCart size={18} className="text-primary" />}
              {confirmed ? t("parts.placedTitle") : t("parts.confirmTitle")}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {confirmed
                ? t("parts.placedDesc")
                : selected
                  ? `${selected.name} (${selected.brand})`
                  : ""}
            </SheetDescription>
          </SheetHeader>

          {selected && !confirmed && (
            <div className="px-4 mt-4">
              <div className="glass-card rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("parts.qty")}</span>
                  <span className="font-mono">{selected.qty} {t("common.pieces")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("parts.price")}</span>
                  <span className="font-mono">{formatRub(selected.price)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                  <span className="font-bold uppercase tracking-wider text-xs">{t("common.total")}</span>
                  <span className="font-mono font-bold">{formatRub(selected.price * selected.qty)}</span>
                </div>
              </div>
            </div>
          )}

          {!confirmed && (
            <SheetFooter className="px-4 pb-2 pt-4 flex-col gap-2 sm:flex-col">
              <button
                onClick={onConfirm}
                className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-sm font-semibold active:scale-[.98] transition-transform"
              >
                {t("parts.confirm")}
              </button>
              <button
                onClick={() => setSelected(null)}
                className="w-full glass-card rounded-2xl py-4 text-sm font-medium text-muted-foreground"
              >
                {t("common.cancel")}
              </button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
