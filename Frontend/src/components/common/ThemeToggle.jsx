import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function ThemeToggle({ size = 'sm', variant = 'outline', showLabel = false, className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const baseStyles = 'inline-flex items-center gap-1.5 transition-colors cursor-pointer rounded-md focus:outline-none';
  const sizeStyles = size === 'sm' ? 'h-7 px-2 text-xs' : 'h-8.5 px-3 text-xs';
  const variantStyles =
    variant === 'outline'
      ? 'border border-[#E8E8E5] dark:border-[#353535] bg-transparent hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
      : 'bg-transparent hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
    >
      {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      {showLabel && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  );
}

export default ThemeToggle;

