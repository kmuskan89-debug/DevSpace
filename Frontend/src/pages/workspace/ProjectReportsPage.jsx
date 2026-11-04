import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Download,
  RotateCcw,
  Users,
  Clock,
  ArrowLeft,
  Loader2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import api from '../../utils/axios';
import useProject from '../../hooks/useProject';
import useWorkspace from '../../hooks/useWorkspace';
import ProjectHeader from '../../components/projects/ProjectHeader';
import ProjectNavTabs from '../../components/projects/ProjectNavTabs';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import {
  DonutChart,
  HorizontalBarChart,
  TrendLineChart,
  BurndownChart
} from '../../components/analytics/AnalyticsCharts';

export function ProjectReportsPage() {
  const navigate = useNavigate();
  const { workspaceId, projectId } = useParams();
  const { addToast } = useToast();
  const { project, tasks, sprints, isLoading: isLoadingProject } = useProject(projectId);
  const { workspace } = useWorkspace(workspaceId || project?.workspaceId);

  const [period, setPeriod] = useState('all');
  const [analytics, setAnalytics] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [selectedSprintId, setSelectedSprintId] = useState('');
  const [sprintReport, setSprintReport] = useState(null);
  const [isLoadingSprintReport, setIsLoadingSprintReport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch Project Analytics from backend
  const fetchProjectAnalytics = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingAnalytics(true);
    try {
      const res = await api.get(`/projects/${projectId}/analytics?period=${period}`);
      setAnalytics(res.data?.analytics || null);
    } catch (err) {
      console.error('Failed to load project analytics:', err);
      addToast(err.response?.data?.message || 'Failed to load project analytics', 'error');
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [projectId, period, addToast]);

  useEffect(() => {
    fetchProjectAnalytics();
  }, [fetchProjectAnalytics]);

  // Set default selected sprint if not explicitly chosen
  const activeSprintId = selectedSprintId || (sprints && sprints.length > 0 ? (sprints.find((s) => s.status === 'Active') || sprints[0])._id : '');

  // Fetch Detailed Sprint Report when activeSprintId changes
  useEffect(() => {
    if (!activeSprintId) {
      return;
    }

    let isSubscribed = true;
    const fetchSprintReport = async () => {
      setIsLoadingSprintReport(true);
      try {
        const res = await api.get(`/sprints/${activeSprintId}/report`);
        if (isSubscribed) {
          setSprintReport(res.data?.report || null);
        }
      } catch (err) {
        console.error('Failed to load sprint report:', err);
        if (isSubscribed) {
          setSprintReport(null);
        }
      } finally {
        if (isSubscribed) {
          setIsLoadingSprintReport(false);
        }
      }
    };

    fetchSprintReport();
    return () => {
      isSubscribed = false;
    };
  }, [activeSprintId]);

  // Handle CSV Export
  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const res = await api.get(`/projects/${projectId}/export`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${project?.key || 'project'}-issues-report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast('Project report exported as CSV!', 'success');
    } catch (err) {
      console.error('CSV export failed:', err);
      addToast('Failed to export report CSV', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoadingProject || (isLoadingAnalytics && !analytics)) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-6 h-6 text-[#777777] dark:text-[#A0A0A0] animate-spin" />
        <p className="text-xs font-mono text-[#777777] dark:text-[#A0A0A0]">
          Loading project analytics &amp; reports...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] text-center max-w-md mx-auto space-y-4 mt-8">
        <h3 className="text-base font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
          Project Not Found
        </h3>
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const overview = analytics?.overview || {
    totalTasks: tasks.length,
    completedTasks: 0,
    incompleteTasks: tasks.length,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionPercentage: 0
  };

  const statusData = [
    { label: 'Done', value: analytics?.distribution?.byStatus?.['Done'] || 0, color: '#15803D' },
    { label: 'In Progress', value: analytics?.distribution?.byStatus?.['In Progress'] || 0, color: '#4F46E5' },
    { label: 'Code Review', value: analytics?.distribution?.byStatus?.['Code Review'] || 0, color: '#0284C7' },
    { label: 'To Do', value: analytics?.distribution?.byStatus?.['To Do'] || 0, color: '#999999' }
  ];

  const priorityData = [
    { label: 'Highest', value: analytics?.distribution?.byPriority?.['Highest'] || 0, color: '#DC2626' },
    { label: 'High', value: analytics?.distribution?.byPriority?.['High'] || 0, color: '#EA580C' },
    { label: 'Medium', value: analytics?.distribution?.byPriority?.['Medium'] || 0, color: '#D97706' },
    { label: 'Low', value: analytics?.distribution?.byPriority?.['Low'] || 0, color: '#2563EB' },
    { label: 'Lowest', value: analytics?.distribution?.byPriority?.['Lowest'] || 0, color: '#64748B' }
  ];

  const typeData = [
    { label: 'Tasks', value: analytics?.distribution?.byType?.['Task'] || 0, color: '#252525' },
    { label: 'Bugs', value: analytics?.distribution?.byType?.['Bug'] || 0, color: '#DC2626' },
    { label: 'Stories', value: analytics?.distribution?.byType?.['Story'] || 0, color: '#15803D' },
    { label: 'Epics', value: analytics?.distribution?.byType?.['Epic'] || 0, color: '#7C3AED' }
  ];

  return (
    <div className="space-y-5 max-w-6xl">
      {/* 1. Project Header Banner */}
      <ProjectHeader project={project} />

      {/* 2. Project Navigation Tabs */}
      <ProjectNavTabs taskCount={overview.totalTasks} />

      {/* 3. Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020]">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#252525] dark:text-[#F2F2F2]" />
          <h2 className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
            Project Analytics &amp; Reports
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
            onClick={fetchProjectAnalytics}
            className="p-1.5 rounded-md border border-[#E8E8E5] dark:border-[#353535] text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
            title="Refresh analytics data"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
          </button>

          {/* Export CSV button */}
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCsv}
            disabled={isExporting}
            className="h-7 text-xs font-medium"
          >
            {isExporting ? 'Exporting...' : 'Export Issues CSV'}
          </Button>
        </div>
      </div>

      {/* 4. Compact Metric Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#777777] dark:text-[#A0A0A0]">Total Issues</span>
          <div className="text-lg font-bold font-mono text-[#252525] dark:text-[#F2F2F2]">{overview.totalTasks}</div>
          <span className="text-[10px] text-[#999999] dark:text-[#666666] font-mono block">100% scope</span>
        </div>

        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#15803D] dark:text-[#34D399]">Completed</span>
          <div className="text-lg font-bold font-mono text-[#15803D] dark:text-[#34D399]">{overview.completedTasks}</div>
          <span className="text-[10px] text-[#777777] dark:text-[#A0A0A0] font-mono block">{overview.completionPercentage}% done</span>
        </div>

        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#4F46E5] dark:text-[#A5B4FC]">In Progress</span>
          <div className="text-lg font-bold font-mono text-[#252525] dark:text-[#F2F2F2]">{overview.inProgressTasks}</div>
          <span className="text-[10px] text-[#999999] dark:text-[#666666] font-mono block">Active work</span>
        </div>

        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#777777] dark:text-[#A0A0A0]">Incomplete</span>
          <div className="text-lg font-bold font-mono text-[#252525] dark:text-[#F2F2F2]">{overview.incompleteTasks}</div>
          <span className="text-[10px] text-[#999999] dark:text-[#666666] font-mono block">Remaining</span>
        </div>

        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#DC2626] dark:text-[#F87171]">Overdue</span>
          <div className="text-lg font-bold font-mono text-[#DC2626] dark:text-[#F87171]">{overview.overdueTasks}</div>
          <span className="text-[10px] text-[#999999] dark:text-[#666666] font-mono block">Past due date</span>
        </div>

        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#252525] dark:text-[#F2F2F2]">Progress</span>
          <div className="text-lg font-bold font-mono text-[#252525] dark:text-[#F2F2F2]">{overview.completionPercentage}%</div>
          <div className="w-full h-1.5 rounded-full bg-[#F1F1EF] dark:bg-[#2A2A2A] overflow-hidden mt-1">
            <div
              className="h-full bg-[#252525] dark:bg-[#F2F2F2] rounded-full"
              style={{ width: `${overview.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Distribution Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status Distribution */}
        <Card hoverable={false} className="p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E5] dark:border-[#353535]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0] my-0">
              Status Distribution
            </h3>
            <span className="text-[10px] font-mono text-[#999999] dark:text-[#666666]">{overview.totalTasks} Total</span>
          </div>
          <DonutChart data={statusData} totalLabel="Issues" />
        </Card>

        {/* Priority Breakdown */}
        <Card hoverable={false} className="p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E5] dark:border-[#353535]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0] my-0">
              Priority Severity
            </h3>
            <span className="text-[10px] font-mono text-[#999999] dark:text-[#666666]">By Severity</span>
          </div>
          <div className="pt-2">
            <HorizontalBarChart items={priorityData} />
          </div>
        </Card>

        {/* Issue Types */}
        <Card hoverable={false} className="p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E5] dark:border-[#353535]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0] my-0">
              Issue Classification
            </h3>
            <span className="text-[10px] font-mono text-[#999999] dark:text-[#666666]">Types</span>
          </div>
          <DonutChart data={typeData} totalLabel="Types" />
        </Card>
      </div>

      {/* 6. 14-Day Velocity & Completion Trend */}
      <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-3">
        <TrendLineChart data={analytics?.completionTrend || []} />
      </Card>

      {/* 7. Dedicated Sprint Reports & Burndown Chart */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E8E5] dark:border-[#353535]">
          <div>
            <h3 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
              Sprint Report &amp; Burndown
            </h3>
            <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] mt-0.5">
              Sprint commitment analysis, completed story points, and actual burndown curves
            </p>
          </div>

          {sprints && sprints.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#777777] dark:text-[#A0A0A0] font-mono">Sprint:</span>
              <select
                value={activeSprintId}
                onChange={(e) => setSelectedSprintId(e.target.value)}
                className="bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] rounded-md px-2.5 py-1 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2] cursor-pointer font-medium"
              >
                {sprints.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {isLoadingSprintReport ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-5 h-5 text-[#777777] dark:text-[#A0A0A0] animate-spin" />
            <p className="text-xs font-mono text-[#777777] dark:text-[#A0A0A0]">
              Loading sprint metrics &amp; burndown...
            </p>
          </div>
        ) : sprintReport ? (
          <div className="space-y-3">
            {/* Sprint Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#777777] dark:text-[#A0A0A0]">Original Commitment</span>
                <div className="text-base font-bold font-mono text-[#252525] dark:text-[#F2F2F2]">
                  {sprintReport.commitment.originalStoryPoints} pts
                </div>
                <span className="text-[10px] text-[#999999] dark:text-[#666666] font-mono block">
                  {sprintReport.commitment.originalIssues} committed issues
                </span>
              </div>

              <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#4F46E5] dark:text-[#A5B4FC]">Current Scope</span>
                <div className="text-base font-bold font-mono text-[#252525] dark:text-[#F2F2F2]">
                  {sprintReport.commitment.currentStoryPoints} pts
                </div>
                <span className="text-[10px] text-[#999999] dark:text-[#666666] font-mono block">
                  {sprintReport.commitment.currentIssues} total issues
                </span>
              </div>

              <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#15803D] dark:text-[#34D399]">Completed Work</span>
                <div className="text-base font-bold font-mono text-[#15803D] dark:text-[#34D399]">
                  {sprintReport.commitment.completedStoryPoints} pts
                </div>
                <span className="text-[10px] text-[#777777] dark:text-[#A0A0A0] font-mono block">
                  {sprintReport.commitment.completedIssues} issues done
                </span>
              </div>

              <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#D97706] dark:text-[#FBBF24]">Remaining Work</span>
                <div className="text-base font-bold font-mono text-[#D97706] dark:text-[#FBBF24]">
                  {sprintReport.commitment.remainingStoryPoints} pts
                </div>
                <span className="text-[10px] text-[#999999] dark:text-[#666666] font-mono block">
                  {sprintReport.commitment.incompleteIssues} issues open
                </span>
              </div>
            </div>

            {/* Burndown Chart Card */}
            <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020]">
              <BurndownChart burndown={sprintReport.burndown} />
            </Card>

            {/* Sprint Issues List */}
            {sprintReport.issues && sprintReport.issues.length > 0 && (
              <Card hoverable={false} className="p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E5] dark:border-[#353535]">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0] my-0">
                    Sprint Issues ({sprintReport.issues.length})
                  </h4>
                  <span className="text-[10px] font-mono text-[#777777] dark:text-[#A0A0A0]">
                    {sprintReport.commitment.completionPercentage}% Resolved
                  </span>
                </div>

                <div className="divide-y divide-[#E8E8E5] dark:divide-[#303030] max-h-72 overflow-y-auto">
                  {sprintReport.issues.map((issue) => (
                    <div key={issue.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] border border-[#E8E8E5] dark:border-[#353535] font-semibold shrink-0">
                          {issue.issueKey}
                        </span>
                        <span className="truncate text-[#252525] dark:text-[#F2F2F2] font-medium">
                          {issue.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {issue.storyPoints !== null && issue.storyPoints !== undefined && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#F7F7F5] dark:bg-[#1A1A1A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]">
                            {issue.storyPoints} pts
                          </span>
                        )}
                        <Badge priority={issue.priority} size="sm" />
                        <span className={`px-2 py-0.2 rounded text-[10px] font-mono ${
                          issue.status === 'Done'
                            ? 'bg-[#EDF8F1] dark:bg-[#16281E] text-[#15803D] dark:text-[#34D399] border border-[#D3EEDB] dark:border-[rgba(52,211,153,0.2)]'
                            : 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]'
                        }`}>
                          {issue.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-[#E8E8E5] dark:border-[#353535] rounded-lg space-y-1.5">
            <Clock className="w-6 h-6 text-[#999999] dark:text-[#666666] mx-auto" />
            <h5 className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">No Sprints Found</h5>
            <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0]">
              Create a sprint in the Backlog view to generate sprint reporting.
            </p>
          </div>
        )}
      </div>

      {/* 8. Team Workload Breakdown within Project */}
      {analytics?.assigneeDistribution && analytics.assigneeDistribution.length > 0 && (
        <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E5] dark:border-[#353535]">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0] my-0">
                Project Assignee Workload
              </h3>
              <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] mt-0.5">
                Distribution of assigned tasks and resolution statuses among project members
              </p>
            </div>
            <Users className="w-4 h-4 text-[#777777] dark:text-[#A0A0A0]" />
          </div>

          <div className="divide-y divide-[#E8E8E5] dark:divide-[#303030]">
            {analytics.assigneeDistribution.map((member) => (
              <div key={member.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={member.name} src={member.avatar} size="xs" />
                  <div className="truncate">
                    <span className="font-semibold text-[#252525] dark:text-[#F2F2F2] block truncate">
                      {member.name}
                    </span>
                    <span className="text-[10px] text-[#777777] dark:text-[#A0A0A0] font-mono">
                      {member.total} tasks ({member.share}% of project)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] shrink-0">
                  <span className="text-[#15803D] dark:text-[#34D399]" title="Completed Tasks">
                    ✓ {member.completed}
                  </span>
                  <span className="text-[#4F46E5] dark:text-[#A5B4FC]" title="In Progress Tasks">
                    ⚡ {member.inProgress}
                  </span>
                  <span className="text-[#777777] dark:text-[#A0A0A0]" title="Pending Tasks">
                    ⏳ {member.pending}
                  </span>
                  {member.overdue > 0 && (
                    <span className="text-[#DC2626] dark:text-[#F87171] font-semibold" title="Overdue Tasks">
                      ! {member.overdue}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default ProjectReportsPage;
