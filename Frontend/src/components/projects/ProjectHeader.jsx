import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FolderGit2, Kanban, Plus, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export function ProjectHeader({ project, onAddTask }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!project) return null;

  const isBoardView = location.pathname.endsWith('/board');
  const workspaceId = project.workspaceId || project.workspace?._id || project.workspace;
  const projectId = project.id || project._id;

  return (
    <div className="p-4 sm:p-5 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-3.5">
      {/* Top Breadcrumb & Status Badges */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate(`/workspace/${workspaceId}/projects`)}
          className="inline-flex items-center gap-1.5 text-xs text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Projects</span>
          <span className="text-[#999999] dark:text-[#666666]">/</span>
          <span className="font-medium text-[#252525] dark:text-[#F2F2F2]">{project.name}</span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <Badge status={project.status || 'Active'} size="sm" />
          <Badge priority={project.priority || 'Medium'} size="sm" />
        </div>
      </div>

      {/* Main Title & Action Buttons Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-md bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#252525] dark:text-[#F2F2F2] my-0 truncate">
                {project.name}
              </h1>
              {project.key && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535] font-bold shrink-0">
                  {project.key}
                </span>
              )}
            </div>
            {project.githubRepo && (
              <p className="text-[11px] font-mono text-[#777777] dark:text-[#A0A0A0] truncate mt-0.5">
                Repo: {project.githubRepo}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isBoardView ? (
            <Button
              variant="outline"
              size="sm"
              icon={FolderGit2}
              onClick={() => navigate(`/workspace/${workspaceId}/projects/${projectId}`)}
            >
              Overview
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={Kanban}
              onClick={() => navigate(`/workspace/${workspaceId}/projects/${projectId}/board`)}
            >
              Board
            </Button>
          )}

          <Button variant="primary" size="sm" icon={Plus} onClick={onAddTask}>
            New Task
          </Button>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-[#777777] dark:text-[#A0A0A0] leading-relaxed my-0 max-w-3xl">
          {project.description}
        </p>
      )}

      {/* Tech Stack & Lead Row */}
      {project.techStack && project.techStack.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-[#E8E8E5] dark:border-[#353535] flex-wrap text-xs">
          <span className="text-[11px] font-medium text-[#777777] dark:text-[#A0A0A0]">Stack:</span>
          {project.techStack.map((tech, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectHeader;
