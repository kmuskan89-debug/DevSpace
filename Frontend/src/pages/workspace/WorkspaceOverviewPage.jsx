import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  CheckSquare,
  Activity,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Kanban,
  GitPullRequest,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import useWorkspace from '../../hooks/useWorkspace';
import ProjectCard from '../../components/projects/ProjectCard';
import RecentActivityList from '../../components/dashboard/RecentActivityList';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { INITIAL_TASKS } from '../../utils/constants';

export function WorkspaceOverviewPage() {
  const navigate = useNavigate();
  const { workspace, projects, members, activities } = useWorkspace();

  // Task statistics calculation
  const totalTasksCount = INITIAL_TASKS.length + 14;
  const openTasksCount = INITIAL_TASKS.filter((t) => t.status !== 'Done').length + 4;
  const completedTasksCount = totalTasksCount - openTasksCount;
  const progressPercentage = Math.round((completedTasksCount / totalTasksCount) * 100);

  return (
    <div className="space-y-6">
      {/* 1. WORKSPACE HEADER INFO & MEMBER AVATARS STACK */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-semibold mb-1">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>WORKSPACE OVERVIEW</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 my-0">
              {workspace.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {workspace.description}
            </p>
          </div>

          {/* Member Avatars Stack */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex -space-x-2 overflow-hidden p-1">
              {members.slice(0, 4).map((member, i) => (
                <div key={member.id || i} className="inline-block ring-2 ring-slate-950 rounded-full">
                  <Avatar src={member.avatar} name={member.name} size="sm" />
                </div>
              ))}
              {members.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center font-bold text-[10px] text-slate-300 font-mono">
                  +{members.length - 4}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={UserPlus}
              onClick={() => navigate(`/workspace/${workspace.id}/members`)}
            >
              Manage Team
            </Button>
          </div>
        </div>

        {/* Tech Stack Badges */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 flex-wrap">
          <span className="text-xs font-semibold text-slate-400">Workspace Stack:</span>
          {workspace.techStack?.map((tech, i) => (
            <Badge key={i} variant="tech">
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      {/* 2. PROJECT & TASK STATISTICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Project Statistics */}
        <Card hoverable={false} className="flex items-start gap-3.5 border border-slate-800">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Project Repositories</p>
            <h4 className="text-2xl font-bold text-slate-100 mt-0.5">{projects.length} Active Repos</h4>
            <p className="text-[11px] text-indigo-400 font-mono mt-1">✓ GitHub OAuth Connected</p>
          </div>
        </Card>

        {/* Task Statistics */}
        <Card hoverable={false} className="flex items-start gap-3.5 border border-slate-800">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Sprint Task Metrics</p>
            <h4 className="text-2xl font-bold text-slate-100 mt-0.5">{openTasksCount} Open Issues</h4>
            <p className="text-[11px] text-emerald-400 font-mono mt-1">{completedTasksCount} Tasks Completed</p>
          </div>
        </Card>

        {/* Team Collaboration Statistics */}
        <Card hoverable={false} className="flex items-start gap-3.5 border border-slate-800">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Team Collaborators</p>
            <h4 className="text-2xl font-bold text-slate-100 mt-0.5">{members.length} Members</h4>
            <p className="text-[11px] text-cyan-400 font-mono mt-1">4 Online • Admin SSO Active</p>
          </div>
        </Card>
      </div>

      {/* 3. PROGRESS OVERVIEW CARD */}
      <Card hoverable={false} className="space-y-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 my-0">Sprint Progress & Velocity</h3>
            <p className="text-xs text-slate-400">Completion overview for active workspace milestones</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Velocity: 28 Story Points / week</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Overall Milestone Progress</span>
            <span className="text-emerald-400 font-bold">{progressPercentage}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Completed</span>
            <span className="text-base font-bold text-emerald-400">{completedTasksCount} Tasks</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">In Progress</span>
            <span className="text-base font-bold text-indigo-400">4 Tasks</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Code Review</span>
            <span className="text-base font-bold text-cyan-400">2 PRs</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Backlog</span>
            <span className="text-base font-bold text-amber-400">3 Tasks</span>
          </div>
        </div>
      </Card>

      {/* 4. ACTIVE PROJECTS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100 my-0">Active Workspace Projects</h2>
            <p className="text-xs text-slate-400">Code repositories linked to this workspace</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/workspace/${workspace.id}/projects`)}
          >
            View All ({projects.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <ProjectCard key={proj.id} project={proj} />
          ))}
        </div>
      </div>

      {/* 5. RECENT ACTIVITY LOG STREAM */}
      <RecentActivityList activities={activities} />
    </div>
  );
}

export default WorkspaceOverviewPage;
