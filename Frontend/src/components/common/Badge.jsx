import React from 'react';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  status,
  priority,
  icon: Icon,
  dot = false,
  className = ''
}) {
  let styleClass = 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] border border-[#E8E8E5] dark:border-[#353535]';
  let dotColor = 'bg-[#777777] dark:bg-[#A0A0A0]';

  if (status) {
    const s = String(status).toLowerCase();
    if (s === 'active' || s === 'done' || s === 'completed' || s === 'success') {
      styleClass = 'bg-[#EBF8F1] dark:bg-[rgba(78,190,126,0.12)] text-[#107C41] dark:text-[#4EBE7E] border border-[#D1F0DE] dark:border-[rgba(78,190,126,0.25)]';
      dotColor = 'bg-[#107C41] dark:bg-[#4EBE7E]';
    } else if (s === 'in progress' || s === 'in-progress' || s === 'code review' || s === 'review') {
      styleClass = 'bg-[#EFF6FC] dark:bg-[rgba(96,165,250,0.12)] text-[#0078D4] dark:text-[#60A5FA] border border-[#C7E0F4] dark:border-[rgba(96,165,250,0.25)]';
      dotColor = 'bg-[#0078D4] dark:bg-[#60A5FA]';
    } else if (s === 'to do' || s === 'todo' || s === 'pending') {
      styleClass = 'bg-[#FEF8ED] dark:bg-[rgba(251,191,36,0.12)] text-[#B26B00] dark:text-[#FBBF24] border border-[#FBE5C3] dark:border-[rgba(251,191,36,0.25)]';
      dotColor = 'bg-[#B26B00] dark:bg-[#FBBF24]';
    } else {
      styleClass = 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]';
      dotColor = 'bg-[#777777] dark:bg-[#A0A0A0]';
    }
  } else if (priority) {
    const p = String(priority).toLowerCase();
    if (p === 'urgent') {
      styleClass = 'bg-[#FDF3F2] dark:bg-[rgba(248,113,113,0.12)] text-[#D83B01] dark:text-[#F87171] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.25)]';
      dotColor = 'bg-[#D83B01] dark:bg-[#F87171]';
    } else if (p === 'high') {
      styleClass = 'bg-[#FEF8ED] dark:bg-[rgba(251,191,36,0.12)] text-[#B26B00] dark:text-[#FBBF24] border border-[#FBE5C3] dark:border-[rgba(251,191,36,0.25)]';
      dotColor = 'bg-[#B26B00] dark:bg-[#FBBF24]';
    } else if (p === 'medium') {
      styleClass = 'bg-[#EFF6FC] dark:bg-[rgba(96,165,250,0.12)] text-[#0078D4] dark:text-[#60A5FA] border border-[#C7E0F4] dark:border-[rgba(96,165,250,0.25)]';
      dotColor = 'bg-[#0078D4] dark:bg-[#60A5FA]';
    } else {
      styleClass = 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]';
      dotColor = 'bg-[#777777] dark:bg-[#A0A0A0]';
    }
  } else if (variant === 'tech') {
    styleClass = 'bg-[#F7F7F5] dark:bg-[#202020] text-[#252525] dark:text-[#F2F2F2] border border-[#E8E8E5] dark:border-[#353535] font-mono text-[11px]';
    dotColor = 'bg-[#777777]';
  } else if (variant === 'rose' || variant === 'danger') {
    styleClass = 'bg-[#FDF3F2] dark:bg-[rgba(248,113,113,0.12)] text-[#D83B01] dark:text-[#F87171] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.25)]';
    dotColor = 'bg-[#D83B01] dark:bg-[#F87171]';
  } else if (variant === 'emerald' || variant === 'success') {
    styleClass = 'bg-[#EBF8F1] dark:bg-[rgba(78,190,126,0.12)] text-[#107C41] dark:text-[#4EBE7E] border border-[#D1F0DE] dark:border-[rgba(78,190,126,0.25)]';
    dotColor = 'bg-[#107C41] dark:bg-[#4EBE7E]';
  } else if (variant === 'amber' || variant === 'warning') {
    styleClass = 'bg-[#FEF8ED] dark:bg-[rgba(251,191,36,0.12)] text-[#B26B00] dark:text-[#FBBF24] border border-[#FBE5C3] dark:border-[rgba(251,191,36,0.25)]';
    dotColor = 'bg-[#B26B00] dark:bg-[#FBBF24]';
  } else if (variant === 'cyan' || variant === 'indigo' || variant === 'info') {
    styleClass = 'bg-[#EFF6FC] dark:bg-[rgba(96,165,250,0.12)] text-[#0078D4] dark:text-[#60A5FA] border border-[#C7E0F4] dark:border-[rgba(96,165,250,0.25)]';
    dotColor = 'bg-[#0078D4] dark:bg-[#60A5FA]';
  }

  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded ${styleClass} ${sizeClass} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />}
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children || status || priority}</span>
    </span>
  );
}

export default Badge;
