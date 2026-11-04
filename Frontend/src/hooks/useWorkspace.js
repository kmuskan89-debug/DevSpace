import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkspaceContext } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { normalizeProject } from '../utils/normalizers';

export function useWorkspace(overrideWorkspaceId) {
  const { workspaceId: paramId } = useParams();
  const context = useWorkspaceContext();
  const { user } = useAuth();

  const targetId = overrideWorkspaceId || paramId || '';

  const workspace = useMemo(() => {
    return context.getWorkspace(targetId);
  }, [context.getWorkspace, targetId]);

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  const wsIdentifier = workspace?._id || workspace?.id;
  const { fetchMembers, fetchInvitations, fetchActivities } = context;

  // Fetch real projects for current workspace from backend
  const fetchProjects = useCallback(async () => {
    if (!wsIdentifier) {
      setProjects([]);
      return;
    }

    setIsLoadingProjects(true);
    setProjectsError(null);

    try {
      const response = await api.get(`/workspaces/${wsIdentifier}/projects`);
      const rawProjects = response.data?.projects || [];
      const normalized = rawProjects.map((p) => normalizeProject(p, wsIdentifier));
      setProjects(normalized);
    } catch (err) {
      console.error('Failed to fetch workspace projects:', err?.response?.data?.message || err.message);
      setProjectsError(err?.response?.data?.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [wsIdentifier]);

  // Fetch projects, members, invitations, and activity for active workspace
  useEffect(() => {
    if (wsIdentifier) {
      fetchProjects();
      fetchMembers(wsIdentifier);
      fetchInvitations(wsIdentifier);
      fetchActivities(wsIdentifier);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsIdentifier]);

  // Create project in MongoDB
  const createProject = useCallback(async (projectData) => {
    if (!workspace) throw new Error('No active workspace selected');
    const currentId = workspace._id || workspace.id;

    const payload = {
      name: projectData.name?.trim(),
      key: projectData.key?.trim().toUpperCase(),
      description: projectData.description?.trim() || '',
      status: projectData.status || 'Active',
      priority: projectData.priority || 'Medium',
      techStack: projectData.techStack,
      githubRepo: projectData.githubRepo?.trim() || '',
      lead: projectData.lead || undefined
    };

    const response = await api.post(`/workspaces/${currentId}/projects`, payload);
    const created = normalizeProject(response.data?.project, currentId);
    setProjects((prev) => [created, ...prev]);
    return created;
  }, [workspace]);

  // Update project in MongoDB
  const updateProject = useCallback(async (projectId, fields) => {
    const response = await api.put(`/projects/${projectId}`, fields);
    const updated = normalizeProject(response.data?.project, workspace?._id || workspace?.id);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId || p._id === projectId ? updated : p))
    );
    return updated;
  }, [workspace]);

  // Delete project in MongoDB
  const deleteProject = useCallback(async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    setProjects((prev) => prev.filter((p) => p.id !== projectId && p._id !== projectId));
    return response.data;
  }, []);

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
    const uId = user._id || user.id;

    if (workspace.ownerId === uId || workspace.owner === user.name) {
      return 'Owner';
    }

    const memberRec = members.find((m) => m.userId === uId || m.id === uId || m.email === user.email);
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
