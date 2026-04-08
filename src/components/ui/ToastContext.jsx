/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

const ToastContext = createContext(null);
const MotionDiv = motion.div;

const toastIcons = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info,
};

const toastStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, type = "info", duration = 3200 }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const nextToast = { id, title, description, type };
      setToasts((items) => [...items, nextToast]);
      window.setTimeout(() => dismissToast(id), duration);
      return id;
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[90] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = toastIcons[toast.type] || Info;
            const className = toastStyles[toast.type] || toastStyles.info;

            return (
              <MotionDiv
                key={toast.id}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                className={`rounded-2xl border p-4 shadow-lg ${className}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{toast.title}</p>
                    {toast.description ? <p className="mt-1 text-xs opacity-90">{toast.description}</p> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    className="rounded-md p-1 opacity-70 transition hover:bg-white/60 hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </MotionDiv>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }
  return context;
}
