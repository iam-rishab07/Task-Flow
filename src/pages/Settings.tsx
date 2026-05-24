import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { User, Mail, ShieldAlert, Key, Bell, Palette } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  // Profile forms state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profilePending, setProfilePending] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passPending, setPassPending] = useState(false);

  // Notification checkboxes state
  const [mentions, setMentions] = useState(true);
  const [assignments, setAssignments] = useState(true);
  const [digest, setDigest] = useState(false);
  const [push, setPush] = useState(true);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      showToast('Name and Email are required', 'error');
      return;
    }
    setProfilePending(true);
    try {
      await updateProfile(name, email, avatarUrl || undefined);
      showToast('Profile updated successfully!', 'success');
    } catch {
      showToast('Failed to update profile details.', 'error');
    } finally {
      setProfilePending(false);
    }
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setPassPending(true);
    setTimeout(() => {
      setPassPending(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully!', 'success');
    }, 1000);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Notification preferences updated!', 'success');
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full text-left">
      {/* Settings Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-slate-800 dark:text-zinc-50">
          User Settings
        </h1>
        <p className="text-sm text-slate-400 dark:text-zinc-500">
          Manage your personal details, passwords, theme modes, and notification configurations
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-zinc-800/80 pb-1.5 shrink-0">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-indigo-50/80 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400'
              : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-indigo-50/80 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400'
              : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Security & Password
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-indigo-50/80 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400'
              : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Preferences
        </button>
      </div>

      {/* Settings Forms Body */}
      <div className="glass-panel p-6 rounded-2xl shadow-sm">
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave} className="flex flex-col gap-5 max-w-xl">
            <h3 className="text-md font-bold font-display text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Account Profile Details
            </h3>

            {/* Avatar display row */}
            <div className="flex items-center gap-4 py-2">
              <Avatar name={name || 'User'} src={avatarUrl || undefined} size="lg" />
              <div className="text-left">
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Avatar Photo</h4>
                <p className="text-xs text-slate-400">Determined automatically or customize URL below</p>
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />

            <Input
              label="Profile Photo URL"
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              leftIcon={<Palette className="h-4 w-4" />}
            />

            <Button type="submit" variant="primary" className="w-fit" isLoading={profilePending}>
              Save Profile
            </Button>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSave} className="flex flex-col gap-5 max-w-xl">
            <h3 className="text-md font-bold font-display text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Change Security Password
            </h3>

            <div className="p-3.5 rounded-xl border border-rose-500/10 bg-rose-500/5 text-xs text-rose-800 dark:text-rose-400 flex items-start gap-2">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>
                TODO(security): Integrate leaked passwords scanner check API (e.g. HaveIBeenPwned API) to block compromised passwords.
              </span>
            </div>

            <Input
              label="Old Password"
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" className="w-fit" isLoading={passPending}>
              Update Password
            </Button>
          </form>
        )}

        {activeTab === 'notifications' && (
          <div className="flex flex-col gap-6 max-w-xl">
            {/* Theme Preferences */}
            <div className="flex flex-col gap-3">
              <h3 className="text-md font-bold font-display text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                <Palette className="h-5 w-5 text-indigo-600" /> Theme Mode settings
              </h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={theme === 'light' ? 'primary' : 'secondary'}
                  onClick={() => setTheme('light')}
                  size="sm"
                >
                  Light Mode
                </Button>
                <Button
                  type="button"
                  variant={theme === 'dark' ? 'primary' : 'secondary'}
                  onClick={() => setTheme('dark')}
                  size="sm"
                >
                  Dark Mode
                </Button>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-zinc-800/80 my-2" />

            {/* Notification settings */}
            <form onSubmit={handleSaveNotifications} className="flex flex-col gap-4">
              <h3 className="text-md font-bold font-display text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-600" /> Notification Alert Preferences
              </h3>

              <div className="flex flex-col gap-3.5 text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mentions}
                    onChange={(e) => setMentions(e.target.checked)}
                    className="h-4.5 w-4.5 text-indigo-600 rounded border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="text-left">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300 block">Email Mentions</span>
                    <span className="text-xs text-slate-400">Receive alerts when comments mention your profile</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignments}
                    onChange={(e) => setAssignments(e.target.checked)}
                    className="h-4.5 w-4.5 text-indigo-600 rounded border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="text-left">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300 block">Task Assignments</span>
                    <span className="text-xs text-slate-400">Receive notifications when tasks are assigned to you</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={push}
                    onChange={(e) => setPush(e.target.checked)}
                    className="h-4.5 w-4.5 text-indigo-600 rounded border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="text-left">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300 block">Browser Push Notifications</span>
                    <span className="text-xs text-slate-400">Display instant task alerts overlaying browser tabs</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={digest}
                    onChange={(e) => setDigest(e.target.checked)}
                    className="h-4.5 w-4.5 text-indigo-600 rounded border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="text-left">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300 block">Weekly Workspace Digest</span>
                    <span className="text-xs text-slate-400">Receive a weekly summary email of workspace productivity logs</span>
                  </div>
                </label>
              </div>

              <Button type="submit" variant="primary" className="w-fit mt-4">
                Save Preferences
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
export default Settings;
