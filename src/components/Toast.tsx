import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-primary',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
        bgColors[type]
      )}>
        <div className="text-white font-medium">{message}</div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  return {
    toast,
    showToast,
    hideToast,
  };
}