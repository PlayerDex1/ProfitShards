import { Moon, Sun, Calculator, LogIn, LogOut, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { useI18n } from "@/i18n";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [showAuth, setShowAuth] = useState(false);

  const { t, lang, setLang } = useI18n();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
        <div className="container mx-auto px-4 flex h-16 items-center">
          <div className="mr-6 flex items-center group cursor-pointer">
            {/* WorldShards Calculator Logo */}
            <div className="flex items-center space-x-3 group-hover:scale-105 transition-transform">
              {/* Crystal Logo Icon */}
              <div className="relative">
                <svg viewBox="0 0 60 60" className="w-10 h-10">
                  {/* Outer Crystal */}
                  <polygon 
                    points="30,5 45,20 45,40 30,55 15,40 15,20"
                    fill="url(#crystalGradient)"
                    className="drop-shadow-lg"
                  />
                  
                  {/* Inner Glow */}
                  <polygon 
                    points="30,12 38,22 38,38 30,48 22,38 22,22"
                    fill="rgba(255,255,255,0.25)"
                  />
                  
                  {/* Central Core */}
                  <polygon 
                    points="30,18 34,25 34,35 30,42 26,35 26,25"
                    fill="rgba(255,255,255,0.4)"
                  />
                  
                  {/* Light Reflection */}
                  <line x1="26" y1="15" x2="26" y2="28" 
                        stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                  <line x1="34" y1="18" x2="34" y2="25" 
                        stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
                  
                  <defs>
                    <linearGradient id="crystalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4A90E2" />
                      <stop offset="30%" stopColor="#5B9BD5" />
                      <stop offset="70%" stopColor="#7B68EE" />
                      <stop offset="100%" stopColor="#FFD700" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Subtle Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-lg blur-sm -z-10"></div>
              </div>
              
              {/* Logo Text */}
              <div className="flex flex-col">
                <span className="font-bold text-xl md:text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500 bg-clip-text text-transparent">
                  WorldShards
                </span>
                <span className="hidden md:block text-sm text-muted-foreground tracking-wider uppercase font-medium">
                  Calculator
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
            </div>
            
            <nav className="flex items-center space-x-3">
              {/* Language Selector */}
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as 'pt' | 'en')}
                  className="bg-transparent text-sm text-foreground border-none outline-none cursor-pointer hover:text-primary transition-colors"
                >
                  <option value="pt" className="bg-background text-foreground">🇧🇷 PT</option>
                  <option value="en" className="bg-background text-foreground">🇺🇸 EN</option>
                </select>
              </div>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Alternar tema</span>
              </Button>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium px-3 py-1 bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-full">
                    Olá, <span className="text-green-600 font-bold">{user}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> {t('header.logout')}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowAuth(true)}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <LogIn className="h-4 w-4 mr-2" /> {t('header.login')}
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
