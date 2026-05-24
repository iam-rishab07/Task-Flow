import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { useTheme } from '../contexts/ThemeContext';
import { useOffline } from '../hooks/useOffline';
import { useToast } from '../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDb } from '../services/mockDb';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import {
  LayoutDashboard,
  KanbanSquare,
  Calendar,
  Users,
  BarChart3,
  History,
  Settings,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Plus,
  Menu,
  X,
  CloudOff,
  Check,
  Search
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const isOffline = useOffline();
  const { showToast } = useToast();

  const {
    activeWorkspaceId,
    setActiveWorkspaceId,
    sidebarCollapsed,
    toggleSidebar,
    searchQuery,
    setSearchQuery,
    isWorkspaceModalOpen,
    setWorkspaceModalOpen
  } = useUiStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');

  // Fetch workspaces & notifications via React Query
  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: mockDb.getWorkspaces,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: mockDb.getNotifications,
  });

  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  // Queries/Mutations for notifications
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      mockDb.markNotificationRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      mockDb.markAllNotificationsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showToast('All notifications marked as read', 'success');
    },
  });

  const createWsMutation = useMutation({
    mutationFn: async () => {
      if (!newWsName.trim()) throw new Error('Name required');
      return mockDb.createWorkspace(newWsName, newWsDesc);
    },
    onSuccess: (newWs) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setActiveWorkspaceId(newWs.id);
      setWorkspaceModalOpen(false);
      setNewWsName('');
      setNewWsDesc('');
      showToast(`Workspace "${newWs.name}" created!`, 'success');
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Kanban Board', path: '/board', icon: <KanbanSquare className="h-5 w-5" /> },
    { label: 'Calendar', path: '/calendar', icon: <Calendar className="h-5 w-5" /> },
    { label: 'Team Space', path: '/members', icon: <Users className="h-5 w-5" /> },
    { label: 'Analytics', path: '/analytics', icon: <BarChart3 className="h-5 w-5" /> },
    { label: 'Activity Log', path: '/activity', icon: <History className="h-5 w-5" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    createWsMutation.mutate();
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-zinc-950 transition-colors duration-200">
      {/* Offline Mode Banner */}
      {isOffline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/20 bg-rose-50/90 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 backdrop-blur-md shadow-lg text-sm font-semibold animate-slide-in">
          <CloudOff className="h-4 w-4 shrink-0" />
          <span>Offline mode. All data changes will sync locally.</span>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md transition-all duration-300 shrink-0 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Workspace Switcher Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800/80 relative">
          <button
            onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar
                name={currentWorkspace?.name || 'Workspace'}
                size="sm"
                className="bg-indigo-600 font-display shadow-md shadow-indigo-600/10 text-white"
              />
              {!sidebarCollapsed && (
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate">
                    {currentWorkspace?.name || 'Loading...'}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                    {currentWorkspace?.members?.length || 0} Members
                  </p>
                </div>
              )}
            </div>
            {!sidebarCollapsed && <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {/* Workspace dropdown menu */}
          {wsDropdownOpen && (
            <div className="absolute left-4 right-4 top-full mt-2 z-30 glass-panel rounded-xl shadow-xl p-1.5 flex flex-col gap-1">
              <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2.5 py-1">
                Switch Workspace
              </p>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspaceId(ws.id);
                    setWsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-sm flex items-center justify-between cursor-pointer ${
                    ws.id === activeWorkspaceId
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === activeWorkspaceId && <Check className="h-4 w-4 shrink-0" />}
                </button>
              ))}
              <hr className="border-slate-100 dark:border-zinc-800/80 my-1" />
              <button
                onClick={() => {
                  setWorkspaceModalOpen(true);
                  setWsDropdownOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-sm text-indigo-600 hover:bg-indigo-50/50 dark:text-indigo-400 dark:hover:bg-indigo-950/10 flex items-center gap-2 cursor-pointer font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Create Workspace</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50/80 text-indigo-600 font-semibold dark:bg-indigo-950/25 dark:text-indigo-400 shadow-sm border border-indigo-200/10'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/40'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Footer section */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar name={user?.name || 'User'} src={user?.avatarUrl} size="sm" />
            {!sidebarCollapsed && (
              <div className="text-left overflow-hidden">
                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100 truncate">
                  {user?.name || 'Guest'}
                </p>
                <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">
                  {user?.email || ''}
                </p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={logout}
              className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Navigation Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800/85 transition-transform duration-300 md:hidden flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800/80 flex justify-between items-center">
          <span className="text-lg font-bold font-display tracking-tight text-slate-800 dark:text-zinc-100">
            TaskFlow
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <Avatar name={currentWorkspace?.name || 'Workspace'} size="sm" className="bg-indigo-600 text-white" />
            <div className="text-left truncate">
              <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{currentWorkspace?.name}</p>
              <p className="text-[10px] text-slate-400">Workspace</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-semibold dark:bg-indigo-950/20 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || 'User'} src={user?.avatarUrl} size="sm" />
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate w-32">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-rose-500">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar Header */}
        <header className="h-16 border-b border-slate-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/30 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 relative">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={toggleSidebar}
              className="hidden md:block text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="hidden sm:block text-md font-bold font-display text-slate-800 dark:text-zinc-100">
              {navItems.find((item) => item.path === location.pathname)?.label || 'TaskFlow'}
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4 relative">
            {/* Search Input */}
            <div className="hidden md:flex items-center relative max-w-xs">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search board tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-1.5 text-xs w-52 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-950/40 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            {/* Notifications Bell Button */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900" />
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 z-40 glass-panel rounded-2xl shadow-xl p-4 flex flex-col gap-3 animate-slide-in">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                      Notifications ({unreadCount})
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllReadMutation.mutate()}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.read) markReadMutation.mutate(n.id);
                            setNotifOpen(false);
                          }}
                          className={`p-2.5 rounded-xl text-left transition-colors cursor-pointer border ${
                            n.read
                              ? 'bg-transparent border-transparent'
                              : 'bg-indigo-50/30 dark:bg-indigo-950/10 border-indigo-500/10'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1.5">
                            <span className={`text-xs font-bold ${n.read ? 'text-slate-600 dark:text-zinc-300' : 'text-slate-800 dark:text-zinc-100'}`}>
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Profile Avatar Trigger Link */}
            <Link to="/settings" className="shrink-0 flex items-center gap-1.5">
              <Avatar name={user?.name || 'User'} src={user?.avatarUrl} size="sm" className="hover:ring-2 hover:ring-indigo-500 transition-all" />
            </Link>
          </div>
        </header>

        {/* Page Inner Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
          {children}
        </main>
      </div>

      {/* Modal dialog for creating new workspace */}
      <Modal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setWorkspaceModalOpen(false)}
        title="Create New Workspace"
      >
        <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-4">
          <Input
            label="Workspace Name"
            placeholder="e.g. Mobile Apps, Side Hustle"
            value={newWsName}
            onChange={(e) => setNewWsName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Description (Optional)
            </label>
            <textarea
              placeholder="Explain the purpose of this team workspace..."
              value={newWsDesc}
              onChange={(e) => setNewWsDesc(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 h-24 resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setWorkspaceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createWsMutation.isPending}
            >
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
