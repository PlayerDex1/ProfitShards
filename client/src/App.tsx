import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useTheme } from "@/hooks/use-theme";
import { useEffect } from "react";
import { forceCleanCorruptedHistory } from "@/lib/historyApi";

// Pages
import HomePage from "@/pages/home";
import ProfilePage from "@/pages/profile";
import NotFoundPage from "@/pages/not-found";

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        <ThemeInitializer />
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/perfil" component={ProfilePage} />
          <Route path="/profile" component={ProfilePage} />
          <Route component={NotFoundPage} />
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
