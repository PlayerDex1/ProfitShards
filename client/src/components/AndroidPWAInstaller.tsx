import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  Info,
  Wifi,
  WifiOff,
  Battery,
  Signal
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function AndroidPWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    // Detectar Android
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroidDevice = /android/.test(userAgent);
    setIsAndroid(isAndroidDevice);

    // Detectar se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInApp = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInApp);

    // Listener para o evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listener para quando é instalado
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    // Monitorar conexão
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitorar bateria (se disponível)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
      });
    }

    // Monitorar tipo de conexão (se disponível)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ PWA installation accepted');
      } else {
        console.log('❌ PWA installation dismissed');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('❌ Error during PWA installation:', error);
    }
  };

  const handleManualInstall = () => {
    // Instruções para instalação manual no Android
    const instructions = `
Para instalar o ProfitShards no seu Android:

1. Abra o menu do navegador (três pontos)
2. Toque em "Adicionar à tela inicial" ou "Instalar app"
3. Confirme a instalação
4. O app aparecerá na sua tela inicial

Benefícios da instalação:
• Acesso mais rápido
• Funciona offline
• Notificações push
• Interface nativa
• Melhor performance
    `;
    
    alert(instructions);
  };

  // Não mostrar se não for Android ou se já estiver instalado
  if (!isAndroid || isInstalled) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Smartphone className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">
            Instalar App
          </CardTitle>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Instale o ProfitShards no seu Android para uma experiência melhor
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status da conexão e bateria */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          
          {batteryLevel && (
            <div className="flex items-center gap-1">
              <Battery className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600">{batteryLevel}%</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Signal className="h-4 w-4 text-blue-600" />
            <span className="text-blue-600 capitalize">{connectionType}</span>
          </div>
        </div>

        {/* Benefícios */}
        <div className="space-y-2">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
            Benefícios da instalação:
          </h4>
          <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Acesso mais rápido</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Funciona offline</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Notificações push</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Interface nativa</span>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="space-y-2">
          {deferredPrompt ? (
            <Button 
              onClick={handleInstallClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Instalar Agora
            </Button>
          ) : (
            <Button 
              onClick={handleManualInstall}
              variant="outline"
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Info className="h-4 w-4 mr-2" />
              Como Instalar
            </Button>
          )}
        </div>

        {/* Badge de otimização */}
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-xs">
            🚀 Otimizado para Android
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}