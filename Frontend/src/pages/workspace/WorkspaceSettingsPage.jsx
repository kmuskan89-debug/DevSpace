import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  AlertTriangle,
  Trash2,
  Layers,
  Cpu,
  Smartphone,
  Palette,
  Terminal,
  Code,
  Server,
  Shield,
  Zap,
  Database,
  ArrowRight
} from 'lucide-react';
import useWorkspace from '../../hooks/useWorkspace';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Tabs from '../../components/common/Tabs';
import { useToast } from '../../components/common/Toast';

const ICON_OPTIONS = [
  { name: 'Layers', icon: Layers },
  { name: 'Cpu', icon: Cpu },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Palette', icon: Palette },
  { name: 'Terminal', icon: Terminal },
  { name: 'Code', icon: Code },
  { name: 'Server', icon: Server },
  { name: 'Shield', icon: Shield },
  { name: 'Zap', icon: Zap },
  { name: 'Database', icon: Database }
];

export function WorkspaceSettingsPage() {
  const navigate = useNavigate();
  const { workspace, members, updateWorkspace, deleteWorkspace, isOwner, isAdmin } = useWorkspace();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('general');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Layers');
  const [visibility, setVisibility] = useState('Public');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name || '');
      setDescription(workspace.description || '');
      setIcon(workspace.icon || 'Layers');
      setVisibility(workspace.visibility || 'Public');
    }
  }, [workspace?.id, workspace?.name, workspace?.description, workspace?.icon, workspace?.visibility]);

  if (!workspace) {
    return (
      <div className="p-8 text-center text-xs font-mono text-[#777777] dark:text-[#A0A0A0]">
        Workspace not found.
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }

    setIsSaving(true);
    try {
      await updateWorkspace(workspace.id, {
        name: name.trim(),
        description: description.trim(),
        icon,
        visibility
      });

      addToast(`Workspace settings updated successfully!`, 'success');
    } catch (err) {
      setError(err.message || 'Failed to update workspace');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText.trim().toLowerCase() !== workspace.name.toLowerCase()) {
      addToast('Workspace name confirmation does not match.', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteWorkspace(workspace.id);
      setIsDeleteModalOpen(false);
      addToast(`Workspace "${workspace.name}" deleted.`, 'info');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Failed to delete workspace.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'access', label: 'Members & Access', badge: members.length },
    { id: 'danger', label: 'Danger Zone' }
  ];

  const adminCount = members.filter((m) => m.role === 'Admin' || m.role === 'Owner' || m.role === 'Workspace Owner').length;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="pb-3 border-b border-[#E8E8E5] dark:border-[#353535] flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#252525] dark:text-[#F2F2F2] my-0 tracking-tight">
            Workspace Configuration
          </h1>
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-0.5">
            Manage identity, visibility, icons, and governance for &ldquo;{workspace.name}&rdquo;.
          </p>
        </div>
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]">
          ID: {workspace.id}
        </span>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab: General */}
      {activeTab === 'general' && (
        <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-4">
          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-[#FDF3F2] dark:bg-[#2D1818] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.3)] text-[#D83B01] dark:text-[#F87171] text-xs font-medium">
                {error}
              </div>
            )}

            <Input
              label="Workspace Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Engineering Workspace"
              required
              disabled={!isAdmin}
            />

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#252525] dark:text-[#F2F2F2]">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Primary purpose of this workspace..."
                className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-3 py-2 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
                disabled={!isAdmin}
              />
            </div>

            {/* Change Icon */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#252525] dark:text-[#F2F2F2]">
                Workspace Icon
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {ICON_OPTIONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = icon === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      disabled={!isAdmin}
                      onClick={() => setIcon(item.name)}
                      className={`p-2 rounded-md flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#252525] dark:bg-[#F2F2F2] border-[#252525] dark:border-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919]'
                          : 'bg-[#F7F7F5] dark:bg-[#252525] border border-[#E8E8E5] dark:border-[#353535] text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                      <span className="text-[9px] font-mono hidden sm:inline">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#252525] dark:text-[#F2F2F2]">
                Access & Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                disabled={!isAdmin}
                className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-3 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
              >
                <option value="Public">Public (Anyone in workspace)</option>
                <option value="Private">Private (Members only)</option>
                <option value="Internal">Internal (Strict team restricted)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              {isAdmin ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Save}
                  type="submit"
                  disabled={isSaving}
                  className="h-8 text-xs font-medium"
                >
                  {isSaving ? 'Saving...' : 'Save Workspace Settings'}
                </Button>
              ) : (
                <p className="text-xs text-[#777777] dark:text-[#A0A0A0] font-mono">
                  Only Workspace Administrators and Owners can modify workspace configuration.
                </p>
              )}
            </div>
          </form>
        </Card>
      )}

      {/* Tab: Access & Members */}
      {activeTab === 'access' && (
        <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E5] dark:border-[#353535]">
            <div>
              <h2 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
                Team Access &amp; Permissions Overview
              </h2>
              <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-0.5">
                {members.length} active collaborators ({adminCount} admins/owners)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowRight}
              onClick={() => navigate(`/workspace/${workspace.id}/members`)}
              className="h-8 text-xs font-medium"
            >
              Open Members Directory
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FAFAF9] dark:bg-[#1A1A1A] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#777777] dark:text-[#A0A0A0]">Total Team</span>
              <p className="text-base font-bold text-[#252525] dark:text-[#F2F2F2] my-0">{members.length} Members</p>
            </div>
            <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FAFAF9] dark:bg-[#1A1A1A] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#777777] dark:text-[#A0A0A0]">Admins</span>
              <p className="text-base font-bold text-[#252525] dark:text-[#F2F2F2] my-0">{adminCount} Admins</p>
            </div>
            <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FAFAF9] dark:bg-[#1A1A1A] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#777777] dark:text-[#A0A0A0]">Governance</span>
              <p className="text-base font-bold text-[#252525] dark:text-[#F2F2F2] my-0">Role-Based (RBAC)</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Danger Zone */}
      {activeTab === 'danger' && (
        <Card hoverable={false} className="p-4 sm:p-5 border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.3)] bg-[#FDF3F2] dark:bg-[#231717] space-y-3">
          <div className="flex items-center gap-2 text-[#D83B01] dark:text-[#F87171] font-semibold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Danger Zone</span>
          </div>
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0] leading-relaxed my-0">
            Deleting a workspace permanently removes all projects, tasks, sprints, member associations, and activity records.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-[#F9D5D3] dark:border-[rgba(248,113,113,0.2)]">
            <div>
              <p className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">Delete this workspace</p>
              <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] mt-0.5">
                {isOwner ? 'Once deleted, this workspace cannot be restored.' : 'Only the workspace Owner can delete this workspace.'}
              </p>
            </div>
            {isOwner && (
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setIsDeleteModalOpen(true)}
                className="h-8 text-xs font-medium"
              >
                Delete Workspace
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Workspace"
        subtitle={`Permanently remove "${workspace.name}"`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isDeleting || deleteConfirmText.trim().toLowerCase() !== workspace.name.toLowerCase()}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-md bg-[#FDF3F2] dark:bg-[#2D1818] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.3)] text-[#D83B01] dark:text-[#F87171] leading-relaxed">
            <p className="font-semibold mb-1">Warning: This action cannot be undone!</p>
            Type <strong className="font-mono underline">{workspace.name}</strong> to confirm.
          </div>

          <Input
            label={`Type "${workspace.name}" to confirm`}
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={workspace.name}
          />
        </div>
      </Modal>
    </div>
  );
}

export default WorkspaceSettingsPage;
