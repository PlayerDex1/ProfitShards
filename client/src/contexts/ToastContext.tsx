import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ToastContainer } from '@/components/ToastContainer';

interface ToastContextType {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  notification: (title: string, message?: string) => void;
  addToast: (title: string, message?: string, options?: any) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer 
        toasts={toast.toasts} 
        onRemoveToast={toast.removeToast} 
      />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}