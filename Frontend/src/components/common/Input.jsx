import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function Input({
  label,
  error,
  icon: Icon,
  endIcon: EndIcon,
  helperText,
  className = '',
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-md shadow-2xs">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-[#999999] dark:text-[#777777]">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-md bg-[#FFFFFF] dark:bg-[#202020] border border-[#E8E8E5] dark:border-[#353535] px-3 py-1.5 text-xs sm:text-sm text-[#252525] dark:text-[#F2F2F2] placeholder-[#999999] dark:placeholder-[#777777] transition-colors focus:border-[#777777] dark:focus:border-[#A0A0A0] focus:outline-none focus:ring-1 focus:ring-[#777777]/20 dark:focus:ring-[#A0A0A0]/20 ${
            Icon ? 'pl-9' : ''
          } ${isPassword || EndIcon ? 'pr-9' : ''} ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''
          } ${className}`}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#999999] dark:text-[#777777] hover:text-[#252525] dark:hover:text-[#F2F2F2] cursor-pointer focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        ) : EndIcon ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#999999] dark:text-[#777777]">
            <EndIcon className="h-3.5 w-3.5" />
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="text-[11px] text-rose-500 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Input;
