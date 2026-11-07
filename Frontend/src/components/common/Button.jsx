import React from 'react';

const variants = {
  primary: 'bg-[#252525] hover:bg-[#111111] text-[#FFFFFF] border border-[#252525] dark:bg-[#F2F2F2] dark:hover:bg-[#FFFFFF] dark:text-[#191919] dark:border-[#F2F2F2] shadow-xs',
  secondary: 'bg-[#F7F7F5] hover:bg-[#F1F1EF] text-[#252525] border border-[#E8E8E5] dark:bg-[#242424] dark:hover:bg-[#2A2A2A] dark:text-[#F2F2F2] dark:border-[#353535]',
  outline: 'bg-transparent hover:bg-[#F1F1EF] text-[#252525] border border-[#E8E8E5] dark:hover:bg-[#2A2A2A] dark:text-[#F2F2F2] dark:border-[#353535]',
  ghost: 'bg-transparent hover:bg-[#F1F1EF] text-[#777777] hover:text-[#252525] dark:hover:bg-[#2A2A2A] dark:text-[#A0A0A0] dark:hover:text-[#F2F2F2]',
  danger: 'bg-[#FDF3F2] hover:bg-[#F9E0DE] text-[#D83B01] border border-[#F9D5D3] dark:bg-[rgba(248,113,113,0.12)] dark:hover:bg-[rgba(248,113,113,0.2)] dark:text-[#F87171] dark:border-[rgba(248,113,113,0.25)]',
  // Backward compatibility alias
  cyan: 'bg-[#252525] hover:bg-[#111111] text-[#FFFFFF] border border-[#252525] dark:bg-[#F2F2F2] dark:hover:bg-[#FFFFFF] dark:text-[#191919] dark:border-[#F2F2F2] shadow-xs'
};

const sizes = {
  sm: 'h-7 px-2.5 text-xs rounded-md gap-1.5 font-medium',
  md: 'h-8.5 px-3 py-1.5 text-xs rounded-md gap-2 font-medium',
  lg: 'h-10 px-4 py-2 text-sm rounded-md gap-2.5 font-medium',
  icon: 'h-8 w-8 p-1.5 rounded-md justify-center'
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  rightIcon: RightIcon,
  className = '',
  disabled = false,
  loading = false,
  isLoading = false,
  onClick,
  type = 'button',
  ...props
}) {
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;
  const isButtonLoading = Boolean(loading || isLoading);

  return (
    <button
      type={type}
      disabled={disabled || isButtonLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {isButtonLoading ? (
        <svg
          className="animate-spin h-3.5 w-3.5 text-current shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        Icon && <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} shrink-0`} />
      )}
      {children && <span>{children}</span>}
      {!isButtonLoading && RightIcon && (
        <RightIcon className={`${size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} shrink-0`} />
      )}
    </button>
  );
}

export default Button;
