import React, { useState } from 'react';
import { GitBranch, MessageSquare, Clock, CheckSquare, GripVertical } from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';

export function TaskCard({ task, onClick, onDragStart }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(task);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className={`glass-card rounded-xl p-4 border border-slate-800/80 hover:border-indigo-500/50 transition-all cursor-grab active:cursor-grabbing space-y-3 group ${
        isDragging ? 'opacity-40 scale-95 border-indigo-500/80 shadow-2xl' : ''
      }`}
    >
      {/* Header: ID, Priority, Grip Handle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-slate-500">
          <GripVertical className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
          <span className="text-[10px] font-mono uppercase">{task.id}</span>
        </div>
        <Badge priority={task.priority} size="sm" />
      </div>

      {/* Task Title */}
      <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors leading-snug my-0">
        {task.title}
      </h4>

      {/* Short Description */}
      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed my-0">
        {task.description}
      </p>

      {/* Labels / Tags */}
      <div className="flex flex-wrap gap-1">
        {task.tags?.map((tag, i) => (
          <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
            #{tag}
          </span>
        ))}
      </div>

      {/* Subtasks Progress Indicator */}
      {subtasks.length > 0 && (
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
          <div className="flex items-center gap-1 text-slate-300">
            <CheckSquare className="w-3 h-3 text-indigo-400" />
            <span>Subtasks: {completedSubtasks}/{subtasks.length}</span>
          </div>
          <span className="text-indigo-400 font-bold">
            {Math.round((completedSubtasks / subtasks.length) * 100)}%
          </span>
        </div>
      )}

      {/* Git Branch Info */}
      {task.branch && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/80 text-[10px] font-mono text-indigo-300 border border-slate-800 truncate">
          <GitBranch className="w-3 h-3 text-indigo-400 shrink-0" />
          <span className="truncate">{task.branch}</span>
        </div>
      )}

      {/* Footer: Due Date, Comments Count & Assignee Avatar */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-400">
            <MessageSquare className="w-3 h-3 text-slate-500" />
            <span>{task.comments ? task.comments.length : task.commentsCount || 0}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Due {task.dueDate || 'Oct 15'}</span>
          </div>
        </div>

        {task.assignee && (
          <Avatar src={task.assignee.avatar} name={task.assignee.name} size="sm" />
        )}
      </div>
    </div>
  );
}

export default TaskCard;
