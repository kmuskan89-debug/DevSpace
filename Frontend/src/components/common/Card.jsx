import React from 'react';

export function Card({
  children,
  className = '',
  hoverable = true,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-xl p-5 transition-all duration-200 ${
        hoverable ? 'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-950/20' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
