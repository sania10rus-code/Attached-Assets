import React from "react";
import { motion } from "framer-motion";
import { Shield, Check, X, Lock, Database, MapPin, FileText } from "lucide-react";
import { PRIVACY_POLICY_VERSION } from "@/lib/privacy";

type Props = {
  mode?: "gate" | "view";
  onAccept?: () => void;
  onDecline?: () => void;
  onClose?: () => void;
};

export default function PrivacyPolicy({ mode = "gate", onAccept, onDecline, onClose }: Props) {
  return (
    <div
      className="min-h-[100dvh] w-full flex justify-center"
      style={{ backgroundColor: "#0b0e14" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[430px] flex flex-col h-[100dvh]"
      >
        <header className="px-6 pt-10 pb-4 flex items-center gap-3 border-b border-white/5">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Shield size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight">Политика конфиденциальности</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mt-0.5">
              Версия {PRIVACY_POLICY_VERSION} · ОНИКС
            </p>
          </div>
          {mode === "view" && onClose && (
            <button
              onClick={onClose}
              data-testid="policy-close"
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
            >
              <X size={16} />
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5 space-y-5 text-sm leading-relaxed">
          <p className="text-muted-foreground">
            Перед началом работы ознакомьтесь с тем, какие данные обрабатывает приложение
            ОНИКС, для чего они используются и как защищаются.
          </p>

          <Section icon={Database} title="Какие данные мы собираем">
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>
                <span className="text-foreground">Телеметрия автомобиля</span> — пробег, обороты,
                температура, расход топлива, коды OBD.
              </li>
              <li>
                <span className="text-foreground">VIN-номер и регистрационные данные</span> —
                идентификация автомобиля и привязка истории обслуживания.
              </li>
              <li>
                <span className="text-foreground">История обслуживания</span> — заказ-наряды,
                выполненные работы, установленные запчасти, отметки механиков.
              </li>
              <li>
                <span className="text-foreground">Геолокация</span> — для подбора ближайших
                сервисов и маршрута до СТО (только при согласии в системных настройках).
              </li>
            </ul>
          </Section>

          <Section icon={FileText} title="Как мы используем данные">
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>Диагностика и расчёт износа узлов автомобиля.</li>
              <li>Запись на техническое обслуживание в выбранное СТО.</li>
              <li>Формирование неизменяемой истории обслуживания.</li>
              <li>Улучшение сервиса и качества обслуживания (анонимная аналитика).</li>
            </ul>
          </Section>

          <Section icon={Lock} title="Как мы защищаем данные">
            <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
              <li>
                Аутентификационный токен и VIN хранятся в защищённом хранилище
                (Secure Storage / шифрование AES-GCM).
              </li>
              <li>Передача данных — только по защищённому протоколу HTTPS.</li>
              <li>
                Опциональный вход по биометрии (Face ID / Touch ID) с аппаратной защитой
                ключа в Secure Enclave устройства.
              </li>
              <li>
                История обслуживания неизменяема — записи нельзя удалить или
                подделать после 24 часов.
              </li>
            </ul>
          </Section>

          <Section icon={MapPin} title="Передача третьим лицам">
            <p className="text-muted-foreground">
              Данные передаются СТО только в рамках выбранной вами заявки и в объёме,
              необходимом для выполнения работ. Анонимная статистика может использоваться
              для улучшения сервиса. Данные не продаются и не передаются рекламным сетям.
            </p>
          </Section>

          <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
            Принимая политику, вы подтверждаете, что ознакомлены и согласны с условиями
            обработки данных. Вы можете отозвать согласие в любой момент в разделе
            «Настройки → Конфиденциальность».
          </p>
        </div>

        {mode === "gate" && (
          <div className="px-6 py-4 border-t border-white/5 grid grid-cols-2 gap-3 bg-black/40">
            <button
              onClick={onDecline}
              data-testid="policy-decline"
              className="border border-white/15 bg-white/5 hover:bg-white/10 rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
            >
              <X size={16} />
              Отказываюсь
            </button>
            <button
              onClick={onAccept}
              data-testid="policy-accept"
              className="bg-primary text-primary-foreground rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
            >
              <Check size={16} />
              Принимаю
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-primary" />
        <h2 className="text-[11px] uppercase tracking-widest font-mono font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}
