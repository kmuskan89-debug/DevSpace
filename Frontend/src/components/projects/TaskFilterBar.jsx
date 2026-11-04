import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Bookmark,
  BookmarkPlus,
  Share2,
  Lock,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Copy,
  Trash2,
  Edit2
} from 'lucide-react';
import Dropdown, { DropdownItem } from '../common/Dropdown';
import SaveViewModal from './SaveViewModal';
import { useAuth } from '../../context/AuthContext';

export function TaskFilterBar({
  filters,
  onChangeFilters,
  onResetFilters,
  sort,
  onChangeSort,
  views = [],
  activeViewId = null,
  onSelectView,
  onCreateView,
  onUpdateView,
  onDeleteView,
  onDuplicateView,
  members = [],
  sprints = []
}) {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Sync search input if filters.search changes externally
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        onChangeFilters({ ...filters, search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters, onChangeFilters]);

  // Find active saved view
  const activeSavedView = views.find((v) => v._id === activeViewId) || null;
  const isViewOwner = activeSavedView && (activeSavedView.createdBy?._id === currentUserId || activeSavedView.createdBy === currentUserId);

  // Compute active filter chips
  const activeChips = [];
  if (filters.search) {
    activeChips.push({ key: 'search', label: `Search: "${filters.search}"`, onRemove: () => { setSearchInput(''); onChangeFilters({ ...filters, search: '' }); } });
  }
  if (filters.status && filters.status !== 'all') {
    activeChips.push({ key: 'status', label: `Status: ${filters.status}`, onRemove: () => onChangeFilters({ ...filters, status: 'all' }) });
  }
  if (filters.priority && filters.priority !== 'all') {
    activeChips.push({ key: 'priority', label: `Priority: ${filters.priority}`, onRemove: () => onChangeFilters({ ...filters, priority: 'all' }) });
  }
  if (filters.type && filters.type !== 'all') {
    activeChips.push({ key: 'type', label: `Type: ${filters.type}`, onRemove: () => onChangeFilters({ ...filters, type: 'all' }) });
  }
  if (filters.assignee && filters.assignee !== 'all') {
    let assigneeLabel = filters.assignee;
    if (filters.assignee === 'unassigned') assigneeLabel = 'Unassigned';
    else if (filters.assignee === 'assigned') assigneeLabel = 'Assigned';
    else {
      const m = members.find((mem) => (mem._id || mem.id) === filters.assignee);
      if (m) assigneeLabel = m.name;
    }
    activeChips.push({ key: 'assignee', label: `Assignee: ${assigneeLabel}`, onRemove: () => onChangeFilters({ ...filters, assignee: 'all' }) });
  }
  if (filters.sprint !== undefined && filters.sprint !== 'all' && filters.sprint !== '') {
    let sprintLabel = filters.sprint;
    if (filters.sprint === 'backlog' || filters.sprint === 'null') sprintLabel = 'Backlog';
    else {
      const s = sprints.find((spr) => (spr._id || spr.id) === filters.sprint);
      if (s) sprintLabel = s.name;
    }
    activeChips.push({ key: 'sprint', label: `Sprint: ${sprintLabel}`, onRemove: () => onChangeFilters({ ...filters, sprint: 'all' }) });
  }
  if (filters.dueDate && filters.dueDate !== 'all') {
    const dueLabels = {
      overdue: 'Overdue',
      today: 'Due Today',
      'this-week': 'Due This Week',
      'has-due-date': 'Has Due Date',
      'no-due-date': 'No Due Date'
    };
    activeChips.push({ key: 'dueDate', label: `Due: ${dueLabels[filters.dueDate] || filters.dueDate}`, onRemove: () => onChangeFilters({ ...filters, dueDate: 'all' }) });
  }

  const hasActiveFilters = activeChips.length > 0;

  // Separate views into Shared and Private
  const sharedViews = views.filter((v) => v.visibility === 'Shared');
  const privateViews = views.filter((v) => v.visibility === 'Private');

  return (
    <div className="space-y-2.5">
      {/* Top Bar: Search, Saved Views, Filter Selectors, Sort */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 p-2.5 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020]">
        {/* Left: Saved Views Dropdown & Search Input */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {/* Saved Views Selector */}
          <Dropdown
            align="left"
            width="w-60"
            trigger={
              <button
                type="button"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                  activeSavedView
                    ? 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] border-[#252525] dark:border-[#F2F2F2] font-semibold'
                    : 'bg-[#F7F7F5] dark:bg-[#242424] text-[#252525] dark:text-[#F2F2F2] border-[#E8E8E5] dark:border-[#353535] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-[#777777] dark:text-[#A0A0A0]" />
                <span className="truncate max-w-[120px]">
                  {activeSavedView ? activeSavedView.name : (filters.assignee === currentUserId ? 'My Issues' : 'All Issues')}
                </span>
                <ChevronDown className="w-3 h-3 text-[#999999]" />
              </button>
            }
          >
            <div className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#999999] dark:text-[#777777] border-b border-[#E8E8E5] dark:border-[#353535]">
              Views
            </div>

            <div className="py-1 max-h-60 overflow-y-auto space-y-0.5">
              <button
                type="button"
                onClick={() => onSelectView && onSelectView('default')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer rounded ${
                  !activeViewId && filters.assignee !== currentUserId
                    ? 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] font-semibold'
                    : 'text-[#777777] dark:text-[#A0A0A0] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
                }`}
              >
                <span>All Issues (Default)</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView && onSelectView('my-issues')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer rounded ${
                  !activeViewId && filters.assignee === currentUserId
                    ? 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] font-semibold'
                    : 'text-[#777777] dark:text-[#A0A0A0] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
                }`}
              >
                <span>My Assigned Issues</span>
              </button>

              {sharedViews.length > 0 && (
                <>
                  <div className="px-2.5 pt-2 pb-0.5 text-[10px] font-medium uppercase tracking-wider text-[#999999] dark:text-[#777777] flex items-center gap-1">
                    <Share2 className="w-3 h-3" /> Shared
                  </div>
                  {sharedViews.map((v) => (
                    <button
                      key={v._id}
                      type="button"
                      onClick={() => onSelectView && onSelectView(v._id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer rounded ${
                        activeViewId === v._id
                          ? 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] font-semibold'
                          : 'text-[#777777] dark:text-[#A0A0A0] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
                      }`}
                    >
                      <span className="truncate">{v.name}</span>
                    </button>
                  ))}
                </>
              )}

              {privateViews.length > 0 && (
                <>
                  <div className="px-2.5 pt-2 pb-0.5 text-[10px] font-medium uppercase tracking-wider text-[#999999] dark:text-[#777777] flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Private
                  </div>
                  {privateViews.map((v) => (
                    <button
                      key={v._id}
                      type="button"
                      onClick={() => onSelectView && onSelectView(v._id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer rounded ${
                        activeViewId === v._id
                          ? 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] font-semibold'
                          : 'text-[#777777] dark:text-[#A0A0A0] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
                      }`}
                    >
                      <span className="truncate">{v.name}</span>
                    </button>
                  ))}
                </>
              )}
            </div>

            <div className="pt-1 border-t border-[#E8E8E5] dark:border-[#353535]">
              <DropdownItem icon={BookmarkPlus} onClick={() => setIsSaveModalOpen(true)}>
                Save View...
              </DropdownItem>
            </div>
          </Dropdown>

          {/* Active View Actions (Edit, Duplicate, Delete) */}
          {activeSavedView && (
            <div className="flex items-center gap-1 border-l border-[#E8E8E5] dark:border-[#353535] pl-1.5">
              {isViewOwner && (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-1 text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] rounded transition-colors cursor-pointer"
                  title="Edit View"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onDuplicateView && onDuplicateView(activeSavedView._id)}
                className="p-1 text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] rounded transition-colors cursor-pointer"
                title="Duplicate View"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              {isViewOwner && (
                <button
                  type="button"
                  onClick={() => onDeleteView && onDeleteView(activeSavedView._id)}
                  className="p-1 text-[#999999] hover:text-[#D83B01] dark:hover:text-[#F87171] hover:bg-[#FDF3F2] dark:hover:bg-[rgba(248,113,113,0.12)] rounded transition-colors cursor-pointer"
                  title="Delete View"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999999]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search issues, keys..."
              className="w-full bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md pl-8 pr-7 py-1 text-xs text-[#252525] dark:text-[#F2F2F2] placeholder-[#999999] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#252525] dark:hover:text-[#F2F2F2] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Select Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {/* Status */}
          <select
            value={filters.status || 'all'}
            onChange={(e) => onChangeFilters({ ...filters, status: e.target.value })}
            className="bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md px-2 py-1 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Code Review">Code Review</option>
            <option value="Done">Done</option>
          </select>

          {/* Priority */}
          <select
            value={filters.priority || 'all'}
            onChange={(e) => onChangeFilters({ ...filters, priority: e.target.value })}
            className="bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md px-2 py-1 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="Highest">Highest</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Lowest">Lowest</option>
          </select>

          {/* Type */}
          <select
            value={filters.type || 'all'}
            onChange={(e) => onChangeFilters({ ...filters, type: e.target.value })}
            className="bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md px-2 py-1 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
            <option value="Story">Story</option>
            <option value="Epic">Epic</option>
          </select>

          {/* Assignee */}
          <select
            value={filters.assignee || 'all'}
            onChange={(e) => onChangeFilters({ ...filters, assignee: e.target.value })}
            className="bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md px-2 py-1 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none cursor-pointer max-w-[120px] truncate"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {members.map((m) => (
              <option key={m._id || m.id} value={m._id || m.id}>
                {m.name || m.email}
              </option>
            ))}
          </select>

          {/* Sprints */}
          {sprints.length > 0 && (
            <select
              value={filters.sprint !== undefined ? filters.sprint : 'all'}
              onChange={(e) => onChangeFilters({ ...filters, sprint: e.target.value })}
              className="bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md px-2 py-1 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none cursor-pointer max-w-[120px] truncate"
            >
              <option value="all">All Sprints</option>
              <option value="backlog">Backlog only</option>
              {sprints.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          )}

          {/* Due Date */}
          <select
            value={filters.dueDate || 'all'}
            onChange={(e) => onChangeFilters({ ...filters, dueDate: e.target.value })}
            className="bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md px-2 py-1 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none cursor-pointer"
          >
            <option value="all">Any Date</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="has-due-date">Has Date</option>
            <option value="no-due-date">No Date</option>
          </select>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 border-l border-[#E8E8E5] dark:border-[#353535] pl-1.5">
            <select
              value={sort.field || 'createdAt'}
              onChange={(e) => onChangeSort({ ...sort, field: e.target.value })}
              className="bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md px-2 py-1 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none cursor-pointer"
            >
              <option value="createdAt">Created</option>
              <option value="updatedAt">Updated</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="issueKey">Key</option>
            </select>

            <button
              type="button"
              onClick={() => onChangeSort({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' })}
              className="p-1 rounded-md bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] hover:bg-[#F1F1EF] dark:hover:bg-[#353535] text-[#252525] dark:text-[#F2F2F2] transition-colors cursor-pointer"
              title={`Sort ${sort.order === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {sort.order === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 px-0.5">
          <span className="text-[10px] font-mono text-[#999999] dark:text-[#777777] uppercase">Active:</span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] border border-[#E8E8E5] dark:border-[#353535]"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="hover:text-[#D83B01] dark:hover:text-[#F87171] p-0.5 rounded cursor-pointer"
                title="Remove filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] text-[#777777] dark:text-[#A0A0A0] hover:text-[#D83B01] dark:hover:text-[#F87171] flex items-center gap-1 ml-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      )}

      {/* Save View Modal */}
      <SaveViewModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={async (viewData) => {
          if (onCreateView) {
            await onCreateView({
              ...viewData,
              filters,
              sort
            });
          }
        }}
      />

      {/* Edit View Modal */}
      {activeSavedView && (
        <SaveViewModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialName={activeSavedView.name}
          initialDescription={activeSavedView.description}
          initialVisibility={activeSavedView.visibility}
          isEditing
          onSave={async (viewData) => {
            if (onUpdateView) {
              await onUpdateView(activeSavedView._id, {
                ...viewData,
                filters,
                sort
              });
            }
          }}
        />
      )}
    </div>
  );
}

export default TaskFilterBar;
