import React, { useState, useEffect } from 'react';
import { Play, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export function StartSprintModal({
  isOpen,
  onClose,
  onStart,
  sprint,
  issueCount = 0,
  storyPoints = 0
}) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [goal, setGoal] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && sprint) {
      const now = new Date();
      const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      setStartDate(sprint.startDate ? sprint.startDate.slice(0, 10) : now.toISOString().slice(0, 10));
      setEndDate(sprint.endDate ? sprint.endDate.slice(0, 10) : twoWeeks.toISOString().slice(0, 10));
      setGoal(sprint.goal || '');
      setError('');
    }
  }, [isOpen, sprint]);

  if (!sprint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      await onStart(sprint._id || sprint.id, {
        startDate,
        endDate,
        goal: goal.trim()
      });
      onClose();
    } catch (err) {
      console.error('Failed to start sprint:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to start sprint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={`Start ${sprint.name}`}
      subtitle="Activate this sprint and start tracking live velocity and completion."
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" icon={Play} onClick={handleSubmit} isLoading={isSubmitting}>
            Start Sprint
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

        {/* Commitment Summary */}
        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#F7F7F5] dark:bg-[#242424] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#777777] dark:text-[#A0A0A0]" />
            <span className="text-[#252525] dark:text-[#F2F2F2] font-medium">Initial Commitment</span>
          </div>
          <div className="font-mono text-[#777777] dark:text-[#A0A0A0]">
            <strong className="text-[#252525] dark:text-[#F2F2F2]">{issueCount}</strong> issues · <strong className="text-[#252525] dark:text-[#F2F2F2]">{storyPoints}</strong> story points
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
            Sprint Goal
          </label>
          <textarea
            rows={2}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Key objective for this sprint..."
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

export default StartSprintModal;

