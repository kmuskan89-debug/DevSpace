import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Layers, FolderGit2, ListTodo, Kanban, Users, Activity, Settings, CheckSquare } from 'lucide-react';
import Tabs from '../common/Tabs';
import useWorkspace from '../../hooks/useWorkspace';

export function WorkspaceNavTabs({ projectCount = 0, memberCount = 0, projects: propProjects }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId: paramWsId, projectId: paramProjId } = useParams();
  const { workspace, projects: hookProjects } = useWorkspace(paramWsId);

  const effectiveWorkspaceId = paramWsId || workspace?.id || workspace?._id || 'ws-core-platform';
  const effectiveProjects = propProjects !== undefined ? propProjects : hookProjects;

  const hasProjects = Array.isArray(effectiveProjects) && effectiveProjects.length > 0;
  const activeProjectId = paramProjId && effectiveProjects?.some((p) => (p.id === paramProjId || p._id === paramProjId))
    ? paramProjId
    : hasProjects
    ? (effectiveProjects[0].id || effectiveProjects[0]._id)
    : null;

  const resolvedProjectCount = projectCount || (effectiveProjects?.length ?? 0);

  const tabs = [
    { id: 'overview', label: 'Overview', path: `/workspace/${effectiveWorkspaceId}`, icon: Layers },
    { id: 'tasks', label: 'My Tasks', path: `/workspace/${effectiveWorkspaceId}/tasks`, icon: CheckSquare },
    { id: 'projects', label: 'Projects', path: `/workspace/${effectiveWorkspaceId}/projects`, icon: FolderGit2, badge: resolvedProjectCount },
    { id: 'backlog', label: 'Backlog', path: `/workspace/${effectiveWorkspaceId}/backlog`, icon: ListTodo },
    {
      id: 'board',
      label: 'Sprint Board',
      path: activeProjectId
        ? `/workspace/${effectiveWorkspaceId}/projects/${activeProjectId}/board`
        : `/workspace/${effectiveWorkspaceId}/projects`,
      icon: Kanban,
      disabled: !hasProjects,
      title: !hasProjects ? 'Create a project first to access the Sprint Board' : undefined
    },
    { id: 'members', label: 'Members', path: `/workspace/${effectiveWorkspaceId}/members`, icon: Users, badge: memberCount },
    { id: 'activity', label: 'Activity', path: `/workspace/${effectiveWorkspaceId}/activity`, icon: Activity },
    { id: 'settings', label: 'Settings', path: `/workspace/${effectiveWorkspaceId}/settings`, icon: Settings },
  ];

  const currentTab = tabs.find((t) => location.pathname === t.path)?.id ||
    (location.pathname.includes('/tasks') && !location.pathname.includes('/projects/') ? 'tasks' :
     location.pathname.includes('/backlog') ? 'backlog' :
     location.pathname.includes('/projects/') && location.pathname.endsWith('/board') ? 'board' :
     location.pathname.includes('/projects') ? 'projects' :
     location.pathname.includes('/members') ? 'members' :
     location.pathname.includes('/activity') ? 'activity' :
     location.pathname.includes('/settings') ? 'settings' : 'overview');

  const handleTabChange = (tabId) => {
    const targetTab = tabs.find((t) => t.id === tabId);
    if (targetTab && !targetTab.disabled) {
      navigate(targetTab.path);
    }
  };

  return <Tabs tabs={tabs} activeTab={currentTab} onChange={handleTabChange} className="my-4" />;
}

export default WorkspaceNavTabs;
