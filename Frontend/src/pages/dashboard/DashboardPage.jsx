import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Terminal,
  Search,
  FolderGit2,
  CheckSquare,
  TrendingUp,
  Kanban,
  Zap,
  Filter
} from 'lucide-react';
import StatsOverview from '../../components/dashboard/StatsOverview';
import WorkspaceCard from '../../components/dashboard/WorkspaceCard';
import RecentActivityList from '../../components/dashboard/RecentActivityList';
import QuickActions from '../../components/dashboard/QuickActions';
import ProjectCard from '../../components/projects/ProjectCard';
import TaskCard from '../../components/projects/TaskCard';
import TaskModal from '../../components/projects/TaskModal';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import {
  INITIAL_WORKSPACES,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_ACTIVITIES,
  INITIAL_USER
} from '../../utils/constants';

export function DashboardPage() {
  const navigate = useNavigate();

  // Demo State
  const [workspaces, setWorkspaces] = useState(INITIAL_WORKSPACES);
  const [projects] = useState(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activities] = useState(INITIAL_ACTIVITIES);

  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false);

  // Form states for new workspace
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [newWsVisibility, setNewWsVisibility] = useState('Public');

  // Tasks assigned to current user
  const myTasks = tasks.filter((t) => t.assignee?.name === INITIAL_USER.name || t.assignee === INITIAL_USER.name);

  // Overall sprint progress calculation
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === 'Done' || t.status === 'Completed').length;
  const overallProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 75;

  const filteredWorkspaces = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    const created = {
      id: `ws-${Date.now().toString().slice(-4)}`,
      name: newWsName,
      slug: newWsName.toLowerCase().replace(/\s+/g, '-'),
      description: newWsDesc || 'Newly initialized developer workspace',
      icon: 'Layers',
      color: 'from-indigo-500 to-purple-600',
      visibility: newWsVisibility,
      techStack: ['React', 'Node.js', 'Docker'],
      memberCount: 1,
      projectCount: 0,
      openIssues: 0,
      starred: false,
      updatedAt: 'Just now',
      owner: INITIAL_USER.name
    };

    setWorkspaces([created, ...workspaces]);
    setIsCreateWsOpen(false);
    setNewWsName('');
    setNewWsDesc('');
    navigate(`/workspace/${created.id}`);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (savedTask) => {
    setTasks(tasks.map((t) => (t.id === savedTask.id ? savedTask : t)));
  };

  return (
    <div className="space-y-8">
      {/* 1. WELCOME MESSAGE & QUICK OVERVIEW BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-semibold mb-1">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>DEVSPACE DASHBOARD</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-100 my-0 tracking-tight">
            Welcome back, {INITIAL_USER.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            You have <strong className="text-slate-200">{workspaces.length} active workspaces</strong>,{' '}
            <strong className="text-indigo-400">{myTasks.length} tasks assigned to you</strong>, and{' '}
            <strong className="text-emerald-400">4 pending PR reviews</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsCreateWsOpen(true)}
          >
            Create Workspace
          </Button>
        </div>

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Key Metrics Stats */}
      <StatsOverview />

      {/* Quick Action Shortcuts */}
      <QuickActions
        onOpenNewWorkspace={() => setIsCreateWsOpen(true)}
        onOpenNewProject={() => navigate('/workspace/ws-core-platform/projects')}
        onOpenInviteMember={() => navigate('/workspace/ws-core-platform/members')}
      />

      {/* 2. PROJECT PROGRESS OVERVIEW SECTION */}
      <Card hoverable={false} className="space-y-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100 my-0">Sprint Progress & Velocity Overview</h2>
            <p className="text-xs text-slate-400">Overall completion metrics across active workspace repositories</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sprint Velocity: 24 Story Points / wk</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Total Completion Rate</span>
              <span className="text-emerald-400 font-bold">{overallProgress}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              {completedTasksCount} of {totalTasksCount} sprint tasks marked completed
            </p>
          </div>

          <div className="flex items-center justify-around text-center py-2 bg-slate-900/50 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 block">Open PRs</span>
              <span className="text-lg font-bold text-cyan-400">6 PRs</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 block">Active Repos</span>
              <span className="text-lg font-bold text-indigo-400">{projects.length} Repos</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 block">Deploy Status</span>
              <span className="text-lg font-bold text-emerald-400">100% Healthy</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={Kanban}
              onClick={() => navigate('/workspace/ws-core-platform/projects/proj-auth-service/board')}
            >
              Open Full Kanban Board
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. WORKSPACE CARDS GRID */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100 my-0">Workspaces ({filteredWorkspaces.length})</h2>
            <p className="text-xs text-slate-400">Select a workspace to view team members, microservices & sprint boards</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workspaces..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredWorkspaces.map((ws) => (
            <WorkspaceCard key={ws.id} workspace={ws} />
          ))}
        </div>
      </div>

      {/* 4. RECENT PROJECTS & TASKS ASSIGNED TO ME */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Projects Repositories (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-100 my-0">Recent Repositories & Projects</h2>
              <p className="text-xs text-slate-400">Active software repositories across your workspaces</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/workspace/ws-core-platform/projects')}
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>
        </div>

        {/* Tasks Assigned To Me (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-100 my-0">Tasks Assigned to Me ({myTasks.length})</h2>
              <p className="text-xs text-slate-400">Sprint issues requiring your attention</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-mono border border-indigo-500/20">
              Assigned
            </span>
          </div>

          <div className="space-y-3">
            {myTasks.length > 0 ? (
              myTasks.map((t) => (
                <TaskCard key={t.id} task={t} onClick={() => handleTaskClick(t)} />
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded-xl font-mono">
                No open tasks assigned to you right now.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 5. RECENT TEAM ACTIVITY STREAM */}
      <RecentActivityList activities={activities} />

      {/* Create Workspace Modal */}
      <Modal
        isOpen={isCreateWsOpen}
        onClose={() => setIsCreateWsOpen(false)}
        title="Create New Workspace"
        subtitle="Group projects, assign team permissions, and sync repositories"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateWsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateWorkspace}>
              Create Workspace
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <Input
            label="Workspace Name"
            required
            placeholder="e.g. Cloud Security Team"
            value={newWsName}
            onChange={(e) => setNewWsName(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Description
            </label>
            <textarea
              rows={3}
              value={newWsDesc}
              onChange={(e) => setNewWsDesc(e.target.value)}
              placeholder="Primary mission and microservices in this workspace..."
              className="w-full rounded-lg bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Visibility
            </label>
            <select
              value={newWsVisibility}
              onChange={(e) => setNewWsVisibility(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="Public">Public (Anyone in organization can view)</option>
              <option value="Private">Private (Members only)</option>
              <option value="Internal">Internal (Strict SSO restricted)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Task Inspection Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        onSave={handleSaveTask}
      />
    </div>
  );
}

export default DashboardPage;
