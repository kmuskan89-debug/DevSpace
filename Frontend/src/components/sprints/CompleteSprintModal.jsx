import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ArrowRight, Layers } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export function CompleteSprintModal({
  isOpen,
  onClose,
  onComplete,
  sprint,
  completedIssues = 0,
  openIssues = 0,
  plannedSprints = []
}) {
  const [moveTo, setMoveTo] = useState('backlog'); // 'backlog' | 'sprint'
  const [targetSprintId, setTargetSprintId] = useState(plannedSprints[0]?._id || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!sprint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setIsSubmitting(true);
    try {
      await onComplete(sprint._id || sprint.id, {
        moveTo,
        targetSprintId: moveTo === 'sprint' ? targetSprintId : undefined
      });
      onClose();
    } catch (err) {
      console.error('Failed to complete sprint:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to complete sprint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={`Complete ${sprint.name}`}
      subtitle="Finalize this sprint iteration and transition unfinished issues."
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" icon={CheckCircle2} onClick={handleSubmit} isLoading={isSubmitting}>
            Complete Sprint
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-md bg-[#FDF3F2] dark:bg-[rgba(248,113,113,0.12)] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.25)] text-[#D83B01] dark:text-[#F87171] text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats summary */}
        <div className="p-3 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#F7F7F5] dark:bg-[#242424] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#777777] dark:text-[#A0A0A0]">Completed issues</span>
            <span className="font-semibold text-[#252525] dark:text-[#F2F2F2] font-mono">{completedIssues} issues</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#777777] dark:text-[#A0A0A0]">Incomplete / Open issues</span>
            <span className="font-semibold text-[#252525] dark:text-[#F2F2F2] font-mono">{openIssues} issues</span>
          </div>
        </div>

        {/* Destination for unfinished issues */}
        {openIssues > 0 && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
              Where should the {openIssues} incomplete issues go?
            </label>

            <div className="space-y-2">
              <label
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  moveTo === 'backlog'
                    ? 'border-[#252525] dark:border-[#F2F2F2] bg-[#F1F1EF] dark:bg-[#2A2A2A]'
                    : 'border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020]'
                }`}
              >
                <input
                  type="radio"
                  name="moveTo"
                  value="backlog"
                  checked={moveTo === 'backlog'}
                  onChange={() => setMoveTo('backlog')}
                  className="mt-0.5"
                />
                <div className="text-xs">
                  <div className="font-semibold text-[#252525] dark:text-[#F2F2F2]">Move to Backlog</div>
                  <div className="text-[11px] text-[#777777] dark:text-[#A0A0A0]">
                    Issues return to the uncommitted project backlog.
                  </div>
                </div>
              </label>

              {plannedSprints.length > 0 && (
                <label
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    moveTo === 'sprint'
                      ? 'border-[#252525] dark:border-[#F2F2F2] bg-[#F1F1EF] dark:bg-[#2A2A2A]'
                      : 'border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020]'
                  }`}
                >
                  <input
                    type="radio"
                    name="moveTo"
                    value="sprint"
                    checked={moveTo === 'sprint'}
                    onChange={() => setMoveTo('sprint')}
                    className="mt-0.5"
                  />
                  <div className="text-xs flex-1">
                    <div className="font-semibold text-[#252525] dark:text-[#F2F2F2]">Move to Planned Sprint</div>
                    <div className="text-[11px] text-[#777777] dark:text-[#A0A0A0] mb-2">
                      Carry over issues directly into an upcoming planned sprint.
                    </div>

                    {moveTo === 'sprint' && (
                      <select
                        value={targetSprintId}
                        onChange={(e) => setTargetSprintId(e.target.value)}
                        className="w-full bg-[#FFFFFF] dark:bg-[#202020] border border-[#E8E8E5] dark:border-[#353535] rounded-md px-2.5 py-1 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none"
                      >
                        {plannedSprints.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>
              )}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

export default CompleteSprintModal;

