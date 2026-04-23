export type CatalogPart = {
  id: string;
  name: string;
  brand: string;
  sku: string;
  price: number;
  available: boolean;
};

export const PARTS_CATALOG: CatalogPart[] = [
  { id: "oil", name: "Масло моторное Castrol 5W-30", brand: "Castrol", sku: "EDGE-5W30-5L", price: 5200, available: true },
  { id: "oil-filter", name: "Масляный фильтр", brand: "MANN", sku: "W712/52", price: 1300, available: true },
  { id: "air-filter", name: "Воздушный фильтр", brand: "Bosch", sku: "F026400119", price: 1200, available: true },
  { id: "brake-pads", name: "Тормозные колодки", brand: "TRW", sku: "GDB1622", price: 7200, available: false },
  { id: "spark-plugs", name: "Свечи зажигания", brand: "NGK", sku: "BKR6E-11", price: 4400, available: true },
  { id: "timing-belt", name: "Ремень ГРМ", brand: "Gates", sku: "5670XS", price: 8900, available: false },
];

export type Sto = {
  id: string;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  city: string;
};

export const STO_LIST: Sto[] = [
  {
    id: "north",
    name: "ОНИКС-СЕРВИС Север",
    shortName: "Север",
    address: "Северный проспект, 7",
    phone: "954-76-65",
    city: "Санкт-Петербург",
  },
  {
    id: "south",
    name: "ОНИКС-СЕРВИС Юг",
    shortName: "Юг",
    address: "Бухарестская, 1",
    phone: "703-04-04",
    city: "Санкт-Петербург",
  },
  {
    id: "west",
    name: "ОНИКС-СЕРВИС Запад",
    shortName: "Запад",
    address: "ул. Нахимова, 18а",
    phone: "355-16-04",
    city: "Санкт-Петербург",
  },
  {
    id: "east",
    name: "ОНИКС-СЕРВИС Восток",
    shortName: "Восток",
    address: "Ириновский проспект, 22к3",
    phone: "200-00-00",
    city: "Санкт-Петербург",
  },
];

export function findSto(id: string | undefined): Sto {
  return STO_LIST.find((s) => s.id === id) || STO_LIST[0];
}
