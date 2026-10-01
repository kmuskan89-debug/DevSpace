import React, { useState } from 'react';
import { User, Mail, GitBranch, Save, Shield, Bell, Moon, Sun } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import useTheme from '../../hooks/useTheme';
import { INITIAL_USER } from '../../utils/constants';

export function UserSettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(INITIAL_USER);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [github, setGithub] = useState(user.github);
  const [bio, setBio] = useState(user.bio);

  const handleSave = (e) => {
    e.preventDefault();
    alert('User profile updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Card hoverable={false} className="space-y-6">
        <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-100 my-0">Developer Profile</h1>
            <p className="text-xs text-slate-400">Personal information and developer integrations</p>
          </div>

          <Avatar src={user.avatar} name={user.name} size="lg" status="online" />
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={User}
            />
            <Input
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
            />
          </div>

          <Input
            label="GitHub Handle"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            icon={GitBranch}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Developer Bio / Speciality
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-lg bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <Button variant="primary" size="md" icon={Save} type="submit">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Preferences Card */}
      <Card hoverable={false} className="space-y-4">
        <h3 className="text-sm font-bold text-slate-100 pb-2 border-b border-slate-800">
          Preferences & Themes
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-200">Interface Theme</p>
            <p className="text-[11px] text-slate-400">Switch between sleek dark developer mode and light theme</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={theme === 'dark' ? Sun : Moon}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default UserSettingsPage;
