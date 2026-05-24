import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDb } from '../services/mockDb';
import { useUiStore } from '../store/uiStore';
import { useToast } from '../contexts/ToastContext';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { UserPlus, Mail, Trash2, ShieldCheck, UserCheck } from 'lucide-react';
import type { UserWorkspaceRole, Workspace } from '../types';

export const Workspaces: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { activeWorkspaceId } = useUiStore();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');

  // Fetch workspaces
  const { data: workspaces = [] } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: mockDb.getWorkspaces,
  });

  const currentWorkspace = workspaces.find((w: Workspace) => w.id === activeWorkspaceId) || workspaces[0];

  // Mutations
  const inviteMutation = useMutation({
    mutationFn: async (payload: { email: string; role: 'admin' | 'member' | 'viewer' }) => {
      return mockDb.inviteMember(activeWorkspaceId, payload.email, payload.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('member');
      showToast(`Invitation sent to ${inviteEmail}!`, 'success');
    },
    onError: (err) => {
      showToast(err.message, 'error');
    }
  });

  const changeRoleMutation = useMutation({
    mutationFn: async (payload: { userId: string; role: UserWorkspaceRole }) => {
      return mockDb.changeMemberRole(activeWorkspaceId, payload.userId, payload.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      showToast('Member role updated', 'success');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      return mockDb.removeMember(activeWorkspaceId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      showToast('Member removed from workspace', 'info');
    },
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !/\S+@\S+\.\S+/.test(inviteEmail)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    changeRoleMutation.mutate({ userId, role: newRole as UserWorkspaceRole });
  };

  const handleRemoveMember = (userId: string, name: string) => {
    if (userId === 'user-me') {
      showToast('You cannot remove yourself from this workspace', 'error');
      return;
    }
    if (window.confirm(`Are you sure you want to remove ${name} from this workspace?`)) {
      removeMemberMutation.mutate(userId);
    }
  };

  const roleLabels = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
    viewer: 'Viewer',
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' },
    { value: 'viewer', label: 'Viewer' },
  ];

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full text-left">
      {/* Workspace Management Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-slate-800 dark:text-zinc-50">
            Workspace Space
          </h1>
          <p className="text-sm text-slate-400 dark:text-zinc-500">
            Manage workspace information, invite team members, and configure access roles
          </p>
        </div>

        <Button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Invite Member</span>
        </Button>
      </div>

      {/* Team settings content layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workspace details info block */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col gap-4 h-fit">
          <h3 className="text-md font-bold font-display text-slate-800 dark:text-zinc-100">
            About Workspace
          </h3>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Name
            </label>
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
              {currentWorkspace?.name}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Slug Link
            </label>
            <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
              /workspaces/{currentWorkspace?.slug}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              Description
            </label>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              {currentWorkspace?.description || 'No description supplied for this workspace.'}
            </p>
          </div>
        </div>

        {/* Team Members List container */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800/80">
            <h3 className="text-md font-bold font-display text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Active Members ({currentWorkspace?.members.length || 0})
            </h3>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  <th className="py-3 px-2">Member</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Role</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/40">
                {currentWorkspace?.members.map((member) => (
                  <tr key={member.userId} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-900/10">
                    <td className="py-4 px-2 flex items-center gap-3">
                      <Avatar name={member.name} src={member.avatarUrl} size="sm" />
                      <span className="font-semibold text-slate-800 dark:text-zinc-100">
                        {member.name} {member.userId === 'user-me' && '(You)'}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-slate-500 dark:text-zinc-400">
                      {member.email}
                    </td>
                    <td className="py-4 px-2">
                      {member.role === 'owner' ? (
                        <Badge variant="default" className="flex items-center gap-1 w-fit">
                          <ShieldCheck className="h-3 w-3" /> Owner
                        </Badge>
                      ) : member.userId === 'user-me' ? (
                        <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                          {roleLabels[member.role]}
                        </span>
                      ) : (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                          className="text-xs font-semibold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 px-2 py-1 rounded-lg focus:outline-none cursor-pointer"
                        >
                          {roleOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-950">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="py-4 px-2 text-right">
                      {member.role !== 'owner' && member.userId !== 'user-me' && (
                        <button
                          onClick={() => handleRemoveMember(member.userId, member.name)}
                          className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Remove member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite Member Modal dialog container */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite New Team Member"
      >
        <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
            required
            autoFocus
          />

          <Select
            label="Initial Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as any)}
            options={[
              { value: 'member', label: 'Member (Write/edit access)' },
              { value: 'admin', label: 'Admin (Manage team settings)' },
              { value: 'viewer', label: 'Viewer (Read-only access)' },
            ]}
          />

          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={inviteMutation.isPending}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Workspaces;
