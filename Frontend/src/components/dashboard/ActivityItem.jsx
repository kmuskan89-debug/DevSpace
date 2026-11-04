import React from 'react';
import {
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  Rocket,
  MessageSquare,
  Clock,
  CheckSquare,
  UserPlus,
  FolderGit2,
  Kanban
} from 'lucide-react';
import Avatar from '../common/Avatar';

export function ActivityItem({ activity }) {
  if (!activity) return null;

  const user = activity.user || activity.actor?.name || 'Teammate';
  const avatar = activity.avatar || activity.actor?.avatar || '';

  const getActionLabel = (act) => {
    if (act.action && typeof act.action === 'string' && act.action.includes('_')) {
      switch (act.action) {
        case 'PROJECT_CREATED':
          return 'created project';
        case 'PROJECT_UPDATED':
          return 'updated project';
        case 'PROJECT_DELETED':
          return 'deleted project';
        case 'TASK_CREATED':
          return 'created task';
        case 'TASK_UPDATED':
          return 'updated task';
        case 'TASK_STATUS_CHANGED':
          return `moved to ${act.details?.newStatus || 'next status'}`;
        case 'TASK_DELETED':
          return 'deleted task';
        case 'COMMENT_ADDED':
          return 'commented on';
        case 'MEMBER_INVITED':
          return `invited ${act.details?.email || 'collaborator'}`;
        case 'MEMBER_JOINED':
          return 'joined workspace';
        case 'SPRINT_CREATED':
          return 'created sprint';
        case 'SPRINT_STARTED':
          return 'started sprint';
        case 'SPRINT_COMPLETED':
          return 'completed sprint';
        case 'SPRINT_UPDATED':
          return 'updated sprint';
        case 'SPRINT_DELETED':
          return 'deleted sprint';
        case 'SPRINT_ISSUES_ADDED':
          return 'added issues to sprint';
        case 'SPRINT_ISSUE_REMOVED':
          return 'removed issue from sprint';
        default:
          return act.action.toLowerCase().replace(/_/g, ' ');
      }
    }
    return act.action || 'performed an action';
  };

  const getIcon = (act) => {
    const rawAction = act.action || '';
    if (rawAction.includes('SPRINT')) return <Kanban className="w-3 h-3 text-[#777777] dark:text-[#A0A0A0]" />;
    if (rawAction.includes('TASK')) return <CheckSquare className="w-3 h-3 text-[#777777] dark:text-[#A0A0A0]" />;
    if (rawAction.includes('COMMENT')) return <MessageSquare className="w-3 h-3 text-[#777777] dark:text-[#A0A0A0]" />;
    if (rawAction.includes('MEMBER')) return <UserPlus className="w-3 h-3 text-[#777777] dark:text-[#A0A0A0]" />;
    if (rawAction.includes('PROJECT')) return <FolderGit2 className="w-3 h-3 text-[#777777] dark:text-[#A0A0A0]" />;

    switch (act.type) {
      case 'commit':
        return <GitCommit className="w-3 h-3 text-[#777777] dark:text-[#A0A0A0]" />;
      case 'pull_request':
        return <GitPullRequest className="w-3 h-3 text-[#777777] dark:text-[#A0A0A0]" />;
      case 'review':
        return <CheckCircle2 className="w-3 h-3 text-[#777777] dark:text-[#A0A0A0]" />;
      case 'deploy':
        return <Rocket className="w-3 h-3 text-[#777777] dark:text-[#A0A0A0]" />;
      default:
        return <MessageSquare className="w-3 h-3 text-[#777777] dark:text-[#A0A0A0]" />;
    }
  };

  const target =
    activity.target ||
    activity.details?.title ||
    activity.details?.name ||
    (activity.details?.issueKey ? `[${activity.details.issueKey}] ${activity.details.title || ''}` : '') ||
    '';

  const time =
    activity.time ||
    (activity.createdAt
      ? new Date(activity.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Recently');

  const projectName = activity.project?.name || activity.project?.key || activity.workspace?.name || 'Workspace';

  return (
    <div className="flex items-start gap-3 p-2.5 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] hover:bg-[#F9F9F8] dark:hover:bg-[#262626] transition-colors">
      <Avatar src={avatar} name={user} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2]">{user}</span>
          <span className="text-xs text-[#777777] dark:text-[#A0A0A0]">{getActionLabel(activity)}</span>
          <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] text-[10px] font-mono border border-[#E8E8E5] dark:border-[#353535]">
            {getIcon(activity)}
            <span className="truncate max-w-[140px]">{projectName}</span>
          </div>
        </div>
        {target && (
          <p className="text-xs text-[#555555] dark:text-[#CCCCCC] font-mono mt-1 px-2 py-1 rounded bg-[#F9F9F8] dark:bg-[#1A1A1A] border border-[#E8E8E5] dark:border-[#353535] truncate">
            {target}
          </p>
        )}
        <div className="flex items-center gap-1 text-[10px] text-[#999999] dark:text-[#777777] mt-1 font-mono">
          <Clock className="w-3 h-3 shrink-0" />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

export default ActivityItem;
