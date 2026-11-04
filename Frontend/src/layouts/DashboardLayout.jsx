import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Topbar from '../components/navigation/Topbar';
import Sidebar from '../components/navigation/Sidebar';
import TaskModal from '../components/projects/TaskModal';
import CreateWorkspaceModal from '../components/workspace/CreateWorkspaceModal';
import { useWorkspaceContext } from '../context/WorkspaceContext';
import { useToast } from '../components/common/Toast';

export function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('devspace_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isCreateModalOpen, closeCreateModal } = useWorkspaceContext();
  const { addToast } = useToast();
  const location = useLocation();

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('devspace_sidebar_collapsed', String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const handleCreateTask = (newTask) => {
    addToast(`Task "${newTask.title}" created successfully!`, 'success');
    setIsNewTaskModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#191919] text-[#252525] dark:text-[#F2F2F2] flex flex-col font-sans selection:bg-[#252525] selection:text-[#FFFFFF] dark:selection:bg-[#F2F2F2] dark:selection:text-[#191919] transition-colors duration-150">
      {/* Top Application Header Bar */}
      <Topbar
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebarCollapsed={toggleSidebarCollapsed}
        onOpenNewProjectModal={() => setIsNewTaskModalOpen(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main Container with Docked Sidebar & Content Viewport */}
      <div className="flex-1 flex w-full">
        <Sidebar
          collapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Global Task Creation Modal */}
      <TaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSave={handleCreateTask}
      />

      {/* Global Workspace Creation Modal */}
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
      />
    </div>
  );
}

export default DashboardLayout;
