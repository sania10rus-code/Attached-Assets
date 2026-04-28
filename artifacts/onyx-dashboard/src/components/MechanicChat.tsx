import React, { useState } from 'react';

interface ChatMessage {
  id: string;
  sender: 'mechanic' | 'owner';
  text: string;
  timestamp: string;
}

export const MechanicChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'owner', text: 'Здравствуйте, когда можно подъехать на замену масла?', timestamp: new Date().toISOString() },
    { id: '2', sender: 'mechanic', text: 'Добрый день! Сегодня после 15:00 свободен.', timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'mechanic',
      text: input,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
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
            <div style={{ fontSize: '0.7em', color: '#8a9db0', marginTop: '4px' }}>
              {new Date(msg.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
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