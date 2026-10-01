import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Terminal,
  ChevronDown,
  Search,
  Bell,
  Plus,
  Layers,
  Menu,
  Check,
  Sun,
  Moon
} from 'lucide-react';
import Dropdown, { DropdownItem } from '../common/Dropdown';
import Button from '../common/Button';
import UserMenu from './UserMenu';
import { useTheme } from '../../hooks/useTheme';
import { INITIAL_WORKSPACES, INITIAL_NOTIFICATIONS } from '../../utils/constants';

export function Topbar({ onOpenNewProjectModal, onToggleMobileSidebar }) {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { theme, toggleTheme } = useTheme();

  const currentWorkspace =
    INITIAL_WORKSPACES.find((w) => w.id === workspaceId || w.slug === workspaceId) ||
    INITIAL_WORKSPACES[0];

  const unreadNotifs = INITIAL_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 py-2.5">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left Section: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Terminal className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  DevSpace
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  v2.4
                </span>
              </div>
            </div>
          </Link>

          <span className="text-slate-700 hidden sm:inline">/</span>

          {/* Workspace Switcher Dropdown */}
          <div className="hidden sm:block">
            <Dropdown
              align="left"
              width="w-64"
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate max-w-[140px]">{currentWorkspace.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              }
            >
              <div className="px-3 py-2 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
                Select Workspace
              </div>
              <div className="py-1 max-h-60 overflow-y-auto">
                {INITIAL_WORKSPACES.map((ws) => (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => navigate(`/workspace/${ws.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="truncate font-medium">{ws.name}</span>
                    </div>
                    {ws.id === currentWorkspace.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
              <div className="p-1 border-t border-slate-800">
                <DropdownItem icon={Plus} onClick={() => navigate('/dashboard')}>
                  Create New Workspace
                </DropdownItem>
              </div>
            </Dropdown>
          </div>
        </div>

        {/* Center Section: Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search repositories, commits, tasks... (Press ⌘K)"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-12 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section: Actions, Theme Toggle & User Menu */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={onOpenNewProjectModal}
            className="hidden sm:inline-flex"
          >
            New Project
          </Button>

          {/* Global Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-all cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-900 animate-pulse" />
            )}
          </button>

          <div className="h-4 w-px bg-slate-800" />

          {/* User Profile Dropdown */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

export default Topbar;
