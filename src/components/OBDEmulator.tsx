import React, { useState, useEffect, useCallback } from 'react';
import { loadAppData, saveAppData, updateTelemetry } from '../lib/storage';
import { checkVehicleStatus, type AssistantMessage } from '../services/obdAssistant';

const OBDEmulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [fuelLevel, setFuelLevel] = useState(50);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [todayDistance, setTodayDistance] = useState(0);

  // Запуск эмуляции
  const startEmulation = useCallback(() => {
    setIsRunning(true);
    const data = loadAppData();
    data.telemetry.speed = 0;
    data.telemetry.fuelLevel = 50;
    saveAppData(data);
    setMessages([]);
  }, []);

  // Остановка эмуляции
  const stopEmulation = useCallback(() => {
    setIsRunning(false);
    const data = loadAppData();
    data.telemetry.speed = 0;
    saveAppData(data);
    // Здесь можно добавить сохранение поездки в историю
  }, []);

  // Тик эмуляции
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const data = loadAppData();
      const newSpeed = Math.floor(Math.random() * 80) + 20; // 20-100 км/ч
      const distanceIncrement = newSpeed / 3600; // км за секунду
      const newFuel = Math.max(0, (data.telemetry.fuelLevel || 50) - (newSpeed / 100) * 0.08);

      data.telemetry.speed = newSpeed;
      data.telemetry.fuelLevel = newFuel;
      data.telemetry.mileage = (data.telemetry.mileage || 100000) + distanceIncrement;
      saveAppData(data);

      setSpeed(newSpeed);
      setFuelLevel(newFuel);
      setTodayDistance(prev => prev + distanceIncrement);

      // Проверяем уведомления от ассистента
      const newMessages = checkVehicleStatus();
      if (newMessages.length > 0) {
        setMessages(prev => [...prev, ...newMessages]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div style={{ padding: '16px', color: '#c6deff' }}>
      <h2>OBD Эмулятор</h2>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={startEmulation}
          disabled={isRunning}
          style={{
            background: isRunning ? '#555' : '#1e4f8a',
            border: 'none', color: 'white', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer'
          }}
        >
          Старт
        </button>
        <button
          onClick={stopEmulation}
          disabled={!isRunning}
          style={{
            background: !isRunning ? '#555' : '#8a1e1e',
            border: 'none', color: 'white', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer'
          }}
        >
          Стоп
        </button>
        <span style={{ color: isRunning ? '#00c48c' : '#f4b740' }}>
          {isRunning ? 'В эфире' : 'Остановлено'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
        <div><strong>Скорость:</strong> {speed} км/ч</div>
        <div><strong>Топливо:</strong> {fuelLevel.toFixed(1)} л</div>
        <div><strong>Сегодня:</strong> {todayDistance.toFixed(1)} км</div>
      </div>

      {/* Уведомления от ассистента */}
      {messages.length > 0 && (
        <div style={{ background: '#1a2532', borderRadius: '12px', padding: '12px', marginTop: '16px' }}>
          <h3 style={{ color: '#f4b740' }}>Уведомления</h3>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              background: '#0d1b2a', padding: '8px 12px', borderRadius: '8px',
              marginBottom: '8px', borderLeft: '4px solid #f4b740'
            }}>
              {msg.text}
              {msg.action && (
                <button style={{
                  background: '#1e4f8a', border: 'none', color: 'white',
                  padding: '4px 12px', borderRadius: '12px', cursor: 'pointer', marginTop: '8px'
                }}>
                  {msg.action.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OBDEmulator;