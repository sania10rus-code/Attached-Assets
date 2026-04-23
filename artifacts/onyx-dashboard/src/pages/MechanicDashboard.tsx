import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListChecks,
  History as HistoryIcon,
  MessageSquare,
  User as UserIcon,
  Power,
  Check,
  Wrench,
  FilePlus,
  LogOut,
  Clock,
  CreditCard,
  X,
  MapPin,
} from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import {
  updateAppointment,
  formatDateRu,
  formatRub,
  markOrderPaid,
  type Appointment,
  type AppointmentStatus,
  type Order,
} from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { findSto } from "@/lib/catalog";
import WorkOrderDocument from "@/components/WorkOrderDocument";

type Tab = "tasks" | "history" | "chat" | "profile";

const statusMeta: Record<AppointmentStatus, { chip: string; dot: string }> = {
  Ожидает: { chip: "bg-amber-400/15 text-amber-400 border-amber-400/30", dot: "bg-amber-400" },
  "В работе": { chip: "bg-primary/15 text-primary border-primary/30", dot: "bg-primary" },
  Готово: { chip: "bg-green-500/15 text-green-500 border-green-500/30", dot: "bg-green-500" },
  Отменено: { chip: "bg-white/5 text-muted-foreground border-white/10", dot: "bg-muted-foreground" },
};

export default function MechanicDashboard() {
  const { user, logout } = useAuth();
  const data = useAppData();
  const [tab, setTab] = useState<Tab>("tasks");
  const [online, setOnline] = useState(true);
  const [orderFor, setOrderFor] = useState<Appointment | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [confirmPayFor, setConfirmPayFor] = useState<Order | null>(null);

  const tasks = useMemo(
    () =>
      [...data.appointments].sort((a, b) => {
        const order: Record<AppointmentStatus, number> = { Ожидает: 0, "В работе": 1, Готово: 2, Отменено: 3 };
        return order[a.status] - order[b.status] || b.createdAt.localeCompare(a.createdAt);
      }),
    [data.appointments],
  );

  const orderById = useMemo(() => {
    const m = new Map<string, Order>();
    data.orders.forEach((o) => m.set(o.id, o));
    return m;
  }, [data.orders]);

  const activeTasks = tasks.filter((t) => {
    if (t.status === "Отменено") return false;
    if (t.status === "Готово") {
      const o = t.orderId ? orderById.get(t.orderId) : undefined;
      return o ? o.paid !== true : true;
    }
    return true;
  });
  const archivedTasks = tasks.filter((t) => {
    if (t.status === "Отменено") return true;
    if (t.status === "Готово") {
      const o = t.orderId ? orderById.get(t.orderId) : undefined;
      return o?.paid === true;
    }
    return false;
  });

  const orgName = user?.org || "ОНИКС-СЕРВИС";

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ backgroundColor: "#0b0e14" }}>
      <header className="px-6 pt-12 pb-5 border-b border-white/5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-glow">{orgName}</h1>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
              {user?.name} · Панель механика
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnline((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] uppercase tracking-wider font-semibold ${
                online
                  ? "bg-green-500/15 text-green-500 border-green-500/30"
                  : "bg-white/5 text-muted-foreground border-white/10"
              }`}
            >
              <Power size={12} />
              {online ? "Онлайн" : "Офлайн"}
            </button>
            <button
              onClick={logout}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground"
              title="Выйти"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {tab === "tasks" && (
          <TasksTab
            tasks={activeTasks}
            getOrder={(id) => (id ? orderById.get(id) : undefined)}
            onChange={(id, patch) => updateAppointment(id, patch)}
            onCreateOrder={(t) => {
              setOrderFor(t);
              setShowOrderForm(true);
            }}
            onConfirmPay={(o) => setConfirmPayFor(o)}
          />
        )}
        {tab === "history" && (
          <HistoryTab tasks={archivedTasks} getOrder={(id) => (id ? orderById.get(id) : undefined)} />
        )}
        {tab === "chat" && (
          <Stub title="Чат с владельцами" subtitle="Раздел в разработке" icon={MessageSquare} />
        )}
        {tab === "profile" && (
          <Stub title="Профиль" subtitle={`${user?.name} · ${orgName}`} icon={UserIcon} />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center w-full pointer-events-none">
        <div className="w-full max-w-[430px] bg-background/80 backdrop-blur-xl border-t border-white/10 pointer-events-auto">
          <div className="flex items-center justify-around h-16 px-2">
            {[
              { id: "tasks" as const, label: "Задачи", icon: ListChecks },
              { id: "history" as const, label: "История", icon: HistoryIcon },
              { id: "chat" as const, label: "Чат", icon: MessageSquare },
              { id: "profile" as const, label: "Профиль", icon: UserIcon },
            ].map((nav) => {
              const active = tab === nav.id;
              const Icon = nav.icon;
              return (
                <button
                  key={nav.id}
                  onClick={() => setTab(nav.id)}
                  className="relative flex flex-col items-center justify-center w-16 h-full gap-1 text-xs"
                >
                  <Icon
                    size={22}
                    className={active ? "text-primary" : "text-muted-foreground"}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className={`font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                    {nav.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="mech-nav-indicator"
                      className="absolute top-0 w-8 h-[2px] bg-primary shadow-[0_0_8px_rgba(255,0,0,0.8)] rounded-b-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <WorkOrderDocument
        open={showOrderForm}
        onClose={() => setShowOrderForm(false)}
        appointment={orderFor}
        mechanicName={user?.name || ""}
        defaultStoId={orderFor?.stoId || "north"}
        onSent={(orderId) => {
          if (orderFor) updateAppointment(orderFor.id, { status: "Готово", orderId });
        }}
      />

      <ConfirmPaymentSheet
        order={confirmPayFor}
        onClose={() => setConfirmPayFor(null)}
        onConfirm={(amount) => {
          if (confirmPayFor) markOrderPaid(confirmPayFor.id, amount);
          setConfirmPayFor(null);
        }}
      />
    </div>
  );
}

function TasksTab({
  tasks,
  getOrder,
  onChange,
  onCreateOrder,
  onConfirmPay,
}: {
  tasks: Appointment[];
  getOrder: (id?: string) => Order | undefined;
  onChange: (id: string, patch: Partial<Appointment>) => void;
  onCreateOrder: (t: Appointment) => void;
  onConfirmPay: (o: Order) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <ListChecks size={28} className="text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">На сегодня задач нет</p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          Когда владелец оставит заявку, она появится здесь.
        </p>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-3">
      {tasks.map((t) => (
        <TaskCard
          key={t.id}
          task={t}
          order={getOrder(t.orderId)}
          onChange={onChange}
          onCreateOrder={onCreateOrder}
          onConfirmPay={onConfirmPay}
        />
      ))}
    </div>
  );
}

function TaskCard({
  task,
  order,
  onChange,
  onCreateOrder,
  onConfirmPay,
}: {
  task: Appointment;
  order?: Order;
  onChange: (id: string, patch: Partial<Appointment>) => void;
  onCreateOrder: (t: Appointment) => void;
  onConfirmPay: (o: Order) => void;
}) {
  const meta = statusMeta[task.status];
  const [comment, setComment] = useState(task.mechanicComment || "");
  const sto = findSto(task.stoId);

  const saveComment = () => {
    if (comment !== (task.mechanicComment || "")) {
      onChange(task.id, { mechanicComment: comment });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-2xl p-4 border-white/5"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm leading-tight">{task.ownerName}</h3>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
            {task.carModel}
          </p>
        </div>
        <span
          className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1.5 shrink-0 ${meta.chip}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {task.status}
        </span>
      </div>

      <div className="bg-black/30 rounded-xl p-3 mb-3 space-y-1.5">
        <div className="text-sm font-medium leading-snug">{task.workName}</div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono flex-wrap">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatDateRu(task.date)} · {task.slot}
          </span>
          <span>{task.mileage.toLocaleString("ru-RU")} км</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
          <MapPin size={11} />
          <span>{sto.shortName} · {sto.address}</span>
        </div>
      </div>

      {order ? (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
              Наряд № {order.id}
            </span>
            <span className="text-sm font-bold font-mono text-primary">{formatRub(order.total)}</span>
          </div>
          {order.paid ? (
            <button
              disabled
              className="w-full bg-green-500/15 border border-green-500/30 text-green-500 rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Check size={13} />
              Оплачено
              {order.paidAmount != null && ` · ${formatRub(order.paidAmount)}`}
            </button>
          ) : (
            <button
              onClick={() => onConfirmPay(order)}
              className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[.98] transition-transform"
            >
              <CreditCard size={13} />
              Подтвердить оплату
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => onChange(task.id, { status: "Готово" })}
              className="bg-green-500/15 border border-green-500/30 text-green-500 rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[.98] transition-transform"
            >
              <Check size={14} />В норме
            </button>
            <button
              onClick={() => onChange(task.id, { status: "В работе" })}
              className="bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[.98] transition-transform"
            >
              <Wrench size={14} />
              Замена выполнена
            </button>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onBlur={saveComment}
            rows={2}
            placeholder="Комментарий механика…"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50 resize-none mb-3"
          />

          <button
            onClick={() => onCreateOrder(task)}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[.98] transition-transform"
          >
            <FilePlus size={14} />
            Создать заказ-наряд
          </button>
        </>
      )}
    </motion.div>
  );
}

function HistoryTab({
  tasks,
  getOrder,
}: {
  tasks: Appointment[];
  getOrder: (id?: string) => Order | undefined;
}) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <HistoryIcon size={28} className="text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Закрытых задач пока нет</p>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-3">
      {tasks.map((t) => {
        const meta = statusMeta[t.status];
        const order = getOrder(t.orderId);
        return (
          <div key={t.id} className="glass-card rounded-2xl p-4 border-white/5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm">{t.ownerName}</h3>
                <p className="text-[11px] text-muted-foreground font-mono">{t.carModel}</p>
              </div>
              <span
                className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.chip}`}
              >
                {t.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{t.workName}</p>
            <p className="text-[11px] font-mono text-muted-foreground/70 mt-2">
              {formatDateRu(t.date)} · {t.slot}
            </p>
            {order && (
              <div className="mt-2 flex items-center justify-between bg-black/30 rounded-lg px-2.5 py-1.5">
                <span className="text-[10px] font-mono text-muted-foreground">№ {order.id}</span>
                <span className="text-xs font-mono font-bold text-green-500">
                  {formatRub(order.paidAmount ?? order.total)}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Stub({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Icon size={28} className="text-muted-foreground" />
      </div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-[11px] text-muted-foreground/70 mt-1">{subtitle}</p>
    </div>
  );
}

function ConfirmPaymentSheet({
  order,
  onClose,
  onConfirm,
}: {
  order: Order | null;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}) {
  const [amount, setAmount] = useState<string>("");

  React.useEffect(() => {
    if (order) setAmount(String(order.total));
  }, [order]);

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] bg-black/70 flex items-end justify-center"
        >
          <motion.div
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            exit={{ y: 60 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-background border-t border-white/10 rounded-t-3xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <CreditCard size={18} className="text-primary" />
                  Подтвердить оплату
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Заказ-наряд № {order.id} · сумма к оплате {formatRub(order.total)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-2">
                Полученная сумма
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-2xl font-mono font-bold outline-none focus:border-primary/50 pr-10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">₽</span>
              </div>
            </div>

            <button
              onClick={() => {
                const n = parseInt(amount) || 0;
                if (n > 0) onConfirm(n);
              }}
              disabled={!amount || parseInt(amount) <= 0}
              className="mt-5 w-full bg-primary text-primary-foreground rounded-2xl py-4 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform disabled:opacity-40"
            >
              <Check size={16} />
              Подтвердить оплату
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
