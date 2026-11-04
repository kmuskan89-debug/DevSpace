/**
 * Data normalization helpers between MongoDB backend and DevSpace UI components
 */

export const normalizeWorkspace = (ws) => {
  if (!ws) return null;
  const idStr = ws._id ? ws._id.toString() : (ws.id || '');
  const ownerObj = ws.owner;
  const ownerId = ownerObj?._id ? ownerObj._id.toString() : (ownerObj?.toString() || '');
  const ownerName = ownerObj?.name || (typeof ownerObj === 'string' ? ownerObj : 'You');
  const ownerEmail = ownerObj?.email || '';

  return {
    id: idStr,
    _id: idStr,
    name: ws.name || 'Untitled Workspace',
    slug: ws.slug || idStr,
    description: ws.description || '',
    icon: ws.icon || 'Layers',
    color: ws.color || 'from-indigo-500 to-purple-600',
    visibility: ws.visibility || 'Public',
    techStack: ws.techStack || ['React', 'Node.js', 'MongoDB'],
    memberCount: (ws.members && Array.isArray(ws.members) && ws.members.length > 0) ? ws.members.length : 1,
    projectCount: ws.projectCount || 0,
    openIssues: ws.openIssues || 0,
    starred: Boolean(ws.starred),
    updatedAt: ws.updatedAt ? new Date(ws.updatedAt).toLocaleDateString() : 'Just now',
    owner: ownerName,
    ownerId: ownerId,
    ownerEmail: ownerEmail,
    rawOwner: ownerObj,
    members: ws.members || []
  };
};

export const normalizeProject = (p, defaultWorkspaceId = '') => {
  if (!p) return null;
  const idStr = p._id ? p._id.toString() : (p.id || '');
  const wsId = p.workspace?._id
    ? p.workspace._id.toString()
    : (p.workspace?.toString() || p.workspaceId || defaultWorkspaceId);

  const leadName = p.lead?.name || (typeof p.lead === 'string' ? p.lead : 'You');
  const leadId = p.lead?._id ? p.lead._id.toString() : (p.lead?.toString() || '');
  const leadEmail = p.lead?.email || '';
  const cleanKey = p.key ? p.key.trim().toUpperCase() : (p.name ? p.name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() : 'PRJ');

  const totalTasks = p.stats?.totalTasks ?? (p.openTasksCount !== undefined && p.completedTasksCount !== undefined ? p.openTasksCount + p.completedTasksCount : (p.totalTasks || 0));
  const completedTasks = p.stats?.completedTasks ?? (p.completedTasksCount !== undefined ? p.completedTasksCount : (p.completedTasks || 0));
  const openTasks = p.stats?.openTasks ?? (p.openTasksCount !== undefined ? p.openTasksCount : (totalTasks - completedTasks));
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (typeof p.progress === 'number' ? p.progress : 0);

  return {
    id: idStr,
    _id: idStr,
    workspaceId: wsId,
    workspace: p.workspace,
    name: p.name || 'Untitled Project',
    key: cleanKey,
    description: p.description || '',
    status: p.status || 'Active',
    priority: p.priority || 'Medium',
    progress,
    techStack: Array.isArray(p.techStack) && p.techStack.length > 0 ? p.techStack : ['React', 'Node.js'],
    lead: leadName,
    leadId,
    leadEmail,
    leadObj: p.lead,
    openTasksCount: openTasks,
    completedTasksCount: completedTasks,
    totalTasksCount: totalTasks,
    githubRepo: p.githubRepo || `devspace/${cleanKey.toLowerCase()}`,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Just now',
    createdAt: p.createdAt
  };
};

export const normalizeTask = (t, defaultProjectId = '', defaultWorkspaceId = '') => {
  if (!t) return null;
  const idStr = t._id ? t._id.toString() : (t.id || '');
  const projId = t.project?._id
    ? t.project._id.toString()
    : (t.project?.toString() || t.projectId || defaultProjectId);
  const wsId = t.workspace?._id
    ? t.workspace._id.toString()
    : (t.workspace?.toString() || t.workspaceId || defaultWorkspaceId);

  const assigneeName = t.assignee?.name || (typeof t.assignee === 'string' ? t.assignee : null);
  const assigneeId = t.assignee?._id ? t.assignee._id.toString() : (t.assignee?.toString() || null);
  const assigneeEmail = t.assignee?.email || '';

  // Tags from labels or tags
  const tags = Array.isArray(t.labels) && t.labels.length > 0
    ? t.labels
    : (Array.isArray(t.tags) ? t.tags : []);

  // Standardize status for Kanban columns: Code Review and In Review
  let normalizedStatus = t.status || 'To Do';
  if (normalizedStatus === 'In Review') {
    normalizedStatus = 'Code Review';
  }

  const formattedDueDate = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : (t.dueDate || '');

  return {
    id: t.issueKey || idStr,
    _id: idStr,
    issueKey: t.issueKey || idStr,
    title: t.title || '',
    description: t.description || '',
    type: t.type || 'Task',
    status: normalizedStatus,
    rawStatus: t.status || 'To Do',
    priority: t.priority || 'Medium',
    projectId: projId,
    project: t.project,
    workspaceId: wsId,
    workspace: t.workspace,
    assignee: assigneeName ? {
      id: assigneeId,
      _id: assigneeId,
      name: assigneeName,
      email: assigneeEmail,
      avatar: t.assignee?.avatar || ''
    } : null,
    reporter: t.reporter,
    tags,
    labels: tags,
    dueDate: formattedDueDate,
    rawDueDate: t.dueDate,
    storyPoints: t.storyPoints !== null && t.storyPoints !== undefined ? t.storyPoints : '',
    estimate: t.estimate || '',
    branch: t.branch || '',
    subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
    comments: Array.isArray(t.comments) ? t.comments : [],
    sprint: t.sprint?._id ? t.sprint._id.toString() : (t.sprint?.toString() || null),
    sprintObj: t.sprint && typeof t.sprint === 'object' ? t.sprint : null,
    order: typeof t.order === 'number' ? t.order : 0,
    backlogOrder: typeof t.backlogOrder === 'number' ? t.backlogOrder : 0,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : 'Just now'
  };
};

/**
 * Check if current user has permission to manage (edit/delete) a project
 */
export const canManageProject = (project, workspace, user) => {
  if (!user) return false;
  const currentUserId = (user._id || user.id || '').toString();

  // 1. Check workspace owner
  const wsOwnerId = (workspace?.ownerId || workspace?.owner?._id || workspace?.owner?.id || workspace?.owner || '').toString();
  if (wsOwnerId && wsOwnerId === currentUserId) return true;

  // 2. Check workspace members for Admin or Workspace Owner role
  if (workspace?.members && Array.isArray(workspace.members)) {
    const member = workspace.members.find(m => {
      const mId = (m.user?._id || m.user?.id || m.user || '').toString();
      return mId === currentUserId;
    });
    if (member && (member.role === 'Admin' || member.role === 'Workspace Owner')) {
      return true;
    }
  }

  // 3. Check project lead
  if (project) {
    const leadId = (project.leadId || project.leadObj?._id || project.lead?._id || project.lead?.id || project.lead || '').toString();
    if (leadId && leadId === currentUserId) return true;
  }

  return false;
};

