import { useState, useEffect } from 'react';

export function useLightbulb(): boolean {
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    function checkSeason() {
      const now = new Date();
      const month = now.getMonth(); // 0-11
      const day = now.getDate();

      const seasons = [
        { start: new Date(now.getFullYear(), 2, 1), name: 'spring' },
        { start: new Date(now.getFullYear(), 5, 1), name: 'summer' },
        { start: new Date(now.getFullYear(), 8, 1), name: 'autumn' },
        { start: new Date(now.getFullYear(), 11, 1), name: 'winter' },
      ];

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
    const interval = setInterval(checkSeason, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, []);

  return glow;
}