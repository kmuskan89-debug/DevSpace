import React from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Kanban,
  Users,
  Activity,
  Settings,
  Bell,
  Layers,
  ChevronRight,
  Terminal,
  LogOut,
  X,
  ShieldCheck
} from 'lucide-react';
import Avatar from '../common/Avatar';
import { INITIAL_WORKSPACES, INITIAL_USER } from '../../utils/constants';

export function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const navigate = useNavigate();
  const { workspaceId = 'ws-core-platform' } = useParams();
  const user = INITIAL_USER;

  const activeWorkspace =
    INITIAL_WORKSPACES.find((w) => w.id === workspaceId || w.slug === workspaceId) ||
    INITIAL_WORKSPACES[0];

  const currentWsId = activeWorkspace.id;

  const mainNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Workspaces', path: `/workspace/${currentWsId}`, icon: Layers },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const workspaceNavItems = [
    { label: 'Overview', path: `/workspace/${currentWsId}`, icon: Layers },
    { label: 'Projects', path: `/workspace/${currentWsId}/projects`, icon: FolderGit2 },
    { label: 'Sprint Board', path: `/workspace/${currentWsId}/projects/proj-auth-service/board`, icon: Kanban },
    { label: 'Team Members', path: `/workspace/${currentWsId}/members`, icon: Users },
    { label: 'Activity Log', path: `/workspace/${currentWsId}/activity`, icon: Activity },
    { label: 'Workspace Settings', path: `/workspace/${currentWsId}/settings`, icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4 space-y-6">
      <div className="space-y-6">
        {/* Top Header Logo inside Sidebar */}
        <div className="flex items-center justify-between px-2 pb-3 border-b border-slate-800/80">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group" onClick={onCloseMobile}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Terminal className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                DevSpace
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                v2.4
              </span>
            </div>
          </NavLink>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Main Application Menu */}
        <div>
          <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Main Menu
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Workspace Quick Sub-Menu */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Current Workspace
            </p>
            <span className="text-[10px] text-indigo-400 font-mono">{activeWorkspace.visibility}</span>
          </div>

          <div
            onClick={() => {
              navigate(`/workspace/${currentWsId}`);
              onCloseMobile && onCloseMobile();
            }}
            className="px-3 py-2 mb-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-bold text-slate-200 truncate">{activeWorkspace.name}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </div>

          <nav className="space-y-1">
            {workspaceNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === `/workspace/${currentWsId}`}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* USER PROFILE AT BOTTOM OF SIDEBAR */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <Avatar src={user.avatar} name={user.name} size="sm" status="online" />
            <div className="truncate">
              <p className="text-xs font-bold text-slate-100 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{user.role}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              navigate('/login');
              onCloseMobile && onCloseMobile();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 shrink-0 glass-panel border-r border-slate-800/80 hidden md:flex flex-col min-h-[calc(100vh-57px)]">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-72 glass-panel border-r border-slate-800 bg-slate-950 shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
