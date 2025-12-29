"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: "border-green-500/50 bg-green-500/10 text-green-400",
  error: "border-red-500/50 bg-red-500/10 text-red-400",
  info: "border-blue-500/50 bg-blue-500/10 text-blue-400",
  warning: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = icons[toast.type];

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`animate-in slide-in-from-right-full flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${styles[toast.type]}`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1 text-sm">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="rounded p-1 transition-colors hover:bg-white/10"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
