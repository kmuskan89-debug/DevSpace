import React from 'react';
import { Plus, GitBranch, UserPlus, Terminal } from 'lucide-react';
import Card from '../common/Card';

export function QuickActions({ onOpenNewWorkspace, onOpenNewProject, onOpenInviteMember }) {
  const actions = [
    {
      title: 'Create Workspace',
      desc: 'Setup a new team organization',
      icon: Plus,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      onClick: onOpenNewWorkspace
    },
    {
      title: 'New Repository',
      desc: 'Initialize a microservice or app',
      icon: GitBranch,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      onClick: onOpenNewProject
    },
    {
      title: 'Invite Team Member',
      desc: 'Grant permissions to collaborators',
      icon: UserPlus,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      onClick: onOpenInviteMember
    },
    {
      title: 'Connect GitHub / GitLab',
      desc: 'Sync repos and webhook triggers',
      icon: Terminal,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      onClick: () => alert('GitHub OAuth sync triggered!')
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
            className="glass-card rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 hover:border-slate-700 flex items-center gap-3 cursor-pointer group"
          >
            <div className={`p-2.5 rounded-lg border ${act.color} group-hover:scale-105 transition-transform`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                {act.title}
              </h4>
              <p className="text-[11px] text-slate-400 leading-tight">{act.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default QuickActions;
