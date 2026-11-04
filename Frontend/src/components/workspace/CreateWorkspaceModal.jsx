import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
  Check,
  Globe,
  Lock,
  Building
} from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useWorkspaceContext } from '../../context/WorkspaceContext';
import { useToast } from '../common/Toast';

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

const COLOR_OPTIONS = [
  { name: 'Indigo Gradient', value: 'from-indigo-500 to-purple-600' },
  { name: 'Cyan Gradient', value: 'from-cyan-500 to-blue-600' },
  { name: 'Emerald Gradient', value: 'from-emerald-500 to-teal-600' },
  { name: 'Amber Gradient', value: 'from-amber-500 to-rose-600' },
  { name: 'Violet Gradient', value: 'from-purple-500 to-pink-600' }
];

export function CreateWorkspaceModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { createWorkspace } = useWorkspaceContext();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Layers');
  const [selectedColor, setSelectedColor] = useState('from-indigo-500 to-purple-600');
  const [visibility, setVisibility] = useState('Public');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }

    if (name.trim().length < 3) {
      setError('Workspace name must be at least 3 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createWorkspace({
        name: name.trim(),
        description: description.trim(),
        icon: selectedIcon,
        color: selectedColor,
        visibility
      });

      addToast(`Workspace "${created.name}" created successfully!`, 'success');
      
      // Reset form
      setName('');
      setDescription('');
      setSelectedIcon('Layers');
      setSelectedColor('from-indigo-500 to-purple-600');
      setVisibility('Public');
      setIsSubmitting(false);

      onClose();
      navigate(`/workspace/${created.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create workspace');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Workspace"
      subtitle="Organize repositories, assign team permissions, and manage sprint pipelines"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Workspace'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Name input */}
        <Input
          label="Workspace Name"
          required
          placeholder="e.g. Mobile Cloud Platform"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          error={error && !name.trim() ? error : ''}
        />

        {/* Description input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key goal, microservices, and primary tech stack for this workspace..."
            className="w-full rounded-lg bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Icon picker */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace Icon
          </label>
          <div className="grid grid-cols-5 gap-2">
            {ICON_OPTIONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = selectedIcon === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedIcon(item.name)}
                  className={`p-2.5 rounded-lg flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span className="text-[10px] font-mono">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color theme theme selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Card Accent Color
          </label>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setSelectedColor(c.value)}
                className={`w-8 h-8 rounded-full bg-gradient-to-tr ${c.value} p-0.5 border-2 transition-transform cursor-pointer shrink-0 ${
                  selectedColor === c.value ? 'scale-110 border-white shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Visibility & Access
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Public', label: 'Public', desc: 'Organization wide', icon: Globe },
              { id: 'Private', label: 'Private', desc: 'Invited members', icon: Lock },
              { id: 'Internal', label: 'Internal', desc: 'SSO restricted', icon: Building }
            ].map((vis) => {
              const VisIcon = vis.icon;
              const active = visibility === vis.id;
              return (
                <button
                  key={vis.id}
                  type="button"
                  onClick={() => setVisibility(vis.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-indigo-600/20 border-indigo-500 text-slate-100'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <VisIcon className={`w-3.5 h-3.5 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {active && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <p className="text-xs font-bold">{vis.label}</p>
                  <p className="text-[10px] text-slate-500">{vis.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default CreateWorkspaceModal;
