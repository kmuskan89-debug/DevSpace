import React from 'react';
import Card from '../common/Card';
import ActivityItem from './ActivityItem';

export function RecentActivityList({ activities = [] }) {
  return (
    <Card hoverable={false} className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 my-0">Live Team Activity</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Real-time commits, pull requests & deployments</p>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
          Live Stream
        </span>
      </div>

      <div className="space-y-3">
        {activities.map((act) => (
          <ActivityItem key={act.id} activity={act} />
        ))}
      </div>
    </Card>
  );
}

export default RecentActivityList;
