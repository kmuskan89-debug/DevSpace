import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import useWorkspace from '../hooks/useWorkspace';
import WorkspaceHeader from '../components/workspace/WorkspaceHeader';
import WorkspaceNavTabs from '../components/workspace/WorkspaceNavTabs';
import TaskModal from '../components/projects/TaskModal';
import { useToast } from '../components/common/Toast';

export function WorkspaceLayout() {
  const navigate = useNavigate();
  const { workspace, isLoadingWorkspaces, projects, members } = useWorkspace();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const { addToast } = useToast();

  if (isLoadingWorkspaces) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-mono text-slate-400">Loading workspace...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="py-12 text-center rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] p-6 space-y-3 max-w-md mx-auto mt-8">
        <div className="w-10 h-10 rounded-md bg-[#FDF3F2] dark:bg-[rgba(248,113,113,0.12)] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.25)] text-[#D83B01] dark:text-[#F87171] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">Workspace Unavailable</h2>
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0]">
            This workspace does not exist or you do not have permission to view it.
          </p>
        </div>
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-3 py-1.5 bg-[#252525] hover:bg-[#111111] dark:bg-[#F2F2F2] dark:hover:bg-[#FFFFFF] text-white dark:text-[#191919] rounded-md text-xs font-medium cursor-pointer transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleOpenInviteMember = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast(`Invite link for ${workspace.name} copied to clipboard!`, 'success');
  };

  const handleOpenSettings = () => {
    navigate(`/workspace/${workspace.id}/settings`);
  };

  const handleCreateTask = (newTask) => {
    addToast(`Created task "${newTask.title}" in ${workspace.name}`, 'success');
    setIsTaskModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Summary Header */}
      <WorkspaceHeader
        workspace={workspace}
        onOpenNewProject={() => navigate(`/workspace/${workspace.id || workspace._id}/projects`)}
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
