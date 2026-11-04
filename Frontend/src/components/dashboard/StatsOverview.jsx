import React from 'react';
import { FolderGit2, CheckSquare, Clock, CheckCircle2 } from 'lucide-react';
import Card from '../common/Card';

export function StatsOverview({
  projectsCount = 0,
  tasksCount = 0,
  inProgressCount = 0,
  completedCount = 0
}) {
  const completionRate = tasksCount > 0 ? Math.round((completedCount / tasksCount) * 100) : 0;

  const stats = [
    {
      title: 'Active Projects',
      value: String(projectsCount),
      subtext: `${projectsCount} project${projectsCount === 1 ? '' : 's'} managed`,
      icon: FolderGit2
    },
    {
      title: 'Total Tasks',
      value: String(tasksCount),
      subtext: `${tasksCount} total backlog & sprint item${tasksCount === 1 ? '' : 's'}`,
      icon: CheckSquare
    },
    {
      title: 'In Progress',
      value: String(inProgressCount),
      subtext: 'Active issues under development',
      icon: Clock
    },
    {
      title: 'Completed',
      value: String(completedCount),
      subtext: `${completionRate}% completion rate`,
      icon: CheckCircle2
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card
            key={idx}
            hoverable={false}
            className="p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
                  {stat.title}
                </p>
                <h4 className="text-2xl font-bold text-[#252525] dark:text-[#F2F2F2] mt-1 tracking-tight">
                  {stat.value}
                </h4>
                <p className="text-[11px] text-[#999999] dark:text-[#777777] mt-1">
                  {stat.subtext}
                </p>
              </div>
              <div className="w-7 h-7 rounded-md bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default StatsOverview;
