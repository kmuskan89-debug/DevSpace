import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, Kanban, ArrowRight, Edit3, Trash2 } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';

export function ProjectCard({ project, onEdit, onDelete, canManage = false }) {
  const navigate = useNavigate();

  const leadMember = {
    name: project.lead || 'Project Lead',
    avatar: project.leadObj?.avatar || ''
  };

  const projectUrl = `/workspace/${project.workspaceId}/projects/${project.id || project._id}`;
  const boardUrl = `/workspace/${project.workspaceId}/projects/${project.id || project._id}/board`;

  return (
    <Card
      hoverable={true}
      className="group flex flex-col justify-between h-full p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] hover:border-[#252525] dark:hover:border-[#777777] transition-all space-y-3.5 rounded-lg"
    >
      <div className="space-y-3">
        {/* Header: Icon, Name, Key & Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => navigate(projectUrl)}
                  className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] hover:underline transition-colors truncate my-0 text-left cursor-pointer"
                >
                  {project.name}
                </button>
                {project.key && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535] shrink-0 font-bold">
                    {project.key}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono text-[#777777] dark:text-[#A0A0A0] truncate mt-0.5">
                {project.githubRepo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {project.status && <Badge status={project.status} size="sm" />}
            {project.priority && <Badge priority={project.priority} size="sm" />}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#777777] dark:text-[#A0A0A0] line-clamp-2 leading-relaxed my-0">
          {project.description || 'No description provided.'}
        </p>

        {/* Technology Stack Tags */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.techStack.map((tech, i) => (
              <span
                key={i}
                className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Progress & Footer */}
      <div className="space-y-2.5 pt-2 border-t border-[#E8E8E5] dark:border-[#353535]">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] text-[#777777] dark:text-[#A0A0A0] font-mono">
            <span>{project.completedTasksCount || 0} / {project.totalTasksCount || 0} tasks completed</span>
            <span className="font-semibold text-[#252525] dark:text-[#F2F2F2]">{project.progress || 0}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-[#F1F1EF] dark:bg-[#2A2A2A] overflow-hidden">
            <div
              className="h-full bg-[#252525] dark:bg-[#F2F2F2] rounded-full transition-all duration-300"
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Lead & Actions Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <Avatar src={leadMember.avatar} name={leadMember.name} size="xs" />
            <span className="text-[11px] text-[#777777] dark:text-[#A0A0A0] truncate max-w-[100px]">
              {leadMember.name}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {canManage && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="p-1 rounded text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                title="Edit Project"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            {canManage && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(project)}
                className="p-1 rounded text-[#777777] dark:text-[#A0A0A0] hover:text-[#D83B01] dark:hover:text-[#F87171] hover:bg-[#FDF3F2] dark:hover:bg-[rgba(248,113,113,0.12)] transition-colors cursor-pointer"
                title="Delete Project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(boardUrl)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[#252525] dark:text-[#F2F2F2] bg-[#F1F1EF] dark:bg-[#2A2A2A] hover:bg-[#E8E8E5] dark:hover:bg-[#353535] transition-colors cursor-pointer"
              title="Open Kanban Board"
            >
              <Kanban className="w-3 h-3" />
              <span>Board</span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ProjectCard;
