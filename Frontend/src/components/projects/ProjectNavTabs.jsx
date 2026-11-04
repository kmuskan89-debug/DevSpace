import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Layers, Kanban, ListTodo, CheckSquare, BarChart3, Activity, Settings } from 'lucide-react';
import Tabs from '../common/Tabs';

export function ProjectNavTabs({ taskCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId = 'ws-core-platform', projectId = 'proj-auth-service' } = useParams();

  const basePath = `/workspace/${workspaceId}/projects/${projectId}`;

  const tabs = [
    { id: 'overview', label: 'Overview', path: basePath, icon: Layers },
    { id: 'board', label: 'Board', path: `${basePath}/board`, icon: Kanban },
    { id: 'backlog', label: 'Backlog', path: `${basePath}/backlog`, icon: ListTodo },
    { id: 'tasks', label: 'Tasks', path: `${basePath}/tasks`, icon: CheckSquare, badge: taskCount },
    { id: 'reports', label: 'Reports', path: `${basePath}/reports`, icon: BarChart3 },
    { id: 'activity', label: 'Activity', path: `${basePath}/activity`, icon: Activity },
    { id: 'settings', label: 'Settings', path: `${basePath}/settings`, icon: Settings },
  ];

  const currentTab = tabs.find((t) => location.pathname === t.path)?.id ||
    (location.pathname.endsWith('/board') ? 'board' :
     location.pathname.endsWith('/backlog') ? 'backlog' :
     location.pathname.endsWith('/tasks') ? 'tasks' :
     location.pathname.endsWith('/reports') ? 'reports' :
     location.pathname.endsWith('/activity') ? 'activity' :
     location.pathname.endsWith('/settings') ? 'settings' : 'overview');

  const handleTabChange = (tabId) => {
    const targetTab = tabs.find((t) => t.id === tabId);
    if (targetTab) {
      navigate(targetTab.path);
    }
  };

  return <Tabs tabs={tabs} activeTab={currentTab} onChange={handleTabChange} className="my-4" />;
}

export default ProjectNavTabs;
