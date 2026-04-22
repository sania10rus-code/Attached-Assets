import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Fuel } from "lucide-react";

const historyData = [
  { id: 1, date: "Сегодня, 08:30", type: "Поездка", distance: "12 км", duration: "45 мин", fuel: "1.2 л", route: "Дом - Офис" },
  { id: 2, date: "Вчера, 19:15", type: "Поездка", distance: "8 км", duration: "25 мин", fuel: "0.8 л", route: "Офис - ТЦ Галерея" },
  { id: 3, date: "Вчера, 17:00", type: "Заправка", distance: null, duration: null, fuel: "+ 40 л", route: "Газпромнефть" },
  { id: 4, date: "18 Окт, 09:00", type: "Диагностика", distance: null, duration: "1 ч 20 мин", fuel: null, route: "Плановая проверка" },
  { id: 5, date: "15 Окт, 10:10", type: "Поездка", distance: "45 км", duration: "1 ч 10 мин", fuel: "4.5 л", route: "Загородная" },
];

export default function History() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-12 min-h-full"
    >
      <h1 className="text-2xl font-bold mb-6">История</h1>
      
      <div className="relative border-l border-white/10 ml-3 space-y-8 pb-4">
        {historyData.map((item, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            key={item.id}
            className="relative pl-6"
          >
            <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${item.type === 'Заправка' ? 'bg-green-500' : item.type === 'Диагностика' ? 'bg-primary' : 'bg-white/30'}`} />
            
            <div className="text-xs text-muted-foreground mb-1">{item.date}</div>
            
            <div className="glass-card rounded-xl p-4 border-white/5">
              <div className="flex justify-between items-start mb-3">
                <span className="font-semibold text-sm">{item.type}</span>
                <span className="text-xs font-medium bg-white/10 px-2 py-0.5 rounded text-muted-foreground">{item.route}</span>
              </div>
              
              <div className="flex gap-4">
                {item.distance && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin size={14} />
                    <span>{item.distance}</span>
                  </div>
                )}
                {item.duration && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock size={14} />
                    <span>{item.duration}</span>
                  </div>
                )}
                {item.fuel && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Fuel size={14} className={item.type === 'Заправка' ? 'text-green-500' : ''} />
                    <span className={item.type === 'Заправка' ? 'text-green-500 font-medium' : ''}>{item.fuel}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
