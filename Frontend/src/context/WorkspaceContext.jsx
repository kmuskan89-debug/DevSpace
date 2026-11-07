import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/axios';
import { useAuth } from './AuthContext';
import { normalizeWorkspace, normalizeProject } from '../utils/normalizers';

export { normalizeWorkspace, normalizeProject };

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [error, setError] = useState(null);

  // Cache for members, invitations, activities, and projects by workspace ID
  const [membersByWorkspace, setMembersByWorkspace] = useState({});
  const [invitationsByWorkspace, setInvitationsByWorkspace] = useState({});
  const [activitiesByWorkspace, setActivitiesByWorkspace] = useState({});
  const [projectsByWorkspace, setProjectsByWorkspace] = useState({});
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isLoadingProjectsByWorkspace, setIsLoadingProjectsByWorkspace] = useState({});
  const [projectsErrorByWorkspace, setProjectsErrorByWorkspace] = useState({});

  const projectsByWorkspaceRef = useRef(projectsByWorkspace);
  projectsByWorkspaceRef.current = projectsByWorkspace;
  const inFlightProjectsRef = useRef({});

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch workspaces from MongoDB
  const fetchWorkspaces = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setIsLoadingWorkspaces(false);
      return;
    }

    setIsLoadingWorkspaces(true);
    setError(null);

    try {
      const response = await api.get('/workspaces');
      const rawList = response.data?.workspaces || [];
      const normalizedList = rawList.map(normalizeWorkspace);
      setWorkspaces(normalizedList);
    } catch (err) {
      console.error('Failed to fetch workspaces from database:', err?.response?.data?.message || err.message);
      setError(err?.response?.data?.message || 'Failed to load workspaces');
    } finally {
      setIsLoadingWorkspaces(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Find a workspace by ID, _id, or slug
  const getWorkspace = useCallback((idOrSlug) => {
    if (!idOrSlug) {
      return workspaces[0] || null;
    }
    const found = workspaces.find(
      (w) => w.id === idOrSlug || w.slug === idOrSlug || w._id === idOrSlug
    );
    return found || null;
  }, [workspaces]);

  // Fetch a single workspace directly if navigated to by ID or slug
  const fetchWorkspaceById = useCallback(async (idOrSlug) => {
    if (!idOrSlug || !isAuthenticated) return null;
    try {
      const response = await api.get(`/workspaces/${idOrSlug}`);
      const rawWs = response.data?.workspace;
      if (rawWs) {
        const normalized = normalizeWorkspace(rawWs);
        setWorkspaces((prev) => {
          const exists = prev.some((w) => w.id === normalized.id || w._id === normalized._id || w.slug === normalized.slug);
          if (exists) {
            return prev.map((w) => (w.id === normalized.id || w._id === normalized._id || w.slug === normalized.slug ? normalized : w));
          }
          return [...prev, normalized];
        });
        return normalized;
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch single workspace:', idOrSlug, err?.response?.data?.message || err.message);
      return null;
    }
  }, [isAuthenticated]);

  // Fetch real workspace projects from MongoDB
  const fetchProjects = useCallback(async (workspaceId, force = false) => {
    if (!workspaceId) return [];

    if (!force && projectsByWorkspaceRef.current[workspaceId]) {
      return projectsByWorkspaceRef.current[workspaceId];
    }

    if (inFlightProjectsRef.current[workspaceId]) {
      return inFlightProjectsRef.current[workspaceId];
    }

    setIsLoadingProjectsByWorkspace((prev) => ({ ...prev, [workspaceId]: true }));
    setProjectsErrorByWorkspace((prev) => ({ ...prev, [workspaceId]: null }));

    const fetchPromise = (async () => {
      try {
        const response = await api.get(`/workspaces/${workspaceId}/projects`);
        const rawProjects = response.data?.projects || [];
        const normalized = rawProjects.map((p) => normalizeProject(p, workspaceId));
        setProjectsByWorkspace((prev) => ({
          ...prev,
          [workspaceId]: normalized
        }));
        return normalized;
      } catch (err) {
        const msg = err?.response?.data?.message || err.message || 'Failed to load projects';
        console.error('Failed to fetch workspace projects:', msg);
        setProjectsErrorByWorkspace((prev) => ({ ...prev, [workspaceId]: msg }));
        setProjectsByWorkspace((prev) => ({
          ...prev,
          [workspaceId]: prev[workspaceId] || []
        }));
        return [];
      } finally {
        setIsLoadingProjectsByWorkspace((prev) => ({ ...prev, [workspaceId]: false }));
        delete inFlightProjectsRef.current[workspaceId];
      }
    })();

    inFlightProjectsRef.current[workspaceId] = fetchPromise;
    return fetchPromise;
  }, []);

  // Create project in MongoDB
  const createProject = useCallback(async (workspaceId, projectData) => {
    if (!workspaceId) throw new Error('No active workspace selected');

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

    const response = await api.post(`/workspaces/${workspaceId}/projects`, payload);
    const created = normalizeProject(response.data?.project, workspaceId);

    setProjectsByWorkspace((prev) => ({
      ...prev,
      [workspaceId]: [created, ...(prev[workspaceId] || [])]
    }));

    // Increment workspace projectCount
    setWorkspaces((prev) =>
      prev.map((w) =>
        (w.id === workspaceId || w._id === workspaceId || w.slug === workspaceId)
          ? { ...w, projectCount: (w.projectCount || 0) + 1 }
          : w
      )
    );

    return created;
  }, []);

  // Update project in MongoDB
  const updateProject = useCallback(async (workspaceId, projectId, fields) => {
    const response = await api.put(`/projects/${projectId}`, fields);
    const updated = normalizeProject(response.data?.project, workspaceId);

    setProjectsByWorkspace((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).map((p) =>
        p.id === projectId || p._id === projectId ? updated : p
      )
    }));

    return updated;
  }, []);

  // Delete project in MongoDB
  const deleteProject = useCallback(async (workspaceId, projectId) => {
    const response = await api.delete(`/projects/${projectId}`);

    setProjectsByWorkspace((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).filter(
        (p) => p.id !== projectId && p._id !== projectId
      )
    }));

    // Decrement workspace projectCount
    setWorkspaces((prev) =>
      prev.map((w) =>
        (w.id === workspaceId || w._id === workspaceId || w.slug === workspaceId)
          ? { ...w, projectCount: Math.max(0, (w.projectCount || 1) - 1) }
          : w
      )
    );

    return response.data;
  }, []);

  // Fetch real workspace members from MongoDB
  const fetchMembers = useCallback(async (workspaceId) => {
    if (!workspaceId) return [];

    setIsLoadingMembers(true);
    try {
      const res = await api.get(`/workspaces/${workspaceId}/members`);
      const rawMembers = res.data?.members || [];
      const normalizedMembers = rawMembers.map((m) => {
        const uId = m.user?._id || m.user?.id || m._id;
        return {
          id: uId,
          _id: uId,
          userId: uId,
          name: m.user?.name || 'Collaborator',
          email: m.user?.email || '',
          avatar: m.user?.avatar || '',
          role: m.role || 'Member',
          status: 'Active',
          commits: 0,
          prMerged: 0,
          joinedDate: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'Active member'
        };
      });

      setMembersByWorkspace((prev) => ({
        ...prev,
        [workspaceId]: normalizedMembers
      }));

      return normalizedMembers;
    } catch (err) {
      console.error('Failed to fetch workspace members:', err);
      return [];
    } finally {
      setIsLoadingMembers(false);
    }
  }, []);

  // Fetch pending invitations for workspace
  const fetchInvitations = useCallback(async (workspaceId) => {
    if (!workspaceId) return [];

    setIsLoadingInvitations(true);
    try {
      const res = await api.get(`/workspaces/${workspaceId}/invitations`);
      const rawInvitations = res.data?.invitations || [];
      setInvitationsByWorkspace((prev) => ({
        ...prev,
        [workspaceId]: rawInvitations
      }));
      return rawInvitations;
    } catch (err) {
      console.warn('Failed to fetch workspace invitations:', err?.response?.data?.message || err.message);
      return [];
    } finally {
      setIsLoadingInvitations(false);
    }
  }, []);

  // Fetch persistent workspace activity logs
  const fetchActivities = useCallback(async (workspaceId, filterResourceType = null) => {
    if (!workspaceId) return [];

    setIsLoadingActivities(true);
    try {
      const url = filterResourceType
        ? `/workspaces/${workspaceId}/activity?resourceType=${filterResourceType}&limit=30`
        : `/workspaces/${workspaceId}/activity?limit=30`;
      const res = await api.get(url);
      const rawActivities = res.data?.activities || [];
      setActivitiesByWorkspace((prev) => ({
        ...prev,
        [workspaceId]: rawActivities
      }));
      return rawActivities;
    } catch (err) {
      console.warn('Failed to fetch workspace activities:', err?.response?.data?.message || err.message);
      return [];
    } finally {
      setIsLoadingActivities(false);
    }
  }, []);

  // Get cached members or fallback to empty
  const getMembers = useCallback((workspaceId) => {
    if (!workspaceId) return [];
    if (membersByWorkspace[workspaceId]) {
      return membersByWorkspace[workspaceId];
    }
    const targetWs = workspaces.find((w) => w.id === workspaceId || w.slug === workspaceId);
    if (targetWs && targetWs.members && targetWs.members.length > 0) {
      return targetWs.members.map((m, idx) => ({
        id: m.user?._id || `mem-${idx}`,
        _id: m.user?._id || `mem-${idx}`,
        name: m.user?.name || (idx === 0 ? (targetWs.owner || user?.name || 'Owner') : 'Team Member'),
        email: m.user?.email || '',
        role: m.role || 'Member',
        status: 'Active',
        avatar: '',
        commits: 0,
        prMerged: 0,
        joinedDate: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'Active member'
      }));
    }
    return [];
  }, [membersByWorkspace, workspaces, user]);

  // Create a new workspace in MongoDB
  const createWorkspace = async ({ name, description, icon = 'Layers', color = 'from-indigo-500 to-purple-600', visibility = 'Public' }) => {
    const cleanName = name?.trim();
    if (!cleanName) {
      throw new Error('Workspace name is required.');
    }

    const response = await api.post('/workspaces', {
      name: cleanName,
      description: description?.trim() || '',
      icon,
      color,
      visibility
    });

    const created = normalizeWorkspace(response.data.workspace);
    setWorkspaces((prev) => [created, ...prev]);

    return created;
  };

  // Update existing workspace in MongoDB
  const updateWorkspace = async (workspaceId, fields) => {
    try {
      const response = await api.put(`/workspaces/${workspaceId}`, fields);
      const updated = normalizeWorkspace(response.data.workspace);
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === workspaceId || w.slug === workspaceId ? updated : w))
      );
      return updated;
    } catch (err) {
      console.error('Failed to update workspace in database:', err);
      throw new Error(err.response?.data?.message || 'Failed to update workspace');
    }
  };

  // Delete a workspace in MongoDB
  const deleteWorkspace = async (workspaceId) => {
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId && w.slug !== workspaceId));
      setMembersByWorkspace((prev) => {
        const nextMap = { ...prev };
        delete nextMap[workspaceId];
        return nextMap;
      });
      setInvitationsByWorkspace((prev) => {
        const nextMap = { ...prev };
        delete nextMap[workspaceId];
        return nextMap;
      });
      setProjectsByWorkspace((prev) => {
        const nextMap = { ...prev };
        delete nextMap[workspaceId];
        return nextMap;
      });
    } catch (err) {
      console.error('Failed to delete workspace in database:', err);
      throw new Error(err.response?.data?.message || 'Failed to delete workspace');
    }
  };

  // Invite member via Backend API
  const inviteMember = async (workspaceId, { email, role = 'Member' }) => {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter a valid email address.');
    }

    const res = await api.post(`/workspaces/${workspaceId}/invitations`, {
      email: cleanEmail,
      role
    });

    // Refresh pending invitations list
    await fetchInvitations(workspaceId);

    return {
      invitation: res.data?.invitation,
      token: res.data?.invitationToken || res.data?.invitation?.token,
      url: res.data?.invitationUrl
    };
  };

  // Revoke an invitation via Backend API
  const revokeInvitation = async (workspaceId, invitationId) => {
    await api.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`);
    setInvitationsByWorkspace((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).filter((inv) => inv._id !== invitationId)
    }));
  };

  // Update member role via Backend API
  const updateMemberRole = async (workspaceId, memberId, newRole) => {
    const res = await api.patch(`/workspaces/${workspaceId}/members/${memberId}/role`, {
      role: newRole
    });

    setMembersByWorkspace((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).map((m) =>
        m.id === memberId || m._id === memberId ? { ...m, role: newRole } : m
      )
    }));

    return res.data;
  };

  // Remove member via Backend API
  const removeMember = async (workspaceId, memberId) => {
    await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);

    setMembersByWorkspace((prev) => ({
      ...prev,
      [workspaceId]: (prev[workspaceId] || []).filter((m) => m.id !== memberId && m._id !== memberId)
    }));

    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === workspaceId ? { ...w, memberCount: Math.max(0, (w.memberCount || 1) - 1) } : w
      )
    );
  };

  const openCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
  const closeCreateModal = useCallback(() => setIsCreateModalOpen(false), []);

  const value = React.useMemo(() => ({
    workspaces,
    isLoadingWorkspaces,
    error,
    fetchWorkspaces,
    getWorkspace,
    fetchWorkspaceById,
    getMembers,
    membersByWorkspace,
    invitationsByWorkspace,
    activitiesByWorkspace,
    projectsByWorkspace,
    isLoadingMembers,
    isLoadingInvitations,
    isLoadingActivities,
    isLoadingProjectsByWorkspace,
    projectsErrorByWorkspace,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    fetchMembers,
    fetchInvitations,
    fetchActivities,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    inviteMember,
    revokeInvitation,
    updateMemberRole,
    removeMember,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal
  }), [
    workspaces,
    isLoadingWorkspaces,
    error,
    fetchWorkspaces,
    getWorkspace,
    fetchWorkspaceById,
    getMembers,
    membersByWorkspace,
    invitationsByWorkspace,
    activitiesByWorkspace,
    projectsByWorkspace,
    isLoadingMembers,
    isLoadingInvitations,
    isLoadingActivities,
    isLoadingProjectsByWorkspace,
    projectsErrorByWorkspace,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    fetchMembers,
    fetchInvitations,
    fetchActivities,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    inviteMember,
    revokeInvitation,
    updateMemberRole,
    removeMember,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal
  ]);

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return context;
}

export default WorkspaceContext;
