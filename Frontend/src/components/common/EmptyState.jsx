import React from 'react';
import Button from './Button';

export function EmptyState({
  icon: Icon,
  title = 'No items found',
  description,
  action,
  className = ''
}) {
  return (
    <div
      className={`text-center py-10 px-4 border border-dashed border-[#E8E8E5] dark:border-[#353535] rounded-lg bg-[#FFFFFF] dark:bg-[#202020] space-y-3 ${className}`}
    >
      {Icon && (
        <div className="w-10 h-10 rounded-md bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] flex items-center justify-center mx-auto text-[#777777] dark:text-[#A0A0A0]">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="space-y-1 max-w-sm mx-auto">
        <h4 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">{title}</h4>
        {description && (
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0] leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        <div className="pt-1 flex items-center justify-center gap-2">
          {React.isValidElement(action) ? (
            action
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;

