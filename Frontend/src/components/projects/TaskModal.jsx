import React, { useState, useEffect, useCallback } from 'react';
import {
  Trash2,
  Edit3,
  Plus,
  GitBranch,
  Calendar,
  CheckSquare,
  MessageSquare,
  Send,
  X,
  AlertCircle
} from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

export function TaskModal({ isOpen, onClose, task, defaultStatus = 'To Do', onSave, onDelete, members = [] }) {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;

  // Modal Tab State: 'details' or 'discussion'
  const [activeTab, setActiveTab] = useState('details');

  const memberList = members || [];

  // Form Field States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState(defaultStatus);
  const [assigneeId, setAssigneeId] = useState('');
  const [tags, setTags] = useState('Frontend, React');
  const [branch, setBranch] = useState('feature/task');
  const [dueDate, setDueDate] = useState('');

  // Subtasks State
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // Comments State
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  // Validation Error
  const [titleError, setTitleError] = useState('');

  const taskId = task?._id || task?.id;

  // Fetch comments from real backend when task is opened
  const loadComments = useCallback(async () => {
    if (!taskId) {
      setComments([]);
      return;
    }

    setIsLoadingComments(true);
    setCommentError('');
    try {
      const res = await api.get(`/tasks/${taskId}/comments`);
      const backendComments = (res.data?.comments || []).map((c) => ({
        id: c._id,
        _id: c._id,
        author: c.author,
        authorId: c.author?._id || c.author?.id || c.author,
        user: c.author?.name || 'Collaborator',
        avatar: c.author?.avatar || '',
        content: c.content,
        edited: c.edited,
        time: c.createdAt ? new Date(c.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'Recently'
      }));
      setComments(backendComments);
    } catch (err) {
      console.warn('Could not load task comments:', err?.response?.data?.message || err.message);
    } finally {
      setIsLoadingComments(false);
    }
  }, [taskId]);

  // Sync state when `task` changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'Medium');
      setStatus(task.status || 'To Do');
      setAssigneeId(
        task.assignee?.id ||
          task.assignee?._id ||
          task.assigneeId ||
          ''
      );
      setTags(task.tags ? task.tags.join(', ') : (task.labels ? task.labels.join(', ') : ''));
      setBranch(task.branch || 'feature/task');
      setDueDate(task.dueDate ? (task.dueDate.includes('T') ? task.dueDate.split('T')[0] : task.dueDate) : '');
      setSubtasks(task.subtasks || []);
      loadComments();
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus(defaultStatus);
      setAssigneeId(memberList[0]?.id || memberList[0]?._id || '');
      setTags('');
      setBranch('feature/task');
      setDueDate('');
      setSubtasks([]);
      setComments([]);
    }
    setTitleError('');
    setCommentError('');
    setActiveTab('details');
  }, [isOpen, task, defaultStatus]);

  // Selected Assignee Helper
  const currentAssignee = memberList.find((m) => m.id === assigneeId || m._id === assigneeId) || null;

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
  const handleAddComment = async (e) => {
    e.preventDefault();
    const content = newCommentText.trim();
    if (!content) return;
    setCommentError('');

    if (taskId) {
      try {
        const res = await api.post(`/tasks/${taskId}/comments`, { content });
        const created = res.data?.comment;
        const formatted = {
          id: created._id,
          _id: created._id,
          author: created.author,
          authorId: created.author?._id || currentUserId,
          user: created.author?.name || user?.name || 'You',
          avatar: created.author?.avatar || user?.avatar || '',
          content: created.content,
          edited: false,
          time: 'Just now'
        };
        setComments((prev) => [...prev, formatted]);
        setNewCommentText('');
      } catch (err) {
        setCommentError(err.response?.data?.message || 'Failed to post comment');
      }
    } else {
      const draftComment = {
        id: `draft-${Date.now()}`,
        authorId: currentUserId,
        user: user?.name || 'You',
        avatar: user?.avatar || '',
        content,
        edited: false,
        time: 'Just now'
      };
      setComments((prev) => [...prev, draftComment]);
      setNewCommentText('');
    }
  };

  const handleSaveEditComment = async (commentId) => {
    const content = editCommentText.trim();
    if (!content) return;
    setCommentError('');

    if (taskId && !commentId.startsWith('draft-')) {
      try {
        await api.put(`/tasks/${taskId}/comments/${commentId}`, { content });
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, content, edited: true } : c))
        );
        setEditingCommentId(null);
      } catch (err) {
        setCommentError(err.response?.data?.message || 'Failed to update comment');
      }
    } else {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, content, edited: true } : c))
      );
      setEditingCommentId(null);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setCommentError('');
    if (taskId && !commentId.startsWith('draft-')) {
      try {
        await api.delete(`/tasks/${taskId}/comments/${commentId}`);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch (err) {
        setCommentError(err.response?.data?.message || 'Failed to delete comment');
      }
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  // SUBMIT TASK HANDLER
  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!title.trim()) {
      setTitleError('Task title is required.');
      return;
    }

    const newTask = {
      _id: task?._id,
      id: task?.id || task?.issueKey,
      issueKey: task?.issueKey,
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      branch,
      dueDate,
      subtasks,
      commentsCount: comments.length,
      assigneeId: currentAssignee?.id || currentAssignee?._id || null,
      assignee: currentAssignee ? {
        id: currentAssignee.id || currentAssignee._id,
        _id: currentAssignee.id || currentAssignee._id,
        name: currentAssignee.name,
        avatar: currentAssignee.avatar
      } : null
    };

    if (onSave) onSave(newTask);
    onClose();
  };

  // DELETE TASK HANDLER
  const handleDeleteTask = () => {
    if (task && onDelete) {
      if (window.confirm(`Are you sure you want to delete task ${task.issueKey || task.title}?`)) {
        onDelete(task._id || task.id);
        onClose();
      }
    }
  };

  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={
        <div className="flex items-center gap-2">
          {task?.issueKey && (
            <span className="px-1.5 py-0.2 rounded bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] font-mono text-[11px] font-bold border border-[#E8E8E5] dark:border-[#353535]">
              {task.issueKey}
            </span>
          )}
          <span className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2]">
            {task ? 'Task Details' : 'Create Task'}
          </span>
        </div>
      }
      subtitle={task ? `Persisted in sprint board` : 'Add an issue, bug, or technical chore to this sprint'}
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {task && onDelete && (
              <Button variant="danger" size="sm" icon={Trash2} onClick={handleDeleteTask}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {task ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Modal Tab Switcher */}
        <div className="flex items-center gap-1.5 border-b border-[#E8E8E5] dark:border-[#353535] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] font-semibold'
                : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Details & Subtasks ({completedSubtasksCount}/{subtasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discussion')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'discussion'
                ? 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] font-semibold'
                : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments ({comments.length})</span>
          </button>
        </div>

        {/* TAB 1: DETAILS & SUBTASKS */}
        {activeTab === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
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

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed specifications and acceptance criteria..."
                className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-3 py-2 text-xs text-[#252525] dark:text-[#F2F2F2] placeholder-[#999999] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
              />
            </div>

            {/* Status, Priority & Assignee Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#777777] dark:text-[#A0A0A0]">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-2.5 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Code Review">Code Review</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#777777] dark:text-[#A0A0A0]">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-2.5 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
                >
                  <option value="Lowest">Lowest</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Highest">Highest</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#777777] dark:text-[#A0A0A0]">
                  Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-2.5 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {memberList.map((m) => (
                    <option key={m.id || m._id} value={m.id || m._id}>
                      {m.name} ({m.role || 'Member'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date & Git Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#777777] dark:text-[#A0A0A0]">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999999]" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] pl-8 pr-2.5 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#777777] dark:text-[#A0A0A0]">
                  Git Branch
                </label>
                <div className="relative">
                  <GitBranch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999999]" />
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="feature/branch-name"
                    className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] pl-8 pr-2.5 py-1.5 text-xs font-mono text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Tags Input */}
            <Input
              label="Labels / Tags (comma separated)"
              placeholder="e.g. Frontend, Auth, Security"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />

            {/* Subtasks Section */}
            <div className="space-y-2 pt-2 border-t border-[#E8E8E5] dark:border-[#353535]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2]">
                  Acceptance Criteria & Subtasks
                </label>
                <span className="text-[11px] font-mono text-[#777777] dark:text-[#A0A0A0]">
                  {completedSubtasksCount} of {subtasks.length} resolved
                </span>
              </div>

              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-md bg-[#FAFAF9] dark:bg-[#1E1E1E] border border-[#E8E8E5] dark:border-[#353535] group"
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={Boolean(sub.completed)}
                        onChange={() => handleToggleSubtask(sub.id)}
                        className="rounded border-[#E8E8E5] dark:border-[#353535] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span
                        className={`text-xs truncate ${
                          sub.completed ? 'line-through text-[#999999] dark:text-[#777777]' : 'text-[#252525] dark:text-[#F2F2F2]'
                        }`}
                      >
                        {sub.text}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(sub.id)}
                      className="text-[#999999] hover:text-[#D83B01] dark:hover:text-[#F87171] opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    >
                      <X className="w-3 h-3" />
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
                  className="flex-1 rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-2.5 py-1 text-xs text-[#252525] dark:text-[#F2F2F2] placeholder-[#999999] focus:outline-none"
                />
                <Button variant="outline" size="sm" icon={Plus} onClick={handleAddSubtask} className="h-7 text-xs">
                  Add
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: COMMENTS */}
        {activeTab === 'discussion' && (
          <div className="space-y-4 text-left">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
                  Discussion ({comments.length})
                </h4>
                {isLoadingComments && (
                  <span className="text-[11px] text-[#777777] dark:text-[#A0A0A0]">
                    Loading comments...
                  </span>
                )}
              </div>

              {commentError && (
                <div className="p-2 rounded-md bg-[#FDF3F2] dark:bg-[rgba(248,113,113,0.12)] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.25)] text-[#D83B01] dark:text-[#F87171] text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{commentError}</span>
                </div>
              )}

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {comments.length > 0 ? (
                  comments.map((c) => {
                    const isAuthor =
                      c.authorId === currentUserId ||
                      c.author?._id === currentUserId ||
                      c.author?.email === user?.email ||
                      c.user === user?.name;

                    return (
                      <div
                        key={c.id || c._id}
                        className="p-2.5 rounded-md border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar src={c.avatar} name={c.user} size="xs" />
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2]">{c.user}</span>
                              {c.edited && (
                                <span className="text-[9px] text-[#999999] dark:text-[#777777] font-mono">(edited)</span>
                              )}
                              <span className="text-[10px] text-[#999999] dark:text-[#777777] font-mono">• {c.time}</span>
                            </div>
                          </div>

                          {isAuthor && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCommentId(c.id || c._id);
                                  setEditCommentText(c.content);
                                }}
                                className="p-1 text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(c.id || c._id)}
                                className="p-1 text-[#999999] hover:text-[#D83B01] dark:hover:text-[#F87171] transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {editingCommentId === (c.id || c._id) ? (
                          <div className="space-y-1.5 pt-1">
                            <textarea
                              rows={2}
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] p-2 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
                            />
                            <div className="flex justify-end gap-1.5">
                              <Button variant="outline" size="sm" onClick={() => setEditingCommentId(null)} className="h-6 text-xs">
                                Cancel
                              </Button>
                              <Button variant="primary" size="sm" onClick={() => handleSaveEditComment(c.id || c._id)} className="h-6 text-xs">
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-[#555555] dark:text-[#CCCCCC] leading-relaxed my-0">
                            {c.content}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 border border-dashed border-[#E8E8E5] dark:border-[#353535] rounded-md text-[#999999] dark:text-[#777777] text-xs">
                    No comments yet. Leave a note or feedback for your team.
                  </div>
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-2.5 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] placeholder-[#999999] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
                />
                <Button variant="primary" size="sm" icon={Send} type="submit" disabled={!newCommentText.trim()} className="h-7 text-xs">
                  Post
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default TaskModal;
