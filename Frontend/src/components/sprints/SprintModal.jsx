import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

export function SprintModal({
  isOpen,
  onClose,
  onSave,
  sprint = null,
  isEditing = false
}) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (sprint) {
        setName(sprint.name || '');
        setGoal(sprint.goal || '');
        setStartDate(sprint.startDate ? sprint.startDate.slice(0, 10) : '');
        setEndDate(sprint.endDate ? sprint.endDate.slice(0, 10) : '');
      } else {
        setName('');
        setGoal('');
        // Defaults: today and 2 weeks later
        const now = new Date();
        const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        setStartDate(now.toISOString().slice(0, 10));
        setEndDate(twoWeeks.toISOString().slice(0, 10));
      }
      setError('');
    }
  }, [isOpen, sprint]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Sprint name is required');
      return;
    }
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setError('Sprint name must be between 2 and 80 characters');
      return;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        setError('Sprint end date must be after start date');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: trimmedName,
        goal: goal.trim(),
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      onClose();
    } catch (err) {
      console.error('Failed to save sprint:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to save sprint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={isEditing ? 'Edit Sprint' : 'Create Planned Sprint'}
      subtitle={isEditing ? 'Update sprint schedule and goal' : 'Set up a new iteration for your project backlog'}
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Sprint'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="p-2.5 rounded-md bg-[#FDF3F2] dark:bg-[rgba(248,113,113,0.12)] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.25)] text-[#D83B01] dark:text-[#F87171] text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Sprint Name"
          required
          placeholder="e.g. Sprint 1 - MVP Architecture"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          autoFocus
        />

        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
            Sprint Goal <span className="font-normal">(Optional)</span>
          </label>
          <textarea
            rows={2}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What is the team committing to deliver in this sprint?"
            className="w-full bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] rounded-md px-3 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] placeholder-[#999999] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999999]" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] rounded-md pl-8 pr-2.5 py-1 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999999]" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] rounded-md pl-8 pr-2.5 py-1 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default SprintModal;

