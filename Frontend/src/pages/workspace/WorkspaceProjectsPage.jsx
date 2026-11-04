import React, { useState } from 'react';
import {
  Plus,
  Search,
  FolderGit2,
  AlertCircle,
  Edit3,
  Trash2,
  Kanban,
  LayoutGrid,
  LayoutList
} from 'lucide-react';
import useWorkspace from '../../hooks/useWorkspace';
import { useAuth } from '../../context/AuthContext';
import ProjectCard from '../../components/projects/ProjectCard';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useToast } from '../../components/common/Toast';
import { canManageProject } from '../../utils/normalizers';
import { useNavigate } from 'react-router-dom';

export function WorkspaceProjectsPage() {
  const navigate = useNavigate();
  const {
    workspace,
    projects,
    isLoadingProjects,
    projectsError,
    createProject,
    updateProject,
    deleteProject,
    members
  } = useWorkspace();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Search, Filter & View States
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Create Project Modal State
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projName, setProjName] = useState('');
  const [projKey, setProjKey] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projRepo, setProjRepo] = useState('');
  const [projPriority, setProjPriority] = useState('Medium');
  const [projStatus, setProjStatus] = useState('Active');
  const [projLead, setProjLead] = useState('');
  const [projTech, setProjTech] = useState('React, Node.js');
  const [keyTouched, setKeyTouched] = useState(false);
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit Project Modal State
  const [editingProject, setEditingProject] = useState(null);
  const [editName, setEditName] = useState('');
  const [editKey, setEditKey] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editRepo, setEditRepo] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editStatus, setEditStatus] = useState('Active');
  const [editLead, setEditLead] = useState('');
  const [editTech, setEditTech] = useState('');
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Project Confirmation Modal State
  const [deletingProject, setDeletingProject] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-suggest project key from name
  const handleNameChange = (nameVal) => {
    setProjName(nameVal);
    if (!keyTouched) {
      const words = nameVal.trim().split(/\s+/).filter(Boolean);
      let suggestedKey = '';
      if (words.length >= 2) {
        suggestedKey = words.map((w) => w[0]).join('').slice(0, 5).toUpperCase();
      } else if (words.length === 1) {
        suggestedKey = words[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
      }
      if (/^[A-Z][A-Z0-9_]{1,9}$/.test(suggestedKey)) {
        setProjKey(suggestedKey);
      }
    }
  };

  // Filtered Projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.key || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.githubRepo || '').toLowerCase().includes(search.toLowerCase());

    const matchesPriority =
      priorityFilter === 'all' || (p.priority || '').toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesPriority;
  });

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setProjName('');
    setProjKey('');
    setProjDesc('');
    setProjRepo('');
    setProjPriority('Medium');
    setProjStatus('Active');
    setProjLead(user?._id || user?.id || (members[0]?.id || ''));
    setProjTech('React, Node.js');
    setKeyTouched(false);
    setCreateError('');
    setIsNewProjectModalOpen(true);
  };

  // Create Project submit
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!projName.trim()) {
      setCreateError('Project name is required');
      return;
    }
    if (projName.trim().length < 2 || projName.trim().length > 100) {
      setCreateError('Project name must be between 2 and 100 characters');
      return;
    }

    const cleanKey = projKey.trim().toUpperCase();
    if (!cleanKey) {
      setCreateError('Project key is required (e.g. DEV, WEB, API)');
      return;
    }
    if (!/^[A-Z][A-Z0-9_]{1,9}$/.test(cleanKey)) {
      setCreateError('Project key must start with an uppercase letter and contain 2-10 uppercase alphanumeric characters');
      return;
    }

    setIsCreating(true);
    try {
      const newProj = await createProject({
        name: projName.trim(),
        key: cleanKey,
        description: projDesc.trim(),
        status: projStatus,
        priority: projPriority,
        techStack: projTech.split(',').map((t) => t.trim()).filter(Boolean),
        githubRepo: projRepo.trim() || `devspace/${cleanKey.toLowerCase()}`,
        lead: projLead || undefined
      });

      addToast(`Project "${newProj.name}" [${newProj.key}] created successfully!`, 'success');
      setIsNewProjectModalOpen(false);
    } catch (err) {
      console.error('Error creating project:', err);
      setCreateError(err.response?.data?.message || err.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setEditName(project.name || '');
    setEditKey(project.key || '');
    setEditDesc(project.description || '');
    setEditRepo(project.githubRepo || '');
    setEditPriority(project.priority || 'Medium');
    setEditStatus(project.status || 'Active');
    setEditLead(project.leadId || project.leadObj?._id || project.leadObj?.id || '');
    setEditTech(Array.isArray(project.techStack) ? project.techStack.join(', ') : '');
    setEditError('');
  };

  // Submit Edit Project
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProject) return;
    setEditError('');

    if (!editName.trim()) {
      setEditError('Project name is required');
      return;
    }

    setIsUpdating(true);
    try {
      const cleanKey = editKey.trim().toUpperCase();
      const updated = await updateProject(editingProject.id || editingProject._id, {
        name: editName.trim(),
        key: cleanKey,
        description: editDesc.trim(),
        status: editStatus,
        priority: editPriority,
        techStack: editTech.split(',').map((t) => t.trim()).filter(Boolean),
        githubRepo: editRepo.trim(),
        lead: editLead || undefined
      });

      addToast(`Project "${updated.name}" updated successfully!`, 'success');
      setEditingProject(null);
    } catch (err) {
      console.error('Error updating project:', err);
      setEditError(err.response?.data?.message || err.message || 'Failed to update project');
    } finally {
      setIsUpdating(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (project) => {
    setDeletingProject(project);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);

    try {
      const projId = deletingProject.id || deletingProject._id;
      await deleteProject(projId);
      addToast(`Project "${deletingProject.name}" and associated tasks deleted.`, 'info');
      setDeletingProject(null);
    } catch (err) {
      console.error('Error deleting project:', err);
      addToast(err.response?.data?.message || err.message || 'Failed to delete project', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E8E5] dark:border-[#353535]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252525] dark:text-[#F2F2F2] my-0">
              Projects
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]">
              {projects.length} total
            </span>
          </div>
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0]">
            Manage software projects, track sprint velocity, and assign tasks across {workspace?.name || 'this workspace'}.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={handleOpenCreateModal}
          className="shrink-0"
        >
          Create Project
        </Button>
      </div>

      {/* 2. SEARCH, FILTER & VIEW TOGGLE BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020]">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999999]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, key, repo, or description..."
            className="w-full bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] placeholder-[#999999] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto">
          {/* Priority Filter */}
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

          {/* View Mode Toggle */}
          <div className="inline-flex items-center p-0.5 rounded-md bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#FFFFFF] dark:bg-[#202020] text-[#252525] dark:text-[#F2F2F2] shadow-2xs'
                  : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
              }`}
              title="Table View"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#FFFFFF] dark:bg-[#202020] text-[#252525] dark:text-[#F2F2F2] shadow-2xs'
                  : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. LOADING & ERROR STATES */}
      {isLoadingProjects && (
        <div className="space-y-3">
          <SkeletonLoader variant="card" count={4} />
        </div>
      )}

      {!isLoadingProjects && projectsError && (
        <div className="p-3 rounded-lg bg-[#FDF3F2] dark:bg-[rgba(248,113,113,0.12)] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.25)] text-[#D83B01] dark:text-[#F87171] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{projectsError}</span>
        </div>
      )}

      {/* 4. PROJECTS LIST / TABLE / GRID */}
      {!isLoadingProjects && filteredProjects.length > 0 && (
        <>
          {viewMode === 'table' ? (
            <div className="rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#252525] dark:text-[#F2F2F2]">
                  <thead className="bg-[#FAFAF9] dark:bg-[#1E1E1E] text-[#777777] dark:text-[#A0A0A0] font-medium border-b border-[#E8E8E5] dark:border-[#353535]">
                    <tr>
                      <th className="py-2.5 px-3">Project</th>
                      <th className="py-2.5 px-3">Lead</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Progress</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E8E5] dark:divide-[#353535]">
                    {filteredProjects.map((p) => {
                      const isManager = canManageProject(p, workspace, user);
                      const projectUrl = `/workspace/${p.workspaceId || workspace?.id || workspace?._id}/projects/${p.id || p._id}`;
                      const boardUrl = `/workspace/${p.workspaceId || workspace?.id || workspace?._id}/projects/${p.id || p._id}/board`;

                      return (
                        <tr
                          key={p.id || p._id}
                          className="hover:bg-[#F9F9F8] dark:hover:bg-[#262626] transition-colors group"
                        >
                          {/* Project Name & Key */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-md bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] flex items-center justify-center font-bold text-xs shrink-0">
                                {p.key ? p.key.slice(0, 3) : 'PRJ'}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => navigate(projectUrl)}
                                    className="font-semibold text-xs text-[#252525] dark:text-[#F2F2F2] hover:underline truncate cursor-pointer text-left"
                                  >
                                    {p.name}
                                  </button>
                                  {p.key && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535] shrink-0 font-bold">
                                      {p.key}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] font-mono text-[#777777] dark:text-[#A0A0A0] truncate mt-0.5">
                                  {p.githubRepo}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Lead */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <Avatar src={p.leadObj?.avatar} name={p.lead || 'Lead'} size="xs" />
                              <span className="text-[11px] text-[#777777] dark:text-[#A0A0A0] truncate max-w-[110px]">
                                {p.lead || 'Unassigned'}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <Badge status={p.status} size="sm" />
                          </td>

                          {/* Priority */}
                          <td className="py-3 px-3">
                            <Badge priority={p.priority} size="sm" />
                          </td>

                          {/* Progress */}
                          <td className="py-3 px-3">
                            <div className="w-28 space-y-1">
                              <div className="flex justify-between text-[10px] text-[#777777] dark:text-[#A0A0A0] font-mono">
                                <span>{p.completedTasksCount || 0}/{p.totalTasksCount || 0}</span>
                                <span>{p.progress || 0}%</span>
                              </div>
                              <div className="w-full h-1 rounded-full bg-[#F1F1EF] dark:bg-[#2A2A2A] overflow-hidden">
                                <div
                                  className="h-full bg-[#252525] dark:bg-[#F2F2F2] rounded-full"
                                  style={{ width: `${p.progress || 0}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => navigate(boardUrl)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[#252525] dark:text-[#F2F2F2] bg-[#F1F1EF] dark:bg-[#2A2A2A] hover:bg-[#E8E8E5] dark:hover:bg-[#353535] transition-colors cursor-pointer"
                                title="Open Kanban Board"
                              >
                                <Kanban className="w-3 h-3" />
                                <span className="hidden sm:inline">Board</span>
                              </button>

                              {isManager && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(p)}
                                  className="p-1 rounded text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                                  title="Edit Project"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {isManager && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenDelete(p)}
                                  className="p-1 rounded text-[#777777] dark:text-[#A0A0A0] hover:text-[#D83B01] dark:hover:text-[#F87171] hover:bg-[#FDF3F2] dark:hover:bg-[rgba(248,113,113,0.12)] transition-colors cursor-pointer"
                                  title="Delete Project"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((p) => {
                const isManager = canManageProject(p, workspace, user);
                return (
                  <ProjectCard
                    key={p.id || p._id}
                    project={p}
                    canManage={isManager}
                    onEdit={isManager ? handleOpenEdit : undefined}
                    onDelete={isManager ? handleOpenDelete : undefined}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 5. EMPTY STATE */}
      {!isLoadingProjects && filteredProjects.length === 0 && (
        <EmptyState
          icon={FolderGit2}
          title={search || priorityFilter !== 'all' ? 'No matching projects' : 'No projects created yet'}
          description={
            search || priorityFilter !== 'all'
              ? `No project matching "${search}" with ${priorityFilter} priority. Try resetting filters.`
              : `Create your first project in ${workspace?.name || 'this workspace'} to start tracking tasks.`
          }
          actionLabel={search || priorityFilter !== 'all' ? 'Reset Filters' : 'Create Project'}
          onAction={
            search || priorityFilter !== 'all'
              ? () => {
                  setSearch('');
                  setPriorityFilter('all');
                }
              : handleOpenCreateModal
          }
          className="py-12"
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* CREATE PROJECT MODAL                                  */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isNewProjectModalOpen}
        onClose={() => !isCreating && setIsNewProjectModalOpen(false)}
        title="Create New Project"
        subtitle={`Set up a repository or project tracker in ${workspace?.name || 'Workspace'}`}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsNewProjectModalOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateProject} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateProject} className="space-y-3.5">
          {createError && (
            <div className="p-2.5 rounded-md bg-[#FDF3F2] dark:bg-[rgba(248,113,113,0.12)] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.25)] text-[#D83B01] dark:text-[#F87171] text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Project / Repository Name"
                required
                placeholder="e.g. Core Auth Service"
                value={projName}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Project Key"
                required
                placeholder="e.g. AUTH"
                value={projKey}
                onChange={(e) => {
                  setKeyTouched(true);
                  setProjKey(e.target.value.toUpperCase());
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
              Description
            </label>
            <textarea
              rows={3}
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              placeholder="Objectives, architecture, and scope of this project..."
              className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-3 py-2 text-xs text-[#252525] dark:text-[#F2F2F2] placeholder-[#999999] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
                Status
              </label>
              <select
                value={projStatus}
                onChange={(e) => setProjStatus(e.target.value)}
                className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-2.5 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Planning">Planning</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
                Priority
              </label>
              <select
                value={projPriority}
                onChange={(e) => setProjPriority(e.target.value)}
                className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-2.5 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
                Project Lead
              </label>
              <select
                value={projLead}
                onChange={(e) => setProjLead(e.target.value)}
                className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-2.5 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id || m._id} value={m.id || m._id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Repository Name"
              placeholder="e.g. devspace/auth-service"
              value={projRepo}
              onChange={(e) => setProjRepo(e.target.value)}
            />
            <Input
              label="Tech Stack (comma separated)"
              placeholder="e.g. React, Node.js, Redis"
              value={projTech}
              onChange={(e) => setProjTech(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* EDIT PROJECT MODAL                                    */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={Boolean(editingProject)}
        onClose={() => !isUpdating && setEditingProject(null)}
        title="Edit Project Details"
        subtitle={`Update configuration for ${editingProject?.name || 'Project'}`}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setEditingProject(null)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-3.5">
          {editError && (
            <div className="p-2.5 rounded-md bg-[#FDF3F2] dark:bg-[rgba(248,113,113,0.12)] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.25)] text-[#D83B01] dark:text-[#F87171] text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Project Name"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Project Key"
                required
                value={editKey}
                onChange={(e) => setEditKey(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
              Description
            </label>
            <textarea
              rows={3}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-3 py-2 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-2.5 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Planning">Planning</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
                Priority
              </label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-2.5 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
                Project Lead
              </label>
              <select
                value={editLead}
                onChange={(e) => setEditLead(e.target.value)}
                className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-2.5 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id || m._id} value={m.id || m._id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Repository Name"
              value={editRepo}
              onChange={(e) => setEditRepo(e.target.value)}
            />
            <Input
              label="Tech Stack"
              value={editTech}
              onChange={(e) => setEditTech(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* DELETE PROJECT CONFIRMATION MODAL                     */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={Boolean(deletingProject)}
        onClose={() => !isDeleting && setDeletingProject(null)}
        title="Delete Project"
        subtitle="This action cannot be undone."
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setDeletingProject(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        }
      >
        <p className="text-xs text-[#777777] dark:text-[#A0A0A0] leading-relaxed my-0">
          Are you sure you want to permanently delete{' '}
          <strong className="text-[#252525] dark:text-[#F2F2F2] font-semibold">{deletingProject?.name}</strong>?
          All associated tasks, backlog items, and activity history will be removed.
        </p>
      </Modal>
    </div>
  );
}

export default WorkspaceProjectsPage;
