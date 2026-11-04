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
      return 'bg-[#EBF8F1] dark:bg-[rgba(78,190,126,0.12)] text-[#107C41] dark:text-[#4EBE7E] border border-[#D1F0DE] dark:border-[rgba(78,190,126,0.25)]';
    case 'in progress':
    case 'in-progress':
    case 'code review':
    case 'review':
      return 'bg-[#EFF6FC] dark:bg-[rgba(96,165,250,0.12)] text-[#0078D4] dark:text-[#60A5FA] border border-[#C7E0F4] dark:border-[rgba(96,165,250,0.25)]';
    case 'to do':
    case 'todo':
    case 'pending':
      return 'bg-[#FEF8ED] dark:bg-[rgba(251,191,36,0.12)] text-[#B26B00] dark:text-[#FBBF24] border border-[#FBE5C3] dark:border-[rgba(251,191,36,0.25)]';
    case 'urgent':
    case 'high':
    case 'danger':
      return 'bg-[#FDF3F2] dark:bg-[rgba(248,113,113,0.12)] text-[#D83B01] dark:text-[#F87171] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.25)]';
    default:
      return 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]';
  }
}

export function getPriorityBadgeStyle(priority) {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return 'bg-[#FDF3F2] dark:bg-[rgba(248,113,113,0.12)] text-[#D83B01] dark:text-[#F87171] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.25)]';
    case 'high':
      return 'bg-[#FEF8ED] dark:bg-[rgba(251,191,36,0.12)] text-[#B26B00] dark:text-[#FBBF24] border border-[#FBE5C3] dark:border-[rgba(251,191,36,0.25)]';
    case 'medium':
      return 'bg-[#EFF6FC] dark:bg-[rgba(96,165,250,0.12)] text-[#0078D4] dark:text-[#60A5FA] border border-[#C7E0F4] dark:border-[rgba(96,165,250,0.25)]';
    case 'low':
      return 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]';
    default:
      return 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]';
  }
}
