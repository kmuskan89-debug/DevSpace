import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Download,
  RotateCcw,
  BarChart3,
  UserPlus
} from 'lucide-react';
import api from '../../utils/axios';
import useWorkspace from '../../hooks/useWorkspace';
import ProjectCard from '../../components/projects/ProjectCard';
import RecentActivityList from '../../components/dashboard/RecentActivityList';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Dropdown, { DropdownItem } from '../../components/common/Dropdown';
import { useToast } from '../../components/common/Toast';
import {
  DonutChart,
  HorizontalBarChart
} from '../../components/analytics/AnalyticsCharts';

export function WorkspaceOverviewPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { workspace, projects, members, activities } = useWorkspace();

  const [period, setPeriod] = useState('all');
  const [analytics, setAnalytics] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const wsId = workspace?._id || workspace?.id;

  const fetchWorkspaceAnalytics = useCallback(async () => {
    if (!wsId) return;
    setIsLoadingAnalytics(true);
    try {
      const res = await api.get(`/analytics/workspaces/${wsId}?period=${period}`);
      setAnalytics(res.data?.analytics || null);
    } catch (err) {
      console.warn('Failed to load workspace analytics:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [wsId, period]);

  useEffect(() => {
    fetchWorkspaceAnalytics();
  }, [fetchWorkspaceAnalytics]);

  const handleExport = async (type = 'tasks') => {
    if (!wsId) return;
    setIsExporting(true);
    try {
      const res = await api.get(`/analytics/workspaces/${wsId}/export?type=${type}`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${workspace.name.toLowerCase().replace(/\s+/g, '-')}-${type}-${period}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast(`Exported workspace ${type} report as CSV!`, 'success');
    } catch (err) {
      console.error('Export failed:', err);
      addToast('Failed to export CSV report', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  if (!workspace) {
    return (
      <div className="p-8 text-center text-xs font-mono text-[#777777] dark:text-[#A0A0A0]">
        Workspace not found
      </div>
    );
  }

  const overview = analytics?.overview || {
    totalProjects: projects.length,
    totalTasks: projects.reduce((acc, p) => acc + (p.totalTasksCount || 0), 0),
    completedTasks: projects.reduce((acc, p) => acc + (p.completedTasksCount || 0), 0),
    pendingTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    overallProgress: 0,
    activeSprints: 0,
    completedSprints: 0
  };

  // Status distribution with restrained palette
  const statusData = [
    { label: 'Done', value: analytics?.distribution?.byStatus?.['Done'] || 0, color: '#15803D' },
    { label: 'In Progress', value: analytics?.distribution?.byStatus?.['In Progress'] || 0, color: '#4F46E5' },
    { label: 'Code Review', value: analytics?.distribution?.byStatus?.['Code Review'] || 0, color: '#0284C7' },
    { label: 'To Do', value: analytics?.distribution?.byStatus?.['To Do'] || 0, color: '#999999' }
  ];

  // Priority distribution
  const priorityData = [
    { label: 'Highest', value: analytics?.distribution?.byPriority?.['Highest'] || 0, color: '#DC2626' },
    { label: 'High', value: analytics?.distribution?.byPriority?.['High'] || 0, color: '#EA580C' },
    { label: 'Medium', value: analytics?.distribution?.byPriority?.['Medium'] || 0, color: '#D97706' },
    { label: 'Low', value: analytics?.distribution?.byPriority?.['Low'] || 0, color: '#2563EB' },
    { label: 'Lowest', value: analytics?.distribution?.byPriority?.['Lowest'] || 0, color: '#64748B' }
  ];

  // Project progress comparison
  const projectComparisonData = (analytics?.projectBreakdown || []).map((p) => ({
    label: `${p.name} (${p.key})`,
    value: p.progress,
    unit: '%',
    color: p.progress >= 75 ? '#15803D' : p.progress >= 40 ? '#252525' : '#D97706'
  }));

  return (
    <div className="space-y-5 max-w-6xl">
      {/* 1. Workspace Header Info */}
      <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0]">
              Workspace Overview &amp; Analytics
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#252525] dark:text-[#F2F2F2] my-0 tracking-tight">
              {workspace.name}
            </h1>
            {workspace.description && (
              <p className="text-xs text-[#777777] dark:text-[#A0A0A0] max-w-3xl leading-relaxed mt-0.5">
                {workspace.description}
              </p>
            )}
          </div>

          {/* Member Avatars Stack & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex -space-x-1.5 overflow-hidden p-0.5">
              {members.slice(0, 4).map((member, i) => (
                <div key={member.id || i} className="inline-block ring-2 ring-[#FFFFFF] dark:ring-[#202020] rounded-full">
                  <Avatar src={member.avatar || member.user?.avatar} name={member.name || member.user?.name} size="sm" />
                </div>
              ))}
              {members.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] flex items-center justify-center font-bold text-[10px] text-[#777777] dark:text-[#A0A0A0] font-mono">
                  +{members.length - 4}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={UserPlus}
              onClick={() => navigate(`/workspace/${wsId}/members`)}
              className="h-8 text-xs font-medium"
            >
              Team
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Controls Bar: Date-Range, Refresh & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020]">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#252525] dark:text-[#F2F2F2]" />
          <h2 className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
            Performance Metrics
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-[#F7F7F5] dark:bg-[#1A1A1A] border border-[#E8E8E5] dark:border-[#353535] rounded-md p-0.5 text-xs font-mono">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'all', label: 'All Time' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`px-2.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                  period === p.id
                    ? 'bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] font-medium'
                    : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={fetchWorkspaceAnalytics}
            className="p-1.5 rounded-md border border-[#E8E8E5] dark:border-[#353535] text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
            title="Refresh metrics"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
          </button>

          {/* Export Dropdown */}
          <Dropdown
            align="right"
            width="w-48"
            trigger={
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                disabled={isExporting}
                className="h-7 text-xs font-medium"
              >
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            }
          >
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0] border-b border-[#E8E8E5] dark:border-[#353535]">
              Download Data
            </div>
            <DropdownItem onClick={() => handleExport('tasks')}>
              Export Tasks CSV
            </DropdownItem>
            <DropdownItem onClick={() => handleExport('projects')}>
              Export Projects CSV
            </DropdownItem>
            <DropdownItem onClick={() => handleExport('team')}>
              Export Team Workload CSV
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* 3. Compact Metric Summaries (Aggregated from MongoDB) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#777777] dark:text-[#A0A0A0]">Projects</span>
          <div className="text-lg font-bold font-mono text-[#252525] dark:text-[#F2F2F2]">{overview.totalProjects}</div>
          <span className="text-[10px] text-[#999999] dark:text-[#666666] font-mono block">Active repos</span>
        </div>

        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#777777] dark:text-[#A0A0A0]">Total Tasks</span>
          <div className="text-lg font-bold font-mono text-[#252525] dark:text-[#F2F2F2]">{overview.totalTasks}</div>
          <span className="text-[10px] text-[#999999] dark:text-[#666666] font-mono block">Tracked issues</span>
        </div>

        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#15803D] dark:text-[#34D399]">Completed</span>
          <div className="text-lg font-bold font-mono text-[#15803D] dark:text-[#34D399]">{overview.completedTasks}</div>
          <span className="text-[10px] text-[#777777] dark:text-[#A0A0A0] font-mono block">{overview.overallProgress}% of work</span>
        </div>

        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#4F46E5] dark:text-[#A5B4FC]">In Progress</span>
          <div className="text-lg font-bold font-mono text-[#252525] dark:text-[#F2F2F2]">{overview.inProgressTasks}</div>
          <span className="text-[10px] text-[#999999] dark:text-[#666666] font-mono block">In progress</span>
        </div>

        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#777777] dark:text-[#A0A0A0]">Pending</span>
          <div className="text-lg font-bold font-mono text-[#252525] dark:text-[#F2F2F2]">{overview.pendingTasks}</div>
          <span className="text-[10px] text-[#999999] dark:text-[#666666] font-mono block">To do queue</span>
        </div>

        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#DC2626] dark:text-[#F87171]">Overdue</span>
          <div className="text-lg font-bold font-mono text-[#DC2626] dark:text-[#F87171]">{overview.overdueTasks}</div>
          <span className="text-[10px] text-[#999999] dark:text-[#666666] font-mono block">Past due date</span>
        </div>

        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#0284C7] dark:text-[#38BDF8]">Sprints</span>
          <div className="text-lg font-bold font-mono text-[#252525] dark:text-[#F2F2F2]">{overview.activeSprints}</div>
          <span className="text-[10px] text-[#999999] dark:text-[#666666] font-mono block">{overview.completedSprints} closed</span>
        </div>

        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#252525] dark:text-[#F2F2F2]">Progress</span>
          <div className="text-lg font-bold font-mono text-[#252525] dark:text-[#F2F2F2]">{overview.overallProgress}%</div>
          <div className="w-full h-1.5 rounded-full bg-[#F1F1EF] dark:bg-[#2A2A2A] overflow-hidden mt-1">
            <div
              className="h-full bg-[#252525] dark:bg-[#F2F2F2] rounded-full"
              style={{ width: `${overview.overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Visual Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Project Completion Comparison */}
        <Card hoverable={false} className="p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E5] dark:border-[#353535]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0] my-0">
              Project Completion
            </h3>
            <span className="text-[10px] font-mono text-[#999999] dark:text-[#666666]">{projects.length} Repos</span>
          </div>
          <HorizontalBarChart items={projectComparisonData} emptyMessage="No projects recorded in this workspace" />
        </Card>

        {/* Status Distribution Donut */}
        <Card hoverable={false} className="p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E5] dark:border-[#353535]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0] my-0">
              Task Statuses
            </h3>
            <span className="text-[10px] font-mono text-[#999999] dark:text-[#666666]">{overview.totalTasks} Total</span>
          </div>
          <DonutChart data={statusData} totalLabel="Issues" />
        </Card>

        {/* Priority Breakdown Bar */}
        <Card hoverable={false} className="p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E5] dark:border-[#353535]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0] my-0">
              Priority Severity
            </h3>
            <span className="text-[10px] font-mono text-[#999999] dark:text-[#666666]">Distribution</span>
          </div>
          <div className="pt-2">
            <HorizontalBarChart items={priorityData} />
          </div>
        </Card>
      </div>

      {/* 5. Team Workload Distribution Table */}
      {analytics?.teamWorkload && analytics.teamWorkload.length > 0 && (
        <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E8E8E5] dark:border-[#353535]">
            <div>
              <h3 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
                Team Workload Distribution
              </h3>
              <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] mt-0.5">
                Active task allocation, resolution rates, and overdue burdens per teammate
              </p>
            </div>
            <Users className="w-4 h-4 text-[#777777] dark:text-[#A0A0A0]" />
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#E8E8E5] dark:border-[#353535]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#F7F7F5] dark:bg-[#1A1A1A] border-b border-[#E8E8E5] dark:border-[#353535] font-mono text-[10px] text-[#777777] dark:text-[#A0A0A0] uppercase">
                  <th className="py-2.5 px-3">Collaborator</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3 text-center">Assigned</th>
                  <th className="py-2.5 px-3 text-center">Completed</th>
                  <th className="py-2.5 px-3 text-center">In Progress</th>
                  <th className="py-2.5 px-3 text-center">Pending</th>
                  <th className="py-2.5 px-3 text-center">Overdue</th>
                  <th className="py-2.5 px-3 text-right">Workload Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E5] dark:divide-[#303030]">
                {analytics.teamWorkload.map((m) => (
                  <tr key={m.user._id} className="hover:bg-[#F9F9F8] dark:hover:bg-[#242424] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={m.user.name} src={m.user.avatar} size="xs" />
                        <div>
                          <span className="font-semibold text-[#252525] dark:text-[#F2F2F2] block">
                            {m.user.name}
                          </span>
                          <span className="text-[10px] text-[#777777] dark:text-[#A0A0A0] font-mono">
                            {m.user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] border border-[#E8E8E5] dark:border-[#353535]">
                        {m.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-[#252525] dark:text-[#F2F2F2]">
                      {m.assignedTasks}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#15803D] dark:text-[#34D399]">
                      {m.completedTasks}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#4F46E5] dark:text-[#A5B4FC]">
                      {m.inProgressTasks}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#777777] dark:text-[#A0A0A0]">
                      {m.pendingTasks}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {m.overdueTasks > 0 ? (
                        <span className="text-[#DC2626] dark:text-[#F87171] font-semibold">{m.overdueTasks}</span>
                      ) : (
                        <span className="text-[#999999] dark:text-[#666666]">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#777777] dark:text-[#A0A0A0]">
                      <div className="flex items-center justify-end gap-2">
                        <span>{m.workloadShare}%</span>
                        <div className="w-10 h-1.5 rounded-full bg-[#F1F1EF] dark:bg-[#2A2A2A] overflow-hidden">
                          <div
                            className="h-full bg-[#252525] dark:bg-[#F2F2F2] rounded-full"
                            style={{ width: `${m.workloadShare}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 6. Active Projects Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E5] dark:border-[#353535]">
          <div>
            <h2 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
              Workspace Projects
            </h2>
            <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] mt-0.5">
              Repositories and active boards under this workspace
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/workspace/${wsId}/projects`)}
            className="h-7 text-xs font-medium"
          >
            View All ({projects.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((proj) => (
            <ProjectCard key={proj.id} project={proj} />
          ))}
        </div>
      </div>

      {/* 7. Live Activity Feed */}
      <RecentActivityList activities={analytics?.recentActivity || activities} />
    </div>
  );
}

export default WorkspaceOverviewPage;
