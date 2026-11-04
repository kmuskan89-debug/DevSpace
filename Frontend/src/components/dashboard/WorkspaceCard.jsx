import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FolderGit2 } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export function WorkspaceCard({ workspace }) {
  const navigate = useNavigate();

  return (
    <Card
      hoverable={true}
      onClick={() => navigate(`/workspace/${workspace.id || workspace._id}`)}
      className="group flex flex-col justify-between h-full p-4 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] hover:border-[#252525] dark:hover:border-[#777777] rounded-lg transition-colors cursor-pointer"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] flex items-center justify-center font-bold text-xs shrink-0">
              {workspace.name ? workspace.name.charAt(0).toUpperCase() : 'W'}
            </div>
            <div className="truncate">
              <h3 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] group-hover:text-[#000000] dark:group-hover:text-[#FFFFFF] transition-colors truncate my-0">
                {workspace.name}
              </h3>
              <p className="text-[10px] text-[#777777] dark:text-[#A0A0A0] font-mono truncate mt-0.5">
                slug: {workspace.slug || 'workspace'}
              </p>
            </div>
          </div>
          <Badge status={workspace.visibility || 'Public'} size="sm" />
        </div>

        {/* Description */}
        <p className="text-xs text-[#777777] dark:text-[#A0A0A0] line-clamp-2 mb-3 leading-relaxed">
          {workspace.description || 'DevSpace team collaboration workspace.'}
        </p>

        {/* Tech Stack Badges */}
        {workspace.techStack && workspace.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {workspace.techStack.map((tech, i) => (
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

      {/* Footer Stats */}
      <div className="pt-2.5 border-t border-[#E8E8E5] dark:border-[#353535] flex items-center justify-between text-xs text-[#777777] dark:text-[#A0A0A0]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>{workspace.projectCount || 0} Projects</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{workspace.memberCount || 1} Members</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default WorkspaceCard;
