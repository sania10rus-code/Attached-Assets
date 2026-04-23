const STORAGE_KEY = "onix_offline_data_v1";

export type Telemetry = {
  mileage: number;
  temperature: number;
  rpm: number;
  speed: number;
  batteryVoltage: number;
  fuelDays: number;
  fuelLiters: number;
  errors: number;
  lastUpdate: string | null;
};

export type HistoryIcon =
  | "wrench"
  | "car-crash"
  | "brake"
  | "engine"
  | "key"
  | "oil"
  | "trip"
  | "check";

export type Discrepancy = {
  reportedMileage: number;
  actualMileage: number;
  diff: number;
  relatedOrderId?: string;
  acknowledged: boolean;
};

export type HistoryEvent = {
  id: string;
  type: string;
  desc: string;
  place: string;
  mileage: number;
  date: string;
  icon: HistoryIcon;
  createdAt: string;
  discrepancy?: Discrepancy;
};

export const HISTORY_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export function canEdit(createdAt?: string): boolean {
  if (!createdAt) return false;
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < HISTORY_EDIT_WINDOW_MS;
}

function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export type Urgency = "high" | "medium" | "low";

export type Reminder = {
  id: number;
  text: string;
  dueMileage?: number;
  dueDate?: string;
  interval: number;
  urgency: Urgency;
};

export type OrderItem = { name: string; qty: number; price: number };

export type Order = {
  id: string;
  date: string;
  service: string;
  city: string;
  status: string;
  items: OrderItem[];
  total: number;
  paid?: boolean;
  paidAmount?: number;
  paidAt?: string;
  createdBy?: "owner" | "mechanic";
  comment?: string;
  createdAt?: string;
};

export type AppointmentStatus = "Ожидает" | "В работе" | "Готово" | "Отменено";

export type Appointment = {
  id: string;
  workName: string;
  date: string;
  slot: string;
  ownerName: string;
  ownerPhone: string;
  carModel: string;
  carVin: string;
  carPlate: string;
  mileage: number;
  status: AppointmentStatus;
  stoId: string;
  mechanicComment?: string;
  orderId?: string;
  createdAt: string;
};

export type AppData = {
  carModel: string;
  carYear: number;
  carVin: string;
  carPlate: string;
  ownerName: string;
  ownerPhone: string;
  selectedStoId: string;
  telemetry: Telemetry;
  todayDate: string;
  todayDistance: number;
  history: HistoryEvent[];
  reminders: Reminder[];
  orders: Order[];
  appointments: Appointment[];
  pendingSync: unknown[];
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export const defaultData: AppData = {
  carModel: "Skoda Octavia A5",
  carYear: 2007,
  carVin: "TMBHE61U982111234",
  carPlate: "А123ВС 178",
  ownerName: "Иван Петров",
  ownerPhone: "+7 (921) 123-45-67",
  selectedStoId: "north",
  telemetry: {
    mileage: 102345,
    temperature: 90,
    rpm: 0,
    speed: 0,
    batteryVoltage: 12.4,
    fuelDays: 7,
    fuelLiters: 50,
    errors: 0,
    lastUpdate: null,
  },
  todayDate: todayIso(),
  todayDistance: 0,
  history: [
    { id: "h1", type: "ТО", desc: "ТО у дилера", place: "Москва", mileage: 80000, date: "2025-01-15", icon: "wrench", createdAt: "2025-01-15T10:00:00.000Z" },
    { id: "h2", type: "ДТП", desc: "ДТП, передний бампер", place: "Москва", mileage: 75280, date: "2021-09-10", icon: "car-crash", createdAt: "2021-09-10T10:00:00.000Z" },
    { id: "h3", type: "Ремонт", desc: "Замена тормозных колодок", place: "Москва", mileage: 75280, date: "2024-11-20", icon: "brake", createdAt: "2024-11-20T10:00:00.000Z" },
    { id: "h4", type: "Ошибка", desc: "Ошибка P0141 (датчик кислорода)", place: "", mileage: 60000, date: "2020-01-02", icon: "engine", createdAt: "2020-01-02T10:00:00.000Z" },
    { id: "h5", type: "Покупка", desc: "Выезд из дилера", place: "Москва", mileage: 52560, date: "2018-05-10", icon: "key", createdAt: "2018-05-10T10:00:00.000Z" },
    { id: "h6", type: "ТО", desc: "Замена масла", place: "Москва", mileage: 40000, date: "2017-01-01", icon: "oil", createdAt: "2017-01-01T10:00:00.000Z" },
  ],
  reminders: [
    { id: 1, text: "Замена масла", dueMileage: 105000, interval: 15000, urgency: "medium" },
    { id: 2, text: "Замена тормозных колодок", dueMileage: 103000, interval: 20000, urgency: "high" },
    { id: 3, text: "Замена свечей зажигания", dueMileage: 110000, interval: 60000, urgency: "low" },
    { id: 4, text: "Проверка ремня ГРМ", dueMileage: 120000, interval: 60000, urgency: "medium" },
    { id: 5, text: "Замена воздушного фильтра", dueMileage: 108000, interval: 30000, urgency: "medium" },
    { id: 6, text: "Замена тормозной жидкости", dueDate: "2026-10-01", interval: 2, urgency: "low" },
  ],
  orders: [
    {
      id: "49281",
      date: "2025-10-21",
      service: "ОНИКС-СЕРВИС",
      city: "Санкт-Петербург",
      status: "Ожидает выполнения",
      items: [
        { name: "Масляный фильтр MANN", qty: 1, price: 1300 },
        { name: "Воздушный фильтр Bosch", qty: 1, price: 1200 },
        { name: "Тормозные колодки TRW", qty: 1, price: 7000 },
        { name: "Свечи NGK", qty: 4, price: 4400 },
        { name: "Масло моторное Castrol", qty: 1, price: 5000 },
      ],
      total: 18900,
      paid: true,
      createdBy: "owner",
    },
  ],
  appointments: [],
  pendingSync: [],
};

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadAppData(): AppData {
  if (!isBrowser()) return defaultData;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const merged: AppData = {
        ...defaultData,
        ...parsed,
        telemetry: { ...defaultData.telemetry, ...(parsed.telemetry || {}) },
      };
      if (merged.todayDate !== todayIso()) {
        merged.todayDate = todayIso();
        merged.todayDistance = 0;
      }
      // Backfill ids / createdAt for legacy history items
      merged.history = (merged.history || []).map((h, i) => ({
        ...h,
        id: h.id || `legacy-${i}-${h.date}`,
        createdAt: h.createdAt || `${h.date}T10:00:00.000Z`,
      }));
      return merged;
    }
    saveAppData(defaultData);
    return defaultData;
  } catch (e) {
    console.error("Ошибка загрузки данных, используем значения по умолчанию", e);
    return defaultData;
  }
}

type Listener = (data: AppData) => void;
const listeners = new Set<Listener>();

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function saveAppData(data: AppData): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    listeners.forEach((fn) => {
      try {
        fn(data);
      } catch (e) {
        console.error(e);
      }
    });
  } catch (e) {
    console.error("Ошибка сохранения данных", e);
  }
}

export function updateTelemetry(patch: Partial<Telemetry>): AppData {
  const current = loadAppData();
  const next: AppData = {
    ...current,
    telemetry: {
      ...current.telemetry,
      ...patch,
      lastUpdate: new Date().toISOString(),
    },
  };
  saveAppData(next);
  return next;
}

export function addTodayDistance(km: number): AppData {
  const current = loadAppData();
  const today = todayIso();
  const sameDay = current.todayDate === today;
  const next: AppData = {
    ...current,
    todayDate: today,
    todayDistance: (sameDay ? current.todayDistance : 0) + km,
  };
  saveAppData(next);
  return next;
}

export function resetAppData(): AppData {
  saveAppData(defaultData);
  return defaultData;
}

export function addHistoryEvent(
  ev: Omit<HistoryEvent, "id" | "createdAt"> & { id?: string; createdAt?: string },
): AppData {
  const current = loadAppData();
  const full: HistoryEvent = {
    ...ev,
    id: ev.id || genId(),
    createdAt: ev.createdAt || new Date().toISOString(),
  };
  const next: AppData = { ...current, history: [full, ...current.history] };
  saveAppData(next);
  return next;
}

export function updateHistoryEvent(id: string, patch: Partial<HistoryEvent>): AppData {
  const current = loadAppData();
  const target = current.history.find((h) => h.id === id);
  if (!target || !canEdit(target.createdAt)) return current;
  const safePatch = { ...patch };
  delete (safePatch as Partial<HistoryEvent>).id;
  delete (safePatch as Partial<HistoryEvent>).createdAt;
  const next: AppData = {
    ...current,
    history: current.history.map((h) => (h.id === id ? { ...h, ...safePatch } : h)),
  };
  saveAppData(next);
  return next;
}

export function acknowledgeDiscrepancy(id: string): AppData {
  const current = loadAppData();
  const next: AppData = {
    ...current,
    history: current.history.map((h) =>
      h.id === id && h.discrepancy
        ? { ...h, discrepancy: { ...h.discrepancy, acknowledged: true } }
        : h,
    ),
  };
  saveAppData(next);
  return next;
}

export function addOrder(order: Order): AppData {
  const current = loadAppData();
  const full: Order = { ...order, createdAt: order.createdAt || new Date().toISOString() };
  const next: AppData = { ...current, orders: [full, ...current.orders] };
  saveAppData(next);
  return next;
}

export function markOrderPaid(orderId: string, amount?: number): AppData {
  const current = loadAppData();
  const order = current.orders.find((o) => o.id === orderId);
  const paidAmount = amount ?? order?.total ?? 0;
  const today = new Date().toISOString().slice(0, 10);
  const newHistory: HistoryEvent[] = order
    ? [
        ...current.history,
        {
          id: `pay-${orderId}-${Date.now()}`,
          createdAt: new Date().toISOString(),
          type: "Оплачено",
          desc: `Оплата заказ-наряда №${orderId} — ${paidAmount.toLocaleString("ru-RU")} ₽`,
          place: order.service,
          mileage: Math.floor(current.telemetry.mileage),
          date: today,
          icon: "check",
        },
      ]
    : current.history;
  const next: AppData = {
    ...current,
    history: newHistory,
    orders: current.orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            paid: true,
            status: "Оплачено",
            paidAmount,
            paidAt: new Date().toISOString(),
          }
        : o,
    ),
  };
  saveAppData(next);
  return next;
}

export function setSelectedSto(stoId: string): AppData {
  const current = loadAppData();
  const next: AppData = { ...current, selectedStoId: stoId };
  saveAppData(next);
  return next;
}

export function addAppointment(a: Appointment): AppData {
  const current = loadAppData();
  const next: AppData = { ...current, appointments: [a, ...current.appointments] };
  saveAppData(next);
  return next;
}

export function updateAppointment(id: string, patch: Partial<Appointment>): AppData {
  const current = loadAppData();
  const next: AppData = {
    ...current,
    appointments: current.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
  };
  saveAppData(next);
  return next;
}

export function formatMileage(km: number): string {
  return km.toLocaleString("ru-RU");
}

export function formatRub(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽";
}

export function formatDateRu(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
