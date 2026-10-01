import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Layers, FolderGit2, Kanban, Users, Activity, Settings } from 'lucide-react';
import Tabs from '../common/Tabs';

export function WorkspaceNavTabs({ projectCount = 0, memberCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId = 'ws-core-platform' } = useParams();

  const tabs = [
    { id: 'overview', label: 'Overview', path: `/workspace/${workspaceId}`, icon: Layers },
    { id: 'projects', label: 'Projects', path: `/workspace/${workspaceId}/projects`, icon: FolderGit2, badge: projectCount },
    { id: 'board', label: 'Sprint Board', path: `/workspace/${workspaceId}/projects/proj-auth-service/board`, icon: Kanban },
    { id: 'members', label: 'Members', path: `/workspace/${workspaceId}/members`, icon: Users, badge: memberCount },
    { id: 'activity', label: 'Activity', path: `/workspace/${workspaceId}/activity`, icon: Activity },
    { id: 'settings', label: 'Settings', path: `/workspace/${workspaceId}/settings`, icon: Settings },
  ];

  const currentTab = tabs.find((t) => location.pathname === t.path)?.id ||
    (location.pathname.includes('/projects/') && location.pathname.endsWith('/board') ? 'board' :
     location.pathname.includes('/projects') ? 'projects' :
     location.pathname.includes('/members') ? 'members' :
     location.pathname.includes('/activity') ? 'activity' :
     location.pathname.includes('/settings') ? 'settings' : 'overview');

  const handleTabChange = (tabId) => {
    const targetTab = tabs.find((t) => t.id === tabId);
    if (targetTab) {
      navigate(targetTab.path);
    }
  };

  return <Tabs tabs={tabs} activeTab={currentTab} onChange={handleTabChange} className="my-4" />;
}

export default WorkspaceNavTabs;
