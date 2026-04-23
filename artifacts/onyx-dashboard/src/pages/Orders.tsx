import React from "react";
import { motion } from "framer-motion";
import { FileText, Download, Phone, MapPin, Clock, Check, Hourglass } from "lucide-react";
import { formatRub, formatDateRu } from "@/lib/storage";
import { useAppData } from "@/hooks/useAppData";

const pastOrders = [
  { id: "48102", date: "2025-04-15", total: 24500, center: "ОНИКС-СЕРВИС МСК", items: 5 },
  { id: "42011", date: "2024-11-10", total: 12800, center: "ОНИКС-СЕРВИС СПб", items: 3 },
];

export default function Orders() {
  const { orders } = useAppData();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-12 min-h-full"
    >
      <h1 className="text-2xl font-bold mb-1">Заказ-наряды</h1>
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-6">Активные и архив</p>

      {orders.map((order) => {
        const unpaid = order.paid === false;
        const paid = order.paid === true;
        return (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`glass-card rounded-2xl p-5 relative overflow-hidden mb-6 ${
            unpaid ? "border-primary/40 bg-primary/5" : "border-white/10"
          }`}
        >
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${unpaid ? "bg-primary" : "bg-white/20"}`} />

          <div className="flex justify-between items-start mb-4 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm truncate">{order.service}</h3>
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5">№ {order.id}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full border border-primary/40 bg-primary/15 text-primary text-glow text-center leading-tight">
                {order.status}
              </span>
              {(unpaid || paid) && (
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    paid
                      ? "bg-green-500/15 text-green-500 border-green-500/30"
                      : "bg-amber-400/15 text-amber-400 border-amber-400/30"
                  }`}
                >
                  {paid ? "Оплачен" : "Не оплачен"}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              <span className="font-mono">{formatDateRu(order.date)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} />
              <span>{order.city}</span>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between items-baseline gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="truncate">{it.name}</div>
                  <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                    {it.qty} шт.
                  </div>
                </div>
                <span className="font-mono shrink-0">{formatRub(it.price)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10 mb-4">
            <span className="text-sm font-bold uppercase tracking-wider">Итого</span>
            <span className="text-xl font-bold font-mono text-glow">{formatRub(order.total)}</span>
          </div>

          {order.comment && (
            <div className="mb-4 -mt-1 bg-black/30 rounded-xl px-3 py-2 text-[11px] text-muted-foreground italic">
              «{order.comment}»
            </div>
          )}

          {unpaid ? (
            <div className="w-full bg-amber-400/10 border border-amber-400/30 text-amber-400 rounded-2xl py-3 text-xs font-semibold flex items-center justify-center gap-2 text-center px-3 leading-snug">
              <Hourglass size={14} />
              Ожидает подтверждения оплаты механиком
            </div>
          ) : paid ? (
            <div className="w-full bg-green-500/15 border border-green-500/30 text-green-500 rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2">
              <Check size={16} />
              Оплачено{order.paidAmount != null ? ` · ${formatRub(order.paidAmount)}` : ""}
            </div>
          ) : (
            <button
              onClick={() => {
                window.location.href = "tel:+78001234567";
              }}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
            >
              <Phone size={16} />
              Связаться с сервисом
            </button>
          )}
        </motion.div>
        );
      })}

      <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">Архив</h2>
      <div className="space-y-3">
        {pastOrders.map((order, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
            key={order.id}
            className="glass-card rounded-2xl p-4 border-white/5"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
                  <FileText size={16} className="text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm font-mono">№ {order.id}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{formatDateRu(order.date)}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground">
                <Download size={16} />
              </button>
            </div>

            <div className="bg-black/30 rounded-xl p-3 mb-3">
              <div className="text-[11px] text-muted-foreground mb-0.5">{order.center}</div>
              <div className="text-[11px] font-medium">{order.items} позиций в заказе</div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Итого</span>
              <span className="text-base font-bold font-mono">{formatRub(order.total)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
