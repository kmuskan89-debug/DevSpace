import React, { useState } from 'react';
import {
  GripVertical,
  CheckSquare,
  Bug,
  Bookmark,
  Zap,
  MoreHorizontal,
  ArrowRight,
  ArrowDown,
  Trash2,
  Edit2
} from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import Dropdown, { DropdownItem } from '../common/Dropdown';

export function IssueRow({
  issue,
  onIssueClick,
  onMoveToSprint,
  onRemoveFromSprint,
  onDelete,
  availableSprints = [],
  currentSprintId = null,
  canManage = true,
  onDragStart,
  onDragOver,
  onDrop
}) {
  const [isDragging, setIsDragging] = useState(false);

  const issueId = issue._id || issue.id;

  const getTypeIcon = (type) => {
    switch (String(type).toLowerCase()) {
      case 'bug':
        return <Bug className="w-3.5 h-3.5 text-[#777777] dark:text-[#A0A0A0]" />;
      case 'story':
        return <Bookmark className="w-3.5 h-3.5 text-[#777777] dark:text-[#A0A0A0]" />;
      case 'epic':
        return <Zap className="w-3.5 h-3.5 text-[#777777] dark:text-[#A0A0A0]" />;
      default:
        return <CheckSquare className="w-3.5 h-3.5 text-[#777777] dark:text-[#A0A0A0]" />;
    }
  };

  const handleDragStartInternal = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', issueId);
    e.dataTransfer.setData('application/devspace-source-sprint', currentSprintId || 'backlog');
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(e, issue);
  };

  const handleDragEndInternal = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable={canManage}
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`group flex items-center justify-between p-2 sm:px-3 sm:py-2 text-xs border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] hover:bg-[#F9F9F8] dark:hover:bg-[#262626] rounded-md transition-colors gap-2.5 cursor-pointer ${
        isDragging ? 'opacity-40 ring-1 ring-[#252525] dark:ring-[#F2F2F2]' : ''
      }`}
      onClick={() => onIssueClick && onIssueClick(issue)}
    >
      {/* Left: Grip, Type Icon, Issue Key & Title */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {canManage && (
          <GripVertical className="w-3.5 h-3.5 text-[#999999] opacity-40 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shrink-0" />
        )}

        <div className="shrink-0" title={`Type: ${issue.type || 'Task'}`}>
          {getTypeIcon(issue.type)}
        </div>

        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium text-[#777777] dark:text-[#A0A0A0] bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] shrink-0">
          {issue.issueKey || issue.id}
        </span>

        <span className="font-medium text-[#252525] dark:text-[#F2F2F2] truncate group-hover:underline">
          {issue.title}
        </span>
      </div>

      {/* Right: Story Points, Priority, Status, Assignee, Actions */}
      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Story Points */}
        {issue.storyPoints !== undefined && issue.storyPoints !== null && issue.storyPoints !== '' ? (
          <span
            className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] border border-[#E8E8E5] dark:border-[#353535] font-semibold"
            title={`${issue.storyPoints} Story Points`}
          >
            {issue.storyPoints} pts
          </span>
        ) : (
          <span className="text-[10px] font-mono text-[#999999] dark:text-[#777777] hidden sm:inline" title="No story points">
            –
          </span>
        )}

        {/* Priority Badge */}
        <div className="hidden sm:inline-flex">
          <Badge priority={issue.priority || 'Medium'} size="sm" />
        </div>

        {/* Status Badge */}
        <Badge status={issue.status || 'To Do'} size="sm" />

        {/* Assignee Avatar */}
        {issue.assignee ? (
          <Avatar
            src={issue.assignee?.avatar}
            name={issue.assignee?.name || 'Assignee'}
            size="xs"
          />
        ) : (
          <div
            className="w-5 h-5 rounded-full border border-dashed border-[#E8E8E5] dark:border-[#353535] flex items-center justify-center text-[9px] text-[#999999]"
            title="Unassigned"
          >
            ?
          </div>
        )}

        {/* Actions Menu */}
        {canManage && (
          <Dropdown
            align="right"
            width="w-48"
            trigger={
              <button
                type="button"
                className="p-1 rounded text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                title="Issue Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="py-1">
              <DropdownItem
                icon={Edit2}
                onClick={() => onIssueClick && onIssueClick(issue)}
              >
                Edit Issue
              </DropdownItem>

              {/* Move to another sprint if in backlog or another sprint */}
              {availableSprints && availableSprints.length > 0 && (
                <>
                  <div className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#999999] dark:text-[#777777] border-t border-[#E8E8E5] dark:border-[#353535] mt-1">
                    Move to Sprint
                  </div>
                  {availableSprints
                    .filter((s) => s._id !== currentSprintId)
                    .map((sprint) => (
                      <DropdownItem
                        key={sprint._id}
                        icon={ArrowRight}
                        onClick={() => onMoveToSprint && onMoveToSprint(issueId, sprint._id)}
                      >
                        <span className="truncate">{sprint.name}</span>
                      </DropdownItem>
                    ))}
                </>
              )}

              {/* Move to Backlog if currently in a sprint */}
              {currentSprintId && (
                <DropdownItem
                  icon={ArrowDown}
                  onClick={() => onRemoveFromSprint && onRemoveFromSprint(issueId)}
                >
                  Move to Backlog
                </DropdownItem>
              )}

              {onDelete && (
                <div className="pt-1 border-t border-[#E8E8E5] dark:border-[#353535] mt-1">
                  <DropdownItem
                    icon={Trash2}
                    danger
                    onClick={() => onDelete(issueId)}
                  >
                    Delete Issue
                  </DropdownItem>
                </div>
              )}
            </div>
          </Dropdown>
        )}
      </div>
    </div>
  );
}

export default IssueRow;

