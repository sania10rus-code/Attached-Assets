import React from "react";
import { Languages } from "lucide-react";
import { useTranslation, LOCALES, type Locale } from "@/i18n";

type Variant = "compact" | "full";

export default function LanguageSwitcher({ variant = "full" }: { variant?: Variant }) {
  const { locale, setLocale, t } = useTranslation();

  if (variant === "compact") {
    return (
      <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-0.5">
        {LOCALES.map((l) => {
          const active = l.code === locale;
          return (
            <button
              key={l.code}
              onClick={() => setLocale(l.code as Locale)}
              data-testid={`lang-${l.code}`}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {l.flag}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="p-4 flex items-center gap-3">
      <Languages size={18} className="text-muted-foreground" />
      <div className="flex-1">
        <div className="text-sm font-medium">{t("more.language")}</div>
      </div>
      <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 p-0.5">
        {LOCALES.map((l) => {
          const active = l.code === locale;
          return (
            <button
              key={l.code}
              onClick={() => setLocale(l.code as Locale)}
              data-testid={`lang-${l.code}`}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
