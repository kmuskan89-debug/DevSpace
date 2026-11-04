import React, { useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderGit2,
  Kanban,
  Users,
  Settings,
  Plus,
  Terminal,
  Activity,
  BarChart3,
  LogOut,
  X,
  Layers,
  ChevronDown,
  CheckSquare
} from 'lucide-react';
import Avatar from '../common/Avatar';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useWorkspaceContext } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ collapsed = false, mobileOpen = false, onCloseMobile }) {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { workspace: activeWorkspace, projects } = useWorkspace(workspaceId);
  const { workspaces, openCreateModal } = useWorkspaceContext();
  const { user: authUser, logout } = useAuth();
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);

  const user = {
    name: authUser?.name || 'Developer',
    email: authUser?.email || '',
    avatar: authUser?.avatar || '',
    role: authUser?.role || 'Developer'
  };

  const currentWs = activeWorkspace || workspaces[0] || {
    id: 'ws-core-platform',
    name: 'DevSpace Core Platform',
    visibility: 'Public'
  };
  const currentWsId = currentWs.id || currentWs._id;

  const firstProjectId = projects && projects.length > 0 ? (projects[0].id || projects[0]._id) : null;
  const sprintBoardPath = firstProjectId
    ? `/workspace/${currentWsId}/projects/${firstProjectId}/board`
    : `/workspace/${currentWsId}/projects`;
  const backlogPath = firstProjectId
    ? `/workspace/${currentWsId}/projects/${firstProjectId}/backlog`
    : `/workspace/${currentWsId}/projects`;

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Tasks', path: `/workspace/${currentWsId}/projects`, icon: CheckSquare },
    { label: 'Projects', path: `/workspace/${currentWsId}/projects`, icon: FolderGit2 },
    { label: 'Backlog', path: backlogPath, icon: Layers },
    { label: 'Sprints', path: sprintBoardPath, icon: Kanban },
    { label: 'Members', path: `/workspace/${currentWsId}/members`, icon: Users },
    { label: 'Analytics', path: `/workspace/${currentWsId}/analytics`, icon: BarChart3 },
    { label: 'Activity', path: `/workspace/${currentWsId}/activity`, icon: Activity },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
  };

  const renderContent = (isCollapsed) => (
    <div className={`flex flex-col justify-between h-full bg-[#FAFAF9] dark:bg-[#1C1C1C] text-[#252525] dark:text-[#F2F2F2] transition-all duration-200 select-none ${
      isCollapsed ? 'p-2 space-y-3' : 'p-3 space-y-4'
    }`}>
      <div className="space-y-3">
        {/* Top Header Logo inside Sidebar */}
        <div className={`flex items-center pb-2.5 border-b border-[#E8E8E5] dark:border-[#353535] ${
          isCollapsed ? 'justify-center' : 'justify-between px-1'
        }`}>
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 group"
            onClick={onCloseMobile}
            title="DevSpace Dashboard"
          >
            <div className="w-6 h-6 rounded-md bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] flex items-center justify-center font-bold shadow-2xs shrink-0">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs tracking-tight text-[#252525] dark:text-[#F2F2F2]">
                  DevSpace
                </span>
                <span className="px-1 py-0.2 rounded text-[9px] font-mono text-[#777777] dark:text-[#A0A0A0] bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535]">
                  v2.4
                </span>
              </div>
            )}
          </NavLink>

          {/* Close button on mobile */}
          {!isCollapsed && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
              title="Close menu"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Workspace Quick Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
            title={currentWs.name}
            className={`w-full flex items-center rounded-md border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#242424] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer ${
              isCollapsed ? 'p-1.5 justify-center' : 'justify-between px-2.5 py-1.5'
            }`}
          >
            <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : 'truncate'}`}>
              <div className="w-4 h-4 rounded bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] flex items-center justify-center font-bold text-[9px] shrink-0">
                {currentWs.name.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <span className="text-xs font-medium text-[#252525] dark:text-[#F2F2F2] truncate">
                  {currentWs.name}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <ChevronDown className="w-3 h-3 text-[#999999] dark:text-[#777777] shrink-0" />
            )}
          </button>

          {/* Workspace Dropdown */}
          <AnimatePresence>
            {wsDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.1 }}
                className={`absolute mt-1 rounded-md border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] shadow-md p-1 z-50 space-y-0.5 ${
                  isCollapsed ? 'left-full ml-1 w-56' : 'left-0 right-0'
                }`}
              >
                <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#999999] dark:text-[#777777]">
                  Switch Workspace
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id || ws._id}
                    type="button"
                    onClick={() => {
                      navigate(`/workspace/${ws.id || ws._id}`);
                      setWsDropdownOpen(false);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left cursor-pointer ${
                      currentWsId === (ws.id || ws._id)
                        ? 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] font-semibold'
                        : 'text-[#777777] dark:text-[#A0A0A0] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] flex items-center justify-center text-[9px] font-bold shrink-0">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{ws.name}</span>
                  </button>
                ))}
                <div className="pt-1 border-t border-[#E8E8E5] dark:border-[#353535] space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/workspace/${currentWsId}/settings`);
                      setWsDropdownOpen(false);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-[#555555] dark:text-[#B0B0B0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] text-left cursor-pointer font-medium"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Workspace Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openCreateModal();
                      setWsDropdownOpen(false);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-[#252525] dark:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] text-left cursor-pointer font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Workspace</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Items */}
        <div className="space-y-0.5">
          {!isCollapsed && (
            <p className="px-2 text-[10px] font-medium uppercase tracking-wider text-[#999999] dark:text-[#777777] mb-1">
              Workspace
            </p>
          )}
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={onCloseMobile}
                  title={item.label}
                  className={({ isActive }) =>
                    `flex items-center rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      isCollapsed
                        ? 'p-2 justify-center'
                        : 'gap-2.5 px-2.5 py-1.5'
                    } ${
                      isActive
                        ? 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] font-semibold shadow-2xs'
                        : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: Settings & User Profile Card */}
      <div className="space-y-2 pt-2 border-t border-[#E8E8E5] dark:border-[#353535]">
        {/* Settings NavLink */}
        <NavLink
          to="/settings"
          onClick={onCloseMobile}
          title="Settings"
          className={({ isActive }) =>
            `flex items-center rounded-md text-xs font-medium transition-colors cursor-pointer ${
              isCollapsed
                ? 'p-2 justify-center'
                : 'gap-2.5 px-2.5 py-1.5'
            } ${
              isActive
                ? 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] font-semibold'
                : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A]'
            }`
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>

        {/* User Card */}
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => navigate('/settings')}
              title={`${user.name} (${user.role})`}
              className="cursor-pointer"
            >
              <Avatar src={user.avatar} name={user.name} size="sm" status="online" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1 rounded text-[#999999] hover:text-[#D83B01] dark:hover:text-[#F87171] hover:bg-[#FDF3F2] dark:hover:bg-[rgba(248,113,113,0.12)] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="p-2 rounded-md bg-[#FFFFFF] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] flex items-center justify-between">
            <div
              className="flex items-center gap-2 truncate cursor-pointer"
              onClick={() => navigate('/settings')}
              role="button"
              tabIndex={0}
            >
              <Avatar src={user.avatar} name={user.name} size="sm" status="online" />
              <div className="truncate">
                <p className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] truncate">{user.name}</p>
                <p className="text-[10px] text-[#777777] dark:text-[#A0A0A0] font-mono truncate">{user.role}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1 rounded text-[#999999] hover:text-[#D83B01] dark:hover:text-[#F87171] hover:bg-[#FDF3F2] dark:hover:bg-[rgba(248,113,113,0.12)] transition-colors shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Collapsible Sidebar */}
      <aside
        className={`shrink-0 border-r border-[#E8E8E5] dark:border-[#353535] bg-[#FAFAF9] dark:bg-[#1C1C1C] hidden md:flex flex-col sticky top-12 h-[calc(100vh-3rem)] z-30 transition-all duration-200 ${
          collapsed ? 'w-14' : 'w-60'
        }`}
      >
        {renderContent(collapsed)}
      </aside>

      {/* Mobile Slide-Over Drawer Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs"
              onClick={onCloseMobile}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative w-64 border-r border-[#E8E8E5] dark:border-[#353535] bg-[#FAFAF9] dark:bg-[#1C1C1C] shadow-xl z-10 flex flex-col h-full"
            >
              {renderContent(false)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
