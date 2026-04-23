import React, { useMemo, useState } from "react";
import { CalendarCheck, Check, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { addAppointment, loadAppData } from "@/lib/storage";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workName: string;
};

const SLOTS = ["9:00–12:00", "12:00–15:00", "15:00–18:00"];
const RU_MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const RU_DOW = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function nextDays(n: number): Date[] {
  const out: Date[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    out.push(d);
  }
  return out;
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function SchedulingModal({ open, onOpenChange, workName }: Props) {
  const days = useMemo(() => nextDays(14), []);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setDate(null);
    setSlot(null);
    setSubmitted(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const onConfirm = () => {
    if (!date || !slot) return;
    const cur = loadAppData();
    addAppointment({
      id: String(Math.floor(Math.random() * 90000) + 10000),
      workName,
      date,
      slot,
      ownerName: cur.ownerName,
      carModel: `${cur.carModel} ${cur.carYear}`,
      mileage: Math.floor(cur.telemetry.mileage),
      status: "Ожидает",
      createdAt: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="bg-background border-white/10 rounded-t-3xl max-h-[90vh] overflow-y-auto"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl tracking-tight flex items-center gap-2">
            {submitted ? (
              <Check size={18} className="text-green-500" />
            ) : (
              <CalendarCheck size={18} className="text-primary" />
            )}
            {submitted ? "Заявка отправлена" : "Запись в ОНИКС-СЕРВИС"}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {submitted ? (
              <>Заявка отправлена механику. Ожидайте звонка или сообщения в чате.</>
            ) : (
              <span className="text-foreground font-medium">{workName}</span>
            )}
          </SheetDescription>
        </SheetHeader>

        {!submitted && (
          <>
            <div className="px-4 mt-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">
                Дата
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
                {days.map((d) => {
                  const iso = toIso(d);
                  const active = iso === date;
                  return (
                    <button
                      key={iso}
                      onClick={() => setDate(iso)}
                      className={`shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-2xl border transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-black/30 border-white/10 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-wider">{RU_DOW[d.getDay()]}</span>
                      <span className="text-lg font-bold leading-none">{d.getDate()}</span>
                      <span className="text-[10px] mt-0.5">{RU_MONTHS[d.getMonth()]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-4 mt-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">
                Время
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SLOTS.map((s) => {
                  const active = s === slot;
                  const disabled = !date;
                  return (
                    <button
                      key={s}
                      onClick={() => setSlot(s)}
                      disabled={disabled}
                      className={`rounded-xl py-3 text-xs font-mono font-medium border transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : disabled
                            ? "bg-black/30 border-white/5 text-muted-foreground/40"
                            : "bg-black/30 border-white/10 text-foreground hover:border-primary/40"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <SheetFooter className="px-4 pb-2 pt-4 flex-col gap-2 sm:flex-col">
          {submitted ? (
            <button
              onClick={() => handleClose(false)}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-sm font-semibold active:scale-[.98] transition-transform"
            >
              Готово
            </button>
          ) : (
            <>
              <button
                onClick={onConfirm}
                disabled={!date || !slot}
                className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform disabled:opacity-40"
              >
                <CalendarCheck size={16} />
                Подтвердить запись
              </button>
              <button
                onClick={() => handleClose(false)}
                className="w-full glass-card rounded-2xl py-4 text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"
              >
                <X size={16} />
                Отмена
              </button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
