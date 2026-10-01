import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FolderGit2,
  Kanban,
  GitBranch,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  Clock,
  Play,
  Users,
  Calendar,
  AlertCircle,
  TrendingUp,
  CheckSquare
} from 'lucide-react';
import useProject from '../../hooks/useProject';
import ProjectHeader from '../../components/projects/ProjectHeader';
import ProjectNavTabs from '../../components/projects/ProjectNavTabs';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import TaskModal from '../../components/projects/TaskModal';
import RecentActivityList from '../../components/dashboard/RecentActivityList';
import { INITIAL_ACTIVITIES, INITIAL_MEMBERS } from '../../utils/constants';

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const { workspaceId, projectId } = useParams();
  const { project, tasks } = useProject();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleCreateTask = (newTask) => {
    alert(`Created task "${newTask.title}" for ${project.name}`);
  };

  // Static demo upcoming deadlines
  const upcomingDeadlines = [
    {
      id: 'd-1',
      title: 'PKCE Mobile OAuth Authorization Release',
      dueDate: 'Oct 5, 2026',
      priority: 'Urgent',
      status: 'In Progress',
      assignee: 'Alex Rivera'
    },
    {
      id: 'd-2',
      title: 'Redis Token Bucket Rate Limiting Middleware',
      dueDate: 'Oct 8, 2026',
      priority: 'High',
      status: 'To Do',
      assignee: 'Sarah Chen'
    },
    {
      id: 'd-3',
      title: 'JWT Token Revocation & Rotation Test Suite',
      dueDate: 'Oct 12, 2026',
      priority: 'Medium',
      status: 'Code Review',
      assignee: 'David Kim'
    }
  ];

  const projectMembers = INITIAL_MEMBERS.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 1. PROJECT HEADER BANNER */}
      <ProjectHeader project={project} onAddTask={() => setIsTaskModalOpen(true)} />

      {/* 2. PROJECT NAVIGATION TABS (REACT ROUTER DOM) */}
      <ProjectNavTabs taskCount={tasks.length} />

      {/* 3. METRICS & PROGRESS OVERVIEW ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card */}
        <Card hoverable={false} className="space-y-3 border border-slate-800">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 uppercase font-semibold">Sprint Progress</span>
            <span className="text-indigo-400 font-bold">{project.progress}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono pt-1">
            <span>Completed: 18 Tasks</span>
            <span className="text-emerald-400">Target: Oct 15</span>
          </div>
        </Card>

        {/* Task Statistics */}
        <Card hoverable={false} className="flex items-center gap-3 border border-slate-800">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0 border border-cyan-500/20">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 my-0">Task Statistics</p>
            <h4 className="text-xl font-bold text-slate-100 mt-0.5">{tasks.length} Active Issues</h4>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">4 In Progress • 2 Code Review</p>
          </div>
        </Card>

        {/* Sprint Velocity */}
        <Card hoverable={false} className="flex items-center gap-3 border border-slate-800">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 my-0">Build & PR Health</p>
            <h4 className="text-xl font-bold text-emerald-400 mt-0.5">46 Tests Passing</h4>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">100% CI Coverage • 1.2s Build</p>
          </div>
        </Card>
      </div>

      {/* 4. MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Upcoming Deadlines & Active Sprint Tasks */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upcoming Deadlines Section */}
          <Card hoverable={false} className="space-y-4 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100 my-0">Upcoming Deadlines & Milestones</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-mono border border-indigo-500/20">
                Sprint 14
              </span>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>Assigned to: <strong className="text-slate-300">{item.assignee}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge priority={item.priority} size="sm" />
                    <div className="flex items-center gap-1 text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                      <Clock className="w-3 h-3" />
                      <span>{item.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Active Sprint Backlog */}
          <Card hoverable={false} className="space-y-4 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100 my-0">Active Tasks</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Sprint tasks linked to this repository</p>
              </div>
              <Button
                variant="cyan"
                size="sm"
                icon={Kanban}
                onClick={() => navigate(`/workspace/${workspaceId}/projects/${project.id}/board`)}
              >
                Sprint Board
              </Button>
            </div>

            <div className="space-y-3">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/workspace/${workspaceId}/projects/${project.id}/board`)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-slate-500 uppercase shrink-0">{t.id}</span>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-200 truncate my-0">{t.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{t.branch}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <Badge status={t.status} size="sm" />
                    <Badge priority={t.priority} size="sm" />
                    <Avatar src={t.assignee?.avatar} name={t.assignee?.name} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 5 Columns: Project Members & Recent Activity */}
        <div className="lg:col-span-5 space-y-6">
          {/* Members List Card */}
          <Card hoverable={false} className="space-y-4 border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100 my-0">Project Members ({projectMembers.length})</h3>
              </div>
              <span className="text-[11px] text-indigo-400 font-mono">Role Access</span>
            </div>

            <div className="space-y-3">
              {projectMembers.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={m.avatar} name={m.name} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-slate-200 my-0">{m.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{m.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {m.commits} commits
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity Log */}
          <RecentActivityList activities={INITIAL_ACTIVITIES.slice(0, 3)} />
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleCreateTask}
      />
    </div>
  );
}

export default ProjectDetailPage;
