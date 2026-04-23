import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { updateAppointment, formatDateRu, type Appointment, type AppointmentStatus } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import CreateWorkOrderForm from "@/components/CreateWorkOrderForm";

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

  const tasks = useMemo(
    () =>
      [...data.appointments].sort((a, b) => {
        const order: Record<AppointmentStatus, number> = { Ожидает: 0, "В работе": 1, Готово: 2, Отменено: 3 };
        return order[a.status] - order[b.status] || b.createdAt.localeCompare(a.createdAt);
      }),
    [data.appointments],
  );

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
            tasks={tasks.filter((t) => t.status !== "Готово")}
            onChange={(id, patch) => updateAppointment(id, patch)}
            onCreateOrder={(t) => {
              setOrderFor(t);
              setShowOrderForm(true);
            }}
          />
        )}
        {tab === "history" && (
          <HistoryTab tasks={tasks.filter((t) => t.status === "Готово" || t.status === "Отменено")} />
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

      <CreateWorkOrderForm
        open={showOrderForm}
        onOpenChange={setShowOrderForm}
        appointment={orderFor}
        mechanicName={user?.name || ""}
        mechanicOrg={orgName}
        onSent={() => {
          if (orderFor) updateAppointment(orderFor.id, { status: "Готово" });
        }}
      />
    </div>
  );
}

function TasksTab({
  tasks,
  onChange,
  onCreateOrder,
}: {
  tasks: Appointment[];
  onChange: (id: string, patch: Partial<Appointment>) => void;
  onCreateOrder: (t: Appointment) => void;
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
        <TaskCard key={t.id} task={t} onChange={onChange} onCreateOrder={onCreateOrder} />
      ))}
    </div>
  );
}

function TaskCard({
  task,
  onChange,
  onCreateOrder,
}: {
  task: Appointment;
  onChange: (id: string, patch: Partial<Appointment>) => void;
  onCreateOrder: (t: Appointment) => void;
}) {
  const meta = statusMeta[task.status];
  const [comment, setComment] = useState(task.mechanicComment || "");

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
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatDateRu(task.date)} · {task.slot}
          </span>
          <span>{task.mileage.toLocaleString("ru-RU")} км</span>
        </div>
      </div>

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
    </motion.div>
  );
}

function HistoryTab({ tasks }: { tasks: Appointment[] }) {
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
