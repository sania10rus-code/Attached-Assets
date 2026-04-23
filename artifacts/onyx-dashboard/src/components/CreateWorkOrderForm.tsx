import React, { useMemo, useState } from "react";
import { Plus, Trash2, FileCheck, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  addOrder,
  addHistoryEvent,
  formatRub,
  loadAppData,
  type Appointment,
  type OrderItem,
} from "@/lib/storage";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  appointment: Appointment | null;
  mechanicName: string;
  mechanicOrg: string;
  onSent: () => void;
};

type Part = { name: string; sku: string; brand: string; qty: number; price: number };
type Work = { name: string; price: number };

const WORK_TYPES = ["ТО", "Ремонт", "Диагностика", "Замена"];
const WORK_SUGGESTIONS = [
  "Замена масла и фильтра",
  "Замена тормозных колодок",
  "Диагностика двигателя",
  "Замена свечей зажигания",
  "Развал-схождение",
];

export default function CreateWorkOrderForm({
  open,
  onOpenChange,
  appointment,
  mechanicName,
  mechanicOrg,
  onSent,
}: Props) {
  const cur = loadAppData();
  const [workType, setWorkType] = useState(WORK_TYPES[0]);
  const [mileage, setMileage] = useState<number>(
    appointment?.mileage ?? Math.floor(cur.telemetry.mileage),
  );
  const [works, setWorks] = useState<Work[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [comment, setComment] = useState("");

  const total = useMemo(
    () =>
      works.reduce((s, w) => s + (w.price || 0), 0) +
      parts.reduce((s, p) => s + (p.price || 0) * (p.qty || 0), 0),
    [works, parts],
  );

  const reset = () => {
    setWorkType(WORK_TYPES[0]);
    setMileage(appointment?.mileage ?? Math.floor(loadAppData().telemetry.mileage));
    setWorks([]);
    setParts([]);
    setComment("");
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const send = () => {
    const id = String(Math.floor(Math.random() * 90000) + 10000);
    const items: OrderItem[] = [
      ...works.map((w) => ({ name: `Работа: ${w.name}`, qty: 1, price: w.price })),
      ...parts.map((p) => ({
        name: `${p.name}${p.brand ? ` ${p.brand}` : ""}${p.sku ? ` (${p.sku})` : ""}`,
        qty: p.qty,
        price: p.price * p.qty,
      })),
    ];
    if (items.length === 0) return;
    addOrder({
      id,
      date: new Date().toISOString().slice(0, 10),
      service: mechanicOrg,
      city: "Санкт-Петербург",
      status: "Выполнен",
      items,
      total,
      paid: false,
      createdBy: "mechanic",
      comment: comment || undefined,
    });
    addHistoryEvent({
      type: "ТО",
      desc: `${workType}: ${appointment?.workName || "работы"}${comment ? ` — ${comment}` : ""}`,
      place: mechanicOrg,
      mileage,
      date: new Date().toISOString().slice(0, 10),
      icon: "check",
    });
    onSent();
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="bg-background border-white/10 rounded-t-3xl max-h-[92vh] overflow-y-auto"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl tracking-tight flex items-center gap-2">
            <FileCheck size={18} className="text-primary" />
            Создать заказ-наряд
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {appointment
              ? `${appointment.ownerName} · ${appointment.carModel}`
              : "Свободный заказ-наряд"}
            <br />
            <span className="text-[11px] font-mono">
              {new Date().toLocaleString("ru-RU")} · мастер {mechanicName}
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Пробег (км)">
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(parseInt(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono outline-none focus:border-primary/50"
              />
            </Field>
            <Field label="Тип работ">
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50"
              >
                {WORK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Section
            title="Работы"
            onAdd={() => setWorks((w) => [...w, { name: "", price: 0 }])}
            addLabel="Добавить работу"
          >
            {works.map((w, i) => (
              <div key={i} className="flex gap-2">
                <input
                  list="work-suggestions"
                  value={w.name}
                  onChange={(e) =>
                    setWorks((arr) => arr.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))
                  }
                  placeholder="Название работы"
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50"
                />
                <input
                  type="number"
                  value={w.price || ""}
                  onChange={(e) =>
                    setWorks((arr) =>
                      arr.map((x, idx) => (idx === i ? { ...x, price: parseInt(e.target.value) || 0 } : x)),
                    )
                  }
                  placeholder="₽"
                  className="w-20 bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs font-mono text-right outline-none focus:border-primary/50"
                />
                <button
                  onClick={() => setWorks((arr) => arr.filter((_, idx) => idx !== i))}
                  className="w-9 h-9 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center text-muted-foreground"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <datalist id="work-suggestions">
              {WORK_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Section>

          <Section
            title="Запчасти"
            onAdd={() =>
              setParts((p) => [...p, { name: "", sku: "", brand: "", qty: 1, price: 0 }])
            }
            addLabel="Добавить запчасть"
          >
            {parts.map((p, i) => (
              <div key={i} className="space-y-2 bg-black/30 rounded-xl p-2">
                <div className="flex gap-2">
                  <input
                    value={p.name}
                    onChange={(e) =>
                      setParts((arr) =>
                        arr.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)),
                      )
                    }
                    placeholder="Название"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50"
                  />
                  <button
                    onClick={() => setParts((arr) => arr.filter((_, idx) => idx !== i))}
                    className="w-9 h-9 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center text-muted-foreground shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={p.sku}
                    onChange={(e) =>
                      setParts((arr) =>
                        arr.map((x, idx) => (idx === i ? { ...x, sku: e.target.value } : x)),
                      )
                    }
                    placeholder="Артикул"
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-primary/50"
                  />
                  <input
                    value={p.brand}
                    onChange={(e) =>
                      setParts((arr) =>
                        arr.map((x, idx) => (idx === i ? { ...x, brand: e.target.value } : x)),
                      )
                    }
                    placeholder="Бренд"
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={p.qty}
                    onChange={(e) =>
                      setParts((arr) =>
                        arr.map((x, idx) =>
                          idx === i ? { ...x, qty: parseInt(e.target.value) || 0 } : x,
                        ),
                      )
                    }
                    placeholder="Кол-во"
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-primary/50"
                  />
                  <input
                    type="number"
                    value={p.price || ""}
                    onChange={(e) =>
                      setParts((arr) =>
                        arr.map((x, idx) =>
                          idx === i ? { ...x, price: parseInt(e.target.value) || 0 } : x,
                        ),
                      )
                    }
                    placeholder="Цена ₽"
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            ))}
          </Section>

          <Field label="Комментарий механика">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 resize-none"
              placeholder="Например: рекомендована замена через 5000 км"
            />
          </Field>

          <div className="flex justify-between items-center pt-3 border-t border-white/10">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
              Итого
            </span>
            <span className="text-xl font-bold font-mono text-glow">{formatRub(total)}</span>
          </div>
        </div>

        <SheetFooter className="px-4 pb-2 pt-4 flex-col gap-2 sm:flex-col">
          <button
            onClick={send}
            disabled={works.length + parts.length === 0}
            className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform disabled:opacity-40"
          >
            <FileCheck size={16} />
            Отправить владельцу
          </button>
          <button
            onClick={() => handleClose(false)}
            className="w-full glass-card rounded-2xl py-4 text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"
          >
            <X size={16} />
            Отмена
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function Section({
  title,
  onAdd,
  addLabel,
  children,
}: {
  title: string;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          {title}
        </span>
        <button
          onClick={onAdd}
          className="text-[10px] text-primary font-semibold uppercase tracking-wider flex items-center gap-1"
        >
          <Plus size={12} />
          {addLabel}
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
