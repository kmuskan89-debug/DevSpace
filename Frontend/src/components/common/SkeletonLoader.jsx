import React from 'react';

export function SkeletonLoader({ type = 'card', count = 1, className = '' }) {
  const items = Array.from({ length: count });

  if (type === 'stat') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {items.map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#242424] p-4 space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded w-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E8E8E5]/50 dark:via-[#353535]/50 to-transparent animate-shimmer" />
              </div>
              <div className="h-7 w-7 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E8E8E5]/50 dark:via-[#353535]/50 to-transparent animate-shimmer" />
              </div>
            </div>
            <div className="h-6 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded w-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E8E8E5]/50 dark:via-[#353535]/50 to-transparent animate-shimmer" />
            </div>
            <div className="h-2.5 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded w-32 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E8E8E5]/50 dark:via-[#353535]/50 to-transparent animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#242424] overflow-hidden ${className}`}>
        <div className="p-3 border-b border-[#E8E8E5] dark:border-[#353535] flex items-center justify-between">
          <div className="h-3.5 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded w-32" />
          <div className="h-7 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded w-20" />
        </div>
        <div className="divide-y divide-[#E8E8E5] dark:divide-[#353535]">
          {items.map((_, index) => (
            <div key={index} className="p-3 flex items-center gap-3">
              <div className="h-8 w-8 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded w-1/3" />
                <div className="h-2.5 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded w-1/4" />
              </div>
              <div className="h-5 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: Card Skeleton
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#242424] p-4 space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="h-3.5 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded w-1/3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E8E8E5]/50 dark:via-[#353535]/50 to-transparent animate-shimmer" />
            </div>
            <div className="h-5 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded w-14" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded w-full" />
            <div className="h-2.5 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded w-2/3" />
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-[#E8E8E5] dark:border-[#353535]">
            <div className="h-5 w-5 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded-full" />
            <div className="h-3 bg-[#F1F1EF] dark:bg-[#2A2A2A] rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonLoader;
