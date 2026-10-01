import React, { useState } from 'react';
import useWorkspace from '../../hooks/useWorkspace';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Save, AlertTriangle, Shield, Trash2 } from 'lucide-react';

export function WorkspaceSettingsPage() {
  const { workspace } = useWorkspace();
  const [name, setName] = useState(workspace?.name || '');
  const [description, setDescription] = useState(workspace?.description || '');
  const [visibility, setVisibility] = useState(workspace?.visibility || 'Public');

  const handleSave = (e) => {
    e.preventDefault();
    alert(`Workspace settings updated for "${name}"`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Card hoverable={false} className="space-y-6">
        <div className="pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 my-0">Workspace Configuration</h2>
          <p className="text-xs text-slate-400">Manage general metadata, visibility, and access controls</p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Workspace Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workspace Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Visibility & SSO Enforcement
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="Public">Public (Anyone in organization)</option>
              <option value="Private">Private (Members only)</option>
              <option value="Internal">Internal (Strict SSO restricted)</option>
            </select>
          </div>

          <div className="pt-2">
            <Button variant="primary" size="md" icon={Save} type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card hoverable={false} className="border-rose-500/30 bg-rose-500/5 space-y-4">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone</span>
        </div>
        <p className="text-xs text-slate-400">
          Archiving or deleting a workspace permanently removes all associated task boards, git links, and collaborator permissions.
        </p>
        <div className="flex items-center gap-3">
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => alert('Workspace delete requested.')}>
            Delete Workspace
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default WorkspaceSettingsPage;
