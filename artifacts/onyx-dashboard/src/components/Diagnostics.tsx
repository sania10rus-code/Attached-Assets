import React from 'react';
import { SUSPENSION_NODES } from '../lib/suspensionNodes';

const Diagnostics: React.FC = () => {
  return (
    <div style={{ padding: '16px', color: '#c6deff' }}>
      <h2>Диагностика подвески</h2>
      {SUSPENSION_NODES.map((node) => (
        <div key={node.id} style={{
          background: '#1a2532', borderRadius: '12px', padding: '12px',
          marginBottom: '8px', border: '1px solid #2e4a6a',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <strong>{node.name}</strong>
            <div style={{ fontSize: '0.8em', color: '#8a9db0' }}>
              {node.category} · Интервал: {node.intervalKm} км
            </div>
          </div>
          <span style={{
            padding: '4px 12px', borderRadius: '20px',
            background: '#132c24', color: '#00c48c', fontSize: '0.9em'
          }}>
            В норме
          </span>
        </div>
      ))}
    </div>
  );
};

export default Diagnostics;