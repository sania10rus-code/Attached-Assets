import React from "react";
import { CalendarCheck, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workName: string;
};

export default function SchedulingModal({ open, onOpenChange, workName }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-background border-white/10 rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl tracking-tight flex items-center gap-2">
            <CalendarCheck size={18} className="text-primary" />
            Запись в ОНИКС-СЕРВИС
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            <span className="text-foreground font-medium">{workName}</span>
            <br />
            Вы будете перенаправлены к мастеру для подтверждения времени и адреса.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 mt-4">
          <div className="glass-card rounded-2xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Сервис-центр</span>
              <span className="font-mono">ОНИКС-СЕРВИС</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Город</span>
              <span className="font-mono">Санкт-Петербург</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Телефон</span>
              <span className="font-mono">+7 (800) 123-45-67</span>
            </div>
          </div>
        </div>

        <SheetFooter className="px-4 pb-2 pt-4 flex-col gap-2 sm:flex-col">
          <button
            onClick={() => {
              window.location.href = "tel:+78001234567";
            }}
            className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
          >
            <CalendarCheck size={16} />
            Подтвердить запись
          </button>
          <button
            onClick={() => onOpenChange(false)}
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
