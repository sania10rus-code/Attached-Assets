import React, { useState } from 'react';
import { useLightbulb } from '../hooks/useLightbulb';
import { SEASONAL_TIPS, getCurrentSeason } from '../lib/seasonalTips';

const Home: React.FC = () => {
  const lightbulbGlows = useLightbulb();
  const [showSeasonalTips, setShowSeasonalTips] = useState(false);
  const currentSeason = getCurrentSeason();

  return (
    <div style={{ padding: '16px', color: '#c6deff' }}>
      {lightbulbGlows && (
        <button
          onClick={() => setShowSeasonalTips(true)}
          style={{
            background: 'transparent', border: 'none',
            fontSize: '24px', cursor: 'pointer',
            animation: 'pulse 1.5s infinite'
          }}
          title="Сезонные рекомендации"
        >
          💡
        </button>
      )}

      <h2>Главная</h2>
      <p>Добро пожаловать в ОНИКС</p>

      {showSeasonalTips && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#0f131a', borderRadius: '20px', padding: '24px',
            maxWidth: '360px', width: '90%', border: '1px solid #2a3643'
          }}>
            <h3 style={{ color: '#c6deff', marginBottom: '16px' }}>
              {SEASONAL_TIPS[currentSeason].icon} {SEASONAL_TIPS[currentSeason].title} — рекомендации
            </h3>
            <ul style={{ color: '#b0c4de', paddingLeft: '20px', marginBottom: '16px' }}>
              {SEASONAL_TIPS[currentSeason].tips.map((tip, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>{tip}</li>
              ))}
            </ul>
            <button
              onClick={() => setShowSeasonalTips(false)}
              style={{
                background: '#1e3a5c', border: 'none', color: 'white',
                padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', width: '100%'
              }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;