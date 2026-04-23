import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Car,
  Shield,
  Info,
  LogOut,
  User,
  BellRing,
  FileText,
  Wrench,
  ChevronRight,
  Fingerprint,
  Lock,
  ShieldCheck,
  ShieldAlert,
  ScanSearch,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import {
  isBiometricSupported,
  isBiometricEnabled,
  enableBiometric,
  disableBiometric,
} from "@/lib/biometric";
import { isSecureContext } from "@/lib/security";
import { revokePolicy } from "@/lib/privacy";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import { useTranslation } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { decodeVin, type DecodedVin } from "@/lib/vinDecoder";

export default function More() {
  const { ownerName, ownerPhone, carModel, carYear, carVin, carPlate } = useAppData();
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const [showPolicy, setShowPolicy] = useState(false);
  const [bioSupported, setBioSupported] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  const [vinBusy, setVinBusy] = useState(false);
  const [vinError, setVinError] = useState<string | null>(null);
  const [vinResult, setVinResult] = useState<DecodedVin | null>(null);
  const secure = isSecureContext();

  useEffect(() => {
    isBiometricSupported().then(setBioSupported);
    if (user) setBioEnabled(isBiometricEnabled(user.login));
  }, [user]);

  const toggleBio = async () => {
    if (!user) return;
    setBioError(null);
    setBioBusy(true);
    try {
      if (bioEnabled) {
        disableBiometric(user.login);
        setBioEnabled(false);
      } else {
        await enableBiometric(user.login, user.name);
        setBioEnabled(true);
      }
    } catch (e) {
      setBioError(e instanceof Error ? e.message : t("more.bio.error"));
    } finally {
      setBioBusy(false);
    }
  };

  const runVinDecode = async () => {
    if (!carVin) return;
    setVinError(null);
    setVinResult(null);
    setVinBusy(true);
    try {
      const r = await decodeVin(carVin);
      const hasAny = r.make || r.model || r.modelYear || r.bodyClass;
      if (!hasAny) {
        setVinError(t("more.vinDecoder.empty"));
      } else {
        setVinResult(r);
      }
    } catch {
      setVinError(t("more.vinDecoder.error"));
    } finally {
      setVinBusy(false);
    }
  };

  if (showPolicy) {
    return <PrivacyPolicy mode="view" onClose={() => setShowPolicy(false)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pt-12 min-h-full"
    >
      <h1 className="text-2xl font-bold mb-6">{t("more.title")}</h1>

      <div className="glass-card rounded-2xl p-5 border-white/5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
          <User size={24} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold">{ownerName}</h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{ownerPhone}</p>
          {user && (
            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest mt-0.5">
              {t("more.brandRole", {
                role: user.role === "owner" ? t("common.role.owner") : t("common.role.mechanic"),
              })}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">
            {t("more.section.sections")}
          </h3>
          <div className="glass-card rounded-2xl overflow-hidden border-white/5">
            <NavRow href="/reminders" icon={BellRing} label={t("more.reminders")} />
            <NavRow href="/parts" icon={Wrench} label={t("more.parts")} />
            <NavRow href="/orders" icon={FileText} label={t("more.orders")} />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">
            {t("more.section.car")}
          </h3>
          <div className="glass-card rounded-2xl overflow-hidden border-white/5">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Car size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium">
                  {carModel} ({carYear})
                </span>
              </div>
            </div>
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-sm text-muted-foreground pl-8">{t("more.vin")}</span>
              <span className="text-sm font-mono">{carVin}</span>
            </div>
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-sm text-muted-foreground pl-8">{t("more.plate")}</span>
              <span className="text-sm font-mono border border-white/20 px-2 py-0.5 rounded bg-white/5">
                {carPlate}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <ScanSearch size={18} className="text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{t("more.vinDecoder")}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {t("more.vinDecoder.body")}
                    </div>
                  </div>
                </div>
                <button
                  onClick={runVinDecode}
                  disabled={vinBusy || !carVin}
                  data-testid="more-vin-decode"
                  className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border bg-primary/15 border-primary/30 text-primary disabled:opacity-50"
                >
                  {vinBusy ? t("more.vinDecoder.busy") : t("more.vinDecoder.run")}
                </button>
              </div>
              {vinError && (
                <div className="mt-2 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {vinError}
                </div>
              )}
              {vinResult && (
                <div
                  data-testid="more-vin-result"
                  className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 space-y-1.5"
                >
                  {([
                    ["more.vinDecoder.field.make", vinResult.make],
                    ["more.vinDecoder.field.model", vinResult.model],
                    ["more.vinDecoder.field.year", vinResult.modelYear],
                    ["more.vinDecoder.field.body", vinResult.bodyClass],
                    ["more.vinDecoder.field.engine", vinResult.engineModel],
                    ["more.vinDecoder.field.fuel", vinResult.fuelType],
                    ["more.vinDecoder.field.country", vinResult.plantCountry],
                    ["more.vinDecoder.field.plant", vinResult.plant],
                  ] as const)
                    .filter(([, v]) => !!v)
                    .map(([k, v]) => (
                      <div key={k} className="flex items-start justify-between gap-3 text-[12px]">
                        <span className="text-muted-foreground">{t(k)}</span>
                        <span className="font-mono text-foreground text-right">{v}</span>
                      </div>
                    ))}
                  <div className="pt-2 mt-2 border-t border-white/5 flex items-center gap-2 text-[11px]">
                    {vinResult.matchedCar ? (
                      <>
                        <CheckCircle2 size={14} className="text-green-400" />
                        <span className="text-green-400">{t("more.vinDecoder.matched")}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={14} className="text-yellow-400" />
                        <span className="text-yellow-400">{t("more.vinDecoder.notMatched")}</span>
                      </>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground/70 font-mono">
                    {t("more.vinDecoder.source")}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">
            {t("more.section.security")}
          </h3>
          <div className="glass-card rounded-2xl overflow-hidden border-white/5">
            <div className="p-4 border-b border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Fingerprint size={18} className="text-muted-foreground" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{t("more.bio")}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {bioSupported ? t("more.bio.available") : t("more.bio.unavailable")}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleBio}
                disabled={!bioSupported || bioBusy}
                data-testid="more-biometric-toggle"
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors disabled:opacity-50 ${
                  bioEnabled
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-white/5 border-white/15 text-muted-foreground"
                }`}
              >
                {bioBusy ? "…" : bioEnabled ? t("more.bio.on") : t("more.bio.enable")}
              </button>
            </div>
            {bioError && (
              <div className="px-4 pb-3 text-[11px] text-red-400">{bioError}</div>
            )}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {secure ? (
                  <ShieldCheck size={18} className="text-green-400" />
                ) : (
                  <ShieldAlert size={18} className="text-red-400" />
                )}
                <div>
                  <div className="text-sm font-medium">{t("more.secure.title")}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {secure ? t("more.secure.on") : t("more.secure.off")}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 flex items-center gap-3">
              <Lock size={18} className="text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{t("more.storage.title")}</div>
                <div className="text-[11px] text-muted-foreground">
                  {t("more.storage.body")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">
            {t("more.section.app")}
          </h3>
          <div className="glass-card rounded-2xl overflow-hidden border-white/5">
            <div className="border-b border-white/5">
              <LanguageSwitcher variant="full" />
            </div>
            <button
              onClick={() => setShowPolicy(true)}
              data-testid="more-policy"
              className="w-full p-4 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
            >
              <Shield size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium flex-1">{t("more.policy")}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <button
              onClick={() => {
                if (!user) return;
                if (!confirm(t("privacy.revokeConfirm"))) return;
                revokePolicy(user.login);
                logout();
              }}
              data-testid="more-policy-revoke"
              className="w-full p-4 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
            >
              <ShieldAlert size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium flex-1">{t("more.revoke")}</span>
            </button>
            <button className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left">
              <Info size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium flex-1">{t("more.about")}</span>
              <span className="text-xs text-muted-foreground">v2.1.0</span>
            </button>
          </div>
        </div>

        <button
          onClick={logout}
          data-testid="more-logout"
          className="w-full glass-card border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium transition-colors mt-8"
        >
          <LogOut size={18} />
          <span>{t("more.logout")}</span>
        </button>
      </div>

      <div className="h-12" />
    </motion.div>
  );
}

function NavRow({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="w-full p-4 border-b last:border-b-0 border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
    >
      <Icon size={18} className="text-muted-foreground" />
      <span className="text-sm font-medium flex-1">{label}</span>
      <ChevronRight size={16} className="text-muted-foreground" />
    </Link>
  );
}
