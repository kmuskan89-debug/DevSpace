import React, { useState } from 'react';
import { Filter, Search, GitCommit, GitPullRequest, CheckCircle2, Rocket } from 'lucide-react';
import Card from '../common/Card';
import Avatar from '../common/Avatar';

export function ActivityFeed({ activities = [] }) {
  const [filter, setFilter] = useState('all');

  const filteredActivities = activities.filter((act) => {
    if (filter === 'all') return true;
    return act.type === filter;
  });

  return (
    <Card hoverable={false} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100">Audit & Event Logs</h3>
          <p className="text-xs text-slate-400">Detailed record of repository actions and sprint updates</p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'commit', 'pull_request', 'review', 'deploy'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors capitalize cursor-pointer whitespace-nowrap ${
                filter === t
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-800">
        {filteredActivities.map((act) => (
          <div key={act.id} className="relative flex items-start gap-4 pl-2">
            <div className="z-10 bg-slate-950 p-0.5 rounded-full ring-4 ring-slate-950">
              <Avatar src={act.avatar} name={act.user} size="sm" />
            </div>

            <div className="flex-1 glass-card rounded-xl p-3.5 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100">{act.user}</span>
                  <span className="text-xs text-slate-400">{act.action}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">{act.time}</span>
              </div>

              <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 text-xs font-mono text-indigo-300">
                {act.target}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                <span>Project: {act.project}</span>
                <span>•</span>
                <span>Type: {act.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default ActivityFeed;
