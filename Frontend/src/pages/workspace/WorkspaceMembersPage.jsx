import React, { useState } from 'react';
import useWorkspace from '../../hooks/useWorkspace';
import MemberList from '../../components/workspace/MemberList';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export function WorkspaceMembersPage() {
  const { workspace, members: initialMembers } = useWorkspace();
  const [members, setMembers] = useState(initialMembers);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Contributor');

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember = {
      id: `mem-${Date.now().toString().slice(-4)}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'Invited',
      avatar: '',
      commits: 0,
      prMerged: 0,
      joinedDate: 'Pending invitation'
    };

    setMembers([...members, newMember]);
    setIsInviteModalOpen(false);
    setInviteEmail('');
  };

  return (
    <div className="space-y-6">
      <MemberList members={members} onInviteClick={() => setIsInviteModalOpen(true)} />

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
        subtitle={`Send an email invitation to join workspace "${workspace.name}"`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSendInvite}>
              Send Invitation
            </Button>
          </>
        }
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="colleague@devspace.io"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workspace Role & Permissions
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="Admin">Admin (Full write & billing access)</option>
              <option value="Maintainer">Maintainer (Manage repos & sprints)</option>
              <option value="Contributor">Contributor (Create PRs & issues)</option>
              <option value="Guest">Guest (Read-only access)</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default WorkspaceMembersPage;
