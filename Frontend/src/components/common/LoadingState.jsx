import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading...', size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`py-12 flex flex-col items-center justify-center space-y-2.5 text-center ${className}`}>
      <Loader2 className={`${sizeMap[size] || sizeMap.md} text-[#777777] dark:text-[#A0A0A0] animate-spin`} />
      {message && <p className="text-xs text-[#777777] dark:text-[#A0A0A0] font-mono">{message}</p>}
    </div>
  );
}

export default LoadingState;

