import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockDb } from '../services/mockDb';
import { useUiStore } from '../store/uiStore';
import { Avatar } from '../components/Avatar';
import { VirtualizedList } from '../components/VirtualizedList';
import { History, MessageCircle, RefreshCw } from 'lucide-react';
import type { Activity as ActivityType } from '../types';

export const Activity: React.FC = () => {
  const { activeWorkspaceId } = useUiStore();

  // Fetch activities list
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', activeWorkspaceId],
    queryFn: () => mockDb.getActivities(activeWorkspaceId),
  });

  const renderActivityRow = (act: ActivityType) => {
    return (
      <div
        key={act.id}
        className="flex gap-4 p-4 border-b border-slate-100 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/10 hover:bg-slate-50/50 dark:hover:bg-zinc-900/20 transition-all items-center h-[72px]"
      >
        <Avatar name={act.userName} src={act.userAvatar} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700 dark:text-zinc-300 truncate">
            <strong className="text-slate-900 dark:text-white font-bold">{act.userName}</strong>{' '}
            {act.action}{' '}
            <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{act.taskTitle}</strong>
          </p>
          <span className="text-xs text-slate-400 dark:text-zinc-500">
            {new Date(act.createdAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/40 text-slate-400">
          {act.action.includes('comment') ? <MessageCircle className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full h-full text-left">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-slate-800 dark:text-zinc-50">
          Activity Logs
        </h1>
        <p className="text-sm text-slate-400 dark:text-zinc-500">
          Audit history and timeline log of team modifications inside this workspace
        </p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm flex flex-col">
        {/* Logs List Header */}
        <div className="p-4 bg-slate-100/50 dark:bg-zinc-900/20 border-b border-slate-200 dark:border-zinc-800/80 flex items-center gap-2">
          <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Audit Timeline logs
          </span>
        </div>

        {/* Scrollable Virtualized Content Viewport */}
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <span className="text-sm text-slate-400 font-medium">Loading timeline records...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-2">
            <p className="text-sm text-slate-400 font-semibold uppercase">No activities tracked</p>
          </div>
        ) : (
          <VirtualizedList
            items={activities}
            itemHeight={72}
            containerHeight={500}
            renderItem={renderActivityRow}
          />
        )}
      </div>
    </div>
  );
};
export default Activity;
