import React from 'react';

export function SectionHeader({
  title,
  description,
  badge,
  icon: Icon,
  actions,
  className = ''
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-[#E8E8E5] dark:border-[#353535] ${className}`}>
      <div>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-[#777777] dark:text-[#A0A0A0]" />}
          <h2 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0 tracking-tight">
            {title}
          </h2>
          {badge !== undefined && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-0.5">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export default SectionHeader;

