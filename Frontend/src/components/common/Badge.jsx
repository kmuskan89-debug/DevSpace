import React from 'react';
import { getStatusBadgeStyle, getPriorityBadgeStyle } from '../../utils/formatters';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  status,
  priority,
  icon: Icon,
  className = ''
}) {
  let styleClass = 'bg-slate-800 text-slate-300 border-slate-700';

  if (status) {
    styleClass = getStatusBadgeStyle(status);
  } else if (priority) {
    styleClass = getPriorityBadgeStyle(priority);
  } else if (variant === 'indigo') {
    styleClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
  } else if (variant === 'cyan') {
    styleClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
  } else if (variant === 'emerald') {
    styleClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (variant === 'amber') {
    styleClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (variant === 'rose') {
    styleClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  } else if (variant === 'tech') {
    styleClass = 'bg-slate-900/90 text-indigo-300 border-slate-700/80 font-mono text-[11px]';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md border ${styleClass} ${sizeClass} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children || status || priority}
    </span>
  );
}

export default Badge;
