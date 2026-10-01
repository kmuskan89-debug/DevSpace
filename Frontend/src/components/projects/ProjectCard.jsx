import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, Kanban, CheckSquare, Clock, ArrowRight, User } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';

export function ProjectCard({ project }) {
  const navigate = useNavigate();

  // Demo team members for project card
  const teamMembers = [
    { name: project.lead || 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' }
  ];

  return (
    <Card
      hoverable={true}
      onClick={() => navigate(`/workspace/${project.workspaceId}/projects/${project.id}`)}
      className="group flex flex-col justify-between h-full border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4"
    >
      <div className="space-y-3">
        {/* Header: Title, Repo & Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors truncate my-0">
                {project.name}
              </h3>
              <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">{project.githubRepo}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {project.status && <Badge status={project.status} size="sm" />}
            {project.priority && <Badge priority={project.priority} size="sm" />}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Sprint Progress Overview Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Sprint Progress</span>
            <span className="text-indigo-400 font-bold">{project.progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Task Counts Metrics */}
        <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>{project.openTasksCount || 4} Open Tasks</span>
          </div>
          <span className="text-emerald-400">
            ✓ {project.completedTasksCount || 18} Completed
          </span>
        </div>

        {/* Tech Stack Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.techStack?.map((t, idx) => (
            <Badge key={idx} variant="tech">
              {t}
            </Badge>
          ))}
        </div>
      </div>

      {/* Footer: Member Avatars & Last Updated Info */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        {/* Team Member Avatars Stack */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            {teamMembers.map((m, i) => (
              <div key={i} className="inline-block ring-2 ring-slate-950 rounded-full" title={`Assignee: ${m.name}`}>
                <Avatar src={m.avatar} name={m.name} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Last Updated Info */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>Updated {project.updatedAt || '25 mins ago'}</span>
        </div>
      </div>
    </Card>
  );
}

export default ProjectCard;
