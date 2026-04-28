export const PARTS_CATALOG = {
  Engine: [
    { name: 'Масло моторное', brands: [{ name: 'Castrol', price: 5200 }, { name: 'Mobil', price: 4800 }, { name: 'Shell', price: 4500 }], inStock: true },
    { name: 'Масляный фильтр', brands: [{ name: 'MANN', price: 1300 }, { name: 'Bosch', price: 1100 }, { name: 'Filtron', price: 900 }], inStock: true },
    { name: 'Воздушный фильтр', brands: [{ name: 'Bosch', price: 1200 }, { name: 'MANN', price: 1000 }], inStock: true },
    { name: 'Свечи зажигания', brands: [{ name: 'NGK', price: 4400 }, { name: 'Bosch', price: 3800 }, { name: 'Denso', price: 4100 }], inStock: true },
    { name: 'Ремень ГРМ (комплект)', brands: [{ name: 'Gates', price: 8900 }, { name: 'Contitech', price: 8200 }, { name: 'INA', price: 7500 }], inStock: false }
  ],
  Brakes: [
    { name: 'Колодки передние', brands: [{ name: 'TRW', price: 7200 }, { name: 'Bosch', price: 6500 }, { name: 'ATE', price: 5900 }], inStock: true },
    { name: 'Колодки задние', brands: [{ name: 'TRW', price: 5800 }, { name: 'Bosch', price: 5200 }], inStock: false },
    { name: 'Диски передние', brands: [{ name: 'Zimmermann', price: 12000 }, { name: 'Brembo', price: 14000 }, { name: 'ATE', price: 10500 }], inStock: false }
  ],
  Suspension: [
    { name: 'Амортизаторы передние', brands: [{ name: 'Sachs', price: 9500 }, { name: 'Bilstein', price: 14000 }, { name: 'KYB', price: 7200 }], inStock: true },
    { name: 'Амортизаторы задние', brands: [{ name: 'Sachs', price: 8500 }, { name: 'KYB', price: 6800 }], inStock: false },
    { name: 'Сайлентблоки', brands: [{ name: 'Lemforder', price: 3200 }, { name: 'Febi', price: 2600 }], inStock: true }
  ],
  Transmission: [
    { name: 'Масло трансмиссионное', brands: [{ name: 'Liqui Moly', price: 3200 }, { name: 'Castrol', price: 2900 }], inStock: true }
  ],
  Cooling: [
    { name: 'Антифриз', brands: [{ name: 'Liqui Moly', price: 2100 }, { name: 'Hepu', price: 1800 }], inStock: true },
    { name: 'Радиатор', brands: [{ name: 'Nissens', price: 14000 }, { name: 'Behr', price: 16000 }], inStock: false }
  ],
  Exhaust: [
    { name: 'Глушитель', brands: [{ name: 'Bosal', price: 12000 }, { name: 'Walker', price: 10500 }], inStock: false },
    { name: 'Катализатор', brands: [{ name: 'Bosal', price: 45000 }, { name: 'Walker', price: 38000 }], inStock: false }
  ]
} as const;