import React, { createContext, useState, useCallback } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import './Toast.css';

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration = 3000) => {
    addToast(message, 'success', duration);
  }, [addToast]);

  const showError = useCallback((message, duration = 4000) => {
    addToast(message, 'error', duration);
  }, [addToast]);

  const showWarning = useCallback((message, duration = 3500) => {
    addToast(message, 'warning', duration);
  }, [addToast]);

  const showInfo = useCallback((message, duration = 3000) => {
    addToast(message, 'info', duration);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle className="toast-icon" />,
    error: <XCircle className="toast-icon" />,
    warning: <AlertCircle className="toast-icon" />,
    info: <Info className="toast-icon" />
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className={`toast-icon-wrapper toast-icon-${toast.type}`}>
        {icons[toast.type]}
      </div>
      <p className="toast-message">{toast.message}</p>
      <button onClick={onClose} className="toast-close-btn">
        <X className="toast-close-icon" />
      </button>
    </div>
  );
};
