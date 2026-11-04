import React, { useState } from 'react';
import { Lock, Users, Sparkles, Check } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

export function SaveViewModal({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  initialDescription = '',
  initialVisibility = 'Private',
  isEditing = false
}) {
  const [name, setName] = useState(initialName || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [visibility, setVisibility] = useState(initialVisibility || 'Private');
  const [nameError, setNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName(initialName || '');
      setDescription(initialDescription || '');
      setVisibility(initialVisibility || 'Private');
      setNameError('');
    }
  }, [isOpen, initialName, initialDescription, initialVisibility]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('View name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        visibility
      });
      onClose();
    } catch (err) {
      console.error('Failed to save view:', err);
      setNameError(err.response?.data?.message || err.message || 'Failed to save view');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Saved View' : 'Save Filter View'}
      subtitle="Save your active search, filters, and sort options for 1-click access."
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            icon={Sparkles}
          >
            {isEditing ? 'Save Changes' : 'Save View'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <Input
            label="View Name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            placeholder="e.g. High Priority Bugs, My Sprint Tasks"
            error={nameError}
            autoFocus
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
            Description <span className="font-normal">(Optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Brief summary of what this view filters..."
            className="w-full bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] rounded-md p-2 text-xs text-[#252525] dark:text-[#F2F2F2] placeholder-[#999999] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
            Visibility &amp; Sharing
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setVisibility('Private')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                visibility === 'Private'
                  ? 'border-[#252525] dark:border-[#F2F2F2] bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2]'
                  : 'border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] text-[#777777] dark:text-[#A0A0A0] hover:bg-[#F9F9F8] dark:hover:bg-[#262626]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Private</span>
                </div>
                {visibility === 'Private' && <Check className="w-3.5 h-3.5" />}
              </div>
              <p className="text-[10px] leading-relaxed my-0 opacity-80">
                Only visible to you across workspace sessions.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setVisibility('Shared')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                visibility === 'Shared'
                  ? 'border-[#252525] dark:border-[#F2F2F2] bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2]'
                  : 'border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] text-[#777777] dark:text-[#A0A0A0] hover:bg-[#F9F9F8] dark:hover:bg-[#262626]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <Users className="w-3.5 h-3.5" />
                  <span>Shared</span>
                </div>
                {visibility === 'Shared' && <Check className="w-3.5 h-3.5" />}
              </div>
              <p className="text-[10px] leading-relaxed my-0 opacity-80">
                Visible to all members of this workspace.
              </p>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default SaveViewModal;
