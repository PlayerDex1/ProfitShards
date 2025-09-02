import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  History, 
  Clock,
  Home,
  RefreshCw
} from 'lucide-react';
import { useNavigationHistory } from '@/hooks/use-navigation-history';
import { useLocation } from 'wouter';

interface NavigationHistoryProps {
  className?: string;
  showHistory?: boolean;
  showHome?: boolean;
  showRefresh?: boolean;
}

export function NavigationHistory({ 
  className = '',
  showHistory = true,
  showHome = true,
  showRefresh = true
}: NavigationHistoryProps) {
  const { 
    canGoBack, 
    canGoForward, 
    goBack, 
    goForward, 
    history, 
    currentIndex,
    historyLength,
    clearHistory,
    currentEntry,
    previousEntry,
    nextEntry
  } = useNavigationHistory();
  
  const [location] = useLocation();

  // Obter título da entrada atual
  const getCurrentTitle = () => {
    if (currentEntry) {
      return currentEntry.title;
    }
    
    // Fallback para títulos baseados na rota
    switch (location) {
      case '/':
        return 'Início';
      case '/perfil':
        return 'Perfil';
      case '/admin':
        return 'Admin';
      default:
        return 'Página';
    }
  };

  // Obter título da entrada anterior
  const getPreviousTitle = () => {
    if (previousEntry) {
      return previousEntry.title;
    }
    return 'Página anterior';
  };

  // Obter título da entrada posterior
  const getNextTitle = () => {
    if (nextEntry) {
      return nextEntry.title;
    }
    return 'Próxima página';
  };

  // Formatar timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Menos de 1 minuto
      return 'Agora';
    } else if (diff < 3600000) { // Menos de 1 hora
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m atrás`;
    } else if (diff < 86400000) { // Menos de 1 dia
      const hours = Math.floor(diff / 3600000);
      return `${hours}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Ir para página inicial
  const goHome = () => {
    window.location.href = '/';
  };

  // Recarregar página
  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Botão Voltar */}
      <Button
        variant="outline"
        size="sm"
        onClick={goBack}
        disabled={!canGoBack}
        title={getPreviousTitle()}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Voltar</span>
      </Button>

      {/* Botão Avançar */}
      <Button
        variant="outline"
        size="sm"
        onClick={goForward}
        disabled={!canGoForward}
        title={getNextTitle()}
        className="flex items-center gap-1"
      >
        <span className="hidden sm:inline">Avançar</span>
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Indicador de histórico */}
      {showHistory && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <History className="h-3 w-3 mr-1" />
            {currentIndex + 1} / {historyLength}
          </Badge>
          
          {/* Título da página atual */}
          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{getCurrentTitle()}</span>
            {currentEntry && (
              <span className="text-xs opacity-70">
                ({formatTimestamp(currentEntry.timestamp)})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Botão Home */}
      {showHome && (
        <Button
          variant="ghost"
          size="sm"
          onClick={goHome}
          title="Ir para página inicial"
          className="flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Início</span>
        </Button>
      )}

      {/* Botão Refresh */}
      {showRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshPage}
          title="Recarregar página"
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Recarregar</span>
        </Button>
      )}

      {/* Botão para limpar histórico (apenas se houver muitas entradas) */}
      {historyLength > 10 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          title="Limpar histórico de navegação"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Limpar
        </Button>
      )}
    </div>
  );
}

// Componente compacto para mobile
export function CompactNavigationHistory({ className = '' }: { className?: string }) {
  const { canGoBack, canGoForward, goBack, goForward } = useNavigationHistory();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={goBack}
        disabled={!canGoBack}
        className="p-2"
        title="Voltar"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={goForward}
        disabled={!canGoForward}
        className="p-2"
        title="Avançar"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Componente de breadcrumbs com histórico
export function NavigationBreadcrumbs({ className = '' }: { className?: string }) {
  const { history, currentIndex, goToEntry } = useNavigationHistory();

  // Mostrar apenas as últimas 5 entradas para não poluir a interface
  const recentHistory = history.slice(-5);
  const startIndex = Math.max(0, history.length - 5);

  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      {recentHistory.map((entry, index) => {
        const globalIndex = startIndex + index;
        const isCurrent = globalIndex === currentIndex;
        
        return (
          <React.Fragment key={entry.id}>
            {index > 0 && (
              <span className="text-muted-foreground mx-1">/</span>
            )}
            
            <button
              onClick={() => goToEntry(globalIndex)}
              className={`px-2 py-1 rounded hover:bg-muted transition-colors ${
                isCurrent 
                  ? 'bg-primary text-primary-foreground font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={`${entry.title} - ${new Date(entry.timestamp).toLocaleString('pt-BR')}`}
            >
              {entry.title.length > 20 
                ? entry.title.substring(0, 20) + '...' 
                : entry.title
              }
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Hook para usar navegação com atalhos de teclado
export function useKeyboardNavigation() {
  const { goBack, goForward, canGoBack, canGoForward } = useNavigationHistory();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + Seta Esquerda = Voltar
      if (event.altKey && event.key === 'ArrowLeft' && canGoBack) {
        event.preventDefault();
        goBack();
      }
      
      // Alt + Seta Direita = Avançar
      if (event.altKey && event.key === 'ArrowRight' && canGoForward) {
        event.preventDefault();
        goForward();
      }
      
      // F5 = Recarregar
      if (event.key === 'F5') {
        event.preventDefault();
        window.location.reload();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, goForward, canGoBack, canGoForward]);
}