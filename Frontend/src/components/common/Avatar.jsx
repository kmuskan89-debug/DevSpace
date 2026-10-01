import React, { useState } from 'react';
import { getInitials } from '../../utils/formatters';

const sizes = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg'
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
    <div className={`relative inline-block ${className}`}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className={`${sizeClass} rounded-full object-cover ring-2 ring-slate-800`}
        />
      ) : (
        <div
          className={`${sizeClass} rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center font-bold text-white ring-2 ring-slate-800 shadow-sm`}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-slate-900 ${
            size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
          } ${
            status === 'online' ? 'bg-emerald-500' : status === 'away' ? 'bg-amber-500' : 'bg-slate-500'
          }`}
        />
      )}
    </div>
  );
}

export default Avatar;
