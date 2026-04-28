import React, { useState } from 'react';
import { MechanicChat } from './MechanicChat';

interface Task {
  id: string;
  client: string;
  car: string;
  work: string;
  status: 'pending' | 'in_progress' | 'done';
}

const MechanicDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', client: 'Алексей', car: 'Skoda Octavia A5', work: 'Замена масла', status: 'pending' },
    { id: '2', client: 'Мария', car: 'Audi A6', work: 'Замена колодок', status: 'in_progress' }
  ]);
  const [showChat, setShowChat] = useState(false);

  const updateStatus = (id: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  return (
    <div style={{ padding: '16px', color: '#c6deff' }}>
      <h2>Панель механика</h2>
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => setShowChat(!showChat)}
          style={{
            background: showChat ? '#f4b740' : '#1e4f8a',
            border: 'none', color: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer'
          }}
        >
          {showChat ? 'Закрыть чат' : 'Чат с владельцем'}
        </button>
      </div>

      {showChat ? (
        <MechanicChat />
      ) : (
        <div>
          <h3>Задачи</h3>
          {tasks.map(task => (
            <div key={task.id} style={{
              background: '#1a2532', borderRadius: '12px', padding: '12px',
              marginBottom: '8px', border: '1px solid #2e4a6a'
            }}>
              <strong>{task.client}</strong> — {task.car}
              <div style={{ fontSize: '0.9em', color: '#8a9db0' }}>{task.work}</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => updateStatus(task.id, 'in_progress')}
                  style={{
                    background: '#1e4f8a', border: 'none', color: 'white',
                    padding: '4px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8em'
                  }}
                >
                  В работу
                </button>
                <button
                  onClick={() => updateStatus(task.id, 'done')}
                  style={{
                    background: '#00c48c', border: 'none', color: 'white',
                    padding: '4px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8em'
                  }}
                >
                  Готово
                </button>
              </div>
              <span style={{
                float: 'right', padding: '2px 10px', borderRadius: '20px',
                background: task.status === 'done' ? '#132c24' : task.status === 'in_progress' ? '#2a3a4a' : '#2a2a1e',
                color: task.status === 'done' ? '#00c48c' : '#f4b740', fontSize: '0.8em'
              }}>
                {task.status === 'pending' ? 'Ожидает' : task.status === 'in_progress' ? 'В работе' : 'Готово'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MechanicDashboard;