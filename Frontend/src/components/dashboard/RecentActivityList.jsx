import React from 'react';
import Card from '../common/Card';
import ActivityItem from './ActivityItem';
import EmptyState from '../common/EmptyState';
import { Activity } from 'lucide-react';

export function RecentActivityList({ activities = [] }) {
  return (
    <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-3">
      <div className="flex items-center justify-between pb-2.5 border-b border-[#E8E8E5] dark:border-[#353535]">
        <div>
          <h3 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">Workspace Activity</h3>
          <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] mt-0.5">Recent task updates, projects, and team collaboration</p>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]">
          Live Feed
        </span>
      </div>

      {activities && activities.length > 0 ? (
        <div className="space-y-2">
          {activities.map((act) => (
            <ActivityItem key={act.id || act._id} activity={act} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Activity}
          title="No recent activity"
          description="Workspace events and task status transitions will appear here."
          className="py-6"
        />
      )}
    </Card>
  );
}

export default RecentActivityList;
