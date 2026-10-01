import React, { useState } from 'react';
import { Plus, Search, Filter, Kanban as KanbanIcon, FolderKanban } from 'lucide-react';
import TaskCard from './TaskCard';
import Button from '../common/Button';
import { useToast } from '../common/Toast';

export function KanbanBoard({ tasks = [], onTaskClick, onAddTask, onMoveTask }) {
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeDragCol, setActiveDragCol] = useState(null);

  // 4 Columns: TODO, IN PROGRESS, REVIEW, DONE
  const columns = [
    { id: 'To Do', label: 'TODO', color: 'border-slate-700 bg-slate-900/40 text-slate-300' },
    { id: 'In Progress', label: 'IN PROGRESS', color: 'border-indigo-500/40 bg-indigo-500/5 text-indigo-300' },
    { id: 'Code Review', label: 'REVIEW', color: 'border-cyan-500/40 bg-cyan-500/5 text-cyan-300' },
    { id: 'Done', label: 'DONE', color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300' }
  ];

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || t.priority?.toLowerCase() === priorityFilter;
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
      const droppedTask = tasks.find((t) => t.id === taskId);
      if (droppedTask && targetCol) {
        addToast(`Moved "${droppedTask.title.slice(0, 25)}..." to ${targetCol.label}`, 'info');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 glass-panel rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title, tag, or description..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Priority:</span>
          {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all capitalize cursor-pointer whitespace-nowrap ${
                priorityFilter === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Global Board Empty State */}
      {tasks.length === 0 && (
        <div className="glass-panel p-12 rounded-2xl text-center border border-dashed border-slate-800 space-y-3">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200 my-0">No tasks on this sprint board</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Get started by creating your first task or issue for this sprint backlog.
          </p>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => onAddTask && onAddTask('To Do')}>
            Create Task
          </Button>
        </div>
      )}

      {/* 4 Columns Grid */}
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
                className={`glass-panel rounded-xl p-3.5 border transition-all flex flex-col min-h-[520px] ${
                  isDragOver ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30' : 'border-slate-800'
                }`}
              >
                {/* Column Header */}
                <div className={`flex items-center justify-between p-2 rounded-lg border mb-3 ${col.color}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-wider font-mono">{col.label}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-950/80 text-[10px] font-mono font-bold">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddTask && onAddTask(col.id)}
                    className="p-1 rounded hover:bg-slate-800/80 transition-colors text-slate-400 hover:text-slate-100 cursor-pointer"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Task Items */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
                  {colTasks.length > 0 ? (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => onTaskClick && onTaskClick(task)}
                      />
                    ))
                  ) : (
                    <div className="p-8 text-center border border-dashed border-slate-800/80 rounded-xl my-4 space-y-2">
                      <p className="text-xs text-slate-500 font-mono my-0">No tasks in {col.label}</p>
                      <button
                        type="button"
                        onClick={() => onAddTask && onAddTask(col.id)}
                        className="text-[11px] font-semibold text-indigo-400 hover:underline cursor-pointer"
                      >
                        + Add Task
                      </button>
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
