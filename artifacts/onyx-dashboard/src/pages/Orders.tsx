import React from "react";
import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";

const orders = [
  { id: "49281", date: "21.10.2025", total: "6 300 ₽", center: "ОНИКС-СЕРВИС СПб", items: 2 },
  { id: "48102", date: "15.04.2025", total: "24 500 ₽", center: "ОНИКС-СЕРВИС МСК", items: 5 },
  { id: "42011", date: "10.11.2024", total: "12 800 ₽", center: "ОНИКС-СЕРВИС СПб", items: 3 },
];

export default function Orders() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-12 min-h-full"
    >
      <h1 className="text-2xl font-bold mb-6">Заказ-наряды</h1>

      <div className="space-y-4">
        {orders.map((order, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            key={order.id}
            className="glass-card rounded-2xl p-5 border-white/5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <FileText size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm font-mono">№ {order.id}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{order.date}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground">
                <Download size={18} />
              </button>
            </div>
            
            <div className="bg-black/30 rounded-xl p-3 mb-4">
              <div className="text-xs text-muted-foreground mb-1">{order.center}</div>
              <div className="text-xs font-medium">{order.items} позиций в заказе</div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Итого</span>
              <span className="text-lg font-bold font-mono">{order.total}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
