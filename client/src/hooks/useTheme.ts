import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light'); // Default to light instead of system

  // Get system preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((themeToApply: Theme) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Determine actual theme to apply
    let actualTheme: 'light' | 'dark';
    if (themeToApply === 'system') {
      actualTheme = getSystemTheme();
    } else {
      actualTheme = themeToApply;
    }
    
    // Apply theme class
    root.classList.add(actualTheme);
    
    console.log('🎨 [THEME] Applied theme:', actualTheme, '(requested:', themeToApply, ')');
  }, [getSystemTheme]);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('worldshards-theme') as Theme;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        // Default to light for better first experience
        setThemeState('light');
        applyTheme('light');
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      setThemeState('light');
      applyTheme('light');
    }
  }, [applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  // Set theme function
  const setTheme = useCallback((newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      localStorage.setItem('worldshards-theme', newTheme);
      applyTheme(newTheme);
      console.log('🎨 [THEME] Theme changed to:', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, [applyTheme]);

  // Toggle between light and dark (skip system)
  const toggleTheme = useCallback(() => {
    const currentActual = theme === 'system' ? getSystemTheme() : theme;
    const newTheme = currentActual === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, getSystemTheme, setTheme]);

  // Get current resolved theme
  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark'
  };
}