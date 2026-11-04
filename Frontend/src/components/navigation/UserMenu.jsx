import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Bell, LogOut, Shield } from 'lucide-react';
import Dropdown, { DropdownItem } from '../common/Dropdown';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';

export function UserMenu() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();

  const user = {
    name: authUser?.name || 'Developer',
    email: authUser?.email || '',
    avatar: authUser?.avatar || '',
    role: authUser?.role || 'Developer'
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Dropdown
      align="right"
      width="w-60"
      trigger={
        <button
          type="button"
          className="flex items-center gap-2 p-1 rounded-md hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
        >
          <Avatar src={user.avatar} name={user.name} size="sm" status="online" />
          <span className="hidden sm:inline-block text-xs font-medium text-[#252525] dark:text-[#F2F2F2]">
            {user.name}
          </span>
        </button>
      }
    >
      <div className="px-3 py-2 border-b border-[#E8E8E5] dark:border-[#353535]">
        <p className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2]">{user.name}</p>
        <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] truncate">{user.email}</p>
        <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535]">
          <Shield className="w-2.5 h-2.5" />
          <span>{user.role}</span>
        </div>
      </div>

      <div className="py-1 border-b border-[#E8E8E5] dark:border-[#353535]">
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
        <DropdownItem icon={LogOut} danger onClick={handleLogout}>
          Sign Out
        </DropdownItem>
      </div>
    </Dropdown>
  );
}

export default UserMenu;
