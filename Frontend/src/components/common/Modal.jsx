import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  footer
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="modal-portal" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60"
            onClick={onClose}
          />

          {/* Modal Dialog */}
          <motion.div
            key="modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : undefined}
            initial={{ opacity: 0, scale: 0.98, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`relative w-full ${maxWidth} rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] p-5 shadow-xl z-10 overflow-hidden my-auto max-h-[90vh] flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E8E8E5] dark:border-[#353535] shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#252525] dark:text-[#F2F2F2] tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-0.5">{subtitle}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
                <X className="w-3.5 h-3.5 text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]" />
              </Button>
            </div>

            {/* Content */}
            <div className="py-4 text-xs sm:text-sm text-[#252525] dark:text-[#F2F2F2] overflow-y-auto flex-1">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="pt-3 border-t border-[#E8E8E5] dark:border-[#353535] flex justify-end gap-2 shrink-0">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
