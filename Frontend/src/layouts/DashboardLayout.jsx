import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from '../components/navigation/Topbar';
import Sidebar from '../components/navigation/Sidebar';
import TaskModal from '../components/projects/TaskModal';

export function DashboardLayout() {
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleCreateTask = (newTask) => {
    alert(`Task "${newTask.title}" created successfully!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Application Header Bar */}
      <Topbar
        onOpenNewProjectModal={() => setIsNewTaskModalOpen(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main Container with Sidebar & Content Viewport */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Shared Task Creation Modal */}
      <TaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSave={handleCreateTask}
      />
    </div>
  );
}

export default DashboardLayout;
