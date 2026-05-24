import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockDb } from '../services/mockDb';
import { useUiStore } from '../store/uiStore';
import { ChartSkeleton } from '../components/Skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from 'recharts';
import { Award, Zap, CheckCircle2, TrendingUp, BarChart4 } from 'lucide-react';
import type { Workspace, WorkspaceMember } from '../types';

export const Analytics: React.FC = () => {
  const { activeWorkspaceId } = useUiStore();

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', activeWorkspaceId],
    queryFn: () => mockDb.getTasksByWorkspace(activeWorkspaceId),
  });

  const { data: workspaces = [] } = useQuery<Workspace[]>({ 
    queryKey: ['workspaces'],
    queryFn: mockDb.getWorkspaces
  });
  const currentWorkspace = workspaces.find((w: Workspace) => w.id === activeWorkspaceId);

  // Statistics calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.columnId === 'done').length;

  const lowPriorityTasks = tasks.filter((t) => t.priority === 'low').length;
  const mediumPriorityTasks = tasks.filter((t) => t.priority === 'medium').length;
  const highPriorityTasks = tasks.filter((t) => t.priority === 'high').length;
  const urgentPriorityTasks = tasks.filter((t) => t.priority === 'urgent').length;

  // Chart datasets
  // 1. Priority Breakdown dataset
  const priorityData = [
    { name: 'Low', count: lowPriorityTasks, color: '#10b981' },
    { name: 'Medium', count: mediumPriorityTasks, color: '#0ea5e9' },
    { name: 'High', count: highPriorityTasks, color: '#f59e0b' },
    { name: 'Urgent', count: urgentPriorityTasks, color: '#e11d48' },
  ];

  // 2. Team Productivity completions dataset
  const teamProductivityData = currentWorkspace?.members.map((member: WorkspaceMember) => {
    const memberTasks = tasks.filter((t) => t.assigneeId === member.userId);
    const completed = memberTasks.filter((t) => t.columnId === 'done').length;
    const active = memberTasks.filter((t) => t.columnId !== 'done').length;
    return {
      name: member.name,
      Completed: completed,
      Active: active,
    };
  }) || [];

  // 3. Weekly completion velocity
  const completionVelocityData = [
    { name: 'Week 1', completed: 3, targeted: 5 },
    { name: 'Week 2', completed: 6, targeted: 6 },
    { name: 'Week 3', completed: 5, targeted: 7 },
    { name: 'Week 4', completed: completedTasks, targeted: totalTasks > 0 ? totalTasks : 8 },
  ];

  if (tasksLoading) {
    return (
      <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <div className="h-8 w-48 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full text-left">
      {/* Analytics Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-slate-800 dark:text-zinc-50">
          Analytics Dashboard
        </h1>
        <p className="text-sm text-slate-400 dark:text-zinc-500">
          Visual metrics and insights regarding team productivity and task velocities
        </p>
      </div>

      {/* KPI Highlights block */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 flex gap-4 items-center shadow-sm">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Task Completion Rate</span>
            <span className="text-xl font-bold font-display text-slate-800 dark:text-white">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 flex gap-4 items-center shadow-sm">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-600">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Velocity</span>
            <span className="text-xl font-bold font-display text-slate-800 dark:text-white">
              4.8 tasks / wk
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 flex gap-4 items-center shadow-sm">
          <div className="p-3 bg-sky-500/10 rounded-xl text-sky-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top Performer</span>
            <span className="text-xl font-bold font-display text-slate-800 dark:text-white">
              John Doe
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team productivity completions */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-md font-bold font-display text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              <BarChart4 className="h-4.5 w-4.5 text-indigo-600" /> Team Productivity
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Completions and active tasks mapped per team member
            </p>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamProductivityData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    color: '#f4f4f5',
                  }}
                />
                <Legend />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Active" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority distribution */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-md font-bold font-display text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-rose-500" /> Priority Distribution
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Tasks distribution sorted by priority levels
            </p>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    color: '#f4f4f5',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Weekly target velocity insights card */}
      <div className="glass-panel p-6 rounded-2xl shadow-sm flex flex-col gap-4">
        <div>
          <h3 className="text-md font-bold font-display text-slate-800 dark:text-zinc-100">
            Sprint Target Velocity
          </h3>
          <p className="text-xs text-slate-400">
            Compare sprint completions against targeted item goals
          </p>
        </div>
        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completionVelocityData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '12px',
                }}
              />
              <Legend />
              <Bar dataKey="completed" name="Completed Items" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="targeted" name="Targeted Sprint Scope" fill="#94a3b8" opacity={0.3} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
