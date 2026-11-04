import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle2,
  Calendar,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Kanban
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import IssueRow from './IssueRow';
import Button from '../common/Button';
import Dropdown, { DropdownItem } from '../common/Dropdown';

export function SprintCard({
  sprint,
  issues = [],
  onIssueClick,
  onAddIssue,
  onStartSprint,
  onCompleteSprint,
  onEditSprint,
  onDeleteSprint,
  onMoveIssueToSprint,
  onRemoveIssue,
  onDeleteIssue,
  availableSprints = [],
  canManage = true,
  onDropIssueIntoSprint,
  defaultCollapsed = false
}) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isDragOver, setIsDragOver] = useState(false);

  const sprintId = sprint._id || sprint.id;
  const status = sprint.status || 'Planned';
  const isActive = status === 'Active';
  const isCompleted = status === 'Completed';

  // Metrics computation
  const totalIssues = issues.length;
  const completedIssues = issues.filter(
    (t) => String(t.status).toLowerCase() === 'done' || String(t.status).toLowerCase() === 'completed'
  ).length;
  const totalStoryPoints = issues.reduce((sum, t) => {
    const pts = typeof t.storyPoints === 'number' && !isNaN(t.storyPoints) ? t.storyPoints : 0;
    return sum + pts;
  }, 0);
  const progress = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    const sourceSprint = e.dataTransfer.getData('application/devspace-source-sprint');
    if (taskId && sourceSprint !== sprintId) {
      if (onDropIssueIntoSprint) {
        onDropIssueIntoSprint(taskId, sprintId);
      }
    }
  };

  const formatDateRange = () => {
    if (!sprint.startDate && !sprint.endDate) return null;
    const startStr = sprint.startDate ? new Date(sprint.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD';
    const endStr = sprint.endDate ? new Date(sprint.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD';
    return `${startStr} – ${endStr}`;
  };

  const dateRange = formatDateRange();

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-lg border transition-all overflow-hidden ${
        isDragOver
          ? 'border-[#252525] dark:border-[#F2F2F2] ring-1 ring-[#252525]/20 dark:ring-[#F2F2F2]/20 bg-[#F9F9F8] dark:bg-[#242424]'
          : isActive
          ? 'border-[#252525] dark:border-[#777777] bg-[#FFFFFF] dark:bg-[#202020] shadow-2xs'
          : 'border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020]'
      }`}
    >
      {/* Sprint Header Row */}
      <div className="p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E8E5] dark:border-[#353535] bg-[#FAFAF9] dark:bg-[#1E1E1E]">
        {/* Left: Collapse toggle, Sprint Name, Status Pill, Dates, Goal */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? 'Expand sprint' : 'Collapse sprint'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-[#252525] dark:text-[#F2F2F2] my-0 truncate">
                {sprint.name}
              </h3>

              {/* Status Badge */}
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-semibold ${
                  isActive
                    ? 'bg-[#252525] text-[#FFFFFF] dark:bg-[#F2F2F2] dark:text-[#191919]'
                    : isCompleted
                    ? 'bg-[#EAEAE7] dark:bg-[#333333] text-[#777777] dark:text-[#A0A0A0]'
                    : 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]'
                }`}
              >
                {status}
              </span>

              {dateRange && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-[#777777] dark:text-[#A0A0A0]">
                  <Calendar className="w-3 h-3 text-[#999999]" />
                  <span>{dateRange}</span>
                </span>
              )}
            </div>

            {sprint.goal && (
              <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] truncate my-0 mt-0.5">
                Goal: {sprint.goal}
              </p>
            )}
          </div>
        </div>

        {/* Right: Issue count, Points, Progress, Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-[#777777] dark:text-[#A0A0A0]">
            <span>
              <strong className="text-[#252525] dark:text-[#F2F2F2] font-semibold">{totalIssues}</strong> issues
            </span>
            <span>•</span>
            <span>
              <strong className="text-[#252525] dark:text-[#F2F2F2] font-semibold">{totalStoryPoints}</strong> pts
            </span>
            {totalIssues > 0 && (
              <>
                <span>•</span>
                <span className="font-semibold text-[#252525] dark:text-[#F2F2F2]">{progress}%</span>
              </>
            )}
          </div>

          {/* Action Buttons based on status & permissions */}
          <div className="flex items-center gap-1.5">
            {isActive && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Kanban}
                  onClick={() => navigate(`/workspace/${sprint.project?.workspace || 'ws'}/projects/${sprint.project?._id || sprint.project}/board`)}
                  className="h-7 text-xs hidden sm:inline-flex"
                >
                  Board
                </Button>

                {canManage && onCompleteSprint && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => onCompleteSprint(sprint, completedIssues, totalIssues - completedIssues)}
                    className="h-7 text-xs"
                  >
                    Complete Sprint
                  </Button>
                )}
              </>
            )}

            {!isActive && !isCompleted && canManage && onStartSprint && (
              <Button
                variant="primary"
                size="sm"
                icon={Play}
                onClick={() => onStartSprint(sprint, totalIssues, totalStoryPoints)}
                className="h-7 text-xs"
              >
                Start Sprint
              </Button>
            )}

            {canManage && (
              <Dropdown
                align="right"
                width="w-40"
                trigger={
                  <button
                    type="button"
                    className="p-1 rounded text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                    title="Sprint Actions"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                }
              >
                <div className="py-1">
                  {!isCompleted && onAddIssue && (
                    <DropdownItem icon={Plus} onClick={() => onAddIssue(sprintId)}>
                      Add Issue
                    </DropdownItem>
                  )}
                  {onEditSprint && (
                    <DropdownItem icon={Edit2} onClick={() => onEditSprint(sprint)}>
                      Edit Sprint
                    </DropdownItem>
                  )}
                  {!isActive && onDeleteSprint && (
                    <DropdownItem icon={Trash2} danger onClick={() => onDeleteSprint(sprintId)}>
                      Delete Sprint
                    </DropdownItem>
                  )}
                </div>
              </Dropdown>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar under header */}
      {totalIssues > 0 && (
        <div className="w-full h-1 bg-[#F1F1EF] dark:bg-[#2A2A2A] overflow-hidden">
          <div
            className="h-full bg-[#252525] dark:bg-[#F2F2F2] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Issues List */}
      {!isCollapsed && (
        <div className="p-2 sm:p-2.5 space-y-1.5 bg-[#FFFFFF] dark:bg-[#202020]">
          {issues.length > 0 ? (
            issues.map((issue) => (
              <IssueRow
                key={issue._id || issue.id}
                issue={issue}
                currentSprintId={sprintId}
                onIssueClick={onIssueClick}
                onMoveToSprint={onMoveIssueToSprint}
                onRemoveFromSprint={onRemoveIssue}
                onDelete={onDeleteIssue}
                availableSprints={availableSprints}
                canManage={canManage}
              />
            ))
          ) : (
            <div className="py-6 text-center rounded-md border border-dashed border-[#E8E8E5] dark:border-[#353535] space-y-1">
              <p className="text-xs text-[#777777] dark:text-[#A0A0A0] my-0 font-medium">
                Sprint is empty
              </p>
              <p className="text-[11px] text-[#999999] dark:text-[#777777] my-0">
                Drag issues here from the backlog or click + to add issues.
              </p>
              {canManage && onAddIssue && !isCompleted && (
                <div className="pt-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Plus}
                    onClick={() => onAddIssue(sprintId)}
                    className="h-6 text-xs px-2"
                  >
                    Add Issue
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SprintCard;

