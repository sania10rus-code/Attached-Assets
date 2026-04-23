import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Trash2,
  FileCheck,
  Stamp,
  Package,
  PackageOpen,
  AlertTriangle,
} from "lucide-react";
import {
  addOrder,
  addHistoryEvent,
  formatRub,
  formatMileage,
  loadAppData,
  type Appointment,
  type OrderItem,
} from "@/lib/storage";
import { PARTS_CATALOG, findSto, type CatalogPart } from "@/lib/catalog";

type Props = {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  mechanicName: string;
  defaultStoId: string;
  onSent: (orderId: string) => void;
};

type Work = { name: string; price: number };
type LinePart = { catalogId?: string; name: string; brand: string; sku: string; qty: number; price: number };

const WORK_TYPES = ["ТО", "Ремонт", "Диагностика", "Замена"];
const WORK_SUGGESTIONS = [
  "Замена масла и фильтра",
  "Замена тормозных колодок",
  "Диагностика двигателя",
  "Замена свечей зажигания",
  "Развал-схождение",
];

export default function WorkOrderDocument({
  open,
  onClose,
  appointment,
  mechanicName,
  defaultStoId,
  onSent,
}: Props) {
  const cur = loadAppData();
  const sto = findSto(appointment?.stoId || defaultStoId);

  const ownerName = appointment?.ownerName || cur.ownerName;
  const ownerPhone = appointment?.ownerPhone || cur.ownerPhone;
  const carModel = appointment?.carModel || `${cur.carModel} ${cur.carYear}`;
  const carVin = appointment?.carVin || cur.carVin;
  const carPlate = appointment?.carPlate || cur.carPlate;

  const [workType, setWorkType] = useState(WORK_TYPES[0]);
  const [mileage, setMileage] = useState<number>(
    appointment?.mileage ?? Math.floor(cur.telemetry.mileage),
  );
  const [works, setWorks] = useState<Work[]>([]);
  const [parts, setParts] = useState<LinePart[]>([]);
  const [comment, setComment] = useState("");
  const [showCatalog, setShowCatalog] = useState(false);
  const [warnDiff, setWarnDiff] = useState<number | null>(null);

  const orderId = useMemo(() => String(Math.floor(Math.random() * 90000) + 10000), [appointment?.id]);

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
    setShowCatalog(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const addCatalogPart = (cp: CatalogPart) => {
    setParts((arr) => {
      const idx = arr.findIndex((x) => x.catalogId === cp.id);
      if (idx >= 0) {
        return arr.map((x, i) => (i === idx ? { ...x, qty: x.qty + 1 } : x));
      }
      return [
        ...arr,
        {
          catalogId: cp.id,
          name: cp.name,
          brand: cp.brand,
          sku: cp.sku,
          qty: 1,
          price: cp.price,
        },
      ];
    });
  };

  const trySend = () => {
    if (works.length + parts.length === 0) return;
    const fresh = loadAppData();
    const actual = Math.floor(fresh.telemetry.mileage);
    const diff = Math.abs(mileage - actual);
    if (diff > 500 && diff <= 1000) {
      setWarnDiff(diff);
      return;
    }
    finalizeSend();
  };

  const finalizeSend = () => {
    const fresh = loadAppData();
    const actual = Math.floor(fresh.telemetry.mileage);
    const diff = Math.abs(mileage - actual);
    const items: OrderItem[] = [
      ...works.map((w) => ({ name: `Работа: ${w.name}`, qty: 1, price: w.price })),
      ...parts.map((p) => ({
        name: `${p.name}${p.brand ? ` ${p.brand}` : ""}${p.sku ? ` (${p.sku})` : ""}`,
        qty: p.qty,
        price: p.price * p.qty,
      })),
    ];
    addOrder({
      id: orderId,
      date: new Date().toISOString().slice(0, 10),
      service: sto.name,
      city: sto.city,
      status: "Выполнен · ожидает оплаты",
      items,
      total,
      paid: false,
      createdBy: "mechanic",
      comment: comment || undefined,
    });
    addHistoryEvent({
      type: "ТО",
      desc: `${workType}: ${appointment?.workName || "работы"}${comment ? ` — ${comment}` : ""}`,
      place: sto.name,
      mileage,
      date: new Date().toISOString().slice(0, 10),
      icon: "check",
    });
    if (diff > 1000) {
      addHistoryEvent({
        type: "Расхождение",
        desc: `Расхождение пробега ${formatMileage(diff)} км`,
        place: sto.name,
        mileage,
        date: new Date().toISOString().slice(0, 10),
        icon: "engine",
        discrepancy: {
          reportedMileage: mileage,
          actualMileage: actual,
          diff,
          relatedOrderId: orderId,
          acknowledged: false,
        },
      });
    }
    onSent(orderId);
    reset();
    setWarnDiff(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[430px] h-[100dvh] sm:h-[92vh] sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            style={{ backgroundColor: "#1a1d23" }}
          >
            <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-background shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck size={16} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Заказ-наряд</span>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar bg-[#0b0e14]">
              <PaperDocument
                orderId={orderId}
                sto={sto}
                ownerName={ownerName}
                ownerPhone={ownerPhone}
                carModel={carModel}
                carVin={carVin}
                carPlate={carPlate}
                mileage={mileage}
                onMileage={setMileage}
                workType={workType}
                onWorkType={setWorkType}
                works={works}
                onWorksChange={setWorks}
                parts={parts}
                onPartsChange={setParts}
                comment={comment}
                onComment={setComment}
                total={total}
                mechanicName={mechanicName}
                onOpenCatalog={() => setShowCatalog(true)}
              />
            </div>

            <footer className="px-4 py-3 border-t border-white/10 bg-background shrink-0">
              <button
                onClick={trySend}
                disabled={works.length + parts.length === 0}
                className="w-full bg-primary text-primary-foreground rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform disabled:opacity-40"
              >
                <FileCheck size={16} />
                Отправить владельцу
              </button>
            </footer>

            <CatalogSheet
              open={showCatalog}
              onClose={() => setShowCatalog(false)}
              onAdd={(cp) => {
                addCatalogPart(cp);
              }}
            />

            <DiscrepancyWarning
              diff={warnDiff}
              reported={mileage}
              actual={Math.floor(loadAppData().telemetry.mileage)}
              onCancel={() => setWarnDiff(null)}
              onConfirm={() => finalizeSend()}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PaperDocument(props: {
  orderId: string;
  sto: ReturnType<typeof findSto>;
  ownerName: string;
  ownerPhone: string;
  carModel: string;
  carVin: string;
  carPlate: string;
  mileage: number;
  onMileage: (v: number) => void;
  workType: string;
  onWorkType: (v: string) => void;
  works: Work[];
  onWorksChange: React.Dispatch<React.SetStateAction<Work[]>>;
  parts: LinePart[];
  onPartsChange: React.Dispatch<React.SetStateAction<LinePart[]>>;
  comment: string;
  onComment: (v: string) => void;
  total: number;
  mechanicName: string;
  onOpenCatalog: () => void;
}) {
  const {
    orderId,
    sto,
    ownerName,
    ownerPhone,
    carModel,
    carVin,
    carPlate,
    mileage,
    onMileage,
    workType,
    onWorkType,
    works,
    onWorksChange,
    parts,
    onPartsChange,
    comment,
    onComment,
    total,
    mechanicName,
    onOpenCatalog,
  } = props;

  const dateStr = new Date().toLocaleDateString("ru-RU");
  const timeStr = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="p-3">
      <div
        className="rounded-lg shadow-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #f5f1e8 0%, #ede8d8 100%)",
          color: "#1a1a1a",
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b-2 border-dashed border-black/20 relative">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <h2 className="text-xl font-bold tracking-tight">ОНИКС-СЕРВИС</h2>
              </div>
              <p className="text-[10px] mt-0.5 uppercase tracking-widest text-black/60 font-mono">
                Цифровой паспорт автомобиля
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-black/60">Заказ-наряд</div>
              <div className="text-2xl font-bold font-mono">№ {orderId}</div>
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-black/70">
            <span>{dateStr}</span>
            <span>{timeStr}</span>
          </div>
          <Stamp
            size={64}
            className="absolute right-4 -bottom-4 text-primary/15 rotate-12 pointer-events-none"
            strokeWidth={1.5}
          />
        </div>

        {/* Parties */}
        <div className="px-5 pt-4 pb-3 grid grid-cols-1 gap-3">
          <PaperBlock label="Исполнитель">
            <div className="font-bold text-sm">{sto.name}</div>
            <div className="text-[11px] text-black/70">{sto.address}, {sto.city}</div>
            <div className="text-[11px] text-black/70 font-mono">тел. {sto.phone}</div>
            <div className="text-[11px] text-black/60 mt-1">Мастер: {mechanicName}</div>
          </PaperBlock>

          <PaperBlock label="Заказчик">
            <div className="font-bold text-sm">{ownerName}</div>
            <div className="text-[11px] text-black/70 font-mono">{ownerPhone}</div>
          </PaperBlock>

          <PaperBlock label="Автомобиль">
            <div className="font-bold text-sm">{carModel}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-black/70 font-mono mt-1">
              <span>Госномер:</span><span className="font-bold text-black">{carPlate}</span>
              <span>VIN:</span><span className="font-bold text-black truncate">{carVin}</span>
              <span>Пробег:</span>
              <input
                type="number"
                value={mileage}
                onChange={(e) => onMileage(parseInt(e.target.value) || 0)}
                className="bg-transparent border-b border-black/30 outline-none focus:border-black text-black font-bold"
              />
            </div>
          </PaperBlock>

          <PaperBlock label="Тип работ">
            <select
              value={workType}
              onChange={(e) => onWorkType(e.target.value)}
              className="bg-transparent border-b border-black/30 outline-none focus:border-black w-full text-sm font-bold"
            >
              {WORK_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </PaperBlock>
        </div>

        {/* Works */}
        <PaperSection
          title="Перечень выполненных работ"
          actionLabel="+ Работа"
          onAction={() => onWorksChange((w) => [...w, { name: "", price: 0 }])}
        >
          {works.length === 0 && (
            <div className="text-[11px] italic text-black/40 px-3 py-2">— работ не добавлено —</div>
          )}
          {works.map((w, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 border-b border-dashed border-black/15">
              <span className="text-[10px] font-mono text-black/50 w-5">{i + 1}.</span>
              <input
                list="work-suggestions-doc"
                value={w.name}
                onChange={(e) =>
                  onWorksChange((arr) => arr.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))
                }
                placeholder="Наименование работы"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-black/30"
              />
              <input
                type="number"
                value={w.price || ""}
                onChange={(e) =>
                  onWorksChange((arr) =>
                    arr.map((x, idx) => (idx === i ? { ...x, price: parseInt(e.target.value) || 0 } : x)),
                  )
                }
                placeholder="₽"
                className="w-20 bg-transparent border-b border-black/30 outline-none text-sm font-mono font-bold text-right"
              />
              <button
                onClick={() => onWorksChange((arr) => arr.filter((_, idx) => idx !== i))}
                className="text-black/40 hover:text-red-700"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <datalist id="work-suggestions-doc">
            {WORK_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </PaperSection>

        {/* Parts */}
        <PaperSection
          title="Запчасти и расходные материалы"
          actionLabel="+ Из каталога"
          onAction={onOpenCatalog}
        >
          {parts.length === 0 && (
            <div className="text-[11px] italic text-black/40 px-3 py-2">— запчастей не добавлено —</div>
          )}
          {parts.map((p, i) => (
            <div key={i} className="px-3 py-2 border-b border-dashed border-black/15">
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-mono text-black/50 w-5 mt-0.5">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-snug">
                    {p.name}{" "}
                    <span className="text-black/60 text-[11px] font-mono">{p.brand}</span>
                  </div>
                  {p.sku && (
                    <div className="text-[10px] text-black/50 font-mono">арт. {p.sku}</div>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() =>
                        onPartsChange((arr) =>
                          arr.map((x, idx) =>
                            idx === i ? { ...x, qty: Math.max(1, x.qty - 1) } : x,
                          ),
                        )
                      }
                      className="w-6 h-6 rounded-full bg-black/10 text-xs font-bold leading-none"
                    >
                      −
                    </button>
                    <span className="text-xs font-mono w-8 text-center">{p.qty} шт.</span>
                    <button
                      onClick={() =>
                        onPartsChange((arr) =>
                          arr.map((x, idx) => (idx === i ? { ...x, qty: x.qty + 1 } : x)),
                        )
                      }
                      className="w-6 h-6 rounded-full bg-black/10 text-xs font-bold leading-none"
                    >
                      +
                    </button>
                    <span className="text-[11px] font-mono text-black/60 ml-1">
                      × {formatRubBare(p.price)}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-mono font-bold">{formatRubBare(p.price * p.qty)} ₽</div>
                  <button
                    onClick={() => onPartsChange((arr) => arr.filter((_, idx) => idx !== i))}
                    className="text-black/40 hover:text-red-700 mt-0.5"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </PaperSection>

        {/* Comment */}
        <div className="px-5 mt-4">
          <div className="text-[10px] uppercase tracking-widest text-black/60 font-bold mb-1">
            Комментарий механика
          </div>
          <textarea
            value={comment}
            onChange={(e) => onComment(e.target.value)}
            rows={2}
            placeholder="Например: рекомендована замена через 5 000 км"
            className="w-full bg-transparent border-b border-black/30 outline-none focus:border-black text-sm resize-none placeholder:text-black/30"
          />
        </div>

        {/* Total */}
        <div className="px-5 mt-4 pb-2">
          <div className="border-t-2 border-double border-black/40 pt-3 flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-widest font-bold">Итого к оплате</span>
            <span className="text-2xl font-bold font-mono">{formatRub(total)}</span>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-4 px-5 pt-6 pb-6">
          <SigBlock role="Исполнитель" />
          <SigBlock role="Заказчик" />
        </div>
      </div>
    </div>
  );
}

function PaperBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-black/15 rounded p-3 bg-black/[0.03]">
      <div className="text-[9px] uppercase tracking-widest text-black/60 font-bold mb-1">{label}</div>
      {children}
    </div>
  );
}

function PaperSection({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel: string;
  onAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <div className="px-5 flex items-center justify-between mb-1">
        <div className="text-[10px] uppercase tracking-widest text-black/70 font-bold">{title}</div>
        <button
          onClick={onAction}
          className="text-[10px] font-bold uppercase tracking-wider text-primary"
        >
          {actionLabel}
        </button>
      </div>
      <div className="border-y border-black/20 bg-black/[0.02]">{children}</div>
    </div>
  );
}

function SigBlock({ role }: { role: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-widest text-black/60 mb-1">
        Подпись {role}
      </div>
      <div className="font-mono text-sm text-black/70 tracking-widest">___________</div>
    </div>
  );
}

function formatRubBare(n: number) {
  return n.toLocaleString("ru-RU");
}

function CatalogSheet({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (p: CatalogPart) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-10 bg-black/70 flex items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            exit={{ y: 50 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-background rounded-t-3xl border-t border-white/10 max-h-[80%] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold tracking-tight">Каталог запчастей</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Skoda Octavia A5 · 2007</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 no-scrollbar">
              {PARTS_CATALOG.map((p) => (
                <div
                  key={p.id}
                  className="glass-card rounded-2xl p-3 flex items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      p.available ? "bg-green-500/15" : "bg-amber-400/15"
                    }`}
                  >
                    {p.available ? (
                      <Package size={16} className="text-green-500" />
                    ) : (
                      <PackageOpen size={16} className="text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-tight truncate">
                      {p.name}{" "}
                      <span className="text-muted-foreground text-[11px]">{p.brand}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
                          p.available
                            ? "bg-green-500/10 text-green-500 border-green-500/30"
                            : "bg-amber-400/10 text-amber-400 border-amber-400/30"
                        }`}
                      >
                        {p.available ? "В наличии" : "Под заказ"}
                      </span>
                      <span className="text-[11px] font-mono font-bold">{formatRub(p.price)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onAdd(p)}
                    className="bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 active:scale-[.98]"
                  >
                    <Plus size={11} />
                    Добавить
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DiscrepancyWarning({
  diff,
  reported,
  actual,
  onCancel,
  onConfirm,
}: {
  diff: number | null;
  reported: number;
  actual: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {diff != null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 bg-black/80 flex items-end justify-center"
          onClick={onCancel}
        >
          <motion.div
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            exit={{ y: 60 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-background rounded-t-3xl border-t border-amber-400/30 p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-400/15 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-400 leading-snug">
                  Внимание: расхождение пробега
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Указанный пробег расходится с данными автомобиля на{" "}
                  <span className="text-amber-400 font-mono font-bold">
                    {formatMileage(diff)} км
                  </span>
                  . Проверьте правильность ввода.
                </p>
              </div>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-xl p-3 mb-4 text-[12px] font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Указано:</span>
                <span className="font-bold">{formatMileage(reported)} км</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">По данным авто:</span>
                <span className="font-bold">{formatMileage(actual)} км</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onCancel}
                className="glass-card rounded-2xl py-3.5 text-xs font-semibold"
              >
                Исправить
              </button>
              <button
                onClick={onConfirm}
                className="bg-amber-400 text-black rounded-2xl py-3.5 text-xs font-semibold"
              >
                Всё верно, отправить
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
