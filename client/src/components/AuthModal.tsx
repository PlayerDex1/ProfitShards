import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

interface AuthModalProps {
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'forgot' | 'reset';
  defaultToken?: string;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [isStaticHost, setIsStaticHost] = useState(false);

  useEffect(() => {
    // Detecta se estamos em um host estático (Cloudflare Pages, Netlify, etc.)
    const hostname = window.location.hostname;
    const isStatic = hostname.includes('.pages.dev') || 
                    hostname.includes('.netlify.app') || 
                    hostname.includes('.github.io') ||
                    hostname.includes('surge.sh');
    setIsStaticHost(isStatic);
  }, []);

  const googleLogin = () => {
    setLoading(true);
    // Use Express OAuth route
    window.location.href = '/api/auth/google';
  };

  if (isStaticHost) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <Card className="w-full max-w-md bg-black border-gray-800">
          <CardHeader className="py-4">
            <CardTitle className="text-white text-lg text-center">🎮 Calculadora Worldshards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="text-center space-y-3">
              <p className="text-white/80 text-sm">
                Esta calculadora funciona <strong>100% offline</strong> no seu navegador!
              </p>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-left">
                <p className="text-green-300 text-xs mb-2">
                  <strong>✅ Funcionalidades Completas:</strong>
                </p>
                <ul className="text-green-200/80 text-xs space-y-1 ml-2">
                  <li>• Calculadora de lucro avançada</li>
                  <li>• Gráficos interativos e análises</li>
                  <li>• Histórico de cálculos salvo</li>
                  <li>• Modo escuro/claro</li>
                  <li>• Interface responsiva</li>
                  <li>• Dados salvos no navegador</li>
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-left">
                <p className="text-blue-300 text-xs mb-2">
                  <strong>💡 Como funciona:</strong>
                </p>
                <p className="text-blue-200/80 text-xs">
                  Todos os seus dados ficam salvos localmente no navegador. 
                  Não precisamos de login ou internet após o carregamento inicial!
                </p>
              </div>
              
              <Button 
                type="button" 
                onClick={onClose} 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 h-10 font-medium"
              >
                🚀 Começar a Calcular
              </Button>
              
              <p className="text-[11px] text-white/50 text-center">
                Seus cálculos são salvos automaticamente no navegador
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <Card className="w-full max-w-sm bg-black border-gray-800">
        <CardHeader className="py-3">
          <CardTitle className="text-white text-base">{t('auth.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-2">
            <Button 
              type="button" 
              onClick={googleLogin} 
              className="w-full bg-white text-black hover:bg-white/90 h-9 px-4 flex items-center gap-2" 
              disabled={loading}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Entrando...' : 'Continuar com Google'}
            </Button>
            <Button type="button" onClick={onClose} className="w-full bg-white/10 text-white hover:bg-white/20 h-9 px-4">
              {t('auth.cancel')}
            </Button>
            <p className="text-[11px] text-white/60 text-center">
              Use sua conta Google para entrar com segurança e salvar seus dados na nuvem.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
