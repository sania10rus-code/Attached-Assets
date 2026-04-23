import { CARS, findCarByLogin, findCarByVin, OWNER_LOGINS, type CarHotspotKey } from "@/lib/cars";
import { secureGetSync, secureSetSync } from "@/lib/secureStorage";

const STORAGE_PREFIX = "onix_offline_data_v1__";
const LEGACY_KEY = "onix_offline_data_v1";
const AUTH_KEY = "onix_auth_v1";

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
  | "check"
  | "alert";

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
  fromDefectId?: string;
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

export type DefectSeverity = "warn" | "critical";

export type Defect = {
  id: string;
  nodeKey: CarHotspotKey;
  nodeLabel: string;
  severity: DefectSeverity;
  wearPercent: number;
  description: string;
  recommendation: string;
  createdBy: string;
  createdByOrg?: string;
  createdAt: string;
  resolved?: boolean;
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
  defects: Defect[];
  pendingSync: unknown[];
};

const todayIso = () => new Date().toISOString().slice(0, 10);

function buildSkodaData(): AppData {
  return {
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
    defects: [],
    pendingSync: [],
  };
}

function buildAudiData(): AppData {
  const mileage = 182000;
  return {
    carModel: "Audi A6 C7",
    carYear: 2012,
    carVin: "WAUZZZ4G8CN012345",
    carPlate: "В222ОЕ 178",
    ownerName: "Сергей Иванов",
    ownerPhone: "+7 (921) 222-22-22",
    selectedStoId: "south",
    telemetry: {
      mileage,
      temperature: 92,
      rpm: 0,
      speed: 0,
      batteryVoltage: 12.6,
      fuelDays: 9,
      fuelLiters: 60,
      errors: 0,
      lastUpdate: null,
    },
    todayDate: todayIso(),
    todayDistance: 0,
    history: [
      { id: "ah1", type: "ТО", desc: "ТО-180 у официального дилера", place: "Санкт-Петербург", mileage: 180000, date: "2025-09-15", icon: "wrench", createdAt: "2025-09-15T10:00:00.000Z" },
      { id: "ah2", type: "Ремонт", desc: "Замена приводных ремней", place: "Санкт-Петербург", mileage: 165000, date: "2024-05-10", icon: "wrench", createdAt: "2024-05-10T10:00:00.000Z" },
      { id: "ah3", type: "ТО", desc: "Замена масла и фильтров", place: "Санкт-Петербург", mileage: 150000, date: "2023-08-20", icon: "oil", createdAt: "2023-08-20T10:00:00.000Z" },
      { id: "ah4", type: "Покупка", desc: "Покупка с пробегом", place: "Санкт-Петербург", mileage: 95000, date: "2018-04-12", icon: "key", createdAt: "2018-04-12T10:00:00.000Z" },
    ],
    reminders: [
      { id: 1, text: "Замена масла", dueMileage: mileage + 5000, interval: 15000, urgency: "medium" },
      { id: 2, text: "Замена воздушного фильтра", dueMileage: mileage + 8000, interval: 30000, urgency: "low" },
      { id: 3, text: "Замена свечей зажигания", dueMileage: mileage + 18000, interval: 60000, urgency: "low" },
      { id: 4, text: "Проверка ремня ГРМ", dueMileage: mileage + 4000, interval: 90000, urgency: "high" },
    ],
    orders: [],
    appointments: [],
    defects: [
      {
        id: "audi-def-1",
        nodeKey: "rear-wheels",
        nodeLabel: "Задние сайлентблоки",
        severity: "critical",
        wearPercent: 95,
        description: "Задние сайлентблоки — износ 95%",
        recommendation: "Срочная замена. Стук и крен при поворотах.",
        createdBy: "Алексей Смирнов",
        createdByOrg: "ОНИКС-СЕРВИС Юг",
        createdAt: "2026-04-10T10:00:00.000Z",
      },
      {
        id: "audi-def-2",
        nodeKey: "front-wheels",
        nodeLabel: "Развал-схождение",
        severity: "warn",
        wearPercent: 60,
        description: "Развал-схождение — отклонение от нормы",
        recommendation: "Требуется регулировка развал-схождения.",
        createdBy: "Алексей Смирнов",
        createdByOrg: "ОНИКС-СЕРВИС Юг",
        createdAt: "2026-04-10T10:05:00.000Z",
      },
    ],
    pendingSync: [],
  };
}

function buildBmwData(): AppData {
  const mileage = 205000;
  return {
    carModel: "BMW X5 E70",
    carYear: 2010,
    carVin: "WBAFE410600L33333",
    carPlate: "Е333КХ 178",
    ownerName: "Дмитрий Соколов",
    ownerPhone: "+7 (921) 333-33-33",
    selectedStoId: "west",
    telemetry: {
      mileage,
      temperature: 95,
      rpm: 0,
      speed: 0,
      batteryVoltage: 12.5,
      fuelDays: 6,
      fuelLiters: 85,
      errors: 0,
      lastUpdate: null,
    },
    todayDate: todayIso(),
    todayDistance: 0,
    history: [
      { id: "bh1", type: "ТО", desc: "Замена масла и масляного фильтра", place: "Санкт-Петербург", mileage: 200000, date: "2026-01-20", icon: "oil", createdAt: "2026-01-20T10:00:00.000Z" },
      { id: "bh2", type: "Ремонт", desc: "Замена раздаточной коробки", place: "Санкт-Петербург", mileage: 185000, date: "2024-11-05", icon: "wrench", createdAt: "2024-11-05T10:00:00.000Z" },
      { id: "bh3", type: "ТО", desc: "Замена тормозных колодок (перед/зад)", place: "Санкт-Петербург", mileage: 170000, date: "2023-06-12", icon: "brake", createdAt: "2023-06-12T10:00:00.000Z" },
      { id: "bh4", type: "Покупка", desc: "Покупка с пробегом", place: "Москва", mileage: 120000, date: "2019-03-15", icon: "key", createdAt: "2019-03-15T10:00:00.000Z" },
    ],
    reminders: [
      { id: 1, text: "Замена масла", dueMileage: mileage + 9000, interval: 10000, urgency: "low" },
      { id: 2, text: "Замена воздушного фильтра", dueMileage: mileage + 12000, interval: 30000, urgency: "low" },
      { id: 3, text: "Замена тормозных колодок", dueMileage: mileage + 6000, interval: 35000, urgency: "medium" },
      { id: 4, text: "Замена свечей зажигания", dueMileage: mileage + 25000, interval: 60000, urgency: "low" },
    ],
    orders: [],
    appointments: [],
    defects: [
      {
        id: "bmw-def-1",
        nodeKey: "front-wheels",
        nodeLabel: "Передние амортизаторы",
        severity: "critical",
        wearPercent: 80,
        description: "Передние амортизаторы — износ 80%",
        recommendation: "Требуется замена передних амортизаторов.",
        createdBy: "Алексей Смирнов",
        createdByOrg: "ОНИКС-СЕРВИС Запад",
        createdAt: "2026-04-15T10:00:00.000Z",
      },
      {
        id: "bmw-def-2",
        nodeKey: "rear-wheels",
        nodeLabel: "Задние сайлентблоки",
        severity: "warn",
        wearPercent: 60,
        description: "Задние сайлентблоки — износ 60%",
        recommendation: "Рекомендована замена через 10 000 км.",
        createdBy: "Алексей Смирнов",
        createdByOrg: "ОНИКС-СЕРВИС Запад",
        createdAt: "2026-04-15T10:05:00.000Z",
      },
    ],
    pendingSync: [],
  };
}

const DEFAULT_BUILDERS: Record<string, () => AppData> = {
  "0000": buildSkodaData,
  "2222": buildAudiData,
  "3333": buildBmwData,
};

function defaultDataFor(login: string): AppData {
  const fn = DEFAULT_BUILDERS[login];
  if (fn) return injectDefectsArtifacts(fn(), login);
  return injectDefectsArtifacts(buildSkodaData(), "0000");
}

// For pre-seeded defects, also add a "Обнаружена неисправность" history entry
// and a "Проверка: <узел>" reminder. So owner sees consistent state.
function injectDefectsArtifacts(data: AppData, login: string): AppData {
  if (data.defects.length === 0) return data;
  const car = findCarByLogin(login);
  const stoOrg = car?.model || "ОНИКС-СЕРВИС";
  let nextReminderId = Math.max(0, ...data.reminders.map((r) => r.id)) + 1;
  const newHistory: HistoryEvent[] = [];
  const newReminders: Reminder[] = [];
  data.defects.forEach((d) => {
    if (!data.history.some((h) => h.id === `def-h-${d.id}`)) {
      newHistory.push({
        id: `def-h-${d.id}`,
        type: "Обнаружена неисправность",
        desc: `${d.description} — ${d.recommendation}`,
        place: d.createdByOrg || stoOrg,
        mileage: Math.floor(data.telemetry.mileage),
        date: d.createdAt.slice(0, 10),
        icon: "alert",
        createdAt: d.createdAt,
      });
    }
    if (!data.reminders.some((r) => r.fromDefectId === d.id)) {
      newReminders.push({
        id: nextReminderId++,
        text: `Проверка: ${d.nodeLabel}`,
        dueMileage: Math.floor(data.telemetry.mileage) + (d.severity === "critical" ? 200 : 2000),
        interval: 30000,
        urgency: d.severity === "critical" ? "high" : "medium",
        fromDefectId: d.id,
      });
    }
  });
  return {
    ...data,
    history: [...newHistory, ...data.history],
    reminders: [...newReminders, ...data.reminders],
  };
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function keyFor(login: string): string {
  return `${STORAGE_PREFIX}${login}`;
}

function currentLogin(): string {
  if (!isBrowser()) return "0000";
  try {
    // The full user blob is encrypted at rest; we read the plaintext
    // session pointer (login + role) maintained by auth.ts.
    const raw = window.localStorage.getItem("onix_session_v1");
    if (!raw) return "0000";
    const u = JSON.parse(raw) as { login?: string; role?: string };
    if (u?.role === "owner" && u?.login) return u.login;
    if (u?.role === "mechanic") return getMechanicActiveLogin();
    return "0000";
  } catch {
    return "0000";
  }
}

const MECH_ACTIVE_KEY = "onix_mech_active_login_v1";

export function getMechanicActiveLogin(): string {
  if (!isBrowser()) return "0000";
  return window.localStorage.getItem(MECH_ACTIVE_KEY) || "0000";
}

export function setMechanicActiveLogin(login: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(MECH_ACTIVE_KEY, login);
  notifyAll(loadAppData());
}

export function loadAppDataFor(login: string): AppData {
  if (!isBrowser()) return defaultDataFor(login);
  try {
    // Per-login data (incl. VIN) is encrypted-at-rest via the sync secure
    // storage layer; the helper transparently falls back to plaintext for
    // legacy values written before this migration.
    let stored = secureGetSync(keyFor(login));
    // Migrate legacy single-key data to the Skoda namespace once
    if (!stored && login === "0000") {
      const legacy = secureGetSync(LEGACY_KEY);
      if (legacy) {
        stored = legacy;
        secureSetSync(keyFor("0000"), legacy);
        window.localStorage.removeItem(LEGACY_KEY);
      }
    }
    if (stored) {
      const parsed = JSON.parse(stored);
      const base = defaultDataFor(login);
      const merged: AppData = {
        ...base,
        ...parsed,
        telemetry: { ...base.telemetry, ...(parsed.telemetry || {}) },
        defects: parsed.defects || base.defects,
        appointments: parsed.appointments || base.appointments,
      };
      if (merged.todayDate !== todayIso()) {
        merged.todayDate = todayIso();
        merged.todayDistance = 0;
      }
      merged.history = (merged.history || []).map((h, i) => ({
        ...h,
        id: h.id || `legacy-${i}-${h.date}`,
        createdAt: h.createdAt || `${h.date}T10:00:00.000Z`,
      }));
      return merged;
    }
    const fresh = defaultDataFor(login);
    saveAppDataFor(login, fresh);
    return fresh;
  } catch (e) {
    console.error("Ошибка загрузки данных", e);
    return defaultDataFor(login);
  }
}

export function loadAppData(): AppData {
  return loadAppDataFor(currentLogin());
}

type Listener = (data: AppData) => void;
const listeners = new Set<Listener>();

function notifyAll(data: AppData) {
  listeners.forEach((fn) => {
    try {
      fn(data);
    } catch (e) {
      console.error(e);
    }
  });
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function saveAppDataFor(login: string, data: AppData): void {
  if (!isBrowser()) return;
  try {
    secureSetSync(keyFor(login), JSON.stringify(data));
    notifyAll(loadAppData());
  } catch (e) {
    console.error("Ошибка сохранения данных", e);
  }
}

export function saveAppData(data: AppData): void {
  saveAppDataFor(currentLogin(), data);
}

export function loadAllOwnersData(): { login: string; data: AppData }[] {
  return OWNER_LOGINS.map((login) => ({ login, data: loadAppDataFor(login) }));
}

function loginForVin(vin: string): string {
  return findCarByVin(vin)?.login || currentLogin();
}

// ===== Telemetry / today distance =====

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
  const login = currentLogin();
  const fresh = defaultDataFor(login);
  saveAppDataFor(login, fresh);
  return fresh;
}

// ===== History =====

export function addHistoryEventFor(
  login: string,
  ev: Omit<HistoryEvent, "id" | "createdAt"> & { id?: string; createdAt?: string },
): AppData {
  const current = loadAppDataFor(login);
  const full: HistoryEvent = {
    ...ev,
    id: ev.id || genId(),
    createdAt: ev.createdAt || new Date().toISOString(),
  };
  const next: AppData = { ...current, history: [full, ...current.history] };
  saveAppDataFor(login, next);
  return next;
}

export function addHistoryEvent(
  ev: Omit<HistoryEvent, "id" | "createdAt"> & { id?: string; createdAt?: string },
): AppData {
  return addHistoryEventFor(currentLogin(), ev);
}

export function updateHistoryEvent(id: string, patch: Partial<HistoryEvent>): AppData {
  const login = currentLogin();
  const current = loadAppDataFor(login);
  const target = current.history.find((h) => h.id === id);
  if (!target || !canEdit(target.createdAt)) return current;
  const safePatch = { ...patch };
  delete (safePatch as Partial<HistoryEvent>).id;
  delete (safePatch as Partial<HistoryEvent>).createdAt;
  const next: AppData = {
    ...current,
    history: current.history.map((h) => (h.id === id ? { ...h, ...safePatch } : h)),
  };
  saveAppDataFor(login, next);
  return next;
}

export function acknowledgeDiscrepancy(id: string): AppData {
  const login = currentLogin();
  const current = loadAppDataFor(login);
  const next: AppData = {
    ...current,
    history: current.history.map((h) =>
      h.id === id && h.discrepancy
        ? { ...h, discrepancy: { ...h.discrepancy, acknowledged: true } }
        : h,
    ),
  };
  saveAppDataFor(login, next);
  return next;
}

// ===== Orders =====

export function addOrderFor(login: string, order: Order): AppData {
  const current = loadAppDataFor(login);
  const full: Order = { ...order, createdAt: order.createdAt || new Date().toISOString() };
  const next: AppData = { ...current, orders: [full, ...current.orders] };
  saveAppDataFor(login, next);
  return next;
}

export function addOrder(order: Order): AppData {
  return addOrderFor(currentLogin(), order);
}

export function markOrderPaidFor(login: string, orderId: string, amount?: number): AppData {
  const current = loadAppDataFor(login);
  const order = current.orders.find((o) => o.id === orderId);
  const paidAmount = amount ?? order?.total ?? 0;
  const today = new Date().toISOString().slice(0, 10);
  const newHistory: HistoryEvent[] = order
    ? [
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
        ...current.history,
      ]
    : current.history;
  const next: AppData = {
    ...current,
    history: newHistory,
    orders: current.orders.map((o) =>
      o.id === orderId
        ? { ...o, paid: true, status: "Оплачено", paidAmount, paidAt: new Date().toISOString() }
        : o,
    ),
  };
  saveAppDataFor(login, next);
  return next;
}

export function markOrderPaid(orderId: string, amount?: number): AppData {
  // For mechanic context, route by appointment vin if possible
  const login = currentLogin();
  const owners = loadAllOwnersData();
  const owner = owners.find((o) => o.data.orders.some((or) => or.id === orderId));
  return markOrderPaidFor(owner?.login || login, orderId, amount);
}

// ===== STO =====

export function setSelectedSto(stoId: string): AppData {
  const login = currentLogin();
  const current = loadAppDataFor(login);
  const next: AppData = { ...current, selectedStoId: stoId };
  saveAppDataFor(login, next);
  return next;
}

// ===== Appointments =====

export function addAppointment(a: Appointment): AppData {
  const login = currentLogin();
  const current = loadAppDataFor(login);
  const next: AppData = { ...current, appointments: [a, ...current.appointments] };
  saveAppDataFor(login, next);
  return next;
}

export function updateAppointmentFor(login: string, id: string, patch: Partial<Appointment>): AppData {
  const current = loadAppDataFor(login);
  const next: AppData = {
    ...current,
    appointments: current.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
  };
  saveAppDataFor(login, next);
  return next;
}

export function updateAppointment(id: string, patch: Partial<Appointment>): AppData {
  const owners = loadAllOwnersData();
  const target = owners.find((o) => o.data.appointments.some((a) => a.id === id));
  return updateAppointmentFor(target?.login || currentLogin(), id, patch);
}

// ===== Defects =====

export function addDefectFor(
  login: string,
  defect: Omit<Defect, "id" | "createdAt"> & { id?: string; createdAt?: string },
): AppData {
  const current = loadAppDataFor(login);
  const full: Defect = {
    ...defect,
    id: defect.id || genId(),
    createdAt: defect.createdAt || new Date().toISOString(),
  };
  const today = full.createdAt.slice(0, 10);
  const newHistory: HistoryEvent = {
    id: `def-h-${full.id}`,
    type: "Обнаружена неисправность",
    desc: `${full.description}${full.recommendation ? " — " + full.recommendation : ""}`,
    place: full.createdByOrg || "ОНИКС-СЕРВИС",
    mileage: Math.floor(current.telemetry.mileage),
    date: today,
    icon: "alert",
    createdAt: full.createdAt,
  };
  const nextReminderId = Math.max(0, ...current.reminders.map((r) => r.id)) + 1;
  const newReminder: Reminder = {
    id: nextReminderId,
    text: `Проверка: ${full.nodeLabel}`,
    dueMileage: Math.floor(current.telemetry.mileage) + (full.severity === "critical" ? 200 : 2000),
    interval: 30000,
    urgency: full.severity === "critical" ? "high" : "medium",
    fromDefectId: full.id,
  };
  const next: AppData = {
    ...current,
    defects: [full, ...current.defects],
    history: [newHistory, ...current.history],
    reminders: [newReminder, ...current.reminders],
  };
  saveAppDataFor(login, next);
  return next;
}

export function addDefectByVin(
  vin: string,
  defect: Omit<Defect, "id" | "createdAt"> & { id?: string; createdAt?: string },
): AppData {
  return addDefectFor(loginForVin(vin), defect);
}

// ===== Formatting =====

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

export { CARS, OWNER_LOGINS };
