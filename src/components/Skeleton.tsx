import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-zinc-800 rounded-xl ${className}`} />
  );
};

export const TaskCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 flex flex-col gap-3">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-12 w-full" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
};

export const BoardColumnSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 w-72 shrink-0 bg-slate-100/50 dark:bg-zinc-900/10 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800/40">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-5 rounded-lg" />
      </div>
      <TaskCardSkeleton />
      <TaskCardSkeleton />
      <TaskCardSkeleton />
    </div>
  );
};

export const DashboardCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 flex flex-col gap-4 h-80">
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="flex-1 w-full" />
    </div>
  );
};
