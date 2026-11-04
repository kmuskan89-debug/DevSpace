import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Plus,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight
} from 'lucide-react';
import Button from '../common/Button';
import ThemeToggle from '../common/ThemeToggle';
import UserMenu from './UserMenu';
import GlobalSearchModal from './GlobalSearchModal';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useNotifications } from '../../context/NotificationContext';

export function Topbar({
  isSidebarCollapsed = false,
  onToggleSidebarCollapsed,
  onToggleMobileSidebar,
  onOpenNewProjectModal
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId } = useParams();
  const { unreadCount } = useNotifications();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const {
    workspace: currentWorkspace,
    allWorkspaces,
    isCreateModalOpen,
    closeCreateModal
  } = useWorkspace(workspaceId);

  // Global keyboard shortcut for search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeWs = currentWorkspace || allWorkspaces[0] || { name: 'DevSpace', id: 'ws-core-platform' };

  // Calculate breadcrumbs from location
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/dashboard') {
      return [
        { label: activeWs.name, path: `/workspace/${activeWs.id || activeWs._id || ''}` },
        { label: 'Overview', active: true }
      ];
    }
    if (path.includes('/projects') && path.includes('/board')) {
      return [
        { label: activeWs.name, path: `/workspace/${activeWs.id || activeWs._id || ''}` },
        { label: 'Projects', path: `/workspace/${activeWs.id || activeWs._id || ''}/projects` },
        { label: 'Sprint Board', active: true }
      ];
    }
    if (path.includes('/projects') && path.includes('/backlog')) {
      return [
        { label: activeWs.name, path: `/workspace/${activeWs.id || activeWs._id || ''}` },
        { label: 'Projects', path: `/workspace/${activeWs.id || activeWs._id || ''}/projects` },
        { label: 'Backlog', active: true }
      ];
    }
    if (path.includes('/projects') && path.includes('/reports')) {
      return [
        { label: activeWs.name, path: `/workspace/${activeWs.id || activeWs._id || ''}` },
        { label: 'Projects', path: `/workspace/${activeWs.id || activeWs._id || ''}/projects` },
        { label: 'Reports', active: true }
      ];
    }
    if (path.includes('/projects') && path.includes('/settings')) {
      return [
        { label: activeWs.name, path: `/workspace/${activeWs.id || activeWs._id || ''}` },
        { label: 'Projects', path: `/workspace/${activeWs.id || activeWs._id || ''}/projects` },
        { label: 'Project Settings', active: true }
      ];
    }
    if (path.includes('/projects')) {
      return [
        { label: activeWs.name, path: `/workspace/${activeWs.id || activeWs._id || ''}` },
        { label: 'Projects', active: true }
      ];
    }
    if (path.includes('/analytics')) {
      return [
        { label: activeWs.name, path: `/workspace/${activeWs.id || activeWs._id || ''}` },
        { label: 'Analytics', active: true }
      ];
    }
    if (path.includes('/members')) {
      return [
        { label: activeWs.name, path: `/workspace/${activeWs.id || activeWs._id || ''}` },
        { label: 'Members', active: true }
      ];
    }
    if (path.includes('/activity')) {
      return [
        { label: activeWs.name, path: `/workspace/${activeWs.id || activeWs._id || ''}` },
        { label: 'Activity', active: true }
      ];
    }
    if (path.includes('/settings') && path.includes('/workspace')) {
      return [
        { label: activeWs.name, path: `/workspace/${activeWs.id || activeWs._id || ''}` },
        { label: 'Workspace Settings', active: true }
      ];
    }
    if (path === '/notifications') {
      return [{ label: 'Notifications', active: true }];
    }
    if (path === '/settings') {
      return [{ label: 'Account Settings', active: true }];
    }
    return [{ label: activeWs.name, active: true }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-12 border-b border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#1C1C1C] px-3 sm:px-4 flex items-center transition-colors">
        <div className="flex items-center justify-between gap-3 w-full">
          {/* Left Section: Mobile toggle, Desktop collapse toggle, Brand & Breadcrumbs */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="md:hidden p-1.5 rounded-md text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Desktop Sidebar Collapse Toggle */}
            <button
              type="button"
              onClick={onToggleSidebarCollapsed}
              className="hidden md:inline-flex p-1.5 rounded-md text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer shrink-0"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-1.5 text-xs truncate pl-1" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <ChevronRight className="w-3 h-3 text-[#999999] dark:text-[#666666] shrink-0" />
                  )}
                  {crumb.active ? (
                    <span className="font-semibold text-[#252525] dark:text-[#F2F2F2] truncate max-w-[150px] sm:max-w-[200px]">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path || '#'}
                      className="text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors truncate max-w-[120px] sm:max-w-[160px]"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Center Section: Global Search Bar Trigger */}
          <div className="flex-1 max-w-sm mx-2 hidden lg:block">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1 text-xs text-[#777777] dark:text-[#A0A0A0] bg-[#F7F7F5] dark:bg-[#202020] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-[#999999] group-hover:text-[#252525] dark:group-hover:text-[#F2F2F2] shrink-0" />
                <span className="truncate">Search tasks, keys, projects...</span>
              </div>
              <kbd className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-mono bg-[#FFFFFF] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] rounded text-[#999999] shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Section: Actions, Theme, Notifications & User */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Search Button for Mobile / Tablet */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
              title="Search (⌘K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Quick Create Action */}
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={onOpenNewProjectModal}
              className="hidden sm:inline-flex h-7 px-2.5 text-xs"
            >
              New Task
            </Button>

            {/* Global Theme Toggle */}
            <ThemeToggle size="sm" variant="ghost" className="h-7 w-7 p-0 justify-center" />

            {/* Notifications Button */}
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="relative p-1.5 rounded-md text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#252525] dark:bg-[#F2F2F2]" />
              )}
            </button>

            <div className="h-4 w-px bg-[#E8E8E5] dark:bg-[#353535] mx-0.5" />

            {/* User Profile Dropdown */}
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

export default Topbar;
