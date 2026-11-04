import React, { useState } from 'react';
import { Plus, Search, FolderKanban } from 'lucide-react';
import TaskCard from './TaskCard';
import EmptyState from '../common/EmptyState';
import { useToast } from '../common/Toast';

export function KanbanBoard({ tasks = [], onTaskClick, onAddTask, onMoveTask, hideFilters = false }) {
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeDragCol, setActiveDragCol] = useState(null);

  // 4 Standard Kanban Columns
  const columns = [
    { id: 'To Do', label: 'To Do' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Code Review', label: 'Code Review' },
    { id: 'Done', label: 'Done' }
  ];

  // Filtering if hideFilters is false
  const filteredTasks = hideFilters
    ? tasks
    : tasks.filter((t) => {
        const matchesSearch =
          (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
          (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
          (t.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase())));
        const matchesPriority = priorityFilter === 'all' || (t.priority || '').toLowerCase() === priorityFilter.toLowerCase();
        return matchesSearch && matchesPriority;
      });

  // Drag and Drop Event Handlers
  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDragCol !== colId) {
      setActiveDragCol(colId);
    }
  };

  const handleDragLeave = (e, colId) => {
    if (activeDragCol === colId) {
      setActiveDragCol(null);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setActiveDragCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onMoveTask) {
      onMoveTask(taskId, targetStatus);
      const targetCol = columns.find((c) => c.id === targetStatus);
      const droppedTask = tasks.find((t) => (t.id === taskId || t._id === taskId || t.issueKey === taskId));
      if (droppedTask && targetCol) {
        addToast(`Moved "${droppedTask.title.slice(0, 25)}..." to ${targetCol.label}`, 'info');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar (hidden if external filter bar provided) */}
      {!hideFilters && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999999]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks by title, tag, or description..."
              className="w-full bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] placeholder-[#999999] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] text-[#777777] dark:text-[#A0A0A0] font-medium whitespace-nowrap">Priority:</span>
            <div className="inline-flex items-center p-0.5 rounded-md bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535]">
              {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors cursor-pointer ${
                    priorityFilter.toLowerCase() === p.toLowerCase()
                      ? 'bg-[#FFFFFF] dark:bg-[#202020] text-[#252525] dark:text-[#F2F2F2] shadow-2xs font-semibold'
                      : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Board Empty State */}
      {tasks.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title="No tasks on this board"
          description="Create your first task or issue for this sprint backlog to get started."
          actionLabel="Create Task"
          onAction={() => onAddTask && onAddTask('To Do')}
          className="py-12"
        />
      )}

      {/* 4 Columns Kanban Grid */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const isDragOver = activeDragCol === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`rounded-lg p-3 border transition-all flex flex-col min-h-[500px] bg-[#FAFAF9] dark:bg-[#1E1E1E] ${
                  isDragOver
                    ? 'border-[#252525] dark:border-[#F2F2F2] ring-1 ring-[#252525]/20 dark:ring-[#F2F2F2]/20'
                    : 'border-[#E8E8E5] dark:border-[#353535]'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#E8E8E5] dark:border-[#353535]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2]">
                      {col.label}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[10px] font-mono text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddTask && onAddTask(col.id)}
                    className="p-1 rounded text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Task Items */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[640px] pr-0.5">
                  {colTasks.length > 0 ? (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id || task._id}
                        task={task}
                        onClick={() => onTaskClick && onTaskClick(task)}
                      />
                    ))
                  ) : (
                    <div className="h-28 rounded-md border border-dashed border-[#E8E8E5] dark:border-[#353535] flex items-center justify-center text-center p-3">
                      <p className="text-[11px] text-[#999999] dark:text-[#777777] my-0 font-mono">
                        Drag tasks here or click +
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default KanbanBoard;
