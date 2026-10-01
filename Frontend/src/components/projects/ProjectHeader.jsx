import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FolderGit2, Kanban, GitBranch, Settings, Play, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export function ProjectHeader({ project, onAddTask }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!project) return null;

  const isBoardView = location.pathname.endsWith('/board');

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
      {/* Top Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(`/workspace/${project.workspaceId}/projects`)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-2">
          <Badge status={project.status} />
          <Badge priority={project.priority} />
        </div>
      </div>

      {/* Main Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 my-0">
                {project.name}
              </h1>
              <p className="text-xs font-mono text-slate-400">
                Repo: <span className="text-indigo-300">{project.githubRepo}</span>
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* View Switcher / Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {isBoardView ? (
            <Button
              variant="outline"
              size="sm"
              icon={FolderGit2}
              onClick={() => navigate(`/workspace/${project.workspaceId}/projects/${project.id}`)}
            >
              Overview
            </Button>
          ) : (
            <Button
              variant="cyan"
              size="sm"
              icon={Kanban}
              onClick={() => navigate(`/workspace/${project.workspaceId}/projects/${project.id}/board`)}
            >
              Open Kanban Board
            </Button>
          )}

          <Button variant="primary" size="sm" icon={Play} onClick={onAddTask}>
            New Task
          </Button>
        </div>
      </div>

      {/* Tech badges & Github link */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Stack:</span>
          {project.techStack?.map((t, idx) => (
            <Badge key={idx} variant="tech">
              {t}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>Lead: <strong className="text-slate-200">{project.lead}</strong></span>
          <span>•</span>
          <span>Progress: <strong className="text-emerald-400">{project.progress}%</strong></span>
        </div>
      </div>
    </div>
  );
}

export default ProjectHeader;
