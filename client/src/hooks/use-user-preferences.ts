import { useState, useEffect } from 'react';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  animations: boolean;
  dashboardLayout: 'grid' | 'list';
  visibleWidgets: string[];
  shortcuts: Record<string, string>;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  accentColor: '#3B82F6',
  fontSize: 'medium',
  animations: true,
  dashboardLayout: 'grid',
  visibleWidgets: ['stats', 'chart', 'recent', 'quick'],
  shortcuts: {
    'Ctrl+K': 'Busca rápida',
    'Ctrl+D': 'Dashboard',
    'Ctrl+C': 'Calculadora',
    'Ctrl+G': 'Giveaways'
  }
};

const STORAGE_KEY = 'profitshards_user_preferences';

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar preferências do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.warn('Erro ao carregar preferências:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Salvar preferências no localStorage
  const savePreferences = (newPreferences: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Erro ao salvar preferências:', error);
    }
  };

  // Atualizar tema
  const updateTheme = (theme: UserPreferences['theme']) => {
    savePreferences({ theme });
    
    // Aplicar tema imediatamente
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', systemTheme);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  };

  // Atualizar cor de destaque
  const updateAccentColor = (color: string) => {
    savePreferences({ accentColor: color });
    
    // Aplicar CSS custom properties
    document.documentElement.style.setProperty('--accent-color', color);
    document.documentElement.style.setProperty('--accent-foreground', getContrastColor(color));
  };

  // Atualizar tamanho da fonte
  const updateFontSize = (size: UserPreferences['fontSize']) => {
    savePreferences({ fontSize });
    
    const sizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    
    document.documentElement.style.setProperty('--font-size-base', sizeMap[size]);
  };

  // Atualizar animações
  const updateAnimations = (enabled: boolean) => {
    savePreferences({ animations });
    
    if (enabled) {
      document.documentElement.classList.remove('no-animations');
    } else {
      document.documentElement.classList.add('no-animations');
    }
  };

  // Atualizar layout do dashboard
  const updateDashboardLayout = (layout: 'grid' | 'list') => {
    savePreferences({ dashboardLayout: layout });
  };

  // Atualizar widgets visíveis
  const updateVisibleWidgets = (widgets: string[]) => {
    savePreferences({ visibleWidgets: widgets });
  };

  // Atualizar atalhos
  const updateShortcuts = (shortcuts: Record<string, string>) => {
    savePreferences({ shortcuts });
  };

  // Resetar para padrões
  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
    localStorage.removeItem(STORAGE_KEY);
    
    // Aplicar padrões
    updateTheme('system');
    updateAccentColor('#3B82F6');
    updateFontSize('medium');
    updateAnimations(true);
  };

  // Exportar configuração
  const exportPreferences = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'profitshards-preferences.json';
    link.click();
  };

  // Importar configuração
  const importPreferences = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          const validated = { ...defaultPreferences, ...imported };
          setPreferences(validated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
          resolve();
        } catch (error) {
          reject(new Error('Arquivo de configuração inválido'));
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  };

  // Aplicar preferências ao carregar
  useEffect(() => {
    if (isLoaded) {
      updateTheme(preferences.theme);
      updateAccentColor(preferences.accentColor);
      updateFontSize(preferences.fontSize);
      updateAnimations(preferences.animations);
    }
  }, [isLoaded]);

  return {
    preferences,
    isLoaded,
    updateTheme,
    updateAccentColor,
    updateFontSize,
    updateAnimations,
    updateDashboardLayout,
    updateVisibleWidgets,
    updateShortcuts,
    resetToDefaults,
    exportPreferences,
    importPreferences
  };
}

// Função auxiliar para calcular cor de contraste
function getContrastColor(hexColor: string): string {
  // Remover # se presente
  const hex = hexColor.replace('#', '');
  
  // Converter para RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calcular luminância
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retornar preto ou branco baseado na luminância
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}