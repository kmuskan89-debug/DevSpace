import React, { useState } from 'react';
import { getInitials } from '../../utils/formatters';

const sizes = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-6 h-6 text-[11px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-12 h-12 text-base'
};

export function Avatar({
  src,
  name = '',
  size = 'md',
  status = null,
  className = ''
}) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className={`${sizeClass} rounded-full object-cover border border-[#E8E8E5] dark:border-[#353535] shadow-2xs`}
        />
      ) : (
        <div
          className={`${sizeClass} rounded-full bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] border border-[#E8E8E5] dark:border-[#353535] flex items-center justify-center font-medium shadow-2xs`}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-[#FFFFFF] dark:ring-[#191919] ${
            size === 'xs' || size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
          } ${
            status === 'online' ? 'bg-[#107C41] dark:bg-[#4EBE7E]' : status === 'away' ? 'bg-[#B26B00] dark:bg-[#FBBF24]' : 'bg-[#999999]'
          }`}
        />
      )}
    </div>
  );
}

export default Avatar;
