import React, { useState, useEffect } from 'react';
import { loadAppData, saveAppData } from '../lib/storage';

interface ChatMessage {
  id: string;
  sender: 'mechanic' | 'owner';
  text: string;
  timestamp: string;
  proposal?: {
    date: string;
    timeSlot: string;
    status: 'pending' | 'accepted' | 'changed';
  };
}

export const MechanicChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const data = loadAppData();
    setMessages(data.mechanicChat || []);
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'mechanic',
      text: input,
      timestamp: new Date().toISOString()
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    const data = loadAppData();
    data.mechanicChat = updated;
    saveAppData(data);
    setInput('');
  };

  const proposeTime = (date: string, slot: string) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'mechanic',
      text: `Предлагаю запись на ${date}, время: ${slot}`,
      timestamp: new Date().toISOString(),
      proposal: { date, timeSlot: slot, status: 'pending' }
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    const data = loadAppData();
    data.mechanicChat = updated;
    saveAppData(data);
  };

  return (
    <div style={{ padding: '16px', color: '#c6deff' }}>
      <h3>Чат с владельцем</h3>
      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '12px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            background: msg.sender === 'mechanic' ? '#1a3a5c' : '#2a4a3a',
            padding: '8px 12px',
            borderRadius: '12px',
            marginBottom: '8px'
          }}>
            <strong>{msg.sender === 'mechanic' ? 'Вы' : 'Владелец'}:</strong> {msg.text}
            {msg.proposal && (
              <div style={{ marginTop: '8px', fontSize: '0.9em', color: '#f4b740' }}>
                Статус: {msg.proposal.status === 'pending' ? 'Ожидает подтверждения' : msg.proposal.status === 'accepted' ? 'Принято' : 'Изменено'}
              </div>
            )}
            <div style={{ fontSize: '0.7em', color: '#8a9db0', marginTop: '4px' }}>
              {new Date(msg.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button onClick={() => proposeTime('2026-04-28', '9:00-12:00')} style={{
          background: '#1e4f8a', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer'
        }}>Предложить 28 апр 9-12</button>
        <button onClick={() => proposeTime('2026-04-28', '12:00-15:00')} style={{
          background: '#1e4f8a', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer'
        }}>Предложить 28 апр 12-15</button>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Сообщение..."
          style={{ flex: 1, padding: '8px', borderRadius: '12px', border: '1px solid #2e4a6a', background: '#0f131a', color: '#c6deff' }}
        />
        <button onClick={sendMessage} style={{
          background: '#1e4f8a', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer'
        }}>Отправить</button>
      </div>
    </div>
  );
};