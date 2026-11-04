import React from 'react';
import {
  Shield,
  Search,
  Filter,
  Trash2,
  ChevronDown,
  XCircle,
  UserX,
  Crown
} from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Card from '../common/Card';
import Dropdown, { DropdownItem } from '../common/Dropdown';
import { useAuth } from '../../context/AuthContext';

const ALL_ROLES = ['Owner', 'Admin', 'Member', 'Viewer'];

export function MemberList({
  members = [],
  onInviteClick,
  onChangeRole,
  onRemoveMember,
  searchQuery,
  setSearchQuery,
  selectedRoleFilter,
  setSelectedRoleFilter,
  canManageMembers = false,
  isOwner = false,
  isLoading = false
}) {
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?._id || currentUser?.id;

  // Roles an admin can assign vs owner
  const assignableRoles = isOwner
    ? ['Owner', 'Admin', 'Member', 'Viewer']
    : ['Admin', 'Member', 'Viewer'];

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Owner':
      case 'Workspace Owner':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#FEF8ED] dark:bg-[rgba(251,191,36,0.12)] text-[#B26B00] dark:text-[#FBBF24] border border-[#FBE5C3] dark:border-[rgba(251,191,36,0.25)]">
            <Crown className="w-3 h-3 text-[#B26B00] dark:text-[#FBBF24]" />
            Owner
          </span>
        );
      case 'Admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F4F4F7] dark:bg-[#25252A] text-[#4F46E5] dark:text-[#A5B4FC] border border-[#E5E5EB] dark:border-[rgba(165,180,252,0.25)]">
            <Shield className="w-3 h-3 text-[#4F46E5] dark:text-[#A5B4FC]" />
            Admin
          </span>
        );
      case 'Member':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] border border-[#E8E8E5] dark:border-[#353535]">
            Member
          </span>
        );
      case 'Viewer':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F7F7F5] dark:bg-[#202020] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]">
            Viewer
          </span>
        );
    }
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return 'Recently';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999999] dark:text-[#666666]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name or email..."
            className="w-full bg-[#F7F7F5] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#353535] rounded-md pl-8 pr-8 py-1.5 text-xs text-[#252525] dark:text-[#F2F2F2] placeholder-[#999999] dark:placeholder-[#666666] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#252525] dark:hover:text-[#F2F2F2] cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-mono uppercase text-[#777777] dark:text-[#A0A0A0] flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3 h-3" /> Role:
          </span>
          {['All', 'Owner', 'Admin', 'Member', 'Viewer'].map((roleOption) => (
            <button
              key={roleOption}
              type="button"
              onClick={() => setSelectedRoleFilter(roleOption)}
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedRoleFilter === roleOption
                  ? 'bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] font-semibold'
                  : 'bg-[#F7F7F5] dark:bg-[#252525] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
              }`}
            >
              {roleOption}
            </button>
          ))}
        </div>
      </div>

      {/* Member Table */}
      {members.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-[#E8E8E5] dark:border-[#353535]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F7F7F5] dark:bg-[#1A1A1A] border-b border-[#E8E8E5] dark:border-[#353535] text-[10px] font-mono uppercase tracking-wider text-[#777777] dark:text-[#A0A0A0]">
                <th className="py-2.5 px-3">Collaborator</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Joined Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E5] dark:divide-[#303030]">
              {members.map((member) => {
                const memberId = member.id || member._id;
                const memberIsOwner = member.role === 'Workspace Owner' || member.role === 'Owner';
                const isSelf = memberId === currentUserId || member.email === currentUser?.email;
                const canChangeThisMember =
                  canManageMembers &&
                  !isSelf &&
                  (isOwner || !memberIsOwner);

                return (
                  <tr
                    key={memberId}
                    className="hover:bg-[#F9F9F8] dark:hover:bg-[#242424] transition-colors group"
                  >
                    {/* Collaborator */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={member.avatar || member.user?.avatar}
                          name={member.name || member.user?.name}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#252525] dark:text-[#F2F2F2] truncate">
                              {member.name || member.user?.name || 'Member'}
                            </span>
                            {isSelf && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#777777] dark:text-[#A0A0A0] font-mono truncate block">
                            {member.email || member.user?.email || '—'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role Dropdown / Badge */}
                    <td className="py-2.5 px-3">
                      {canChangeThisMember ? (
                        <Dropdown
                          align="left"
                          width="w-36"
                          trigger={
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-[#F7F7F5] dark:bg-[#252525] hover:bg-[#EFEFEA] dark:hover:bg-[#303030] border border-[#E8E8E5] dark:border-[#353535] text-[#252525] dark:text-[#F2F2F2] transition-colors cursor-pointer"
                            >
                              <span>{member.role}</span>
                              <ChevronDown className="w-3 h-3 text-[#777777] dark:text-[#A0A0A0]" />
                            </button>
                          }
                        >
                          <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-[#777777] dark:text-[#A0A0A0] border-b border-[#E8E8E5] dark:border-[#353535]">
                            Change Role
                          </div>
                          <div className="py-0.5">
                            {assignableRoles.map((r) => (
                              <DropdownItem
                                key={r}
                                onClick={() => onChangeRole(memberId, r)}
                                className={member.role === r ? 'font-semibold text-[#252525] dark:text-[#F2F2F2] bg-[#F1F1EF] dark:bg-[#2A2A2A]' : ''}
                              >
                                {r}
                              </DropdownItem>
                            ))}
                          </div>
                        </Dropdown>
                      ) : (
                        getRoleBadge(member.role)
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#777777] dark:text-[#A0A0A0]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] dark:bg-[#34D399]" />
                        Active
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#777777] dark:text-[#A0A0A0]">
                      {formatDate(member.joinedAt || member.joinedDate)}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right">
                      {canChangeThisMember && (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(member)}
                          className="p-1 rounded text-[#999999] hover:text-[#D83B01] dark:hover:text-[#F87171] hover:bg-[#FDF3F2] dark:hover:bg-[#2D1818] transition-colors cursor-pointer"
                          title="Remove from Workspace"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 border border-dashed border-[#E8E8E5] dark:border-[#353535] rounded-lg space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#F7F7F5] dark:bg-[#252525] border border-[#E8E8E5] dark:border-[#353535] flex items-center justify-center mx-auto text-[#777777] dark:text-[#A0A0A0]">
            <UserX className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">No members found</h4>
            <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] max-w-sm mx-auto">
              {searchQuery || selectedRoleFilter !== 'All'
                ? `No collaborators match query "${searchQuery}" with role "${selectedRoleFilter}".`
                : 'This workspace has no additional team members yet.'}
            </p>
          </div>
          {(searchQuery || selectedRoleFilter !== 'All') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedRoleFilter('All');
              }}
            >
              Reset Search & Filters
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

export default MemberList;
