import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useWorkspace from '../hooks/useWorkspace';
import WorkspaceHeader from '../components/workspace/WorkspaceHeader';
import WorkspaceNavTabs from '../components/workspace/WorkspaceNavTabs';
import TaskModal from '../components/projects/TaskModal';

export function WorkspaceLayout() {
  const navigate = useNavigate();
  const { workspace, projects, members } = useWorkspace();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleOpenInviteMember = () => {
    alert(`Invite link for ${workspace.name} copied to clipboard!`);
  };

  const handleOpenSettings = () => {
    navigate(`/workspace/${workspace.id}/settings`);
  };

  const handleCreateTask = (newTask) => {
    console.log('Task saved inside workspace:', newTask);
    alert(`Created task "${newTask.title}" in ${workspace.name}`);
  };

  return (
    <div className="space-y-4">
      {/* Workspace Summary Header */}
      <WorkspaceHeader
        workspace={workspace}
        onOpenNewProject={() => setIsTaskModalOpen(true)}
        onOpenInviteMember={handleOpenInviteMember}
        onOpenSettings={handleOpenSettings}
      />

      {/* Navigation Sub-Tabs */}
      <WorkspaceNavTabs
        projectCount={projects.length}
        memberCount={members.length}
      />

      {/* Sub-Route Page Content */}
      <div className="pt-2">
        <Outlet />
      </div>

      {/* Workspace Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleCreateTask}
      />
    </div>
  );
}

export default WorkspaceLayout;
