import React, { useState } from 'react';
import { Download, X, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/use-pwa';
import { useToastContext } from '@/contexts/ToastContext';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isOnline, installPWA } = usePWA();
  const { success, info } = useToastContext();
  const [isDismissed, setIsDismissed] = useState(false);

  // Não mostrar se já foi instalado ou foi dispensado
  if (isInstalled || isDismissed || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const installed = await installPWA();
    if (installed) {
      success('App Instalado!', 'ProfitShards foi instalado com sucesso no seu dispositivo');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    info('Instalação Adiada', 'Você pode instalar o app a qualquer momento pelo menu do navegador');
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 card-premium">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              Instalar ProfitShards
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Instale o app para acesso rápido e funcionalidades offline
            </p>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Smartphone className="h-3 w-3" />
                <span>Mobile</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Monitor className="h-3 w-3" />
                <span>Desktop</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 text-orange-500" />
                    <span className="text-orange-500">Offline</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="flex-1 btn-premium"
              >
                <Download className="h-3 w-3 mr-1" />
                Instalar
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
                className="px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}