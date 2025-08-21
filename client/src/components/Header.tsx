import { Moon, Sun, Calculator, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useMemo, useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { useI18n } from "@/i18n";
import { Link } from "wouter";

export function Header() {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const { lang, setLang, t } = useI18n();
  const [defaultMode, setDefaultMode] = useState<'login' | 'register' | 'forgot' | 'reset' | undefined>(undefined);
  const [defaultToken, setDefaultToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const token = url.searchParams.get('resetToken');
      if (token) {
        setDefaultMode('reset');
        setDefaultToken(token);
        setShowAuth(true);
        url.searchParams.delete('resetToken');
        window.history.replaceState({}, '', url.toString());
      }
    } catch {}
  }, []);

  return (
    <header className="bg-black sticky top-0 z-50 w-full border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-white truncate">
              {t('header.title')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'pt' | 'en')}
              className="h-9 px-2 rounded bg-white/10 text-white border border-white/10"
              aria-label={t('header.lang')}
            >
              <option className="bg-black text-white" value="pt">Português</option>
              <option className="bg-black text-white" value="en">English</option>
            </select>
            {isAuthenticated ? (
              <>
                <Link href="/perfil" className="text-white/80 text-sm hidden md:inline hover:underline">Perfil</Link>
                <span className="text-white/80 text-sm hidden md:inline">Olá, {user}</span>
                <Button
                  variant="ghost"
                  className="h-9 px-3 rounded-lg text-white hover:bg-white/10"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5 mr-2" /> {t('header.logout')}
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                className="h-9 px-3 rounded-lg text-white hover:bg-white/10"
                onClick={() => setShowAuth(true)}
              >
                <LogIn className="h-5 w-5 mr-2" /> {t('header.login')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-toggle-theme"
              className="h-9 w-9 rounded-lg text-white hover:bg-white/10"
              aria-label={t('header.theme')}
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultMode={defaultMode} defaultToken={defaultToken} />}
    </header>
  );
}
