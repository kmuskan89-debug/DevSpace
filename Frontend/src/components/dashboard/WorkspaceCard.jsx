import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Users, FolderGit2, ArrowRight, Star, Clock } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export function WorkspaceCard({ workspace }) {
  const navigate = useNavigate();

  return (
    <Card
      hoverable={true}
      onClick={() => navigate(`/workspace/${workspace.id}`)}
      className="group flex flex-col justify-between h-full border border-slate-800 hover:border-indigo-500/40"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${workspace.color || 'from-indigo-500 to-purple-600'} p-0.5 shadow-md`}>
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                {workspace.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">slug: {workspace.slug}</p>
            </div>
          </div>
          <Badge status={workspace.visibility} size="sm" />
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {workspace.description}
        </p>

        {/* Tech Stack Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {workspace.techStack?.map((tech, i) => (
            <Badge key={i} variant="tech">
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{workspace.projectCount} Projects</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{workspace.memberCount} Members</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-1 transition-transform font-semibold">
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Card>
  );
}

export default WorkspaceCard;
