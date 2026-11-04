import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: (msg) => console.log('Toast:', msg),
      removeToast: () => {}
    };
  }
  return context;
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3800);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#107C41] dark:text-[#4EBE7E] shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-[#D83B01] dark:text-[#F87171] shrink-0" />,
    info: <Info className="w-4 h-4 text-[#0078D4] dark:text-[#60A5FA] shrink-0" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="pointer-events-auto flex items-center justify-between p-3 rounded-md border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#242424] shadow-md text-xs font-medium text-[#252525] dark:text-[#F2F2F2]"
    >
      <div className="flex items-center gap-2">
        {icons[toast.type] || icons.success}
        <span>{toast.message}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded text-[#999999] hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors cursor-pointer ml-3 focus:outline-none"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export default ToastProvider;
