import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, MessageSquare, Clock, CheckSquare, GripVertical } from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';

export function TaskCard({ task, onClick, onDragStart }) {
  const [isDragging, setIsDragging] = useState(false);

  const taskId = task.id || task._id || task.issueKey;

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(task);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  return (
    <motion.div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.1 }}
      className={`rounded-md p-3 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] hover:border-[#252525] dark:hover:border-[#777777] transition-all cursor-grab active:cursor-grabbing space-y-2.5 group shadow-2xs ${
        isDragging ? 'opacity-40 scale-[0.98] ring-1 ring-[#252525] dark:ring-[#F2F2F2]' : ''
      }`}
    >
      {/* Header: Key, Grip Handle, Priority */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="w-3 h-3 text-[#999999] opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium text-[#777777] dark:text-[#A0A0A0] bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] shrink-0">
            {task.issueKey || task.id}
          </span>
        </div>
        <Badge priority={task.priority} size="sm" dot />
      </div>

      {/* Title */}
      <h4 className="text-xs font-medium text-[#252525] dark:text-[#F2F2F2] group-hover:underline transition-colors leading-snug my-0">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] line-clamp-2 leading-relaxed my-0">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag, i) => (
            <span
              key={i}
              className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#F7F7F5] dark:bg-[#262626] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Subtasks Progress */}
      {subtasks.length > 0 && (
        <div className="flex items-center justify-between text-[10px] font-mono text-[#777777] dark:text-[#A0A0A0] bg-[#F9F9F8] dark:bg-[#1A1A1A] px-2 py-1 rounded border border-[#E8E8E5] dark:border-[#353535]">
          <div className="flex items-center gap-1 text-[#555555] dark:text-[#CCCCCC]">
            <CheckSquare className="w-3 h-3" />
            <span>Subtasks: {completedSubtasks}/{subtasks.length}</span>
          </div>
          <span className="font-semibold text-[#252525] dark:text-[#F2F2F2]">
            {Math.round((completedSubtasks / subtasks.length) * 100)}%
          </span>
        </div>
      )}

      {/* Git Branch */}
      {task.branch && (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F9F9F8] dark:bg-[#1A1A1A] text-[10px] font-mono text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535] truncate">
          <GitBranch className="w-3 h-3 shrink-0" />
          <span className="truncate">{task.branch}</span>
        </div>
      )}

      {/* Footer: Due Date, Comments, Assignee */}
      <div className="pt-2 border-t border-[#E8E8E5] dark:border-[#353535] flex items-center justify-between text-[10px] text-[#777777] dark:text-[#A0A0A0] font-mono">
        <div className="flex items-center gap-2">
          {(task.comments?.length > 0 || task.commentsCount > 0) && (
            <div className="flex items-center gap-0.5">
              <MessageSquare className="w-3 h-3" />
              <span>{task.comments ? task.comments.length : task.commentsCount}</span>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              <span>{task.formattedDueDate || task.dueDate}</span>
            </div>
          )}
        </div>

        {task.assignee && (
          <Avatar
            src={task.assignee.avatar}
            name={task.assignee.name || 'Assignee'}
            size="xs"
          />
        )}
      </div>
    </motion.div>
  );
}

export default TaskCard;
