import React from 'react';
import { GitCommit, GitPullRequest, CheckCircle2, Rocket, MessageSquare, Clock } from 'lucide-react';
import Avatar from '../common/Avatar';

export function ActivityItem({ activity }) {
  if (!activity) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'commit':
        return <GitCommit className="w-3.5 h-3.5 text-indigo-400" />;
      case 'pull_request':
        return <GitPullRequest className="w-3.5 h-3.5 text-cyan-400" />;
      case 'review':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'deploy':
        return <Rocket className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 transition-colors">
      <Avatar src={activity.avatar} name={activity.user} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-200">{activity.user}</span>
          <span className="text-xs text-slate-400">{activity.action}</span>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] font-mono border border-slate-800">
            {getIcon(activity.type)}
            <span className="truncate max-w-[180px]">{activity.project}</span>
          </div>
        </div>
        <p className="text-xs text-slate-300 font-mono mt-1.5 bg-slate-950/70 p-2 rounded border border-slate-800/70 truncate">
          {activity.target}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1.5 font-mono">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{activity.time}</span>
          <span>•</span>
          <span>{activity.workspace}</span>
        </div>
      </div>
    </div>
  );
}

export default ActivityItem;
