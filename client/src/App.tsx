import { Route, Switch, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/contexts/ToastContext";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { AndroidPWAInstaller } from "@/components/AndroidPWAInstaller";
import { useTheme } from "@/hooks/useTheme";
import { useEffect } from "react";
import { forceCleanCorruptedHistory } from "@/lib/historyApi";
import { useDataSync } from "@/hooks/use-data-sync";
import "@/lib/cleanTestGiveaways"; // Limpar giveaways de teste

// Pages
import HomePage from "@/pages/home";
import ProfilePage from "@/pages/profile";
import TestPage from "@/pages/test";
import NotFoundPage from "@/pages/not-found";

// Redirect components
function PlannerRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/perfil?tab=planner");
  }, [setLocation]);
  return null;
}

function AnalyticsRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/perfil?tab=activity");
  }, [setLocation]);
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function ThemeInitializer() {
  const { theme } = useTheme();
  
  useEffect(() => {
    console.log('🎨 [APP] Theme system initialized:', theme);
    
    // Limpar dados corrompidos do histórico ao inicializar o app
    forceCleanCorruptedHistory();
  }, [theme]);
  
  return null;
}

function DataSyncInitializer() {
  const { isLoading, lastSync } = useDataSync();
  
  useEffect(() => {
    if (isLoading) {
      console.log('🔄 [APP] Data sync in progress...');
    } else if (lastSync) {
      console.log('✅ [APP] Data sync completed at:', new Date(lastSync).toLocaleString());
    }
  }, [isLoading, lastSync]);
  
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-background text-foreground">
          <ThemeInitializer />
          <DataSyncInitializer />
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/perfil" component={ProfilePage} />
          <Route path="/test" component={TestPage} />
          <Route path="/planner" component={PlannerRedirect} />
          <Route path="/analytics" component={AnalyticsRedirect} />
          <Route component={NotFoundPage} />
        </Switch>
               <Toaster />
               <PWAInstallPrompt />
               <AndroidPWAInstaller />
               </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}
