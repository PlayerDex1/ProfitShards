import { Route, Switch } from "wouter";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { useCloudStorage } from "@/hooks/useCloudStorage";
import { useEffect } from "react";

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

function CloudSyncManager() {
  const { isAuthenticated, user } = useAuth();
  const { loadUserData } = useCloudStorage();

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 [APP] User authenticated, initializing cloud sync for:', user);
      
      // Load user data from cloud after login
      setTimeout(() => {
        loadUserData().then((result) => {
          if (result.success) {
            console.log('✅ [APP] Cloud sync initialized successfully');
          } else {
            console.log('❌ [APP] Cloud sync failed:', result.error);
          }
        });
      }, 3000); // Wait 3 seconds for auth to stabilize
    } else {
      console.log('📱 [APP] User not authenticated, using local storage only');
    }
  }, [isAuthenticated, user, loadUserData]);

  return null; // This component only handles side effects
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen bg-background text-foreground">
          <CloudSyncManager />
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/perfil" component={ProfilePage} />
            <Route path="/profile" component={ProfilePage} />
            <Route component={NotFoundPage} />
          </Switch>
          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
