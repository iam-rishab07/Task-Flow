import React from 'react';
import { useUiStore } from '../store/uiStore';
import { useQuery } from '@tanstack/react-query';
import { mockDb } from '../services/mockDb';
import { DashboardCardSkeleton, ChartSkeleton } from '../components/Skeleton';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertOctagon,
  TrendingUp,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { activeWorkspaceId } = useUiStore();
  const { theme } = useTheme();

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', activeWorkspaceId],
    queryFn: () => mockDb.getTasksByWorkspace(activeWorkspaceId),
  });

  // Fetch activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities', activeWorkspaceId],
    queryFn: () => mockDb.getActivities(activeWorkspaceId),
  });

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: mockDb.getWorkspaces,
  });

  const workspaceName = workspaces.find(w => w.id === activeWorkspaceId)?.name || 'Acme Workspace';

  // Statistics calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.columnId === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.columnId === 'in-progress').length;
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent' && t.columnId !== 'done').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Chart datasets
  // 1. Weekly completion trend (mocked dataset for this workspace)
  const areaData = [
    { date: 'Mon', completed: 2, created: 3 },
    { date: 'Tue', completed: 4, created: 2 },
    { date: 'Wed', completed: 3, created: 5 },
    { date: 'Thu', completed: 5, created: 4 },
    { date: 'Fri', completed: 7, created: 6 },
    { date: 'Sat', completed: 2, created: 1 },
    { date: 'Sun', completed: completedTasks, created: totalTasks - 6 > 0 ? totalTasks - 6 : 2 },
  ];

  // 2. Status distribution
  const todoCount = tasks.filter((t) => t.columnId === 'todo').length;
  const reviewCount = tasks.filter((t) => t.columnId === 'in-review').length;

  const barData = [
    { name: 'Todo', count: todoCount, color: '#6366f1' },
    { name: 'In Progress', count: inProgressTasks, color: '#0ea5e9' },
    { name: 'In Review', count: reviewCount, color: '#f59e0b' },
    { name: 'Done', count: completedTasks, color: '#10b981' },
  ];

  const statCards = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: <ListTodo className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      desc: 'All active and closed tasks',
      bg: 'bg-indigo-500/5',
      border: 'border-indigo-500/10',
    },
    {
      title: 'Completed',
      value: `${completedTasks} (${completionRate}%)`,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      desc: 'Closed items in this workspace',
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/10',
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      icon: <Clock className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
      desc: 'Actively being worked on',
      bg: 'bg-sky-500/5',
      border: 'border-sky-500/10',
    },
    {
      title: 'Urgent Action',
      value: urgentTasks,
      icon: <AlertOctagon className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
      desc: 'Open urgent priority cards',
      bg: 'bg-rose-500/5',
      border: 'border-rose-500/10',
    },
  ];

  if (tasksLoading || activitiesLoading) {
    return (
      <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-1 text-left">
          <div className="h-8 w-48 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-zinc-800 rounded mt-1 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full text-left">
      {/* Welcome Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-slate-800 dark:text-zinc-50">
            {workspaceName}
          </h1>
          <p className="text-sm text-slate-400 dark:text-zinc-500">
            Overview of work, analytics, and current status
          </p>
        </div>
        <Link to="/board">
          <Button variant="secondary" className="flex items-center gap-2">
            Open Kanban Board <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`p-6 rounded-2xl border ${card.border} ${card.bg} bg-white dark:bg-zinc-900/30 flex flex-col gap-2 shadow-sm transition-all hover:translate-y-[-2px]`}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {card.title}
              </span>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/30">
                {card.icon}
              </div>
            </div>
            <h3 className="text-2xl font-bold font-display text-slate-800 dark:text-zinc-50">
              {card.value}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-bold font-display text-slate-800 dark:text-zinc-100">
                Productivity Trend
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500">
                Weekly velocity: completed vs newly created tasks
              </p>
            </div>
            <Badge variant="low" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +14% velocity
            </Badge>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
                    borderColor: theme === 'dark' ? '#27272a' : '#f1f5f9',
                    borderRadius: '12px',
                    color: theme === 'dark' ? '#f4f4f5' : '#0f172a',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  name="Created"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCreated)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Distribution */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-md font-bold font-display text-slate-800 dark:text-zinc-100">
              Task Status
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Task distribution across columns
            </p>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
                    borderColor: theme === 'dark' ? '#27272a' : '#f1f5f9',
                    borderRadius: '12px',
                    color: theme === 'dark' ? '#f4f4f5' : '#0f172a',
                  }}
                />
                <Bar dataKey="count" name="Tasks count" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Content Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Log */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800/80">
            <h3 className="text-md font-bold font-display text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Recent Activities
            </h3>
            <Link to="/activity" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View Audit Log
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                No recent actions logged for this workspace.
              </p>
            ) : (
              activities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex gap-3 text-sm items-start">
                  <Avatar name={activity.userName} src={activity.userAvatar} size="xs" className="mt-0.5" />
                  <div className="flex-1">
                    <p className="text-slate-600 dark:text-zinc-300">
                      <strong className="text-slate-800 dark:text-white font-semibold">{activity.userName}</strong>{' '}
                      {activity.action}{' '}
                      <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{activity.taskTitle}</strong>
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                      {new Date(activity.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task Priority Box */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <h3 className="text-md font-bold font-display text-slate-800 dark:text-zinc-100">
            Urgent Tasks Checklist
          </h3>
          <div className="flex flex-col gap-3">
            {tasks.filter(t => t.priority === 'urgent' && t.columnId !== 'done').length === 0 ? (
              <div className="text-center py-6 flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="text-xs text-slate-400 font-medium">All caught up! No urgent open tasks.</p>
              </div>
            ) : (
              tasks.filter(t => t.priority === 'urgent' && t.columnId !== 'done').slice(0, 3).map((task) => (
                <Link
                  key={task.id}
                  to="/board"
                  className="p-3.5 rounded-xl border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10 transition-all flex flex-col gap-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      Urgent Action
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                      Due: {task.dueDate || 'No Date'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate">
                    {task.title}
                  </h4>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
