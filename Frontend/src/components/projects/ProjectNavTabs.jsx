import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Layers, Kanban, CheckSquare, Activity } from 'lucide-react';
import Tabs from '../common/Tabs';

export function ProjectNavTabs({ taskCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId = 'ws-core-platform', projectId = 'proj-auth-service' } = useParams();

  const basePath = `/workspace/${workspaceId}/projects/${projectId}`;

  const tabs = [
    { id: 'overview', label: 'Overview', path: basePath, icon: Layers },
    { id: 'board', label: 'Board', path: `${basePath}/board`, icon: Kanban },
    { id: 'tasks', label: 'Tasks', path: `${basePath}/tasks`, icon: CheckSquare, badge: taskCount },
    { id: 'activity', label: 'Activity', path: `${basePath}/activity`, icon: Activity },
  ];

  const currentTab = tabs.find((t) => location.pathname === t.path)?.id ||
    (location.pathname.endsWith('/board') ? 'board' :
     location.pathname.endsWith('/tasks') ? 'tasks' :
     location.pathname.endsWith('/activity') ? 'activity' : 'overview');

  const handleTabChange = (tabId) => {
    const targetTab = tabs.find((t) => t.id === tabId);
    if (targetTab) {
      navigate(targetTab.path);
    }
  };

  return <Tabs tabs={tabs} activeTab={currentTab} onChange={handleTabChange} className="my-4" />;
}

export default ProjectNavTabs;
