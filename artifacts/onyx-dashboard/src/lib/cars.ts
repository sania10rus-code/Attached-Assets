export type CarHotspotKey =
  | "engine"
  | "front-wheels"
  | "rear-wheels"
  | "grille"
  | "underbody"
  | "cabin";

export type CarHotspot = {
  key: CarHotspotKey;
  label: string;
  position: [number, number, number];
  reminderText: string;
  partId: string;
  recommendation: string;
};

export type CarStyle = "hatchback" | "sedan" | "suv";

export type CarProfile = {
  login: string;
  password: string;
  vin: string;
  plate: string;
  model: string;
  year: number;
  ownerName: string;
  ownerPhone: string;
  initialMileage: number;
  bodyColor: string;
  bodyAccent: string;
  style: CarStyle;
  hotspots: CarHotspot[];
};

const COMMON_HOTSPOTS = (style: CarStyle): CarHotspot[] => {
  const isSuv = style === "suv";
  const yWheel = isSuv ? -0.05 : -0.15;
  return [
    {
      key: "engine",
      label: "Двигатель / Масло",
      position: [0, 0.45, 1.4],
      reminderText: "Замена масла",
      partId: "oil",
      recommendation: "Замена моторного масла и масляного фильтра каждые 10–15 тыс. км.",
    },
    {
      key: "front-wheels",
      label: "Передние тормозные колодки",
      position: [-1.05, yWheel, 0.95],
      reminderText: "Замена тормозных колодок",
      partId: "brake-pads",
      recommendation: "Замена передних колодок TRW при остатке менее 3 мм.",
    },
    {
      key: "rear-wheels",
      label: "Задние тормозные диски",
      position: [-1.05, yWheel, -1.15],
      reminderText: "Замена задних тормозных дисков",
      partId: "brake-pads",
      recommendation: "Контроль и замена задних дисков каждые 90 тыс. км.",
    },
    {
      key: "grille",
      label: "Воздушный фильтр (решётка)",
      position: [0, 0.15, 2.0],
      reminderText: "Замена воздушного фильтра",
      partId: "air-filter",
      recommendation: "Замена воздушного фильтра каждые 30 тыс. км.",
    },
    {
      key: "underbody",
      label: "Ремень ГРМ (днище)",
      position: [0.6, -0.3, 0.6],
      reminderText: "Проверка ремня ГРМ",
      partId: "timing-belt",
      recommendation: "Проверка/замена ремня ГРМ каждые 60–90 тыс. км.",
    },
    {
      key: "cabin",
      label: "Салонный фильтр",
      position: [0, 1.0, 0.4],
      reminderText: "Замена салонного фильтра",
      partId: "air-filter",
      recommendation: "Замена салонного фильтра каждые 15–20 тыс. км.",
    },
  ];
};

export const CARS: CarProfile[] = [
  {
    login: "0000",
    password: "0000",
    vin: "TMBHE61U982111234",
    plate: "А123ВС 178",
    model: "Skoda Octavia A5",
    year: 2007,
    ownerName: "Иван Петров",
    ownerPhone: "+7 (921) 123-45-67",
    initialMileage: 102345,
    bodyColor: "#1f3854",
    bodyAccent: "#2a5a8a",
    style: "hatchback",
    hotspots: COMMON_HOTSPOTS("hatchback"),
  },
  {
    login: "2222",
    password: "2222",
    vin: "WAUZZZ4G8CN012345",
    plate: "В222ОЕ 178",
    model: "Audi A6 C7",
    year: 2012,
    ownerName: "Сергей Иванов",
    ownerPhone: "+7 (921) 222-22-22",
    initialMileage: 182000,
    bodyColor: "#1a2638",
    bodyAccent: "#3a6aa8",
    style: "sedan",
    hotspots: COMMON_HOTSPOTS("sedan"),
  },
  {
    login: "3333",
    password: "3333",
    vin: "WBAFE410600L33333",
    plate: "Е333КХ 178",
    model: "BMW X5 E70",
    year: 2010,
    ownerName: "Дмитрий Соколов",
    ownerPhone: "+7 (921) 333-33-33",
    initialMileage: 205000,
    bodyColor: "#0e1a2e",
    bodyAccent: "#2a5a8a",
    style: "suv",
    hotspots: COMMON_HOTSPOTS("suv"),
  },
];

export function findCarByLogin(login: string): CarProfile | undefined {
  return CARS.find((c) => c.login === login);
}

export function findCarByVin(vin: string): CarProfile | undefined {
  return CARS.find((c) => c.vin === vin);
}

export const OWNER_LOGINS = CARS.map((c) => c.login);
