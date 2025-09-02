import React, { Suspense, lazy, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// Componente de loading padrão
export function LoadingSpinner({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
    </div>
  );
}

// Componente de loading para páginas
export function PageLoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Carregando página...</h3>
        <p className="text-muted-foreground">Aguarde um momento</p>
      </div>
    </div>
  );
}

// Componente de loading para listas
export function ListLoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
      <span className="text-muted-foreground">Carregando itens...</span>
    </div>
  );
}

// Componente de loading para cards
export function CardLoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-6">
      <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
      <span className="text-sm text-muted-foreground">Carregando...</span>
    </div>
  );
}

// HOC para lazy loading com fallback customizado
export function withLazyLoading<T extends object>(
  Component: ComponentType<T>,
  fallback?: React.ComponentType
) {
  const LazyComponent = lazy(() => 
    Promise.resolve({ default: Component })
  );

  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Hook para lazy loading com estado de carregamento
export function useLazyLoading<T>(
  loader: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await loader();
        
        if (mounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Erro desconhecido'));
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return { data, loading, error };
}

// Componente de lazy loading com retry
export function LazyComponentWithRetry<T extends object>({
  component,
  fallback,
  retryCount = 3,
  retryDelay = 1000,
  ...props
}: {
  component: () => Promise<{ default: ComponentType<T> }>;
  fallback?: React.ComponentType;
  retryCount?: number;
  retryDelay?: number;
} & T) {
  const [retryAttempts, setRetryAttempts] = React.useState(0);
  const [hasError, setHasError] = React.useState(false);

  const LazyComponent = React.useMemo(() => {
    return lazy(async () => {
      try {
        return await component();
      } catch (error) {
        if (retryAttempts < retryCount) {
          // Aguardar antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          setRetryAttempts(prev => prev + 1);
          return await component();
        } else {
          setHasError(true);
          throw error;
        }
      }
    });
  }, [component, retryAttempts, retryCount, retryDelay]);

  if (hasError) {
    return (
      <div className="flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-red-500 mb-2">Erro ao carregar componente</p>
          <button
            onClick={() => {
              setHasError(false);
              setRetryAttempts(0);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Utilitário para criar lazy components com nomes descritivos
export function createLazyComponent<T extends object>(
  name: string,
  loader: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = lazy(loader);
  
  // Adicionar displayName para debugging
  LazyComponent.displayName = `Lazy(${name})`;
  
  return function NamedLazyComponent(props: T) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Componente de loading progressivo
export function ProgressiveLoadingSpinner({ 
  progress, 
  total, 
  message = 'Carregando...' 
}: { 
  progress: number; 
  total: number; 
  message?: string; 
}) {
  const percentage = Math.round((progress / total) * 100);
  
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground mb-2">{message}</p>
      <p className="text-xs text-muted-foreground">
        {progress} de {total} ({percentage}%)
      </p>
    </div>
  );
}