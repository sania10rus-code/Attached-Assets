import React, { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MobileFrame from "@/components/layout/MobileFrame";

import Splash from "@/pages/Splash";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import MechanicDashboard from "@/pages/MechanicDashboard";
import PrivacyPolicy from "@/pages/PrivacyPolicy";

import Home from "@/pages/Home";
import History from "@/pages/History";
import Reminders from "@/pages/Reminders";
import Orders from "@/pages/Orders";
import Parts from "@/pages/Parts";
import More from "@/pages/More";
import Diagnostics from "@/pages/Diagnostics";
import Tips from "@/pages/Tips";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { isPolicyAccepted, acceptPolicy } from "@/lib/privacy";
import { getSecurityWarning, installSecureFetchGuard } from "@/lib/security";
import { LocaleProvider } from "@/i18n";

const queryClient = new QueryClient();

function OwnerRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/diagnostics" component={Diagnostics} />
      <Route path="/tips" component={Tips} />
      <Route path="/history" component={History} />
      <Route path="/reminders" component={Reminders} />
      <Route path="/orders" component={Orders} />
      <Route path="/parts" component={Parts} />
      <Route path="/more" component={More} />
      <Route component={NotFound} />
    </Switch>
  );
}

function SecurityBanner() {
  const warning = getSecurityWarning();
  if (!warning) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-red-500/95 text-white px-4 py-2.5 text-xs flex items-center justify-center gap-2 shadow-lg">
      <AlertTriangle size={14} />
      <span className="font-medium">{warning}</span>
    </div>
  );
}

function Shell() {
  const { user, ready, justLoggedIn, markOnboardingDone, logout } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState<boolean>(false);

  // Re-check policy acceptance whenever the active user changes.
  useEffect(() => {
    if (user) setPolicyAccepted(isPolicyAccepted(user.login));
    else setPolicyAccepted(false);
  }, [user]);

  if (!splashDone) {
    return <Splash onDone={() => setSplashDone(true)} />;
  }

  if (!ready) return null;

  if (!user) {
    return <Login />;
  }

  if (justLoggedIn) {
    return <Onboarding role={user.role} onDone={markOnboardingDone} />;
  }

  if (!policyAccepted) {
    return (
      <PrivacyPolicy
        mode="gate"
        onAccept={() => {
          acceptPolicy(user.login);
          setPolicyAccepted(true);
        }}
        onDecline={() => {
          // Refusal returns the user to the auth screen.
          logout();
        }}
      />
    );
  }

  if (user.role === "mechanic") {
    return (
      <div className="min-h-[100dvh] w-full bg-black flex justify-center overflow-hidden">
        <div className="w-full max-w-[430px] relative shadow-2xl flex flex-col h-[100dvh] overflow-hidden border-x border-white/5">
          <MechanicDashboard />
        </div>
      </div>
    );
  }

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <MobileFrame>
        <OwnerRouter />
      </MobileFrame>
    </WouterRouter>
  );
}

function App() {
  useEffect(() => {
    installSecureFetchGuard();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <TooltipProvider>
          <SecurityBanner />
          <AuthProvider>
            <Shell />
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}

export default App;
