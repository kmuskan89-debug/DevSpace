import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  ShieldAlert,
  Clock,
  Shield,
  Check,
  X,
  Info,
  Mail,
  Copy,
  CheckCircle2,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import useWorkspace from '../../hooks/useWorkspace';
import MemberList from '../../components/workspace/MemberList';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Tabs from '../../components/common/Tabs';
import { useToast } from '../../components/common/Toast';

const ROLE_DEFINITIONS = {
  Admin: {
    title: 'Admin',
    desc: 'Full administrative access to manage workspace settings, invite/remove members, and manage projects.',
    permissions: [
      'Manage workspace settings & projects',
      'Invite teammates & revoke invites',
      'Manage member roles (except Owner)',
      'Create and assign sprint boards & issues'
    ]
  },
  Member: {
    title: 'Member',
    desc: 'Standard contributor access to create tasks, contribute to sprints, and participate in project discussions.',
    permissions: [
      'Create and update tasks & backlog issues',
      'Move task statuses on Kanban boards',
      'Post comments & participate in discussions',
      'Create and manage project views'
    ]
  },
  Viewer: {
    title: 'Viewer',
    desc: 'Read-only access to inspect project boards, backlog issues, analytics, and team activity.',
    permissions: [
      'View workspace projects & boards',
      'Inspect backlog issues & reports',
      'Read workspace activity stream',
      'View team member directory'
    ]
  }
};

const PERMISSION_MATRIX = [
  { feature: 'View Workspace Projects & Backlog', owner: true, admin: true, member: true, viewer: true },
  { feature: 'Inspect Kanban Board & Task Details', owner: true, admin: true, member: true, viewer: true },
  { feature: 'Create & Update Tasks & Issues', owner: true, admin: true, member: true, viewer: false },
  { feature: 'Transition Kanban Statuses', owner: true, admin: true, member: true, viewer: false },
  { feature: 'Post Comments on Tasks', owner: true, admin: true, member: true, viewer: false },
  { feature: 'Create & Manage Sprint Cycles', owner: true, admin: true, member: true, viewer: false },
  { feature: 'Create & Edit Projects', owner: true, admin: true, member: true, viewer: false },
  { feature: 'Invite New Collaborators', owner: true, admin: true, member: false, viewer: false },
  { feature: 'Revoke Pending Invitations', owner: true, admin: true, member: false, viewer: false },
  { feature: 'Change Member Roles (Admin/Member/Viewer)', owner: true, admin: true, member: false, viewer: false },
  { feature: 'Grant or Transfer Owner Role', owner: true, admin: false, member: false, viewer: false },
  { feature: 'Modify Workspace Settings & Name', owner: true, admin: true, member: false, viewer: false },
  { feature: 'Delete Workspace Permanently', owner: true, admin: false, member: false, viewer: false }
];

export function WorkspaceMembersPage() {
  const {
    workspace,
    members,
    invitations,
    isOwner,
    isAdmin,
    inviteMember,
    revokeInvitation,
    updateMemberRole,
    removeMember,
    isLoadingMembers
  } = useWorkspace();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');

  // Invitation Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [inviteError, setInviteError] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteSuccessData, setInviteSuccessData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Remove Member Modal
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  if (!workspace) {
    return (
      <div className="p-8 text-center text-xs font-mono text-[#777777] dark:text-[#A0A0A0]">
        Workspace not found
      </div>
    );
  }

  // Filter members
  const filteredMembers = members.filter((m) => {
    const nameStr = m.name || m.user?.name || '';
    const emailStr = m.email || m.user?.email || '';
    const matchesSearch =
      nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emailStr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRoleFilter === 'All' ||
      m.role?.toLowerCase() === selectedRoleFilter.toLowerCase() ||
      (selectedRoleFilter === 'Owner' && (m.role === 'Workspace Owner' || m.role === 'Owner'));
    return matchesSearch && matchesRole;
  });

  const totalCount = members.length;
  const adminCount = members.filter((m) => m.role === 'Admin' || m.role === 'Workspace Owner' || m.role === 'Owner').length;
  const pendingCount = invitations.filter((i) => i.status === 'Pending').length;

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setInviteError('');

    if (!inviteEmail.trim()) {
      setInviteError('Please enter a valid email address');
      return;
    }

    setIsSendingInvite(true);
    try {
      const res = await inviteMember({
        email: inviteEmail.trim(),
        role: inviteRole
      });

      addToast(`Invitation sent to ${inviteEmail}`, 'success');
      setInviteSuccessData({
        email: inviteEmail.trim(),
        role: inviteRole,
        token: res.token
      });
      setInviteEmail('');
      setInviteRole('Member');
    } catch (err) {
      setInviteError(err?.response?.data?.message || err.message || 'Failed to send invitation');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!inviteSuccessData?.token) return;
    const link = `${window.location.origin}/invite/${inviteSuccessData.token}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    addToast('Invitation link copied to clipboard', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRevokeInvitation = async (invitationId, email) => {
    try {
      await revokeInvitation(invitationId);
      addToast(`Revoked invitation for ${email}`, 'info');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to revoke invitation', 'danger');
    }
  };

  const handleChangeRole = async (memberId, newRole) => {
    const member = members.find((m) => (m.id || m._id) === memberId);
    try {
      await updateMemberRole(memberId, newRole);
      addToast(`Updated ${member?.name || 'member'}'s role to ${newRole}`, 'success');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to update member role', 'danger');
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);
    try {
      await removeMember(memberToRemove.id || memberToRemove._id);
      addToast(`Removed ${memberToRemove.name || 'member'} from workspace`, 'info');
      setMemberToRemove(null);
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to remove member', 'danger');
    } finally {
      setIsRemoving(false);
    }
  };

  const tabs = [
    { id: 'members', label: 'Collaborators', badge: totalCount },
    { id: 'invitations', label: 'Pending Invitations', badge: pendingCount },
    { id: 'matrix', label: 'Roles & Permissions' }
  ];

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E8E5] dark:border-[#353535]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[#252525] dark:text-[#F2F2F2] my-0 tracking-tight">
              Workspace Members
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]">
              {totalCount} total
            </span>
          </div>
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-0.5">
            Manage teammates, configure workspace roles, and control permission access for &ldquo;{workspace.name}&rdquo;.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            data-testid="open-invite-modal-btn"
            onClick={() => {
              setInviteSuccessData(null);
              setInviteError('');
              setIsInviteModalOpen(true);
            }}
            className="h-8 text-xs font-medium shrink-0"
          >
            Invite Member
          </Button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card hoverable={false} className="p-3.5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] flex items-center justify-center text-[#252525] dark:text-[#F2F2F2]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0]">Total Team</p>
            <p className="text-lg font-bold text-[#252525] dark:text-[#F2F2F2] my-0 leading-tight">{totalCount}</p>
          </div>
        </Card>

        <Card hoverable={false} className="p-3.5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#F4F4F7] dark:bg-[#25252A] border border-[#E5E5EB] dark:border-[rgba(165,180,252,0.25)] flex items-center justify-center text-[#4F46E5] dark:text-[#A5B4FC]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0]">Admins & Owners</p>
            <p className="text-lg font-bold text-[#252525] dark:text-[#F2F2F2] my-0 leading-tight">{adminCount}</p>
          </div>
        </Card>

        <Card hoverable={false} className="p-3.5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-8 h-8 rounded-md bg-[#FEF8ED] dark:bg-[rgba(251,191,36,0.12)] border border-[#FBE5C3] dark:border-[rgba(251,191,36,0.25)] flex items-center justify-center text-[#B26B00] dark:text-[#FBBF24]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0]">Pending Invites</p>
            <p className="text-lg font-bold text-[#252525] dark:text-[#F2F2F2] my-0 leading-tight">{pendingCount}</p>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Collaborators List */}
      {activeTab === 'members' && (
        <MemberList
          members={filteredMembers}
          onInviteClick={() => {
            setInviteSuccessData(null);
            setInviteError('');
            setIsInviteModalOpen(true);
          }}
          onChangeRole={handleChangeRole}
          onRemoveMember={(member) => setMemberToRemove(member)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedRoleFilter={selectedRoleFilter}
          setSelectedRoleFilter={setSelectedRoleFilter}
          canManageMembers={isAdmin}
          isOwner={isOwner}
          isLoading={isLoadingMembers}
        />
      )}

      {/* Tab 2: Pending Invitations */}
      {activeTab === 'invitations' && (
        <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E8E5] dark:border-[#353535]">
            <div>
              <h3 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
                Pending Invitations ({pendingCount})
              </h3>
              <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-0.5">
                Invitations expire automatically after 7 days. Once accepted, teammates gain immediate access.
              </p>
            </div>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                icon={UserPlus}
                onClick={() => {
                  setInviteSuccessData(null);
                  setInviteError('');
                  setIsInviteModalOpen(true);
                }}
              >
                New Invite
              </Button>
            )}
          </div>

          {invitations.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-[#E8E8E5] dark:border-[#353535]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F7F7F5] dark:bg-[#1A1A1A] border-b border-[#E8E8E5] dark:border-[#353535] text-[10px] font-mono uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0]">
                    <th className="py-2.5 px-3">Invitee Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Sent By</th>
                    <th className="py-2.5 px-3">Expires</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E5] dark:divide-[#303030]">
                  {invitations.map((inv) => (
                    <tr key={inv._id} className="hover:bg-[#F9F9F8] dark:hover:bg-[#242424] transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#252525] dark:text-[#F2F2F2]">
                        {inv.email}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] border border-[#E8E8E5] dark:border-[#353535]">
                          {inv.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-[#FEF8ED] dark:bg-[rgba(251,191,36,0.12)] text-[#B26B00] dark:text-[#FBBF24] border border-[#FBE5C3] dark:border-[rgba(251,191,36,0.25)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B26B00] dark:bg-[#FBBF24]" />
                          Pending
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#777777] dark:text-[#A0A0A0] font-mono text-[11px]">
                        {inv.invitedBy?.name || 'Administrator'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#777777] dark:text-[#A0A0A0]">
                        {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : '7 days'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleRevokeInvitation(inv._id, inv.email)}
                            className="text-xs text-[#D83B01] dark:text-[#F87171] hover:underline font-medium px-2 py-1 rounded hover:bg-[#FDF3F2] dark:hover:bg-[#2D1818] transition-colors cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-[#E8E8E5] dark:border-[#353535] rounded-lg space-y-2">
              <Clock className="w-7 h-7 text-[#999999] dark:text-[#666666] mx-auto" />
              <p className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">No pending invitations</p>
              <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0]">
                All invited teammates have joined the workspace or previous invitations were resolved.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Roles & Permissions Matrix */}
      {activeTab === 'matrix' && (
        <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-5">
          <div className="pb-3 border-b border-[#E8E8E5] dark:border-[#353535]">
            <h3 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
              Workspace Roles & Governance Matrix
            </h3>
            <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-0.5">
              Review specific privileges granted to Owner, Admin, Member, and Viewer accounts.
            </p>
          </div>

          {/* Role Cards Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(ROLE_DEFINITIONS).map(([key, role]) => (
              <div
                key={key}
                className="p-3.5 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FAFAF9] dark:bg-[#1A1A1A] space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#252525] dark:text-[#F2F2F2]" />
                  <span className="font-semibold text-xs text-[#252525] dark:text-[#F2F2F2]">{role.title}</span>
                </div>
                <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] leading-relaxed">
                  {role.desc}
                </p>
                <ul className="text-[10px] space-y-1 text-[#555555] dark:text-[#B0B0B0] pt-2 border-t border-[#E8E8E5] dark:border-[#303030]">
                  {role.permissions.map((p) => (
                    <li key={p} className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-[#15803D] dark:text-[#34D399] shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Detailed Matrix Table */}
          <div className="overflow-x-auto rounded-lg border border-[#E8E8E5] dark:border-[#353535]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F7F5] dark:bg-[#1A1A1A] border-b border-[#E8E8E5] dark:border-[#353535] text-[10px] font-mono uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0]">
                  <th className="py-2.5 px-3">Permission / Capability</th>
                  <th className="py-2.5 px-3 text-center">Owner</th>
                  <th className="py-2.5 px-3 text-center">Admin</th>
                  <th className="py-2.5 px-3 text-center">Member</th>
                  <th className="py-2.5 px-3 text-center">Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E5] dark:divide-[#303030]">
                {PERMISSION_MATRIX.map((row) => (
                  <tr key={row.feature} className="hover:bg-[#F9F9F8] dark:hover:bg-[#242424] transition-colors">
                    <td className="py-2.5 px-3 font-medium text-[#252525] dark:text-[#F2F2F2]">
                      {row.feature}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Check className="w-3.5 h-3.5 text-[#15803D] dark:text-[#34D399] mx-auto" />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.admin ? (
                        <Check className="w-3.5 h-3.5 text-[#15803D] dark:text-[#34D399] mx-auto" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-[#999999] dark:text-[#666666] mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.member ? (
                        <Check className="w-3.5 h-3.5 text-[#15803D] dark:text-[#34D399] mx-auto" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-[#999999] dark:text-[#666666] mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.viewer ? (
                        <Check className="w-3.5 h-3.5 text-[#15803D] dark:text-[#34D399] mx-auto" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-[#999999] dark:text-[#666666] mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInviteError('');
          setInviteSuccessData(null);
        }}
        title="Invite Teammate"
        subtitle={`Send a workspace invitation to collaborate in "${workspace.name}"`}
        footer={
          <div className="flex items-center gap-2">
            <Button
              key="invite-modal-cancel"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsInviteModalOpen(false);
                setInviteError('');
                setInviteSuccessData(null);
              }}
            >
              {inviteSuccessData ? 'Done' : 'Cancel'}
            </Button>
            {!inviteSuccessData && (
              <Button
                key="invite-modal-submit"
                variant="primary"
                size="sm"
                onClick={handleSendInvite}
                disabled={isSendingInvite}
              >
                {isSendingInvite ? 'Sending...' : 'Send Invitation'}
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          {inviteError && (
            <div className="p-3 rounded-md bg-[#FDF3F2] dark:bg-[#2D1818] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.3)] text-[#D83B01] dark:text-[#F87171] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{inviteError}</span>
            </div>
          )}

          {inviteSuccessData ? (
            <div className="space-y-3.5 p-4 rounded-lg bg-[#EDF8F1] dark:bg-[#16281E] border border-[#D3EEDB] dark:border-[rgba(52,211,153,0.25)]">
              <div className="flex items-center gap-2 text-[#15803D] dark:text-[#34D399] font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Invitation Generated Successfully</span>
              </div>
              <p className="text-xs text-[#252525] dark:text-[#D1D5DB] leading-relaxed">
                An invitation was created for <strong className="font-semibold">{inviteSuccessData.email}</strong> as{' '}
                <span className="font-mono text-[11px] font-semibold">{inviteSuccessData.role}</span>.
                You can copy the direct link below to share with them:
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  icon={copiedLink ? Check : Copy}
                  onClick={handleCopyInviteLink}
                  className="w-full justify-center h-8 text-xs font-medium"
                >
                  {copiedLink ? 'Copied Invitation Link' : 'Copy Invitation Link'}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendInvite} className="space-y-3.5">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  if (inviteError) setInviteError('');
                }}
                icon={Mail}
              />

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#252525] dark:text-[#F2F2F2]">
                  Workspace Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-3 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
                >
                  <option value="Admin">Admin (Full workspace administration)</option>
                  <option value="Member">Member (Create and update tasks & projects)</option>
                  <option value="Viewer">Viewer (Read-only access)</option>
                </select>
              </div>

              {ROLE_DEFINITIONS[inviteRole] && (
                <div className="p-3 rounded-md bg-[#FAFAF9] dark:bg-[#1A1A1A] border border-[#E8E8E5] dark:border-[#353535] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#252525] dark:text-[#F2F2F2]">
                    <Info className="w-3.5 h-3.5 text-[#777777] dark:text-[#A0A0A0]" />
                    <span>{ROLE_DEFINITIONS[inviteRole].title} Privileges</span>
                  </div>
                  <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] leading-relaxed">
                    {ROLE_DEFINITIONS[inviteRole].desc}
                  </p>
                </div>
              )}
            </form>
          )}
        </div>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        title="Remove Member"
        subtitle={`Remove ${memberToRemove?.name || 'this member'} from "${workspace.name}"?`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMemberToRemove(null)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmRemove}
              disabled={isRemoving}
            >
              {isRemoving ? 'Removing...' : 'Remove Member'}
            </Button>
          </>
        }
      >
        <div className="space-y-2 text-xs text-[#777777] dark:text-[#A0A0A0] leading-relaxed">
          <p>
            Removing <strong className="text-[#252525] dark:text-[#F2F2F2]">{memberToRemove?.name || 'this member'}</strong> ({memberToRemove?.email}) will revoke their access to this workspace and its projects immediately.
          </p>
          <p className="text-[11px]">
            Their previously authored tasks, comments, and project activity will remain intact.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default WorkspaceMembersPage;
