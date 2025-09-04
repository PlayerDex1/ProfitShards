import { useState, useCallback } from 'react';
import { ToastData, ToastType } from '@/components/Toast';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((title: string, message?: string, options: ToastOptions = {}) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const newToast: ToastData = {
      id,
      type: options.type || 'info',
      title,
      message,
      duration: options.duration,
      persistent: options.persistent,
      action: options.action,
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((title: string, message?: string, options?: Omit<ToastOptions, 'type'>) => {
    return addToast(title, message, { ...options, type: 'success' });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, options?: Omit<ToastOptions, 'type'>) => {
    return addToast(title, message, { ...options, type: 'error' });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, options?: Omit<ToastOptions, 'type'>) => {
    return addToast(title, message, { ...options, type: 'warning' });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, options?: Omit<ToastOptions, 'type'>) => {
    return addToast(title, message, { ...options, type: 'info' });
  }, [addToast]);

  const notification = useCallback((title: string, message?: string, options?: Omit<ToastOptions, 'type'>) => {
    return addToast(title, message, { ...options, type: 'notification' });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    notification,
  };
}