import React from 'react';
import { PARTS_CATALOG } from '../lib/partsCatalog';

const Parts: React.FC = () => {
  const categories = Object.entries(PARTS_CATALOG);

  return (
    <div style={{ padding: '16px', color: '#c6deff' }}>
      <h2>Каталог запчастей</h2>
      {categories.map(([category, items]) => (
        <div key={category} style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#f4b740' }}>{category}</h3>
          {items.map((item) => (
            <div key={item.name} style={{
              background: '#1a2532', borderRadius: '12px', padding: '12px',
              marginBottom: '8px', border: '1px solid #2e4a6a'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{item.name}</strong>
                <span style={{ color: item.inStock ? '#00c48c' : '#f4b740' }}>
                  {item.inStock ? 'В наличии' : 'Под заказ'}
                </span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.9em', color: '#8a9db0' }}>
                {item.brands.map((brand) => (
                  <div key={brand.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{brand.name}</span>
                    <span>{brand.price} ₽</span>
                  </div>
                ))}
              </div>
              <button style={{
                background: '#1e4f8a', border: 'none', color: 'white',
                padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', marginTop: '8px'
              }}>Добавить в заказ</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Parts;