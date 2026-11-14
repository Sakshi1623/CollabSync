import { useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const TOAST_STYLES = {
  info: {
    border: 'border-indigo-500/30',
    iconColor: 'text-indigo-400',
    icon: Info,
  },
  success: {
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    icon: CheckCircle2,
  },
  warning: {
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    icon: AlertTriangle,
  },
  error: {
    border: 'border-rose-500/30',
    iconColor: 'text-rose-400',
    icon: AlertCircle,
  },
};

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const style = TOAST_STYLES[type] || TOAST_STYLES.info;
  const Icon = style.icon;

  return (
    <div
      className={`bg-zinc-900/95 backdrop-blur-md text-zinc-100 px-4 py-3.5 rounded-xl border ${style.border} shadow-2xl shadow-black/60 flex items-center gap-3 w-full sm:min-w-80 sm:max-w-md animate-slide-in pointer-events-auto`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${style.iconColor}`} />
      <p className="flex-1 text-sm font-medium text-zinc-100">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 focus:outline-none transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Container to hold multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-3 right-3 left-3 sm:bottom-4 sm:right-4 sm:left-auto z-50 flex flex-col gap-2.5 items-end pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

export default Toast;
