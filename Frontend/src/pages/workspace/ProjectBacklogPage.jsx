import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ListTodo,
  Plus,
  Search,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import useProject from '../../hooks/useProject';
import useWorkspace from '../../hooks/useWorkspace';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import ProjectHeader from '../../components/projects/ProjectHeader';
import ProjectNavTabs from '../../components/projects/ProjectNavTabs';
import SprintCard from '../../components/sprints/SprintCard';
import IssueRow from '../../components/sprints/IssueRow';
import SprintModal from '../../components/sprints/SprintModal';
import StartSprintModal from '../../components/sprints/StartSprintModal';
import CompleteSprintModal from '../../components/sprints/CompleteSprintModal';
import TaskModal from '../../components/projects/TaskModal';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { canManageProject } from '../../utils/normalizers';

export function ProjectBacklogPage() {
  const navigate = useNavigate();
  const { workspaceId, projectId: _paramProjectId } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const {
    project,
    tasks,
    isLoading,
    error,
    sprints,
    createSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
    addIssuesToSprint,
    removeIssueFromSprint,
    fetchBacklog,
    reorderBacklog,
    createTask,
    updateTask,
    deleteTask,
    fetchSprints
  } = useProject();

  const { members, workspace } = useWorkspace(workspaceId || project?.workspaceId);
  const canManage = canManageProject(project, workspace, user);

  // Backlog specific state
  const [backlogIssues, setBacklogIssues] = useState([]);
  const [isLoadingBacklog, setIsLoadingBacklog] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Completed sprints collapsible state
  const [showCompletedSprints, setShowCompletedSprints] = useState(false);

  // Modals state
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);

  const [startingSprint, setStartingSprint] = useState(null);
  const [startIssueCount, setStartIssueCount] = useState(0);
  const [startStoryPoints, setStartStoryPoints] = useState(0);

  const [completingSprint, setCompletingSprint] = useState(null);
  const [completeCompletedIssues, setCompleteCompletedIssues] = useState(0);
  const [completeOpenIssues, setCompleteOpenIssues] = useState(0);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [targetSprintForNewTask, setTargetSprintForNewTask] = useState(null);

  // Backlog drop highlight
  const [isBacklogDragOver, setIsBacklogDragOver] = useState(false);

  // Load backlog issues
  const loadBacklog = useCallback(async () => {
    setIsLoadingBacklog(true);
    try {
      const res = await fetchBacklog();
      setBacklogIssues(res.tasks || []);
    } catch (err) {
      console.warn('Failed to load project backlog:', err);
    } finally {
      setIsLoadingBacklog(false);
    }
  }, [fetchBacklog]);

  useEffect(() => {
    if (project?._id) {
      loadBacklog();
    }
  }, [project?._id, loadBacklog]);

  // Group sprints by status
  const activeSprint = useMemo(() => sprints.find((s) => s.status === 'Active') || null, [sprints]);
  const plannedSprints = useMemo(() => sprints.filter((s) => s.status === 'Planned'), [sprints]);
  const completedSprints = useMemo(() => sprints.filter((s) => s.status === 'Completed'), [sprints]);

  // Map issues to their corresponding sprints
  const sprintIssuesMap = useMemo(() => {
    const map = {};
    sprints.forEach((s) => {
      map[s._id] = [];
    });
    tasks.forEach((t) => {
      const sId = t.sprint?._id || t.sprint;
      if (sId && map[sId]) {
        map[sId].push(t);
      }
    });
    return map;
  }, [sprints, tasks]);

  // Filter issues helper
  const filterIssue = useCallback(
    (issue) => {
      const matchesSearch =
        (issue.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (issue.issueKey || '').toLowerCase().includes(search.toLowerCase()) ||
        (issue.description || '').toLowerCase().includes(search.toLowerCase());
      const matchesPriority =
        priorityFilter === 'all' || (issue.priority || '').toLowerCase() === priorityFilter.toLowerCase();
      const matchesType =
        typeFilter === 'all' || (issue.type || '').toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesPriority && matchesType;
    },
    [search, priorityFilter, typeFilter]
  );

  const filteredBacklogIssues = useMemo(() => {
    return backlogIssues.filter(filterIssue);
  }, [backlogIssues, filterIssue]);

  // Total backlog story points
  const backlogStoryPoints = useMemo(() => {
    return filteredBacklogIssues.reduce((sum, t) => {
      const pts = typeof t.storyPoints === 'number' && !isNaN(t.storyPoints) ? t.storyPoints : 0;
      return sum + pts;
    }, 0);
  }, [filteredBacklogIssues]);

  // --- SPRINT ACTIONS ---
  const handleOpenCreateSprint = () => {
    setEditingSprint(null);
    setIsSprintModalOpen(true);
  };

  const handleOpenEditSprint = (sprint) => {
    setEditingSprint(sprint);
    setIsSprintModalOpen(true);
  };

  const handleSaveSprint = async (sprintData) => {
    if (editingSprint) {
      await updateSprint(editingSprint._id, sprintData);
      addToast(`Sprint "${sprintData.name}" updated`, 'success');
    } else {
      await createSprint(sprintData);
      addToast(`Planned Sprint "${sprintData.name}" created`, 'success');
    }
  };

  const handleDeleteSprint = async (sprintId) => {
    if (window.confirm('Delete this sprint? All tasks will safely return to the backlog.')) {
      try {
        await deleteSprint(sprintId);
        addToast('Sprint deleted. Associated tasks returned to backlog.', 'info');
        loadBacklog();
      } catch (err) {
        addToast(err?.response?.data?.message || err.message || 'Failed to delete sprint', 'error');
      }
    }
  };

  const handleOpenStartSprint = (sprint, issueCount, storyPoints) => {
    setStartingSprint(sprint);
    setStartIssueCount(issueCount);
    setStartStoryPoints(storyPoints);
  };

  const handleConfirmStartSprint = async (sprintId, startData) => {
    try {
      await startSprint(sprintId, startData);
      addToast('Sprint started successfully!', 'success');
      loadBacklog();
    } catch (err) {
      addToast(err?.response?.data?.message || err.message || 'Failed to start sprint', 'error');
      throw err;
    }
  };

  const handleOpenCompleteSprint = (sprint, completedCount, openCount) => {
    setCompletingSprint(sprint);
    setCompleteCompletedIssues(completedCount);
    setCompleteOpenIssues(openCount);
  };

  const handleConfirmCompleteSprint = async (sprintId, completeData) => {
    try {
      await completeSprint(sprintId, completeData);
      addToast('Sprint completed!', 'success');
      loadBacklog();
    } catch (err) {
      addToast(err?.response?.data?.message || err.message || 'Failed to complete sprint', 'error');
      throw err;
    }
  };

  // --- ISSUE ACTIONS & DRAG AND DROP ---
  const handleOpenCreateIssue = (sprintId = null) => {
    setSelectedTask(null);
    setTargetSprintForNewTask(sprintId);
    setIsTaskModalOpen(true);
  };

  const handleIssueClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    if (selectedTask) {
      await updateTask(selectedTask._id || selectedTask.id, taskData);
      addToast(`Task "${taskData.title}" updated`, 'success');
    } else {
      const payload = {
        ...taskData,
        sprint: targetSprintForNewTask || undefined
      };
      await createTask(payload);
      addToast(`Issue "${taskData.title}" created`, 'success');
    }
    loadBacklog();
    fetchSprints();
  };

  const handleDeleteIssue = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      await deleteTask(taskId);
      addToast('Issue deleted', 'info');
      loadBacklog();
    }
  };

  // Move issue into a sprint
  const handleMoveIssueToSprint = async (taskId, targetSprintId) => {
    try {
      await addIssuesToSprint(targetSprintId, [taskId]);
      addToast('Issue moved to sprint', 'success');
      loadBacklog();
    } catch (err) {
      addToast(err?.response?.data?.message || err.message || 'Failed to move issue', 'error');
    }
  };

  // Remove issue from a sprint (moves to backlog)
  const handleRemoveIssueFromSprint = async (taskId) => {
    // Find which sprint this task belongs to
    const task = tasks.find((t) => (t._id === taskId || t.id === taskId));
    const sId = task?.sprint?._id || task?.sprint;
    if (sId) {
      try {
        await removeIssueFromSprint(sId, taskId);
        addToast('Issue moved to backlog', 'info');
        loadBacklog();
      } catch (err) {
        addToast(err?.response?.data?.message || err.message || 'Failed to remove issue', 'error');
      }
    }
  };

  // Drop issue onto Backlog Container
  const handleBacklogDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isBacklogDragOver) setIsBacklogDragOver(true);
  };

  const handleBacklogDragLeave = () => {
    setIsBacklogDragOver(false);
  };

  const handleBacklogDrop = async (e) => {
    e.preventDefault();
    setIsBacklogDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    const sourceSprint = e.dataTransfer.getData('application/devspace-source-sprint');
    if (taskId && sourceSprint && sourceSprint !== 'backlog') {
      await handleRemoveIssueFromSprint(taskId);
    }
  };

  // Reorder within Backlog
  const handleReorderBacklog = async (draggedTaskId, dropTargetTaskId) => {
    if (!draggedTaskId || !dropTargetTaskId || draggedTaskId === dropTargetTaskId) return;

    const currentOrder = [...backlogIssues];
    const dragIndex = currentOrder.findIndex((t) => (t._id === draggedTaskId || t.id === draggedTaskId));
    const dropIndex = currentOrder.findIndex((t) => (t._id === dropTargetTaskId || t.id === dropTargetTaskId));

    if (dragIndex < 0 || dropIndex < 0) return;

    const [moved] = currentOrder.splice(dragIndex, 1);
    currentOrder.splice(dropIndex, 0, moved);

    // Optimistic update
    setBacklogIssues(currentOrder);

    try {
      const taskIds = currentOrder.map((t) => t._id || t.id);
      await reorderBacklog(taskIds);
    } catch (err) {
      console.warn('Failed to persist backlog reorder:', err);
      loadBacklog();
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

  return (
    <div className="space-y-5">
      {/* 1. PROJECT HEADER */}
      <ProjectHeader project={project} onAddTask={() => handleOpenCreateIssue(null)} />

      {/* 2. NAVIGATION TABS */}
      <ProjectNavTabs taskCount={tasks.length} />

      {/* 3. CONTROLS BAR: SEARCH, FILTERS, CREATE SPRINT & ISSUE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020]">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999999]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search backlog & sprints..."
              className="w-full bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] placeholder-[#999999] focus:outline-none"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md px-2 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="Highest">Highest</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Lowest">Lowest</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md px-2 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
            <option value="Story">Story</option>
            <option value="Epic">Epic</option>
          </select>

          {(search || priorityFilter !== 'all' || typeFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPriorityFilter('all');
                setTypeFilter('all');
              }}
              className="inline-flex items-center gap-1 text-xs text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Primary Actions */}
        {canManage && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleOpenCreateSprint}
            >
              Create Sprint
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => handleOpenCreateIssue(null)}
            >
              Create Issue
            </Button>
          </div>
        )}
      </div>

      {/* 4. ACTIVE SPRINT SECTION */}
      {activeSprint && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0]">
              Active Sprint
            </h2>
          </div>
          <SprintCard
            sprint={activeSprint}
            issues={(sprintIssuesMap[activeSprint._id] || []).filter(filterIssue)}
            onIssueClick={handleIssueClick}
            onAddIssue={handleOpenCreateIssue}
            onCompleteSprint={handleOpenCompleteSprint}
            onEditSprint={handleOpenEditSprint}
            onDeleteSprint={handleDeleteSprint}
            onMoveIssueToSprint={handleMoveIssueToSprint}
            onRemoveIssue={handleRemoveIssueFromSprint}
            onDeleteIssue={handleDeleteIssue}
            availableSprints={plannedSprints}
            canManage={canManage}
            onDropIssueIntoSprint={handleMoveIssueToSprint}
          />
        </div>
      )}

      {/* 5. PLANNED SPRINTS SECTION */}
      {plannedSprints.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0]">
              Planned Sprints ({plannedSprints.length})
            </h2>
          </div>

          <div className="space-y-3">
            {plannedSprints.map((sprint) => (
              <SprintCard
                key={sprint._id}
                sprint={sprint}
                issues={(sprintIssuesMap[sprint._id] || []).filter(filterIssue)}
                onIssueClick={handleIssueClick}
                onAddIssue={handleOpenCreateIssue}
                onStartSprint={handleOpenStartSprint}
                onEditSprint={handleOpenEditSprint}
                onDeleteSprint={handleDeleteSprint}
                onMoveIssueToSprint={handleMoveIssueToSprint}
                onRemoveIssue={handleRemoveIssueFromSprint}
                onDeleteIssue={handleDeleteIssue}
                availableSprints={sprints.filter((s) => s.status !== 'Completed')}
                canManage={canManage}
                onDropIssueIntoSprint={handleMoveIssueToSprint}
              />
            ))}
          </div>
        </div>
      )}

      {/* 6. BACKLOG SECTION */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0]">
              Backlog
            </h2>
            <span className="text-xs font-mono text-[#777777] dark:text-[#A0A0A0]">
              ({filteredBacklogIssues.length} issues · {backlogStoryPoints} pts)
            </span>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={() => handleOpenCreateIssue(null)}
              className="text-xs text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors cursor-pointer font-medium"
            >
              + Add Issue
            </button>
          )}
        </div>

        {/* Backlog Drop Target & Container */}
        <div
          onDragOver={handleBacklogDragOver}
          onDragLeave={handleBacklogDragLeave}
          onDrop={handleBacklogDrop}
          className={`rounded-lg border transition-all p-2 sm:p-2.5 space-y-1.5 ${
            isBacklogDragOver
              ? 'border-[#252525] dark:border-[#F2F2F2] ring-1 ring-[#252525]/20 dark:ring-[#F2F2F2]/20 bg-[#F9F9F8] dark:bg-[#242424]'
              : 'border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020]'
          }`}
        >
          {isLoadingBacklog ? (
            <div className="space-y-2 py-4">
              <SkeletonLoader variant="table-row" count={4} />
            </div>
          ) : filteredBacklogIssues.length > 0 ? (
            filteredBacklogIssues.map((issue) => (
              <IssueRow
                key={issue._id || issue.id}
                issue={issue}
                currentSprintId={null}
                onIssueClick={handleIssueClick}
                onMoveToSprint={handleMoveIssueToSprint}
                onDelete={handleDeleteIssue}
                availableSprints={sprints.filter((s) => s.status !== 'Completed')}
                canManage={canManage}
                onDrop={(e) => {
                  e.preventDefault();
                  const draggedId = e.dataTransfer.getData('text/plain');
                  const source = e.dataTransfer.getData('application/devspace-source-sprint');
                  if (source === 'backlog') {
                    handleReorderBacklog(draggedId, issue._id || issue.id);
                  }
                }}
              />
            ))
          ) : (
            <EmptyState
              icon={ListTodo}
              title="Backlog is empty"
              description="No unassigned backlog issues. Create a new issue or drag from sprints."
              actionLabel="Create Issue"
              onAction={() => handleOpenCreateIssue(null)}
              className="py-8"
            />
          )}
        </div>
      </div>

      {/* 7. COMPLETED SPRINTS (COLLAPSED BY DEFAULT) */}
      {completedSprints.length > 0 && (
        <div className="pt-2 border-t border-[#E8E8E5] dark:border-[#353535] space-y-3">
          <button
            type="button"
            onClick={() => setShowCompletedSprints(!showCompletedSprints)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors cursor-pointer"
          >
            {showCompletedSprints ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span>Completed Sprints ({completedSprints.length})</span>
          </button>

          {showCompletedSprints && (
            <div className="space-y-3">
              {completedSprints.map((sprint) => (
                <SprintCard
                  key={sprint._id}
                  sprint={sprint}
                  issues={(sprintIssuesMap[sprint._id] || []).filter(filterIssue)}
                  onIssueClick={handleIssueClick}
                  defaultCollapsed
                  canManage={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SPRINT MODALS                                         */}
      {/* ---------------------------------------------------- */}
      <SprintModal
        isOpen={isSprintModalOpen}
        onClose={() => setIsSprintModalOpen(false)}
        onSave={handleSaveSprint}
        sprint={editingSprint}
        isEditing={Boolean(editingSprint)}
      />

      <StartSprintModal
        isOpen={Boolean(startingSprint)}
        onClose={() => setStartingSprint(null)}
        onStart={handleConfirmStartSprint}
        sprint={startingSprint}
        issueCount={startIssueCount}
        storyPoints={startStoryPoints}
      />

      <CompleteSprintModal
        isOpen={Boolean(completingSprint)}
        onClose={() => setCompletingSprint(null)}
        onComplete={handleConfirmCompleteSprint}
        sprint={completingSprint}
        completedIssues={completeCompletedIssues}
        openIssues={completeOpenIssues}
        plannedSprints={plannedSprints.filter((s) => s._id !== completingSprint?._id)}
      />

      {/* Task Creation / Inspection Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        onSave={handleSaveTask}
        onDelete={handleDeleteIssue}
        members={members}
      />
    </div>
  );
}

export default ProjectBacklogPage;
