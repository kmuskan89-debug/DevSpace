import React from 'react';
import { Layers, Plus, UserPlus, Settings, GitBranch, Globe, Lock } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export function WorkspaceHeader({ workspace, onOpenNewProject, onOpenInviteMember, onOpenSettings }) {
  if (!workspace) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-xl shadow-indigo-600/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Layers className="w-7 h-7 text-indigo-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight my-0">
                {workspace.name}
              </h1>
              <Badge status={workspace.visibility} icon={workspace.visibility === 'Public' ? Globe : Lock} />
              <span className="text-xs text-slate-500 font-mono">ID: {workspace.id}</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {workspace.description}
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-xs font-semibold text-slate-400">Tech Stack:</span>
              {workspace.techStack?.map((tech, i) => (
                <Badge key={i} variant="tech">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button variant="outline" size="sm" icon={UserPlus} onClick={onOpenInviteMember}>
            Invite Member
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={onOpenNewProject}>
            New Project
          </Button>
          <Button variant="ghost" size="icon" onClick={onOpenSettings} title="Workspace Settings">
            <Settings className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceHeader;
