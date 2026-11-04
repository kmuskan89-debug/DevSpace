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
      className={`rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#242424] p-4 sm:p-5 transition-colors duration-150 ${
        hoverable ? 'hover:bg-[#FAFAF9] dark:hover:bg-[#2A2A2A] hover:border-[#D1D1CD] dark:hover:border-[#444444]' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
