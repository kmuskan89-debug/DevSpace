import React from 'react';
import { Layers, FolderGit2, CheckSquare, Users, TrendingUp, GitBranch } from 'lucide-react';
import Card from '../common/Card';

export function StatsOverview() {
  const stats = [
    {
      title: 'Active Workspaces',
      value: '4',
      change: '+1 this month',
      icon: Layers,
      color: 'from-indigo-500 to-purple-600',
      iconColor: 'text-indigo-400'
    },
    {
      title: 'Total Projects',
      value: '11',
      change: '8 active sprints',
      icon: FolderGit2,
      color: 'from-cyan-500 to-blue-600',
      iconColor: 'text-cyan-400'
    },
    {
      title: 'Open Tasks / PRs',
      value: '26',
      change: '14 reviewed today',
      icon: CheckSquare,
      color: 'from-emerald-500 to-teal-600',
      iconColor: 'text-emerald-400'
    },
    {
      title: 'Collaborators',
      value: '33',
      change: '+5 pending invites',
      icon: Users,
      color: 'from-amber-500 to-rose-600',
      iconColor: 'text-amber-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card key={idx} hoverable={true} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {stat.title}
                </p>
                <h4 className="text-2xl font-extrabold text-slate-100 mt-1">{stat.value}</h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2 font-mono">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${stat.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Subtle glow accent bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} opacity-60`} />
          </Card>
        );
      })}
    </div>
  );
}

export default StatsOverview;
