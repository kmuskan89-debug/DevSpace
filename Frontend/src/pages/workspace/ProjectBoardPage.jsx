import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useProject from '../../hooks/useProject';
import useWorkspace from '../../hooks/useWorkspace';
import ProjectHeader from '../../components/projects/ProjectHeader';
import ProjectNavTabs from '../../components/projects/ProjectNavTabs';
import KanbanBoard from '../../components/projects/KanbanBoard';
import TaskFilterBar from '../../components/projects/TaskFilterBar';
import TaskModal from '../../components/projects/TaskModal';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';

export function ProjectBoardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;

  const {
    project,
    tasks,
    pagination,
    isLoading,
    error,
    sprints,
    activeSprint,
    views,
    fetchViews,
    createView,
    updateView,
    deleteView,
    duplicateView,
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  } = useProject();

  const { members, workspace } = useWorkspace(project?.workspaceId);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState('To Do');
  const [isFiltering, setIsFiltering] = useState(false);

  // Parse filters from URL search params
  const activeFilters = useMemo(() => {
    return {
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || 'all',
      priority: searchParams.get('priority') || 'all',
      type: searchParams.get('type') || 'all',
      assignee: searchParams.get('assignee') || 'all',
      sprint: searchParams.get('sprint') !== null ? searchParams.get('sprint') : 'all',
      dueDate: searchParams.get('dueDate') || 'all'
    };
  }, [searchParams]);

  const activeSort = useMemo(() => {
    return {
      field: searchParams.get('sortBy') || 'createdAt',
      order: searchParams.get('sortOrder') || 'desc'
    };
  }, [searchParams]);

  const activePage = parseInt(searchParams.get('page'), 10) || 1;
  const activeLimit = parseInt(searchParams.get('limit'), 10) || 20;
  const activeViewId = searchParams.get('viewId') || null;
  const taskIdParam = searchParams.get('taskId');

  // Fetch saved views when project is loaded
  useEffect(() => {
    if (project?._id) {
      fetchViews();
    }
  }, [project?._id, fetchViews]);

  // Synchronize filtering and query parameters with backend
  const loadFilteredTasks = useCallback(async () => {
    if (!project?._id) return;
    setIsFiltering(true);
    try {
      const options = {
        page: activePage,
        limit: activeLimit,
        sortBy: activeSort.field,
        sortOrder: activeSort.order
      };

      if (activeFilters.search) options.search = activeFilters.search;
      if (activeFilters.status && activeFilters.status !== 'all') options.status = activeFilters.status;
      if (activeFilters.priority && activeFilters.priority !== 'all') options.priority = activeFilters.priority;
      if (activeFilters.type && activeFilters.type !== 'all') options.type = activeFilters.type;
      if (activeFilters.assignee && activeFilters.assignee !== 'all') options.assignee = activeFilters.assignee;
      if (activeFilters.sprint !== undefined && activeFilters.sprint !== 'all' && activeFilters.sprint !== '') {
        options.sprint = activeFilters.sprint;
      }
      if (activeFilters.dueDate && activeFilters.dueDate !== 'all') options.dueDate = activeFilters.dueDate;

      await fetchTasks(options);
    } catch (err) {
      console.error('Error fetching filtered tasks:', err);
    } finally {
      setIsFiltering(false);
    }
  }, [project?._id, activeFilters, activeSort, activePage, activeLimit, fetchTasks]);

  useEffect(() => {
    loadFilteredTasks();
  }, [loadFilteredTasks]);

  // Check if taskIdParam is in URL, auto-open task modal
  useEffect(() => {
    if (taskIdParam && tasks.length > 0 && !selectedTask) {
      const found = tasks.find((t) => t._id === taskIdParam || t.id === taskIdParam || t.issueKey === taskIdParam);
      if (found) {
        setSelectedTask(found);
        setIsTaskModalOpen(true);
      }
    }
  }, [taskIdParam, tasks, selectedTask]);

  // Update URL Search Parameters helper
  const updateUrlParams = useCallback((newParams, resetPage = true) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, val]) => {
        if (val === null || val === undefined || val === '' || val === 'all') {
          updated.delete(key);
        } else {
          updated.set(key, String(val));
        }
      });
      if (resetPage) {
        updated.delete('page');
      }
      return updated;
    }, { replace: true });
  }, [setSearchParams]);

  // Handle filter change
  const handleChangeFilters = (nextFilters) => {
    updateUrlParams({
      search: nextFilters.search,
      status: nextFilters.status,
      priority: nextFilters.priority,
      type: nextFilters.type,
      assignee: nextFilters.assignee,
      sprint: nextFilters.sprint,
      dueDate: nextFilters.dueDate
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    updateUrlParams({
      search: null,
      status: null,
      priority: null,
      type: null,
      assignee: null,
      sprint: null,
      dueDate: null,
      viewId: null
    });
  };

  // Handle sort change
  const handleChangeSort = (nextSort) => {
    updateUrlParams({
      sortBy: nextSort.field,
      sortOrder: nextSort.order
    }, false);
  };

  // Handle Saved View Selection
  const handleSelectView = (viewId) => {
    if (viewId === 'default') {
      handleResetFilters();
      return;
    }
    if (viewId === 'my-issues') {
      updateUrlParams({
        search: null,
        status: null,
        priority: null,
        type: null,
        assignee: currentUserId,
        sprint: null,
        dueDate: null,
        viewId: null
      });
      return;
    }

    const foundView = views.find((v) => v._id === viewId);
    if (!foundView) return;

    const f = foundView.filters || {};
    const s = foundView.sort || {};

    updateUrlParams({
      search: f.search || null,
      status: f.status || null,
      priority: f.priority || null,
      type: f.type || null,
      assignee: f.assignee || null,
      sprint: f.sprint !== undefined ? f.sprint : null,
      dueDate: f.dueDate || null,
      sortBy: s.field || null,
      sortOrder: s.order || null,
      viewId: foundView._id
    });
    addToast(`Applied saved view: "${foundView.name}"`, 'info');
  };

  // Saved Views CRUD Handlers
  const handleCreateView = async (viewData) => {
    try {
      const created = await createView(viewData);
      updateUrlParams({ viewId: created._id }, false);
      addToast(`Saved view "${created.name}" created!`, 'success');
    } catch (err) {
      console.error('Failed to create view:', err);
      addToast(err.response?.data?.message || err.message || 'Failed to save view', 'error');
    }
  };

  const handleUpdateView = async (viewId, viewData) => {
    try {
      const updated = await updateView(viewId, viewData);
      addToast(`Saved view "${updated.name}" updated!`, 'success');
    } catch (err) {
      console.error('Failed to update view:', err);
      addToast(err.response?.data?.message || err.message || 'Failed to update view', 'error');
    }
  };

  const handleDeleteView = async (viewId) => {
    try {
      await deleteView(viewId);
      if (activeViewId === viewId) {
        updateUrlParams({ viewId: null }, false);
      }
      addToast('Saved view deleted', 'info');
    } catch (err) {
      console.error('Failed to delete view:', err);
      addToast(err.response?.data?.message || err.message || 'Failed to delete view', 'error');
    }
  };

  const handleDuplicateView = async (viewId) => {
    try {
      const duplicated = await duplicateView(viewId);
      updateUrlParams({ viewId: duplicated._id }, false);
      addToast(`Duplicated as "${duplicated.name}"`, 'success');
    } catch (err) {
      console.error('Failed to duplicate view:', err);
      addToast(err.response?.data?.message || err.message || 'Failed to duplicate view', 'error');
    }
  };

  // Task Operations
  const handleOpenAddTask = useCallback((status = 'To Do') => {
    setSelectedTask(null);
    setModalDefaultStatus(status);
    setIsTaskModalOpen(true);
  }, []);

  const handleTaskClick = useCallback((task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
    updateUrlParams({ taskId: task._id || task.id }, false);
  }, [updateUrlParams]);

  const handleCloseTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
    if (taskIdParam) {
      updateUrlParams({ taskId: null }, false);
    }
  }, [taskIdParam, updateUrlParams]);

  const handleSaveTask = useCallback(async (savedTask) => {
    try {
      if (selectedTask || savedTask._id) {
        const taskId = selectedTask?._id || selectedTask?.id || savedTask._id || savedTask.id;
        const updated = await updateTask(taskId, savedTask);
        addToast(`Task "${updated.title}" updated!`, 'success');
      } else {
        const created = await createTask(savedTask);
        addToast(`Task "${created.title}" [${created.issueKey || created.id}] created!`, 'success');
      }
      loadFilteredTasks();
    } catch (err) {
      console.error('Failed to save task:', err);
      addToast(err.response?.data?.message || err.message || 'Failed to save task', 'error');
    }
  }, [selectedTask, updateTask, createTask, addToast, loadFilteredTasks]);

  const handleDeleteTask = useCallback(async (taskId) => {
    try {
      await deleteTask(taskId);
      addToast('Task deleted successfully', 'info');
      handleCloseTaskModal();
      loadFilteredTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
      addToast(err.response?.data?.message || err.message || 'Failed to delete task', 'error');
    }
  }, [deleteTask, addToast, handleCloseTaskModal, loadFilteredTasks]);

  const handleMoveTask = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error('Failed to move task:', err);
      addToast(err.response?.data?.message || err.message || 'Failed to update task status', 'error');
    }
  };

  // Pagination Handlers
  const handlePageChange = (newPage) => {
    updateUrlParams({ page: newPage }, false);
  };

  const handlePageSizeChange = (newSize) => {
    updateUrlParams({ limit: newSize, page: 1 }, false);
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-mono text-slate-400">Loading sprint board from database...</p>
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
            {error || 'The requested project could not be loaded or you lack access to it.'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate(workspace ? `/workspace/${workspace.id}/projects` : '/dashboard')}
        >
          Back to Projects
        </Button>
      </div>
    );
  }

  const totalCount = pagination?.total ?? tasks.length;
  const currentPage = pagination?.page ?? activePage;
  const totalPages = pagination?.totalPages ?? 1;
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * activeLimit + 1;
  const endItem = Math.min(currentPage * activeLimit, totalCount);

  return (
    <div className="space-y-4">
      {/* 1. Project Banner Header */}
      <ProjectHeader project={project} onAddTask={() => handleOpenAddTask('To Do')} />

      {/* 2. Project Nav Tabs */}
      <ProjectNavTabs taskCount={totalCount} />

      {/* 3. Active Sprint Banner (if running) */}
      {activeSprint && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2]">{activeSprint.name}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] border border-[#E8E8E5] dark:border-[#353535] font-semibold">
                  Active
                </span>
              </div>
              {activeSprint.goal && (
                <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] mt-0.5 my-0">
                  Goal: {activeSprint.goal}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#777777] dark:text-[#A0A0A0] font-mono text-[11px]">
              {activeSprint.startDate ? new Date(activeSprint.startDate).toLocaleDateString() : 'Now'} - {activeSprint.endDate ? new Date(activeSprint.endDate).toLocaleDateString() : 'TBD'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/workspace/${project.workspaceId}/projects/${project._id || project.id}/backlog`)}
              className="text-xs h-7"
            >
              Sprint Backlog
            </Button>
          </div>
        </div>
      )}

      {/* 4. Advanced Filter Bar & Saved Views Navigation */}
      <TaskFilterBar
        filters={activeFilters}
        onChangeFilters={handleChangeFilters}
        onResetFilters={handleResetFilters}
        sort={activeSort}
        onChangeSort={handleChangeSort}
        views={views}
        activeViewId={activeViewId}
        onSelectView={handleSelectView}
        onCreateView={handleCreateView}
        onUpdateView={handleUpdateView}
        onDeleteView={handleDeleteView}
        onDuplicateView={handleDuplicateView}
        members={members}
        sprints={sprints}
        pageSize={activeLimit}
        onChangePageSize={handlePageSizeChange}
        totalTasks={totalCount}
      />

      {/* Loading overlay indicator while filtering */}
      {isFiltering && (
        <div className="py-2 flex items-center justify-center gap-2 text-xs font-mono text-[#777777] dark:text-[#A0A0A0]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Refreshing filtered board...</span>
        </div>
      )}

      {/* 5. Interactive Kanban Board */}
      <KanbanBoard
        tasks={tasks}
        onTaskClick={handleTaskClick}
        onAddTask={(colId) => handleOpenAddTask(colId)}
        onMoveTask={handleMoveTask}
        hideFilters
      />

      {/* 6. Server-side Pagination & Results Counter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] text-xs text-[#777777] dark:text-[#A0A0A0]">
        <div className="flex items-center gap-2 font-mono">
          <span>
            Showing <strong className="text-[#252525] dark:text-[#F2F2F2]">{startItem}</strong> - <strong className="text-[#252525] dark:text-[#F2F2F2]">{endItem}</strong> of <strong className="text-[#252525] dark:text-[#F2F2F2]">{totalCount}</strong> issues
          </span>
          {(activeFilters.status !== 'all' || activeFilters.priority !== 'all' || activeFilters.search) && (
            <span className="text-[10px] text-[#252525] dark:text-[#F2F2F2] bg-[#F1F1EF] dark:bg-[#2A2A2A] px-1.5 py-0.2 rounded border border-[#E8E8E5] dark:border-[#353535]">
              Filtered
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Page size dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#999999] dark:text-[#777777]">Per page:</span>
            <select
              value={activeLimit}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded px-1.5 py-0.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none cursor-pointer"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          {/* Previous / Next buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1 || isFiltering}
              onClick={() => handlePageChange(currentPage - 1)}
              className="p-1 rounded-md border border-[#E8E8E5] dark:border-[#353535] bg-[#F7F7F5] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#353535] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="font-mono px-2 text-[#252525] dark:text-[#F2F2F2] text-xs">
              {currentPage} / {Math.max(1, totalPages)}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages || isFiltering}
              onClick={() => handlePageChange(currentPage + 1)}
              className="p-1 rounded-md border border-[#E8E8E5] dark:border-[#353535] bg-[#F7F7F5] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#353535] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 7. Task Details / Edit / Delete Modal */}
      <TaskModal
        key="project-board-task-modal"
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        task={selectedTask}
        defaultStatus={modalDefaultStatus}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        members={members}
      />
    </div>
  );
}

export default ProjectBoardPage;
