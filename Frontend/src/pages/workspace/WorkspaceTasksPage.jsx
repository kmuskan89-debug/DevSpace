import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Search,
  Calendar,
  FolderGit2,
  AlertCircle,
  RefreshCw,
  LayoutGrid,
  LayoutList,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import useWorkspace from '../../hooks/useWorkspace';
import { normalizeTask } from '../../utils/normalizers';
import TaskModal from '../../components/projects/TaskModal';
import KanbanBoard from '../../components/projects/KanbanBoard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useToast } from '../../components/common/Toast';

const STATUS_GROUPS = [
  { id: 'To Do', label: 'To Do', color: 'border-l-slate-400 dark:border-l-slate-500' },
  { id: 'In Progress', label: 'In Progress', color: 'border-l-blue-500' },
  { id: 'In Review', label: 'In Review', color: 'border-l-amber-500' },
  { id: 'Done', label: 'Done', color: 'border-l-emerald-500' }
];

export function WorkspaceTasksPage() {
  const navigate = useNavigate();
  const { workspaceId: paramWsId } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const addToastRef = useRef(addToast);
  addToastRef.current = addToast;

  const {
    workspace,
    members,
    projects
  } = useWorkspace(paramWsId);

  const currentUserId = user?._id || user?.id;
  const effectiveWsId = paramWsId || workspace?.id || workspace?._id;

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 100,
    totalPages: 1,
    hasNextPage: false
  });

  // Filters & View state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' | 'board'

  // Collapsible status groups
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch tasks assigned to the current user in this workspace
  const fetchMyTasks = useCallback(async (pageToFetch = 1) => {
    if (!effectiveWsId || !currentUserId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    if (pageToFetch === 1) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await api.get('/tasks', {
        params: {
          workspaceId: effectiveWsId,
          assignee: currentUserId,
          page: pageToFetch,
          limit: 100
        }
      });

      const rawTasks = response.data?.tasks || [];
      const normalized = rawTasks.map((t) => normalizeTask(t, '', effectiveWsId));
      const meta = response.data?.pagination || {
        total: response.data?.total ?? rawTasks.length,
        page: pageToFetch,
        limit: 100,
        totalPages: Math.ceil((response.data?.total ?? rawTasks.length) / 100) || 1,
        hasNextPage: false
      };

      if (pageToFetch === 1) {
        setTasks(normalized);
      } else {
        setTasks((prev) => {
          const seen = new Set(prev.map((t) => t._id || t.id));
          const uniqueNew = normalized.filter((t) => !seen.has(t._id || t.id));
          return [...prev, ...uniqueNew];
        });
      }

      setPagination(meta);
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || 'Failed to load assigned tasks';
      console.error('Failed to fetch user tasks in workspace:', errMsg);
      if (pageToFetch === 1) {
        setError(errMsg);
        setTasks([]);
      } else {
        addToastRef.current?.(errMsg, 'error');
      }
    } finally {
      if (pageToFetch === 1) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [effectiveWsId, currentUserId]);

  // Load next page
  const handleLoadMore = async () => {
    if (isLoadingMore || !pagination.hasNextPage) return;
    setIsLoadingMore(true);
    await fetchMyTasks(pagination.page + 1);
  };

  useEffect(() => {
    fetchMyTasks(1);
  }, [fetchMyTasks]);

  // Toggle group collapse
  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Helper to map task status into one of the 4 standard buckets
  const mapStatusToBucket = (status) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'done' || s === 'completed') return 'Done';
    if (s === 'in review' || s === 'code review' || s === 'review') return 'In Review';
    if (s === 'in progress' || s === 'in-progress') return 'In Progress';
    return 'To Do';
  };

  // Filter tasks based on search, status, priority, and project
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      const searchLower = search.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        (task.title || '').toLowerCase().includes(searchLower) ||
        (task.issueKey || '').toLowerCase().includes(searchLower) ||
        (task.description || '').toLowerCase().includes(searchLower) ||
        (task.project?.name || '').toLowerCase().includes(searchLower);

      // Status
      const taskBucket = mapStatusToBucket(task.rawStatus || task.status);
      const matchesStatus =
        statusFilter === 'all' ||
        taskBucket.toLowerCase() === statusFilter.toLowerCase() ||
        (task.status || '').toLowerCase() === statusFilter.toLowerCase();

      // Priority
      const matchesPriority =
        priorityFilter === 'all' ||
        (task.priority || '').toLowerCase() === priorityFilter.toLowerCase();

      // Project
      const taskProjId = task.projectId || task.project?._id || task.project?.id;
      const matchesProject =
        projectFilter === 'all' ||
        taskProjId === projectFilter ||
        task.project?.key === projectFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });
  }, [tasks, search, statusFilter, priorityFilter, projectFilter]);

  // Group tasks by status bucket
  const groupedTasks = useMemo(() => {
    const groups = {
      'To Do': [],
      'In Progress': [],
      'In Review': [],
      'Done': []
    };

    filteredTasks.forEach((task) => {
      const bucket = mapStatusToBucket(task.rawStatus || task.status);
      if (groups[bucket]) {
        groups[bucket].push(task);
      } else {
        groups['To Do'].push(task);
      }
    });

    return groups;
  }, [filteredTasks]);

  // Open task detail/modal
  const handleOpenTask = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Save task updates
  const handleSaveTask = async (taskData) => {
    try {
      const taskId = selectedTask?._id || selectedTask?.id || taskData._id || taskData.id;
      if (taskId) {
        const res = await api.put(`/tasks/${taskId}`, taskData);
        addToast(`Task "${taskData.title}" updated`, 'success');
        setIsTaskModalOpen(false);
        const updatedTask = res.data?.task || res.data || taskData;
        const normalized = normalizeTask(updatedTask, '', effectiveWsId);
        setTasks((prev) =>
          prev.map((t) => ((t.id || t._id) === taskId ? { ...t, ...normalized } : t))
        );
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      addToast(err?.response?.data?.message || err.message || 'Failed to save task', 'error');
    }
  };

  // Move task status (for Kanban drag or status changer)
  const handleMoveTask = async (taskId, newStatus) => {
    // Optimistically update local tasks state immediately
    setTasks((prev) =>
      prev.map((t) => {
        if ((t.id || t._id || t.issueKey) === taskId) {
          return {
            ...t,
            rawStatus: newStatus,
            status: newStatus
          };
        }
        return t;
      })
    );

    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      addToast(`Task status updated to ${newStatus}`, 'info');
    } catch (err) {
      console.error('Failed to move task status:', err);
      addToast(err?.response?.data?.message || err.message || 'Failed to update status', 'error');
      // Rollback on error
      fetchMyTasks();
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      addToast('Task deleted successfully', 'info');
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      setTasks((prev) => prev.filter((t) => (t.id || t._id || t.issueKey) !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
      addToast(err?.response?.data?.message || err.message || 'Failed to delete task', 'error');
    }
  };

  // 1. Loading State
  if (isLoading && tasks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] animate-pulse h-20" />
        <SkeletonLoader variant="card" count={3} />
      </div>
    );
  }

  // 2. Error State
  if (error && tasks.length === 0) {
    return (
      <div className="p-8 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] text-center max-w-md mx-auto space-y-3 my-8">
        <AlertCircle className="w-8 h-8 text-[#D83B01] dark:text-[#F87171] mx-auto" />
        <div>
          <h3 className="text-base font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
            Failed to load assigned tasks
          </h3>
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-1">
            {error}
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchMyTasks}>
            Retry
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/workspace/${effectiveWsId}/projects`)}
          >
            Go to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-md bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-[#252525] dark:text-[#F2F2F2] my-0 truncate">
                My Tasks
              </h2>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-[#777777] dark:text-[#A0A0A0] bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] shrink-0 font-bold">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] truncate mt-0.5">
              All tasks and issues assigned to you across projects in this workspace.
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Refresh Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center rounded-md border border-[#E8E8E5] dark:border-[#353535] p-0.5 bg-[#F7F7F5] dark:bg-[#2A2A2A]">
            <button
              type="button"
              onClick={() => setViewMode('grouped')}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'grouped'
                  ? 'bg-[#FFFFFF] dark:bg-[#1E1E1E] text-[#252525] dark:text-[#F2F2F2] font-semibold shadow-2xs'
                  : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
              }`}
              title="Grouped Status List"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-[#FFFFFF] dark:bg-[#1E1E1E] text-[#252525] dark:text-[#F2F2F2] font-semibold shadow-2xs'
                  : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchMyTasks}
            title="Refresh assigned tasks"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Filters Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020]">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999999]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search my tasks..."
              className="w-full bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] placeholder-[#999999] focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md px-2.5 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md px-2.5 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="Highest">Highest</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Lowest">Lowest</option>
          </select>

          {/* Project Filter */}
          {projects && projects.length > 0 && (
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md px-2.5 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none cursor-pointer max-w-[160px] truncate"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => {
                const pId = p.id || p._id;
                return (
                  <option key={pId} value={pId}>
                    {p.name}
                  </option>
                );
              })}
            </select>
          )}

          {/* Reset Filters */}
          {(search || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setProjectFilter('all');
              }}
              className="text-xs text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>

        <div className="text-xs text-[#777777] dark:text-[#A0A0A0] font-mono shrink-0">
          Showing {filteredTasks.length} of {pagination.total || tasks.length}
        </div>
      </div>

      {/* 3. Empty State (No Tasks Assigned) */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks assigned to you"
          description="You have no active tasks or issues assigned in this workspace."
          action={{
            label: 'Browse Workspace Projects',
            icon: FolderGit2,
            onClick: () => navigate(`/workspace/${effectiveWsId}/projects`)
          }}
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No tasks match your filters"
          description="Try adjusting your search terms or filters to find what you're looking for."
          action={{
            label: 'Clear Filters',
            onClick: () => {
              setSearch('');
              setStatusFilter('all');
              setPriorityFilter('all');
              setProjectFilter('all');
            }
          }}
        />
      ) : viewMode === 'board' ? (
        /* 4A. Kanban Board View */
        <KanbanBoard
          tasks={filteredTasks}
          onTaskClick={handleOpenTask}
          onMoveTask={handleMoveTask}
          hideFilters={true}
        />
      ) : (
        /* 4B. Status Grouped List View */
        <div className="space-y-4">
          {STATUS_GROUPS.map((group) => {
            const groupTasks = groupedTasks[group.id] || [];
            const isCollapsed = Boolean(collapsedGroups[group.id]);

            return (
              <div
                key={group.id}
                className={`rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] border-l-4 ${group.color} overflow-hidden shadow-2xs`}
              >
                {/* Group Header */}
                <div
                  onClick={() => toggleGroupCollapse(group.id)}
                  className="p-3 bg-[#F9F9F8] dark:bg-[#242424] flex items-center justify-between cursor-pointer select-none border-b border-[#E8E8E5] dark:border-[#353535]"
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-[#777777] dark:text-[#A0A0A0]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#777777] dark:text-[#A0A0A0]" />
                    )}
                    <h3 className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
                      {group.label}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-[#777777] dark:text-[#A0A0A0] bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535]">
                      {groupTasks.length}
                    </span>
                  </div>

                  <span className="text-[11px] text-[#777777] dark:text-[#A0A0A0]">
                    {isCollapsed ? 'Click to expand' : 'Click to collapse'}
                  </span>
                </div>

                {/* Group Task Items */}
                {!isCollapsed && (
                  <div className="divide-y divide-[#E8E8E5] dark:divide-[#353535]">
                    {groupTasks.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#999999] dark:text-[#777777] italic">
                        No tasks in {group.label}
                      </div>
                    ) : (
                      groupTasks.map((task) => {
                        const taskId = task._id || task.id || task.issueKey;
                        const projName = task.project?.name || 'Project';
                        const projKey = task.project?.key || '';
                        const sprintName = task.sprint?.name || null;

                        return (
                          <div
                            key={taskId}
                            onClick={() => handleOpenTask(task)}
                            className="p-3 sm:p-3.5 hover:bg-[#F9F9F8] dark:hover:bg-[#242424] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
                          >
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              {/* Task IssueKey badge */}
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-[#777777] dark:text-[#A0A0A0] bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] shrink-0 mt-0.5">
                                {task.issueKey || task.id}
                              </span>

                              <div className="min-w-0 flex-1 space-y-1">
                                <h4 className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] group-hover:underline transition-colors my-0 leading-tight">
                                  {task.title}
                                </h4>

                                {task.description && (
                                  <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] line-clamp-1 leading-normal my-0">
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                  {/* Project tag */}
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono text-[#555555] dark:text-[#CCCCCC] bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535]">
                                    <FolderGit2 className="w-2.5 h-2.5" />
                                    <span>{projKey || projName}</span>
                                  </span>

                                  {/* Sprint tag */}
                                  {sprintName && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono text-[#555555] dark:text-[#CCCCCC] bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535]">
                                      <Layers className="w-2.5 h-2.5" />
                                      <span>{sprintName}</span>
                                    </span>
                                  )}

                                  {/* Due date */}
                                  {task.dueDate && (() => {
                                    const isOverdue = new Date(task.dueDate) < new Date() && mapStatusToBucket(task.rawStatus || task.status) !== 'Done';
                                    return (
                                      <span
                                        className={`inline-flex items-center gap-1 text-[10px] font-mono ${
                                          isOverdue
                                            ? 'text-red-600 dark:text-red-400 font-semibold'
                                            : 'text-[#777777] dark:text-[#A0A0A0]'
                                        }`}
                                      >
                                        <Clock className="w-2.5 h-2.5" />
                                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                        {isOverdue && (
                                          <span className="text-[9px] uppercase px-1 py-0.2 bg-red-100 dark:bg-red-950/40 rounded border border-red-200 dark:border-red-900/50">
                                            Overdue
                                          </span>
                                        )}
                                      </span>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>

                            {/* Right side: Priority & Status Change */}
                            <div
                              className="flex items-center gap-2 shrink-0 self-end sm:self-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Badge priority={task.priority} size="sm" />

                              {/* Quick Status Selector */}
                              <select
                                value={task.rawStatus || task.status || 'To Do'}
                                onChange={(e) => handleMoveTask(taskId, e.target.value)}
                                className="bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded px-2 py-1 text-[11px] font-medium text-[#252525] dark:text-[#F2F2F2] focus:outline-none cursor-pointer"
                              >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="In Review">In Review</option>
                                <option value="Done">Done</option>
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4b. Pagination Controls / Load More */}
      {tasks.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] text-xs text-[#777777] dark:text-[#A0A0A0]">
          <div>
            Showing <span className="font-semibold text-[#252525] dark:text-[#F2F2F2]">{filteredTasks.length}</span> of{' '}
            <span className="font-semibold text-[#252525] dark:text-[#F2F2F2]">{pagination.total || tasks.length}</span> tasks
            {pagination.totalPages > 1 && (
              <span className="ml-2 text-[11px] font-mono">
                (Page {pagination.page} of {pagination.totalPages})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {pagination.hasNextPage ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                isLoading={isLoadingMore}
              >
                Load More Tasks
              </Button>
            ) : pagination.total > pagination.limit ? (
              <span className="text-[11px] italic">All assigned tasks loaded</span>
            ) : null}
          </div>
        </div>
      )}

      {/* 5. Task Detail / Edit Modal */}
      {selectedTask && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          defaultStatus={selectedTask.rawStatus || selectedTask.status || 'To Do'}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          members={members}
        />
      )}
    </div>
  );
}

export default WorkspaceTasksPage;
