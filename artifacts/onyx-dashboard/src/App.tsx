import React, { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MobileFrame from "@/components/layout/MobileFrame";

import Splash from "@/pages/Splash";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import MechanicDashboard from "@/pages/MechanicDashboard";

import Home from "@/pages/Home";
import History from "@/pages/History";
import Reminders from "@/pages/Reminders";
import Orders from "@/pages/Orders";
import Parts from "@/pages/Parts";
import More from "@/pages/More";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

function OwnerRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/history" component={History} />
      <Route path="/reminders" component={Reminders} />
      <Route path="/orders" component={Orders} />
      <Route path="/parts" component={Parts} />
      <Route path="/more" component={More} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Shell() {
  const { user, justLoggedIn, markOnboardingDone } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return <Splash onDone={() => setSplashDone(true)} />;
  }

  if (!user) {
    return <Login />;
  }

  if (justLoggedIn) {
    return <Onboarding role={user.role} onDone={markOnboardingDone} />;
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Shell />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
