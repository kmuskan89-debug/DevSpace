// Helper formatters for UI elements

export function getInitials(name = '') {
  if (!name) return 'DS';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getStatusBadgeStyle(status) {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'done':
    case 'completed':
    case 'success':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'in progress':
    case 'code review':
    case 'review':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'to do':
    case 'pending':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'urgent':
    case 'high':
    case 'danger':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

export function getPriorityBadgeStyle(priority) {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    case 'high':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'medium':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    case 'low':
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}
