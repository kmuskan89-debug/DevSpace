import React from 'react';

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/30',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
  outline: 'bg-transparent hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600',
  danger: 'bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 border border-rose-500/30',
  ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-100',
  cyan: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 border border-cyan-500/30'
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-3.5 py-2 text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base rounded-xl gap-2.5',
  icon: 'p-2 text-sm rounded-lg justify-center'
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  rightIcon: RightIcon,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />}
      {children && <span>{children}</span>}
      {RightIcon && <RightIcon className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />}
    </button>
  );
}

export default Button;
