import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import './Toast.css';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function Toast({ toasts, onClose }) {
  if (!toasts.length) return null;

  return createPortal(
    <div className="toast-container">
      {toasts.map((t) => {
        const Icon = icons[t.type] || Info;
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <Icon size={18} />
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => onClose(t.id)}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
