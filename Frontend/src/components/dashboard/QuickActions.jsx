import React from 'react';
import { Plus, GitBranch, UserPlus, Terminal } from 'lucide-react';
import { useToast } from '../common/Toast';

export function QuickActions({ onOpenNewWorkspace, onOpenNewProject, onOpenInviteMember }) {
  const { addToast } = useToast();

  const actions = [
    {
      title: 'Create Workspace',
      desc: 'Set up an organization',
      icon: Plus,
      onClick: onOpenNewWorkspace
    },
    {
      title: 'New Project',
      desc: 'Initialize a project or service',
      icon: GitBranch,
      onClick: onOpenNewProject
    },
    {
      title: 'Invite Teammate',
      desc: 'Grant workspace access',
      icon: UserPlus,
      onClick: onOpenInviteMember
    },
    {
      title: 'Version Control',
      desc: 'Connect Git repositories',
      icon: Terminal,
      onClick: () => addToast('Git repository integration is active.', 'info')
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((act, i) => {
        const Icon = act.icon;
        return (
          <button
            key={i}
            type="button"
            onClick={act.onClick}
            className="p-3.5 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] hover:bg-[#F7F7F5] dark:hover:bg-[#262626] transition-colors text-left flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-md bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] flex items-center justify-center text-[#252525] dark:text-[#F2F2F2] shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] my-0 truncate">
                {act.title}
              </h4>
              <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] leading-tight my-0 truncate">
                {act.desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default QuickActions;
