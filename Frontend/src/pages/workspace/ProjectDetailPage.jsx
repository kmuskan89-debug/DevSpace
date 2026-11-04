import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Kanban,
  Users,
  AlertCircle,
  TrendingUp,
  CheckSquare,
  Clock,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import useProject from '../../hooks/useProject';
import useWorkspace from '../../hooks/useWorkspace';
import ProjectHeader from '../../components/projects/ProjectHeader';
import ProjectNavTabs from '../../components/projects/ProjectNavTabs';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import TaskModal from '../../components/projects/TaskModal';
import RecentActivityList from '../../components/dashboard/RecentActivityList';
import { useToast } from '../../components/common/Toast';

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const { workspaceId, projectId: _paramProjectId } = useParams();
  const { addToast } = useToast();
  const { project, tasks, stats, isLoading, error, createTask } = useProject();
  const { members, activities } = useWorkspace(workspaceId || project?.workspaceId);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleCreateTask = async (newTask) => {
    try {
      const created = await createTask(newTask);
      addToast(`Created task "${created.title}" [${created.issueKey || created.id}]`, 'success');
      setIsTaskModalOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
      addToast(err.response?.data?.message || err.message || 'Failed to create task', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader variant="card" count={3} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] text-center max-w-md mx-auto space-y-3 mt-8">
        <AlertCircle className="w-8 h-8 text-[#D83B01] dark:text-[#F87171] mx-auto" />
        <div>
          <h3 className="text-base font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">Project Not Found</h3>
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-1">
            {error || 'The requested project could not be found or you lack permission to view it.'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate(`/workspace/${workspaceId || 'current'}/projects`)}
        >
          Back to Projects
        </Button>
      </div>
    );
  }

  const projectMembers = members && members.length > 0 ? members.slice(0, 6) : [];

  return (
    <div className="space-y-5">
      {/* 1. PROJECT HEADER */}
      <ProjectHeader project={project} onAddTask={() => setIsTaskModalOpen(true)} />

      {/* 2. PROJECT NAVIGATION TABS */}
      <ProjectNavTabs taskCount={tasks.length} />

      {/* 3. METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Progress Card */}
        <Card hoverable={false} className="p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">Completion Rate</p>
              <h4 className="text-2xl font-bold text-[#252525] dark:text-[#F2F2F2] mt-1 tracking-tight">{project.progress}%</h4>
              <p className="text-[11px] text-[#999999] dark:text-[#777777] mt-1 font-mono">
                {stats.completedTasks} of {stats.totalTasks} issues done
              </p>
            </div>
            <div className="w-7 h-7 rounded-md bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </Card>

        {/* Total Tasks Card */}
        <Card hoverable={false} className="p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">Total Issues</p>
              <h4 className="text-2xl font-bold text-[#252525] dark:text-[#F2F2F2] mt-1 tracking-tight">{stats.totalTasks}</h4>
              <p className="text-[11px] text-[#999999] dark:text-[#777777] mt-1">Across sprint and backlog</p>
            </div>
            <div className="w-7 h-7 rounded-md bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] flex items-center justify-center shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
        </Card>

        {/* Open Tasks Card */}
        <Card hoverable={false} className="p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">Open / In Progress</p>
              <h4 className="text-2xl font-bold text-[#252525] dark:text-[#F2F2F2] mt-1 tracking-tight">{stats.openTasks}</h4>
              <p className="text-[11px] text-[#999999] dark:text-[#777777] mt-1">Requiring resolution</p>
            </div>
            <div className="w-7 h-7 rounded-md bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </Card>

        {/* Status Card */}
        <Card hoverable={false} className="p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">Project State</p>
              <h4 className="text-2xl font-bold text-[#252525] dark:text-[#F2F2F2] mt-1 tracking-tight">{project.status}</h4>
              <p className="text-[11px] text-[#999999] dark:text-[#777777] mt-1 font-mono">Key: {project.key}</p>
            </div>
            <div className="w-7 h-7 rounded-md bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </Card>
      </div>

      {/* 4. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Active Issues List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E5] dark:border-[#353535]">
            <h2 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
              Active Issues ({tasks.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              icon={Kanban}
              onClick={() => navigate(`/workspace/${workspaceId}/projects/${project.id || project._id}/board`)}
              className="text-xs h-7"
            >
              Open Board
            </Button>
          </div>

          {tasks.length > 0 ? (
            <div className="rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] divide-y divide-[#E8E8E5] dark:divide-[#353535] overflow-hidden">
              {tasks.slice(0, 8).map((t) => (
                <div
                  key={t.id || t._id}
                  onClick={() => navigate(`/workspace/${workspaceId}/projects/${project.id || project._id}/board`)}
                  className="flex items-center justify-between p-3 hover:bg-[#F9F9F8] dark:hover:bg-[#262626] transition-colors cursor-pointer gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535] shrink-0">
                      {t.issueKey || t.id}
                    </span>
                    <div className="truncate">
                      <span className="text-xs font-medium text-[#252525] dark:text-[#F2F2F2] truncate group-hover:underline">
                        {t.title}
                      </span>
                      {t.branch && (
                        <p className="text-[10px] font-mono text-[#999999] dark:text-[#777777] truncate mt-0.5">
                          {t.branch}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge status={t.status} size="sm" />
                    <Badge priority={t.priority} size="sm" />
                    {t.assignee && (
                      <Avatar src={t.assignee?.avatar} name={t.assignee?.name} size="xs" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckSquare}
              title="No issues found"
              description="Create a task or issue to begin tracking work for this project."
              actionLabel="Create Task"
              onAction={() => setIsTaskModalOpen(true)}
              className="py-8"
            />
          )}
        </div>

        {/* Right 5 Columns: Project Members & Activity */}
        <div className="lg:col-span-5 space-y-5">
          {/* Members Card */}
          <Card hoverable={false} className="p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] rounded-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E5] dark:border-[#353535]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#777777] dark:text-[#A0A0A0]" />
                <h3 className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
                  Workspace Team ({members.length})
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              {projectMembers.map((m) => (
                <div
                  key={m.id || m._id}
                  className="flex items-center justify-between p-2 rounded-md bg-[#FAFAF9] dark:bg-[#1E1E1E] border border-[#E8E8E5] dark:border-[#353535]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Avatar src={m.avatar} name={m.name} size="xs" />
                    <div className="truncate">
                      <p className="text-xs font-medium text-[#252525] dark:text-[#F2F2F2] my-0 truncate">{m.name}</p>
                      <p className="text-[10px] text-[#777777] dark:text-[#A0A0A0] font-mono truncate">{m.role}</p>
                    </div>
                  </div>
                  {m.name === project.lead && (
                    <span className="text-[10px] font-mono text-[#252525] dark:text-[#F2F2F2] bg-[#F1F1EF] dark:bg-[#2A2A2A] px-1.5 py-0.2 rounded border border-[#E8E8E5] dark:border-[#353535] shrink-0 font-semibold">
                      Lead
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Activity Stream */}
          <RecentActivityList activities={activities.slice(0, 5)} />
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleCreateTask}
        members={members}
      />
    </div>
  );
}

export default ProjectDetailPage;
