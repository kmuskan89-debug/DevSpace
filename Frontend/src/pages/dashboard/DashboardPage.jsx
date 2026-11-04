import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  Kanban,
  CheckCircle2,
  FolderPlus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import StatsOverview from '../../components/dashboard/StatsOverview';
import RecentActivityList from '../../components/dashboard/RecentActivityList';
import TaskModal from '../../components/projects/TaskModal';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import api from '../../utils/axios';
import { normalizeProject, normalizeTask } from '../../utils/normalizers';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { allWorkspaces, isLoadingWorkspaces, openCreateModal } = useWorkspace();
  const { addToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [activities, setActivities] = useState([]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeTaskTab, setActiveTaskTab] = useState('mine'); // 'mine' | 'all'

  const primaryWs = allWorkspaces && allWorkspaces.length > 0 ? (allWorkspaces[0]._id || allWorkspaces[0].id) : null;
  const currentWorkspace = allWorkspaces && allWorkspaces.length > 0 ? allWorkspaces[0] : null;

  // Contextual Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/projects');
        const raw = res.data?.projects || [];
        const normalized = raw.map((p) => normalizeProject(p));
        if (isMounted) {
          setProjects(normalized);
        }
      } catch (err) {
        console.warn('Failed to load dashboard projects:', err);
      } finally {
        if (isMounted) setIsLoadingProjects(false);
      }

      if (primaryWs) {
        // Fetch workspace activities
        try {
          const actRes = await api.get(`/workspaces/${primaryWs}/activity?limit=10`);
          if (isMounted) {
            setActivities(actRes.data?.activities || []);
          }
        } catch (err) {
          console.warn('Failed to load dashboard activities:', err);
        }

        // Fetch workspace tasks
        try {
          const tasksRes = await api.get('/tasks', {
            params: { workspaceId: primaryWs, limit: 50 }
          });
          const rawTasks = tasksRes.data?.tasks || [];
          const normalizedTasks = rawTasks.map((t) => normalizeTask(t));
          if (isMounted) {
            setTasks(normalizedTasks);
          }
        } catch (err) {
          console.warn('Failed to load workspace tasks:', err?.response?.data?.message || err.message);
        } finally {
          if (isMounted) setIsLoadingTasks(false);
        }
      } else {
        if (isMounted) {
          setIsLoadingTasks(false);
        }
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [primaryWs]);

  // Tasks assigned to current user
  const myTasks = useMemo(() => {
    return tasks.filter((t) => {
      const assigneeId = t.assignee?.id || t.assignee?._id || (typeof t.assignee === 'string' ? t.assignee : null);
      const assigneeName = t.assignee?.name || (typeof t.assignee === 'string' ? t.assignee : null);
      return (
        (user?.id && assigneeId === user.id) ||
        (user?._id && assigneeId === user._id) ||
        (user?.name && assigneeName === user.name)
      );
    });
  }, [tasks, user]);

  // Metric counts
  const totalTasksCount = tasks.length;
  const inProgressCount = tasks.filter(
    (t) => String(t.status).toLowerCase() === 'in progress' || String(t.status).toLowerCase() === 'in-progress'
  ).length;
  const completedTasksCount = tasks.filter(
    (t) => String(t.status).toLowerCase() === 'done' || String(t.status).toLowerCase() === 'completed'
  ).length;
  const overallProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const displayedTasks = activeTaskTab === 'mine' ? myTasks : tasks;

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (savedTask) => {
    const norm = normalizeTask(savedTask);
    const existingIndex = tasks.findIndex((t) => (t.id || t._id) === (norm.id || norm._id));
    if (existingIndex >= 0) {
      setTasks(tasks.map((t) => ((t.id || t._id) === (norm.id || norm._id) ? norm : t)));
      addToast(`Task "${norm.title}" updated`, 'success');
    } else {
      setTasks([norm, ...tasks]);
      addToast(`Task "${norm.title}" created`, 'success');
    }
    setIsTaskModalOpen(false);
  };

  const handleCreateNewTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. GREETING & WORKSPACE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E8E5] dark:border-[#353535]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252525] dark:text-[#F2F2F2] my-0">
              {greeting}, {user?.name?.split(' ')[0] || 'Developer'}
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]">
              <Sparkles className="w-2.5 h-2.5 text-[#252525] dark:text-[#F2F2F2]" />
              <span>{currentWorkspace?.name || 'Workspace'}</span>
            </span>
          </div>
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0]">
            You have <strong className="text-[#252525] dark:text-[#F2F2F2] font-semibold">{myTasks.length} assigned task{myTasks.length === 1 ? '' : 's'}</strong> and{' '}
            <strong className="text-[#252525] dark:text-[#F2F2F2] font-semibold">{projects.length} project{projects.length === 1 ? '' : 's'}</strong> active across this workspace.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => {
              if (primaryWs) {
                navigate(`/workspace/${primaryWs}/projects`);
              } else {
                openCreateModal();
              }
            }}
          >
            New Project
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleCreateNewTask}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* 2. COMPACT NOTION OVERVIEW METRICS */}
      <StatsOverview
        projectsCount={projects.length}
        tasksCount={totalTasksCount}
        inProgressCount={inProgressCount}
        completedCount={completedTasksCount}
      />

      {/* 3. WORKSPACE VELOCITY & PROGRESS BANNER */}
      {totalTasksCount > 0 && (
        <Card hoverable={false} className="p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2]">
                  Workspace Sprint Velocity
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] border border-[#E8E8E5] dark:border-[#353535]">
                  {overallProgress}% Done
                </span>
              </div>
              <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0]">
                {completedTasksCount} of {totalTasksCount} issues completed · {inProgressCount} in progress
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-64">
              <div className="flex-1 h-2 rounded-full bg-[#F1F1EF] dark:bg-[#2A2A2A] overflow-hidden border border-[#E8E8E5] dark:border-[#353535]">
                <div
                  className="h-full bg-[#252525] dark:bg-[#F2F2F2] rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={Kanban}
                onClick={() => {
                  if (projects.length > 0 && primaryWs) {
                    navigate(`/workspace/${primaryWs}/projects/${projects[0].id || projects[0]._id}/board`);
                  } else if (primaryWs) {
                    navigate(`/workspace/${primaryWs}/projects`);
                  }
                }}
                className="shrink-0 text-xs h-7"
              >
                Board
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 4. MAIN CONTENT GRID: MY TASKS (LEFT 7 COLS) & RECENT PROJECTS (RIGHT 5 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tasks Section */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E5] dark:border-[#353535]">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
                Tasks
              </h2>
              {/* Tab Selector: Mine vs All */}
              <div className="inline-flex items-center p-0.5 rounded-md bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535]">
                <button
                  type="button"
                  onClick={() => setActiveTaskTab('mine')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    activeTaskTab === 'mine'
                      ? 'bg-[#FFFFFF] dark:bg-[#202020] text-[#252525] dark:text-[#F2F2F2] shadow-2xs font-semibold'
                      : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
                  }`}
                >
                  Assigned to me ({myTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTaskTab('all')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    activeTaskTab === 'all'
                      ? 'bg-[#FFFFFF] dark:bg-[#202020] text-[#252525] dark:text-[#F2F2F2] shadow-2xs font-semibold'
                      : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
                  }`}
                >
                  All ({totalTasksCount})
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateNewTask}
              className="text-xs text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors cursor-pointer font-medium"
            >
              + Add Task
            </button>
          </div>

          {isLoadingTasks ? (
            <div className="space-y-2">
              <SkeletonLoader variant="table-row" count={4} />
            </div>
          ) : displayedTasks.length > 0 ? (
            <div className="rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] divide-y divide-[#E8E8E5] dark:divide-[#353535] overflow-hidden">
              {displayedTasks.slice(0, 8).map((task) => (
                <div
                  key={task.id || task._id}
                  onClick={() => handleTaskClick(task)}
                  className="flex items-center justify-between p-3 hover:bg-[#F9F9F8] dark:hover:bg-[#262626] transition-colors cursor-pointer gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535] shrink-0">
                      {task.issueKey || 'DEV'}
                    </span>
                    <span className="text-xs font-medium text-[#252525] dark:text-[#F2F2F2] truncate group-hover:underline">
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge priority={task.priority} size="sm" />
                    <Badge status={task.status} size="sm" />
                    {task.assignee && (
                      <Avatar
                        src={task.assignee.avatar}
                        name={task.assignee.name || 'User'}
                        size="xs"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title={activeTaskTab === 'mine' ? 'No tasks assigned to you' : 'No workspace tasks'}
              description={
                activeTaskTab === 'mine'
                  ? "You're all caught up! You can browse all tasks or create a new one."
                  : 'Start by creating your first task in this workspace.'
              }
              actionLabel="Create Task"
              onAction={handleCreateNewTask}
              className="py-8"
            />
          )}
        </div>

        {/* Recent Projects Section */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E5] dark:border-[#353535]">
            <h2 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
              Projects ({projects.length})
            </h2>
            {primaryWs && (
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowRight}
                onClick={() => navigate(`/workspace/${primaryWs}/projects`)}
                className="text-xs h-7"
              >
                View all
              </Button>
            )}
          </div>

          {isLoadingProjects ? (
            <div className="space-y-2">
              <SkeletonLoader variant="card" count={3} />
            </div>
          ) : projects.length > 0 ? (
            <div className="space-y-2">
              {projects.slice(0, 4).map((proj) => (
                <div
                  key={proj.id || proj._id}
                  onClick={() => {
                    const wsId = proj.workspaceId || primaryWs;
                    navigate(`/workspace/${wsId}/projects/${proj.id || proj._id}/board`);
                  }}
                  className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] hover:border-[#252525] dark:hover:border-[#777777] transition-colors cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] flex items-center justify-center font-bold text-[10px] shrink-0">
                        {proj.key ? proj.key.slice(0, 3) : 'PRJ'}
                      </div>
                      <span className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] truncate group-hover:underline">
                        {proj.name}
                      </span>
                    </div>
                    <Badge status={proj.status} size="sm" />
                  </div>

                  {proj.description && (
                    <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] line-clamp-1">
                      {proj.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[#999999] dark:text-[#777777] pt-1">
                    <span>{proj.completedTasksCount || 0} / {proj.totalTasksCount || 0} completed</span>
                    <span className="font-mono">{proj.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-[#F1F1EF] dark:bg-[#2A2A2A] overflow-hidden">
                    <div
                      className="h-full bg-[#252525] dark:bg-[#F2F2F2] rounded-full transition-all duration-300"
                      style={{ width: `${proj.progress || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FolderGit2}
              title="No projects yet"
              description="Create a project to organize sprints, backlogs, and tasks."
              actionLabel="Create Project"
              onAction={() => {
                if (primaryWs) {
                  navigate(`/workspace/${primaryWs}/projects`);
                } else {
                  openCreateModal();
                }
              }}
              className="py-8"
            />
          )}
        </div>
      </div>

      {/* 5. WORKSPACE ACTIVITY STREAM */}
      <RecentActivityList activities={activities} />

      {/* 6. ALL WORKSPACES GRID IF MULTIPLE EXIST */}
      {allWorkspaces && allWorkspaces.length > 1 && (
        <div className="space-y-3 pt-2 border-t border-[#E8E8E5] dark:border-[#353535]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
                All Workspaces ({allWorkspaces.length})
              </h2>
              <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] mt-0.5">
                Switch workspaces to access other teams and projects
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={FolderPlus}
              onClick={openCreateModal}
              className="text-xs h-7"
            >
              Add Workspace
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allWorkspaces.map((ws) => (
              <div
                key={ws.id || ws._id}
                onClick={() => navigate(`/workspace/${ws.id || ws._id}`)}
                className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] hover:border-[#252525] dark:hover:border-[#777777] transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-md bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] flex items-center justify-center font-bold text-xs shrink-0">
                    {ws.name ? ws.name.charAt(0).toUpperCase() : 'W'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] truncate my-0">
                      {ws.name}
                    </p>
                    <p className="text-[10px] text-[#777777] dark:text-[#A0A0A0] truncate">
                      {ws.projectCount || 0} projects · {ws.memberCount || 1} members
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#999999] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Task Inspection / Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        onSave={handleSaveTask}
      />
    </div>
  );
}

export default DashboardPage;
