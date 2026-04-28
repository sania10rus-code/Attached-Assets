import React from 'react';
import { WORK_PRICES } from '../lib/workPrices';

interface WorkOrderProps {
  orderNumber?: string;
  date?: string;
  service?: string;
  client?: string;
  car?: string;
  mileage?: number;
}

const WorkOrderDocument: React.FC<WorkOrderProps> = ({
  orderNumber = '49281',
  date = '21.10.2025',
  service = 'ОНИКС-СЕРВИС',
  client = 'Алексей',
  car = 'Skoda Octavia A5',
  mileage = 102345
}) => {
  const selectedWorks = [
    { name: 'Замена масла', price: WORK_PRICES['Замена масла'] },
    { name: 'Замена тормозных колодок (перед)', price: WORK_PRICES['Замена тормозных колодок (перед)'] }
  ];
  const totalWork = selectedWorks.reduce((sum, w) => sum + (w.price || 0), 0);
  const totalParts = 6300; // пример
  const total = totalWork + totalParts;

  return (
    <div style={{ padding: '16px', color: '#c6deff', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Заказ-наряд №{orderNumber}</h2>
      <div style={{ background: '#1a2532', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <p><strong>Дата:</strong> {date}</p>
        <p><strong>Сервис:</strong> {service}</p>
        <p><strong>Клиент:</strong> {client}</p>
        <p><strong>Автомобиль:</strong> {car}</p>
        <p><strong>Пробег:</strong> {mileage} км</p>
      </div>

      <h3>Работы</h3>
      {selectedWorks.map((work) => (
        <div key={work.name} style={{
          background: '#1a2532', borderRadius: '8px', padding: '10px',
          marginBottom: '6px', display: 'flex', justifyContent: 'space-between'
        }}>
          <span>{work.name}</span>
          <span>{work.price} ₽</span>
        </div>
      ))}
      <div style={{ textAlign: 'right', marginBottom: '16px', color: '#8a9db0' }}>
        Итого работы: {totalWork} ₽
      </div>

      <h3>Запчасти</h3>
      <div style={{
        background: '#1a2532', borderRadius: '8px', padding: '10px',
        marginBottom: '6px', display: 'flex', justifyContent: 'space-between'
      }}>
        <span>Масляный фильтр MANN</span>
        <span>1 300 ₽</span>
      </div>
      <div style={{
        background: '#1a2532', borderRadius: '8px', padding: '10px',
        marginBottom: '6px', display: 'flex', justifyContent: 'space-between'
      }}>
        <span>Масло моторное Castrol</span>
        <span>5 000 ₽</span>
      </div>
      <div style={{ textAlign: 'right', marginBottom: '16px', color: '#8a9db0' }}>
        Итого запчасти: {totalParts} ₽
      </div>

      <div style={{
        background: '#0d1b2a', borderRadius: '12px', padding: '16px',
        textAlign: 'right', border: '1px solid #2e4a6a'
      }}>
        <strong style={{ fontSize: '1.2em' }}>ИТОГО: {total} ₽</strong>
      </div>
    </div>
  );
};

export default WorkOrderDocument;