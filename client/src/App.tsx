import { Route, Switch, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/contexts/ToastContext";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { AndroidPWAInstaller } from "@/components/AndroidPWAInstaller";
import { useTheme } from "@/hooks/useTheme";
import { useEffect } from "react";
import { forceCleanCorruptedHistory } from "@/lib/historyApi";
// Removido: useDataSync - usando apenas useSmartSync

// Pages
import HomePage from "@/pages/home";
import ProfilePage from "@/pages/profile";
import TestPage from "@/pages/test";
import NotFoundPage from "@/pages/not-found";

// Redirect components
function CalculatorRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/perfil?tab=calculator");
  }, [setLocation]);
  return null;
}

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

// Redirect components for admin dashboard tabs
function CommunityRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/perfil?tab=community");
  }, [setLocation]);
  return null;
}

function ProfitsRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/perfil?tab=profits");
  }, [setLocation]);
  return null;
}

function AnalyticsAdminRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/perfil?tab=analytics");
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

// Removido: DataSyncInitializer - usando apenas useSmartSync nos componentes específicos

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-background text-foreground">
          <ThemeInitializer />
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/perfil" component={ProfilePage} />
          <Route path="/test" component={TestPage} />
          <Route path="/calculator" component={CalculatorRedirect} />
          <Route path="/planner" component={PlannerRedirect} />
          <Route path="/analytics" component={AnalyticsRedirect} />
          {/* Admin Dashboard Routes */}
          <Route path="/comunidade" component={CommunityRedirect} />
          <Route path="/lucros" component={ProfitsRedirect} />
          <Route path="/admin-analytics" component={AnalyticsAdminRedirect} />
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
