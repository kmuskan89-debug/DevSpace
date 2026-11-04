import React from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  icon: Icon,
  disabled = false,
  required = false,
  placeholder = 'Select an option',
  className = '',
  id,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-md shadow-2xs">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-[#999999] dark:text-[#777777]">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full appearance-none rounded-md bg-[#FFFFFF] dark:bg-[#202020] border border-[#E8E8E5] dark:border-[#353535] px-3 py-1.5 pr-8 text-xs sm:text-sm text-[#252525] dark:text-[#F2F2F2] transition-colors focus:border-[#777777] dark:focus:border-[#A0A0A0] focus:outline-none focus:ring-1 focus:ring-[#777777]/20 dark:focus:ring-[#A0A0A0]/20 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
            Icon ? 'pl-9' : ''
          } ${error ? 'border-rose-500 focus:border-rose-500' : ''} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#999999] dark:text-[#777777]">
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
      </div>
      {error ? (
        <p className="text-[11px] text-rose-500 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Select;

