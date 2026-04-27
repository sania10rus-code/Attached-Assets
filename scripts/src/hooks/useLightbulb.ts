import { useState, useEffect } from 'react';

// Хук для управления «лампочкой» — сезонной памяткой
// Возвращает true, если лампочка должна гореть (за 14 дней до начала сезона)
export function useLightbulb(): boolean {
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    function checkSeason() {
      const now = new Date();
      const month = now.getMonth(); // 0-11
      const day = now.getDate();

      // Определяем, когда начинается следующий сезон
      // Весна: 1 марта (месяц 2)
      // Лето: 1 июня (месяц 5)
      // Осень: 1 сентября (месяц 8)
      // Зима: 1 декабря (месяц 11)
      const seasons = [
        { start: new Date(now.getFullYear(), 2, 1), name: 'spring' },  // 1 марта
        { start: new Date(now.getFullYear(), 5, 1), name: 'summer' },   // 1 июня
        { start: new Date(now.getFullYear(), 8, 1), name: 'autumn' },   // 1 сентября
        { start: new Date(now.getFullYear(), 11, 1), name: 'winter' },  // 1 декабря
      ];

      // Ищем ближайший сезон
      for (const season of seasons) {
        const diffDays = Math.ceil((season.start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 0 && diffDays <= 14) {
          setGlow(true);
          return;
        }
      }
      setGlow(false);
    }

    checkSeason();
    const interval = setInterval(checkSeason, 1000 * 60 * 60); // проверяем раз в час

    return () => clearInterval(interval);
  }, []);

  return glow;
}