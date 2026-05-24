import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  const { id, message, type } = toast;

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-sky-500 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-500/20 dark:border-emerald-500/30',
    error: 'border-rose-500/20 dark:border-rose-500/30',
    warning: 'border-amber-500/20 dark:border-amber-500/30',
    info: 'border-sky-500/20 dark:border-sky-500/30',
  };

  const bgColors = {
    success: 'bg-emerald-50/90 dark:bg-emerald-950/20',
    error: 'bg-rose-50/90 dark:bg-rose-950/20',
    warning: 'bg-amber-50/90 dark:bg-amber-950/20',
    info: 'bg-sky-50/90 dark:bg-sky-950/20',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${borderColors[type]} ${bgColors[type]} backdrop-blur-md shadow-lg pointer-events-auto animate-slide-in transition-all duration-300`}
      role="alert"
    >
      {icons[type]}
      <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">
        {message}
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-0.5 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
