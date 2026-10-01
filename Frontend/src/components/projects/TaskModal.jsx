import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Edit3,
  Plus,
  GitBranch,
  Calendar,
  CheckSquare,
  MessageSquare,
  History,
  User,
  Clock,
  Send,
  X,
  Shield,
  CheckCircle2
} from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { INITIAL_MEMBERS, INITIAL_USER } from '../../utils/constants';

export function TaskModal({ isOpen, onClose, task, defaultStatus = 'To Do', onSave, onDelete }) {
  // Modal Tab State: 'details' or 'discussion'
  const [activeTab, setActiveTab] = useState('details');

  // Form Field States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState(defaultStatus);
  const [assigneeId, setAssigneeId] = useState(INITIAL_MEMBERS[0].id);
  const [tags, setTags] = useState('Frontend, React');
  const [branch, setBranch] = useState('feature/sprint-task');
  const [dueDate, setDueDate] = useState('Oct 15, 2026');

  // Subtasks State
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // Comments State
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  // Task Activity History State
  const [history, setHistory] = useState([]);

  // Validation Error
  const [titleError, setTitleError] = useState('');

  // Sync state when `task` changes or modal opens
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'Medium');
      setStatus(task.status || 'To Do');
      setAssigneeId(
        task.assignee?.id ||
          INITIAL_MEMBERS.find((m) => m.name === task.assignee?.name)?.id ||
          INITIAL_MEMBERS[0].id
      );
      setTags(task.tags ? task.tags.join(', ') : 'Frontend, React');
      setBranch(task.branch || 'feature/sprint-task');
      setDueDate(task.dueDate || 'Oct 15, 2026');
      setSubtasks(task.subtasks || [
        { id: 'sub-1', text: 'Define API specifications', completed: true },
        { id: 'sub-2', text: 'Write automated integration tests', completed: false }
      ]);
      setComments(task.comments || [
        {
          id: 'c-1',
          user: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          content: 'Feature looks ready for code review.',
          time: '2 hours ago'
        }
      ]);
      setHistory(task.history || [
        { id: 'h-1', user: task.assignee?.name || 'Alex Rivera', action: 'created task', time: '1 day ago' }
      ]);
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus(defaultStatus);
      setAssigneeId(INITIAL_MEMBERS[0].id);
      setTags('Frontend, React');
      setBranch('feature/sprint-task');
      setDueDate('Oct 15, 2026');
      setSubtasks([
        { id: 'sub-1', text: 'Define API specifications', completed: false }
      ]);
      setComments([]);
      setHistory([
        { id: 'h-1', user: INITIAL_USER.name, action: 'created draft task', time: 'Just now' }
      ]);
    }
    setTitleError('');
    setActiveTab('details');
  }, [task, defaultStatus, isOpen]);

  // Selected Assignee Helper
  const currentAssignee = INITIAL_MEMBERS.find((m) => m.id === assigneeId) || INITIAL_MEMBERS[0];

  // SUBTASK HANDLERS
  const handleToggleSubtask = (subId) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    const newSub = {
      id: `sub-${Date.now().toString().slice(-4)}`,
      text: newSubtaskText.trim(),
      completed: false
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskText('');
  };

  const handleDeleteSubtask = (subId) => {
    setSubtasks(subtasks.filter((s) => s.id !== subId));
  };

  // COMMENT HANDLERS
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newComment = {
      id: `c-${Date.now().toString().slice(-4)}`,
      user: INITIAL_USER.name,
      avatar: INITIAL_USER.avatar,
      content: newCommentText.trim(),
      time: 'Just now'
    };
    setComments([...comments, newComment]);
    setNewCommentText('');
  };

  const handleSaveEditComment = (commentId) => {
    setComments(
      comments.map((c) => (c.id === commentId ? { ...c, content: editCommentText } : c))
    );
    setEditingCommentId(null);
  };

  const handleDeleteComment = (commentId) => {
    setComments(comments.filter((c) => c.id !== commentId));
  };

  // SUBMIT TASK HANDLER
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Task title is required.');
      return;
    }

    const newTask = {
      id: task?.id || `task-${Date.now().toString().slice(-3)}`,
      title,
      description,
      priority,
      status,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      branch,
      dueDate,
      subtasks,
      comments,
      commentsCount: comments.length,
      history: [
        { id: `h-${Date.now()}`, user: INITIAL_USER.name, action: task ? 'updated task details' : 'created task', time: 'Just now' },
        ...history
      ],
      assignee: {
        id: currentAssignee.id,
        name: currentAssignee.name,
        avatar: currentAssignee.avatar
      }
    };

    onSave && onSave(newTask);
    onClose();
  };

  // DELETE TASK HANDLER
  const handleDeleteTask = () => {
    if (task && onDelete) {
      if (window.confirm(`Are you sure you want to delete task ${task.id} (${task.title})?`)) {
        onDelete(task.id);
        onClose();
      }
    }
  };

  // Completed subtasks counter
  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-slate-100">
            {task ? `Task: ${task.id}` : 'Create Sprint Task'}
          </span>
          {task && <Badge status={status} size="sm" />}
          {task && <Badge priority={priority} size="sm" />}
        </div>
      }
      subtitle="Manage task details, assignees, subtasks, comments, and git branches"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {task && onDelete && (
              <Button variant="danger" size="sm" icon={Trash2} onClick={handleDeleteTask}>
                Delete Task
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {task ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Modal Inner Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Details & Subtasks ({completedSubtasksCount}/{subtasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discussion')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'discussion'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments ({comments.length}) & Activity</span>
          </button>
        </div>

        {/* TAB 1: DETAILS & SUBTASKS */}
        {activeTab === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <Input
              label="Task Title"
              required
              placeholder="e.g. Implement OAuth2 PKCE authorization flow"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError('');
              }}
              error={titleError}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed specifications and code review acceptance criteria..."
                className="w-full rounded-lg bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Quick Status, Priority & Assignee Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase text-slate-400">
                  Status Column
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Code Review">Code Review</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase text-slate-400">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase text-slate-400">
                  Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  {INITIAL_MEMBERS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Git Branch & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Git Feature Branch"
                placeholder="feature/oauth2-pkce"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />

              <Input
                label="Due Date"
                placeholder="Oct 15, 2026"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <Input
              label="Labels / Tags (comma separated)"
              placeholder="Security, OAuth, Backend"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />

            {/* SUBTASKS SECTION */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Subtasks Checklist ({completedSubtasksCount}/{subtasks.length})
                </label>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {subtasks.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={s.completed}
                        onChange={() => handleToggleSubtask(s.id)}
                        className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className={s.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                        {s.text}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(s.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Subtask Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new subtask..."
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask(e);
                    }
                  }}
                  className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <Button variant="secondary" size="sm" icon={Plus} onClick={handleAddSubtask}>
                  Add
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: COMMENTS & ACTIVITY HISTORY */}
        {activeTab === 'discussion' && (
          <div className="space-y-5 text-left">
            {/* COMMENTS SECTION */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Comments ({comments.length})
              </h4>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar src={c.avatar} name={c.user} size="sm" />
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">{c.user}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{c.time}</span>
                        </div>
                      </div>

                      {c.user === INITIAL_USER.name && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(c.id);
                              setEditCommentText(c.content);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                            title="Edit Comment"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(c.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Comment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {editingCommentId === c.id ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          rows={2}
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 text-xs text-slate-100"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingCommentId(null)}>
                            Cancel
                          </Button>
                          <Button variant="primary" size="sm" onClick={() => handleSaveEditComment(c.id)}>
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-300 leading-relaxed my-0">{c.content}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <Button variant="primary" size="sm" icon={Send} type="submit">
                  Post
                </Button>
              </form>
            </div>

            {/* TASK ACTIVITY HISTORY */}
            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Task Activity History</span>
              </h4>

              <div className="space-y-2 font-mono text-[11px]">
                {history.map((h, i) => (
                  <div key={h.id || i} className="flex items-center justify-between text-slate-400 p-2 rounded bg-slate-950/60 border border-slate-800">
                    <div>
                      <strong className="text-slate-200">{h.user}</strong> {h.action}
                    </div>
                    <span className="text-slate-500">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default TaskModal;
