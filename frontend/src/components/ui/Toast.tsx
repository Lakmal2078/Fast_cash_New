import { useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

const icons = {
  success: <CheckCircle className="text-xgreen" size={18} />,
  error: <XCircle className="text-red-400" size={18} />,
  warning: <AlertTriangle className="text-yellow-400" size={18} />,
  info: <Info className="text-bright" size={18} />,
};

const colors = {
  success: 'border-xgreen/30 bg-xgreen/10',
  error: 'border-red-500/30 bg-red-500/10',
  warning: 'border-yellow-500/30 bg-yellow-500/10',
  info: 'border-bright/30 bg-bright/10',
};

let toastIdCounter = 0;
let globalAddToast: ((type: ToastType, message: string) => void) | null = null;

export function toast(type: ToastType, message: string) {
  if (globalAddToast) globalAddToast(type, message);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = String(++toastIdCounter);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  globalAddToast = addToast;

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 p-3.5 rounded-xl border ${colors[t.type]} animate-fade-in pointer-events-auto`}
          style={{ backdropFilter: 'blur(12px)' }}
        >
          {icons[t.type]}
          <p className="flex-1 text-sm text-white font-semibold leading-tight">{t.message}</p>
          <button onClick={() => remove(t.id)} className="text-muted hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
