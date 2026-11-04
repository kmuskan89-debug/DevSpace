import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Dropdown({
  trigger,
  children,
  align = 'right',
  width = 'w-56'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignmentClass = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -2 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className={`absolute ${alignmentClass} mt-1.5 ${width} rounded-md border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] shadow-md p-1 z-50`}
          >
            <div onClick={() => setIsOpen(false)}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({ children, icon: Icon, onClick, danger = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded transition-colors text-left cursor-pointer focus:outline-none ${
        danger
          ? 'text-[#D83B01] dark:text-[#F87171] hover:bg-[#FDF3F2] dark:hover:bg-[rgba(248,113,113,0.12)]'
          : 'text-[#252525] dark:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A]'
      } ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-70" />}
      <span>{children}</span>
    </button>
  );
}

export default Dropdown;
