import { useState, useEffect } from 'react';
import { useSmartSync } from '@/hooks/use-smart-sync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Wifi, 
  WifiOff 
} from 'lucide-react';

interface SyncIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function SyncIndicator({ className = '', showDetails = false }: SyncIndicatorProps) {
  const { syncStatus, lastSync, isLoading } = useSmartSync();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showTooltip, setShowTooltip] = useState(false);

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3" />;
    if (isLoading) return <RefreshCw className="h-3 w-3 animate-spin" />;
    
    switch (syncStatus) {
      case 'success':
        return <CheckCircle className="h-3 w-3" />;
      case 'error':
        return <AlertCircle className="h-3 w-3" />;
      case 'syncing':
        return <RefreshCw className="h-3 w-3 animate-spin" />;
      default:
        return <Cloud className="h-3 w-3" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isLoading) return 'Sincronizando...';
    
    switch (syncStatus) {
      case 'success':
        return 'Sincronizado';
      case 'error':
        return 'Erro de Sync';
      case 'syncing':
        return 'Sincronizando...';
      default:
        return 'Pronto';
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-gray-500';
    if (isLoading || syncStatus === 'syncing') return 'bg-blue-500';
    if (syncStatus === 'success') return 'bg-green-500';
    if (syncStatus === 'error') return 'bg-red-500';
    return 'bg-gray-400';
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Nunca';
    
    const now = Date.now();
    const diff = now - lastSync;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m atrás`;
    } else if (seconds > 0) {
      return `${seconds}s atrás`;
    } else {
      return 'Agora';
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center gap-2 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Badge 
          variant="secondary" 
          className={`${getStatusColor()} text-white border-0 flex items-center gap-1`}
        >
          {getStatusIcon()}
          <span className="text-xs">{getStatusText()}</span>
        </Badge>
        
        {showDetails && (
          <div className="text-xs text-muted-foreground">
            {lastSync && `Última sync: ${formatLastSync()}`}
          </div>
        )}
      </div>

      {/* Tooltip com detalhes */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 p-3 bg-popover border rounded-lg shadow-lg z-50 min-w-[200px]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status de Sincronização</span>
              {!isOnline && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  className="h-6 px-2 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Recarregar
                </Button>
              )}
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
                <span>Conexão: {isOnline ? 'Online' : 'Offline'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span>Status: {getStatusText()}</span>
              </div>
              
              {lastSync && (
                <div className="flex items-center gap-2">
                  <Cloud className="h-3 w-3 text-blue-500" />
                  <span>Última sync: {formatLastSync()}</span>
                </div>
              )}
            </div>
            
            {!isOnline && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border">
                ⚠️ Você está offline. Os dados serão sincronizados quando a conexão for restaurada.
              </div>
            )}
            
            {syncStatus === 'error' && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
                ❌ Erro na sincronização. Tente recarregar a página.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}