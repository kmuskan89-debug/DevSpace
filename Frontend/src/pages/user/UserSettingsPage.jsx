import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  GitBranch,
  Save,
  Shield,
  Bell,
  Moon,
  Sun,
  Lock,
  KeyRound,
  LogOut,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Tabs from '../../components/common/Tabs';
import { useToast } from '../../components/common/Toast';
import useTheme from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';

export function UserSettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const { user: authUser, fetchProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [github, setGithub] = useState('');
  const [bio, setBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security / Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  // Notification toggles with persistence
  const [emailNotifs, setEmailNotifs] = useState(() => {
    try {
      const saved = localStorage.getItem('devspace_notif_prefs');
      return saved ? JSON.parse(saved).email !== false : true;
    } catch {
      return true;
    }
  });
  const [desktopNotifs, setDesktopNotifs] = useState(() => {
    try {
      const saved = localStorage.getItem('devspace_notif_prefs');
      return saved ? JSON.parse(saved).desktop !== false : true;
    } catch {
      return true;
    }
  });

  const handleToggleNotif = (channel, checked) => {
    const nextPrefs = {
      email: channel === 'email' ? checked : emailNotifs,
      desktop: channel === 'desktop' ? checked : desktopNotifs
    };
    if (channel === 'email') setEmailNotifs(checked);
    if (channel === 'desktop') setDesktopNotifs(checked);
    try {
      localStorage.setItem('devspace_notif_prefs', JSON.stringify(nextPrefs));
    } catch {
      // quiet fail
    }
    addToast(`${channel === 'email' ? 'Email' : 'Desktop'} alerts ${checked ? 'enabled' : 'disabled'}`, 'info');
  };

  // Sync state with authUser
  useEffect(() => {
    if (authUser) {
      setName(authUser.name || '');
      setEmail(authUser.email || '');
      setGithub(authUser.github || '');
      setBio(authUser.bio || '');
    }
  }, [authUser]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Name is required', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name: name.trim(),
        github: github.trim(),
        bio: bio.trim()
      });

      if (res.data?.user) {
        await fetchProfile();
      }
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      addToast(msg, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast('Please enter your current password', 'error');
      return;
    }
    if (newPassword.length < 8) {
      addToast('New password must be at least 8 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (res.data?.token) {
        localStorage.setItem('devspace_token', res.data.token);
      }

      addToast('Password changed successfully! All previous sessions have been invalidated.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to change password';
      addToast(msg, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogoutAllSessions = async () => {
    if (!window.confirm('Are you sure you want to log out of all active sessions and devices?')) {
      return;
    }

    setIsLoggingOutAll(true);
    try {
      await logout();
      addToast('Successfully signed out of all active sessions.', 'info');
    } catch (err) {
      addToast('Failed to revoke sessions', 'error');
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'preferences', label: 'Appearance', icon: Sun },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="pb-3 border-b border-[#E8E8E5] dark:border-[#353535]">
        <h1 className="text-xl font-semibold text-[#252525] dark:text-[#F2F2F2] my-0 tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-0.5">
          Manage your personal profile, credentials, appearance, and notification channels.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-[#E8E8E5] dark:border-[#353535]">
            <Avatar src={authUser?.avatar} name={authUser?.name || 'Developer'} size="lg" />
            <div>
              <h2 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
                {authUser?.name || 'Developer'}
              </h2>
              <p className="text-xs text-[#777777] dark:text-[#A0A0A0] font-mono mt-0.5">
                {authUser?.email || 'developer@devspace.io'}
              </p>
              <span className="inline-block mt-1 px-2 py-0.2 rounded text-[10px] font-mono bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#252525] dark:text-[#F2F2F2] border border-[#E8E8E5] dark:border-[#353535]">
                Verified Account
              </span>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
              />
              <Input
                label="Email Address"
                value={email}
                disabled
                helperText="Email cannot be changed directly"
                icon={Mail}
              />
            </div>

            <Input
              label="GitHub Handle"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="e.g. octocat"
              icon={GitBranch}
            />

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#252525] dark:text-[#F2F2F2]">
                Bio / Specialization
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Technical focus, role, or interests..."
                className="w-full rounded-md bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] px-3 py-2 text-xs text-[#252525] dark:text-[#F2F2F2] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
              />
            </div>

            <div className="pt-1">
              <Button
                variant="primary"
                size="sm"
                icon={isSavingProfile ? Loader2 : Save}
                type="submit"
                disabled={isSavingProfile}
                className="h-8 text-xs font-medium"
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-5">
          <div className="pb-3 border-b border-[#E8E8E5] dark:border-[#353535]">
            <h2 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
              Password & Session Security
            </h2>
            <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-0.5">
              Change your password and manage active login sessions across devices.
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              icon={Lock}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                icon={KeyRound}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                icon={KeyRound}
                required
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              type="submit"
              icon={isChangingPassword ? Loader2 : KeyRound}
              disabled={isChangingPassword}
              className="h-8 text-xs font-medium"
            >
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </form>

          {/* Session Revocation */}
          <div className="pt-4 border-t border-[#E8E8E5] dark:border-[#353535] space-y-3">
            <div className="p-3.5 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FAFAF9] dark:bg-[#1A1A1A] space-y-1 text-xs">
              <div className="flex items-center gap-2 text-[#252525] dark:text-[#F2F2F2] font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-[#B26B00] dark:text-[#FBBF24]" />
                <span>Session Revocation</span>
              </div>
              <p className="text-[#777777] dark:text-[#A0A0A0] leading-relaxed">
                Signing out of all sessions immediately invalidates active JWT tokens across all browsers and devices.
              </p>
            </div>

            <Button
              variant="danger"
              size="sm"
              icon={LogOut}
              onClick={handleLogoutAllSessions}
              disabled={isLoggingOutAll}
              className="h-8 text-xs font-medium"
            >
              {isLoggingOutAll ? 'Revoking...' : 'Sign Out of All Sessions'}
            </Button>
          </div>
        </Card>
      )}

      {/* Tab: Preferences */}
      {activeTab === 'preferences' && (
        <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-4">
          <div className="pb-3 border-b border-[#E8E8E5] dark:border-[#353535]">
            <h2 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
              Appearance Preferences
            </h2>
            <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-0.5">
              Customize your workspace theme and display preferences.
            </p>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FAFAF9] dark:bg-[#1A1A1A]">
            <div>
              <p className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">Theme Mode</p>
              <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] mt-0.5">
                Current mode: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={theme === 'dark' ? Sun : Moon}
              onClick={toggleTheme}
              className="h-8 text-xs"
            >
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </Button>
          </div>
        </Card>
      )}

      {/* Tab: Notifications */}
      {activeTab === 'notifications' && (
        <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-4">
          <div className="pb-3 border-b border-[#E8E8E5] dark:border-[#353535]">
            <h2 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
              Notification Channels
            </h2>
            <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-0.5">
              Control when and where you receive notifications.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FAFAF9] dark:bg-[#1A1A1A]">
              <div>
                <p className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">Email Digests & Alerts</p>
                <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] mt-0.5">
                  Receive email notifications when you are assigned tasks or mentioned
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => handleToggleNotif('email', e.target.checked)}
                className="w-4 h-4 rounded border-[#E8E8E5] dark:border-[#353535] text-[#252525] focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FAFAF9] dark:bg-[#1A1A1A]">
              <div>
                <p className="text-xs font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">Desktop Push Notifications</p>
                <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] mt-0.5">
                  Show browser desktop notifications for real-time alerts
                </p>
              </div>
              <input
                type="checkbox"
                checked={desktopNotifs}
                onChange={(e) => handleToggleNotif('desktop', e.target.checked)}
                className="w-4 h-4 rounded border-[#E8E8E5] dark:border-[#353535] text-[#252525] focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default UserSettingsPage;
