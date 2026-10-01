import React from 'react';
import { UserPlus, Shield, GitCommit, GitPullRequest, MoreVertical, Mail } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Card from '../common/Card';

export function MemberList({ members = [], onInviteClick }) {
  return (
    <Card hoverable={false} className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100">Team Collaborators</h3>
          <p className="text-xs text-slate-400">Manage member permissions and roles for this workspace</p>
        </div>
        <Button variant="primary" size="sm" icon={UserPlus} onClick={onInviteClick}>
          Invite Member
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-500">
              <th className="py-2.5 px-3">Member</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Commits</th>
              <th className="py-2.5 px-3">PRs Merged</th>
              <th className="py-2.5 px-3">Joined</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={member.avatar} name={member.name} size="sm" />
                    <div>
                      <p className="font-bold text-slate-200">{member.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[11px]">
                    <Shield className="w-3 h-3 text-indigo-400" />
                    <span>{member.role}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <Badge status={member.status === 'Active' ? 'Active' : 'Pending'} size="sm" />
                </td>
                <td className="py-3 px-3 font-mono text-slate-300">
                  <div className="flex items-center gap-1">
                    <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{member.commits}</span>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-slate-300">
                  <div className="flex items-center gap-1">
                    <GitPullRequest className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{member.prMerged}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{member.joinedDate}</td>
                <td className="py-3 px-3 text-right">
                  <button type="button" className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default MemberList;
