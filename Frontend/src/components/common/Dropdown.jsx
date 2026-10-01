import React, { useState, useRef, useEffect } from 'react';

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

      {isOpen && (
        <div
          className={`absolute ${alignmentClass} mt-2 ${width} glass-panel rounded-xl shadow-2xl border border-slate-700/80 p-1 z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          <div onClick={() => setIsOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, icon: Icon, onClick, danger = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
        danger
          ? 'text-rose-400 hover:bg-rose-500/10'
          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
      } ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 opacity-80" />}
      {children}
    </button>
  );
}

export default Dropdown;
