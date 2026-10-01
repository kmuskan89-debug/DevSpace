import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Bell, LogOut, Code, Shield } from 'lucide-react';
import Dropdown, { DropdownItem } from '../common/Dropdown';
import Avatar from '../common/Avatar';
import { INITIAL_USER } from '../../utils/constants';

export function UserMenu() {
  const navigate = useNavigate();
  const user = INITIAL_USER;

  return (
    <Dropdown
      align="right"
      width="w-64"
      trigger={
        <button type="button" className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-800/80 transition-colors cursor-pointer">
          <Avatar src={user.avatar} name={user.name} size="sm" status="online" />
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-200">{user.name}</span>
        </button>
      }
    >
      <div className="px-3 py-2.5 border-b border-slate-800">
        <p className="text-xs font-bold text-slate-100">{user.name}</p>
        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-mono border border-indigo-500/20">
          <Shield className="w-3 h-3" />
          <span>{user.role}</span>
        </div>
      </div>

      <div className="py-1 border-b border-slate-800">
        <DropdownItem icon={User} onClick={() => navigate('/settings')}>
          User Profile
        </DropdownItem>
        <DropdownItem icon={Bell} onClick={() => navigate('/notifications')}>
          Notifications & Alerts
        </DropdownItem>
        <DropdownItem icon={Settings} onClick={() => navigate('/settings')}>
          Account Settings
        </DropdownItem>
      </div>

      <div className="py-1">
        <DropdownItem icon={LogOut} danger onClick={() => navigate('/login')}>
          Sign Out
        </DropdownItem>
      </div>
    </Dropdown>
  );
}

export default UserMenu;
