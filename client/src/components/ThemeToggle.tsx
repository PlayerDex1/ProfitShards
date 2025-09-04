import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return (
      <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Theme Options */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => handleThemeChange('light')}
          className={`p-2 rounded-md transition-all duration-200 ${
            theme === 'light'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-yellow-500'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          title="Light mode"
        >
          <Sun className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => handleThemeChange('dark')}
          className={`p-2 rounded-md transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-500'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          title="Dark mode"
        >
          <Moon className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => handleThemeChange('system')}
          className={`p-2 rounded-md transition-all duration-200 ${
            theme === 'system'
              ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-500'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          title="System theme"
        >
          <Monitor className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}