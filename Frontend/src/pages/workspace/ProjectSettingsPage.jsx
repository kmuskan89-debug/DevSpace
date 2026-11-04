import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  AlertTriangle,
  Trash2,
  Loader2,
  ArrowLeft,
  GitBranch,
  Tag,
  Info
} from 'lucide-react';
import useProject from '../../hooks/useProject';
import useWorkspace from '../../hooks/useWorkspace';
import ProjectHeader from '../../components/projects/ProjectHeader';
import ProjectNavTabs from '../../components/projects/ProjectNavTabs';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';

export function ProjectSettingsPage() {
  const navigate = useNavigate();
  const { workspaceId, projectId } = useParams();
  const { addToast } = useToast();
  const { project, isLoading, updateProject, deleteProject } = useProject(projectId);
  const { workspace, members, isAdmin, isOwner } = useWorkspace(workspaceId || project?.workspaceId);

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [priority, setPriority] = useState('Medium');
  const [githubRepo, setGithubRepo] = useState('');
  const [techStack, setTechStack] = useState('');
  const [leadId, setLeadId] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setKey(project.key || '');
      setDescription(project.description || '');
      setStatus(project.status || 'Active');
      setPriority(project.priority || 'Medium');
      setGithubRepo(project.githubRepo || '');
      setTechStack(Array.isArray(project.techStack) ? project.techStack.join(', ') : (project.techStack || ''));
      setLeadId(project.lead?._id || project.lead?.id || project.lead || '');
    }
  }, [project]);

  if (isLoading && !project) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-6 h-6 text-[#777777] dark:text-[#A0A0A0] animate-spin" />
        <p className="text-xs font-mono text-[#777777] dark:text-[#A0A0A0]">
          Loading project settings...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] text-center max-w-md mx-auto space-y-4 mt-8">
        <h3 className="text-base font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
          Project Not Found
        </h3>
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }
    if (!key.trim()) {
      setError('Project key is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim(),
        status,
        priority,
        githubRepo: githubRepo.trim(),
        techStack: techStack.split(',').map((t) => t.trim()).filter(Boolean),
        lead: leadId || undefined
      };

      await updateProject(payload);
      addToast(`Project settings for "${name.trim()}" updated successfully!`, 'success');
    } catch (err) {
      console.error('Failed to update project settings:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update project settings');
      addToast(err.response?.data?.message || 'Failed to update project settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText.trim().toLowerCase() !== project.name.toLowerCase()) {
      addToast('Project name confirmation does not match.', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProject();
      setIsDeleteModalOpen(false);
      addToast(`Project "${project.name}" and associated tasks deleted.`, 'info');
      navigate(`/workspace/${workspaceId || project.workspaceId}/projects`);
    } catch (err) {
      console.error('Failed to delete project:', err);
      addToast(err.response?.data?.message || err.message || 'Failed to delete project', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = isAdmin || isOwner;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* 1. Project Header */}
      <ProjectHeader project={project} />

      {/* 2. Project Nav Tabs */}
      <ProjectNavTabs />

      {/* 3. Configuration Form */}
      <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-5">
        <div className="pb-3 border-b border-[#E8E8E5] dark:border-[#353535] flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
              Project Configuration
            </h1>
            <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-0.5">
              Manage key identification, description, repository links, and governance for &ldquo;{project.name}&rdquo;.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]">
            Key: {project.key}
          </span>
        </div>

        {!canEdit && (
          <div className="p-3 rounded-md bg-[#F7F7F5] dark:bg-[#1A1A1A] border border-[#E8E8E5] dark:border-[#353535] flex items-center gap-2 text-xs text-[#777777] dark:text-[#A0A0A0]">
            <Info className="w-4 h-4 shrink-0" />
            <span>You have read-only access. Only workspace administrators and owners can modify project settings.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-[#FDF3F2] dark:bg-[#2D1818] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.3)] text-[#D83B01] dark:text-[#F87171] text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Core Platform API"
                required
                disabled={!canEdit}
              />
            </div>
            <div>
              <Input
                label="Project Key"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                placeholder="CORE"
                maxLength={10}
                required
                disabled={!canEdit}
                helperText="Monospace issue prefix"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#252525] dark:text-[#F2F2F2]">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Primary purpose and architecture of this project..."
              className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-3 py-2 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
              disabled={!canEdit}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#252525] dark:text-[#F2F2F2]">
                Lifecycle Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-3 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
                disabled={!canEdit}
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#252525] dark:text-[#F2F2F2]">
                Project Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-3 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
                disabled={!canEdit}
              >
                <option value="Highest">Highest</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Lowest">Lowest</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#252525] dark:text-[#F2F2F2]">
                Project Lead
              </label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-3 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
                disabled={!canEdit}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id || m._id} value={m.id || m._id}>
                    {m.name || m.user?.name || 'Member'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="GitHub Repository (org/repo)"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="e.g. facebook/react"
              icon={GitBranch}
              disabled={!canEdit}
            />

            <Input
              label="Tech Stack (comma separated)"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="e.g. React 19, Vite, Tailwind CSS"
              icon={Tag}
              disabled={!canEdit}
            />
          </div>

          {canEdit && (
            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                icon={Save}
                type="submit"
                disabled={isSaving}
                className="h-8 text-xs font-medium"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* 4. Danger Zone */}
      {canEdit && (
        <Card hoverable={false} className="p-4 sm:p-5 border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.3)] bg-[#FDF3F2] dark:bg-[#231717] space-y-3">
          <div className="flex items-center gap-2 text-[#D83B01] dark:text-[#F87171] font-semibold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Danger Zone</span>
          </div>
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0] leading-relaxed my-0">
            Deleting a project permanently cascade-deletes all associated issues, sprints, task comments, and saved views. This action cannot be reversed.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-[#F9D5D3] dark:border-[rgba(248,113,113,0.2)]">
            <div>
              <p className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
                Delete this project
              </p>
              <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] mt-0.5">
                Permanently purge {project.key} from workspace
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => setIsDeleteModalOpen(true)}
              className="h-8 text-xs font-medium"
            >
              Delete Project
            </Button>
          </div>
        </Card>
      )}

      {/* 5. Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project"
        subtitle={`Permanently remove "${project.name}" (${project.key})`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isDeleting || deleteConfirmText.trim().toLowerCase() !== project.name.toLowerCase()}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-md bg-[#FDF3F2] dark:bg-[#2D1818] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.3)] text-[#D83B01] dark:text-[#F87171] leading-relaxed">
            <p className="font-semibold mb-1">Warning: All tasks and sprint data will be lost!</p>
            Type <strong className="font-mono underline">{project.name}</strong> to confirm deletion.
          </div>

          <Input
            label={`Type "${project.name}" to confirm`}
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={project.name}
          />
        </div>
      </Modal>
    </div>
  );
}

export default ProjectSettingsPage;

