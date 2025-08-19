import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
const Home = lazy(() => import("@/pages/home"));
const Profile = lazy(() => import("@/pages/profile"));
const NotFound = lazy(() => import("@/pages/not-found"));
import { useIdleLogout } from "@/hooks/useIdleLogout";

function Router() {
  return (
    <Suspense fallback={<div className="text-white/80 p-4">Carregando…</div>}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/perfil" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  useIdleLogout();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
