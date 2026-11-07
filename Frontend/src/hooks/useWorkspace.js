import { useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkspaceContext } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';

export function useWorkspace(overrideWorkspaceId) {
  const { workspaceId: paramId } = useParams();
  const context = useWorkspaceContext();
  const { user } = useAuth();

  const targetId = overrideWorkspaceId || paramId || '';

  const workspace = useMemo(() => {
    return context.getWorkspace(targetId);
  }, [context.getWorkspace, targetId]);

  // If targetId is provided but not found in context.workspaces, fetch directly
  useEffect(() => {
    if (targetId && !workspace && !context.isLoadingWorkspaces && context.fetchWorkspaceById) {
      context.fetchWorkspaceById(targetId);
    }
  }, [targetId, workspace, context.isLoadingWorkspaces, context.fetchWorkspaceById]);

  const wsIdentifier = workspace?._id || workspace?.id;
  const {
    fetchMembers,
    fetchInvitations,
    fetchActivities,
    fetchProjects: contextFetchProjects,
    createProject: contextCreateProject,
    updateProject: contextUpdateProject,
    deleteProject: contextDeleteProject,
    projectsByWorkspace,
    isLoadingProjectsByWorkspace,
    projectsErrorByWorkspace
  } = context;

  const projects = useMemo(() => {
    if (!wsIdentifier) return [];
    return projectsByWorkspace?.[wsIdentifier] || [];
  }, [projectsByWorkspace, wsIdentifier]);

  const isLoadingProjects = Boolean(wsIdentifier && isLoadingProjectsByWorkspace?.[wsIdentifier]);
  const projectsError = (wsIdentifier && projectsErrorByWorkspace?.[wsIdentifier]) || null;

  // Fetch real projects for current workspace from backend
  const fetchProjects = useCallback(
    (force = true) => {
      if (!wsIdentifier) return Promise.resolve([]);
      return contextFetchProjects(wsIdentifier, force);
    },
    [contextFetchProjects, wsIdentifier]
  );

  // Fetch projects, members, invitations, and activity for active workspace
  useEffect(() => {
    if (wsIdentifier) {
      contextFetchProjects(wsIdentifier, false);
      fetchMembers(wsIdentifier);
      fetchInvitations(wsIdentifier);
      fetchActivities(wsIdentifier);
    }
  }, [wsIdentifier, contextFetchProjects, fetchMembers, fetchInvitations, fetchActivities]);

  // Create project in MongoDB
  const createProject = useCallback(
    async (projectData) => {
      if (!wsIdentifier) throw new Error('No active workspace selected');
      return contextCreateProject(wsIdentifier, projectData);
    },
    [contextCreateProject, wsIdentifier]
  );

  // Update project in MongoDB
  const updateProject = useCallback(
    async (projectId, fields) => {
      if (!wsIdentifier) throw new Error('No active workspace selected');
      return contextUpdateProject(wsIdentifier, projectId, fields);
    },
    [contextUpdateProject, wsIdentifier]
  );

  // Delete project in MongoDB
  const deleteProject = useCallback(
    async (projectId) => {
      if (!wsIdentifier) throw new Error('No active workspace selected');
      return contextDeleteProject(wsIdentifier, projectId);
    },
    [contextDeleteProject, wsIdentifier]
  );

  // Members list
  const members = useMemo(() => {
    if (!wsIdentifier) return [];
    return context.membersByWorkspace[wsIdentifier] || context.getMembers(wsIdentifier);
  }, [context.membersByWorkspace, context.getMembers, wsIdentifier]);

  // Invitations list
  const invitations = useMemo(() => {
    if (!wsIdentifier) return [];
    return context.invitationsByWorkspace[wsIdentifier] || [];
  }, [context.invitationsByWorkspace, wsIdentifier]);

  // Activity stream
  const activities = useMemo(() => {
    if (!wsIdentifier) return [];
    return context.activitiesByWorkspace[wsIdentifier] || [];
  }, [context.activitiesByWorkspace, wsIdentifier]);

  // Compute current user's role in this workspace
  const userRole = useMemo(() => {
    if (!workspace || !user) return 'Viewer';
    const uId = (user._id || user.id)?.toString();
    const wsOwnerId = (workspace.ownerId || workspace.owner?._id || (typeof workspace.owner === 'string' && workspace.owner.length === 24 ? workspace.owner : null))?.toString();

    if (wsOwnerId && uId && wsOwnerId === uId) {
      return 'Owner';
    }
    if (workspace.owner === user.name || workspace.ownerName === user.name) {
      return 'Owner';
    }

    const memberRec = members.find((m) => {
      const mId = (m.userId || m.id || m._id)?.toString();
      return mId === uId || m.email === user.email;
    });
    if (memberRec) {
      if (memberRec.role === 'Workspace Owner' || memberRec.role === 'Owner') return 'Owner';
      return memberRec.role;
    }

    return 'Viewer';
  }, [workspace, user, members]);

  const isOwner = userRole === 'Owner';
  const isAdmin = userRole === 'Admin' || isOwner;
  const isWriter = userRole !== 'Viewer';

  return {
    workspace,
    isLoadingWorkspaces: context.isLoadingWorkspaces,
    projects,
    isLoadingProjects,
    projectsError,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    members,
    invitations,
    activities,
    userRole,
    isOwner,
    isAdmin,
    isWriter,
    isLoadingMembers: context.isLoadingMembers,
    isLoadingInvitations: context.isLoadingInvitations,
    isLoadingActivities: context.isLoadingActivities,
    refreshMembers: () => context.fetchMembers(wsIdentifier),
    refreshInvitations: () => context.fetchInvitations(wsIdentifier),
    refreshActivities: (resourceType) => context.fetchActivities(wsIdentifier, resourceType),
    allWorkspaces: context.workspaces,
    createWorkspace: context.createWorkspace,
    updateWorkspace: context.updateWorkspace,
    deleteWorkspace: context.deleteWorkspace,
    inviteMember: (args) => context.inviteMember(wsIdentifier, args),
    revokeInvitation: (invitationId) => context.revokeInvitation(wsIdentifier, invitationId),
    updateMemberRole: (memberId, newRole) => context.updateMemberRole(wsIdentifier, memberId, newRole),
    removeMember: (memberId) => context.removeMember(wsIdentifier, memberId),
    openCreateModal: context.openCreateModal,
    closeCreateModal: context.closeCreateModal,
    isCreateModalOpen: context.isCreateModalOpen
  };
}

export default useWorkspace;
