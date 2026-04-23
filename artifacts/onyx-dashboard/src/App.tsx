import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MobileFrame from "@/components/layout/MobileFrame";

import Home from "@/pages/Home";
import History from "@/pages/History";
import Reminders from "@/pages/Reminders";
import Orders from "@/pages/Orders";
import Parts from "@/pages/Parts";
import More from "@/pages/More";

const queryClient = new QueryClient();

function Router() {
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <MobileFrame>
            <Router />
          </MobileFrame>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
