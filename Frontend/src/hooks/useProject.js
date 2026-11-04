import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { normalizeProject, normalizeTask } from '../utils/normalizers';

export function useProject(overrideProjectId) {
  const { projectId: paramId, workspaceId } = useParams();
  const navigate = useNavigate();
  const targetId = overrideProjectId || paramId;

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, openTasks: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sprints state
  const [sprints, setSprints] = useState([]);
  const [isLoadingSprints, setIsLoadingSprints] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Saved Views state
  const [views, setViews] = useState([]);
  const [isLoadingViews, setIsLoadingViews] = useState(false);

  const activeSprint = useMemo(() => {
    return sprints.find((s) => s.status === 'Active') || null;
  }, [sprints]);

  const fetchProjectAndTasks = useCallback(async () => {
    if (!targetId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch project details and stats
      const projectRes = await api.get(`/projects/${targetId}`);
      const rawProject = projectRes.data?.project;
      const projectStats = projectRes.data?.stats || { totalTasks: 0, completedTasks: 0, openTasks: 0 };
      const normalizedProj = normalizeProject({
        ...rawProject,
        stats: projectStats
      }, workspaceId);

      setProject(normalizedProj);
      setStats(projectStats);

      // 2. Fetch tasks for this project
      const tasksRes = await api.get(`/projects/${rawProject?._id || targetId}/tasks?limit=100`);
      const rawTasks = tasksRes.data?.tasks || [];
      const normalizedTasksList = rawTasks.map((t) =>
        normalizeTask(t, normalizedProj._id, normalizedProj.workspaceId)
      );

      setTasks(normalizedTasksList);
    } catch (err) {
      console.error('Failed to fetch project or tasks:', err?.response?.data?.message || err.message);
      setError(err?.response?.data?.message || 'Failed to load project details');
      setProject(null);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [targetId, workspaceId]);

  // Fetch sprints
  const fetchSprints = useCallback(async () => {
    const projId = project?._id || targetId;
    if (!projId) return [];

    setIsLoadingSprints(true);
    try {
      const res = await api.get(`/projects/${projId}/sprints`);
      const fetchedSprints = res.data?.sprints || [];
      setSprints(fetchedSprints);
      return fetchedSprints;
    } catch (err) {
      console.warn('Failed to load project sprints:', err?.response?.data?.message || err.message);
      return [];
    } finally {
      setIsLoadingSprints(false);
    }
  }, [project, targetId]);

  useEffect(() => {
    fetchProjectAndTasks();
  }, [fetchProjectAndTasks]);

  useEffect(() => {
    if (project?._id || targetId) {
      fetchSprints();
    }
  }, [project?._id, targetId, fetchSprints]);

  // Create Task
  const createTask = useCallback(async (taskData) => {
    const projId = project?._id || targetId;
    if (!projId) throw new Error('No active project to add task to');

    const payload = {
      title: taskData.title?.trim(),
      description: taskData.description?.trim() || '',
      type: taskData.type || 'Task',
      status: taskData.status === 'Code Review' ? 'In Review' : (taskData.status || 'To Do'),
      priority: taskData.priority || 'Medium',
      sprint: taskData.sprint || undefined,
      assignee: taskData.assigneeId || (taskData.assignee?._id || taskData.assignee?.id) || undefined,
      labels: taskData.tags || taskData.labels || [],
      dueDate: taskData.dueDate || undefined,
      storyPoints: taskData.storyPoints !== '' && taskData.storyPoints !== undefined ? Number(taskData.storyPoints) : undefined,
      estimate: taskData.estimate || undefined,
      branch: taskData.branch || undefined,
      subtasks: taskData.subtasks || [],
      comments: taskData.comments || []
    };

    const response = await api.post(`/projects/${projId}/tasks`, payload);
    const created = normalizeTask(response.data?.task, projId, project?.workspaceId);
    setTasks((prev) => [created, ...prev]);

    // Update stats
    setStats((prev) => ({
      ...prev,
      totalTasks: prev.totalTasks + 1,
      openTasks: created.status === 'Done' ? prev.openTasks : prev.openTasks + 1,
      completedTasks: created.status === 'Done' ? prev.completedTasks + 1 : prev.completedTasks
    }));

    // Refresh sprints if task was assigned to a sprint
    if (payload.sprint) {
      fetchSprints();
    }

    return created;
  }, [project, targetId, fetchSprints]);

  // Update Task (Full update)
  const updateTask = useCallback(async (taskId, taskData) => {
    const idToLookup = taskData?._id || taskId;

    const payload = {
      title: taskData.title?.trim(),
      description: taskData.description !== undefined ? taskData.description.trim() : undefined,
      type: taskData.type,
      status: taskData.status === 'Code Review' ? 'In Review' : taskData.status,
      priority: taskData.priority,
      sprint: taskData.sprint !== undefined ? taskData.sprint : undefined,
      assignee: taskData.assigneeId !== undefined
        ? taskData.assigneeId
        : (taskData.assignee?._id || taskData.assignee?.id || null),
      labels: taskData.tags || taskData.labels,
      dueDate: taskData.dueDate,
      storyPoints: taskData.storyPoints !== '' && taskData.storyPoints !== undefined ? Number(taskData.storyPoints) : null,
      estimate: taskData.estimate,
      branch: taskData.branch,
      subtasks: taskData.subtasks,
      comments: taskData.comments
    };

    const response = await api.put(`/tasks/${idToLookup}`, payload);
    const updated = normalizeTask(response.data?.task, project?._id, project?.workspaceId);

    setTasks((prev) =>
      prev.map((t) => (t._id === idToLookup || t.id === idToLookup || t.issueKey === idToLookup ? updated : t))
    );

    if (taskData.sprint !== undefined) {
      fetchSprints();
    }

    return updated;
  }, [project, fetchSprints]);

  // Update Task Status (for drag & drop and column moves)
  const updateTaskStatus = useCallback(async (taskId, newStatus) => {
    // Find task in local state
    const currentTask = tasks.find(
      (t) => t._id === taskId || t.id === taskId || t.issueKey === taskId
    );
    const mongoId = currentTask?._id || taskId;

    // Normalize for backend
    const backendStatus = newStatus === 'Code Review' ? 'In Review' : newStatus;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => {
        if (t._id === mongoId || t.id === taskId || t.issueKey === taskId) {
          return { ...t, status: newStatus, rawStatus: backendStatus };
        }
        return t;
      })
    );

    try {
      const response = await api.patch(`/tasks/${mongoId}/status`, {
        status: backendStatus
      });
      const updated = normalizeTask(response.data?.task, project?._id, project?.workspaceId);

      setTasks((prev) =>
        prev.map((t) => (t._id === mongoId || t.id === taskId ? updated : t))
      );

      // Refresh sprint metrics
      if (updated.sprint) {
        fetchSprints();
      }

      return updated;
    } catch (err) {
      console.error('Failed to update task status in backend:', err);
      // Revert optimistic update on failure
      if (currentTask) {
        setTasks((prev) =>
          prev.map((t) => (t._id === mongoId || t.id === taskId ? currentTask : t))
        );
      }
      throw err;
    }
  }, [tasks, project, fetchSprints]);

  // Delete Task
  const deleteTask = useCallback(async (taskId) => {
    const currentTask = tasks.find(
      (t) => t._id === taskId || t.id === taskId || t.issueKey === taskId
    );
    const mongoId = currentTask?._id || taskId;

    await api.delete(`/tasks/${mongoId}`);

    setTasks((prev) => prev.filter((t) => t._id !== mongoId && t.id !== taskId && t.issueKey !== taskId));

    if (currentTask) {
      setStats((prev) => ({
        ...prev,
        totalTasks: Math.max(0, prev.totalTasks - 1),
        openTasks: currentTask.status === 'Done' ? prev.openTasks : Math.max(0, prev.openTasks - 1),
        completedTasks: currentTask.status === 'Done' ? Math.max(0, prev.completedTasks - 1) : prev.completedTasks
      }));
    }

    fetchSprints();
  }, [tasks, fetchSprints]);

  // Update Project Info
  const updateProject = useCallback(async (fields) => {
    const projId = project?._id || targetId;
    const response = await api.put(`/projects/${projId}`, fields);
    const updated = normalizeProject({
      ...response.data?.project,
      stats
    }, workspaceId);
    setProject(updated);
    return updated;
  }, [project, targetId, stats, workspaceId]);

  // Delete Project
  const deleteProject = useCallback(async () => {
    const projId = project?._id || targetId;
    const response = await api.delete(`/projects/${projId}`);
    return response.data;
  }, [project, targetId]);

  // Task Comments API
  const fetchTaskComments = useCallback(async (taskId) => {
    const res = await api.get(`/tasks/${taskId}/comments`);
    return res.data?.comments || [];
  }, []);

  const createTaskComment = useCallback(async (taskId, content) => {
    const res = await api.post(`/tasks/${taskId}/comments`, { content });
    return res.data?.comment;
  }, []);

  const updateTaskComment = useCallback(async (taskId, commentId, content) => {
    const res = await api.put(`/tasks/${taskId}/comments/${commentId}`, { content });
    return res.data?.comment;
  }, []);

  const deleteTaskComment = useCallback(async (taskId, commentId) => {
    const res = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
    return res.data;
  }, []);

  // --- SPRINT MANAGEMENT METHODS ---

  const createSprint = useCallback(async (sprintData) => {
    const projId = project?._id || targetId;
    const res = await api.post(`/projects/${projId}/sprints`, sprintData);
    await fetchSprints();
    return res.data?.sprint;
  }, [project, targetId, fetchSprints]);

  const updateSprint = useCallback(async (sprintId, sprintData) => {
    const res = await api.patch(`/sprints/${sprintId}`, sprintData);
    await fetchSprints();
    return res.data?.sprint;
  }, [fetchSprints]);

  const deleteSprint = useCallback(async (sprintId) => {
    const res = await api.delete(`/sprints/${sprintId}`);
    await Promise.all([fetchSprints(), fetchProjectAndTasks()]);
    return res.data;
  }, [fetchSprints, fetchProjectAndTasks]);

  const startSprint = useCallback(async (sprintId, startData = {}) => {
    const res = await api.post(`/sprints/${sprintId}/start`, startData);
    await Promise.all([fetchSprints(), fetchProjectAndTasks()]);
    return res.data;
  }, [fetchSprints, fetchProjectAndTasks]);

  const completeSprint = useCallback(async (sprintId, completeData = {}) => {
    const res = await api.post(`/sprints/${sprintId}/complete`, completeData);
    await Promise.all([fetchSprints(), fetchProjectAndTasks()]);
    return res.data;
  }, [fetchSprints, fetchProjectAndTasks]);

  const addIssuesToSprint = useCallback(async (sprintId, taskIds) => {
    const res = await api.post(`/sprints/${sprintId}/issues`, { taskIds });
    await Promise.all([fetchSprints(), fetchProjectAndTasks()]);
    return res.data;
  }, [fetchSprints, fetchProjectAndTasks]);

  const removeIssueFromSprint = useCallback(async (sprintId, taskId) => {
    const res = await api.delete(`/sprints/${sprintId}/issues/${taskId}`);
    await Promise.all([fetchSprints(), fetchProjectAndTasks()]);
    return res.data;
  }, [fetchSprints, fetchProjectAndTasks]);

  const fetchBacklog = useCallback(async () => {
    const projId = project?._id || targetId;
    if (!projId) return { totalIssues: 0, totalStoryPoints: 0, tasks: [] };
    const res = await api.get(`/projects/${projId}/backlog`);
    const rawBacklog = res.data?.tasks || [];
    const normalizedList = rawBacklog.map((t) =>
      normalizeTask(t, projId, project?.workspaceId)
    );
    return {
      totalIssues: res.data?.totalIssues || normalizedList.length,
      totalStoryPoints: res.data?.totalStoryPoints || 0,
      tasks: normalizedList
    };
  }, [project, targetId]);

  const reorderBacklog = useCallback(async (taskIds) => {
    const projId = project?._id || targetId;
    const res = await api.patch(`/projects/${projId}/backlog/reorder`, { taskIds });
    return res.data;
  }, [project, targetId]);

  const fetchSprintMetrics = useCallback(async (sprintId) => {
    const res = await api.get(`/sprints/${sprintId}/metrics`);
    return res.data;
  }, []);

  // --- ADVANCED TASK FILTERING & PAGINATION ---
  const fetchTasks = useCallback(async (filterOptions = {}) => {
    const projId = project?._id || targetId;
    if (!projId) return { tasks: [], pagination: null };

    try {
      const params = new URLSearchParams();
      if (filterOptions.status) params.append('status', filterOptions.status);
      if (filterOptions.priority) params.append('priority', filterOptions.priority);
      if (filterOptions.type) params.append('type', filterOptions.type);
      if (filterOptions.assignee) params.append('assignee', filterOptions.assignee);
      if (filterOptions.reporter) params.append('reporter', filterOptions.reporter);
      if (filterOptions.sprint !== undefined && filterOptions.sprint !== '') {
        params.append('sprint', filterOptions.sprint);
      }
      if (filterOptions.labels) params.append('labels', filterOptions.labels);
      if (filterOptions.dueDate) params.append('dueDate', filterOptions.dueDate);
      if (filterOptions.dueDateFrom) params.append('dueDateFrom', filterOptions.dueDateFrom);
      if (filterOptions.dueDateTo) params.append('dueDateTo', filterOptions.dueDateTo);
      if (filterOptions.createdAtFrom) params.append('createdAtFrom', filterOptions.createdAtFrom);
      if (filterOptions.createdAtTo) params.append('createdAtTo', filterOptions.createdAtTo);
      if (filterOptions.search) params.append('search', filterOptions.search);
      if (filterOptions.sortBy) params.append('sortBy', filterOptions.sortBy);
      if (filterOptions.sortOrder) params.append('sortOrder', filterOptions.sortOrder);
      if (filterOptions.page) params.append('page', filterOptions.page);
      if (filterOptions.limit) params.append('limit', filterOptions.limit);

      const qs = params.toString();
      const res = await api.get(`/projects/${projId}/tasks${qs ? `?${qs}` : ''}`);
      const rawTasks = res.data?.tasks || [];
      const normalizedTasksList = rawTasks.map((t) =>
        normalizeTask(t, projId, project?.workspaceId || workspaceId)
      );

      setTasks(normalizedTasksList);
      if (res.data?.pagination) {
        setPagination(res.data.pagination);
      }
      return { tasks: normalizedTasksList, pagination: res.data?.pagination };
    } catch (err) {
      console.error('Failed to fetch filtered tasks:', err);
      return { tasks: [], pagination: null };
    }
  }, [project, targetId, workspaceId]);

  // --- SAVED VIEWS MANAGEMENT ---
  const fetchViews = useCallback(async () => {
    const wsId = project?.workspaceId || workspaceId;
    const projId = project?._id || targetId;
    if (!wsId) return [];

    setIsLoadingViews(true);
    try {
      const res = await api.get(`/views?workspaceId=${wsId}&projectId=${projId}`);
      const fetchedViews = res.data?.views || [];
      setViews(fetchedViews);
      return fetchedViews;
    } catch (err) {
      console.warn('Failed to load saved views:', err?.response?.data?.message || err.message);
      return [];
    } finally {
      setIsLoadingViews(false);
    }
  }, [project, targetId, workspaceId]);

  const createView = useCallback(async (viewData) => {
    const wsId = project?.workspaceId || workspaceId;
    const projId = project?._id || targetId;
    const res = await api.post('/views', {
      ...viewData,
      workspaceId: wsId,
      projectId: viewData.projectId !== undefined ? viewData.projectId : projId
    });
    await fetchViews();
    return res.data?.view;
  }, [project, targetId, workspaceId, fetchViews]);

  const updateView = useCallback(async (viewId, viewData) => {
    const res = await api.patch(`/views/${viewId}`, viewData);
    await fetchViews();
    return res.data?.view;
  }, [fetchViews]);

  const deleteView = useCallback(async (viewId) => {
    const res = await api.delete(`/views/${viewId}`);
    setViews((prev) => prev.filter((v) => v._id !== viewId));
    return res.data;
  }, []);

  const duplicateView = useCallback(async (viewId, customName) => {
    const res = await api.post(`/views/${viewId}/duplicate`, { name: customName });
    await fetchViews();
    return res.data?.view;
  }, [fetchViews]);

  return {
    project,
    tasks,
    pagination,
    stats,
    isLoading,
    error,
    sprints,
    activeSprint,
    isLoadingSprints,
    fetchSprints,
    createSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
    addIssuesToSprint,
    removeIssueFromSprint,
    fetchBacklog,
    reorderBacklog,
    fetchSprintMetrics,
    fetchTasks,
    views,
    isLoadingViews,
    fetchViews,
    createView,
    updateView,
    deleteView,
    duplicateView,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    updateProject,
    deleteProject,
    fetchTaskComments,
    createTaskComment,
    updateTaskComment,
    deleteTaskComment,
    refresh: fetchProjectAndTasks
  };
}

export default useProject;
