import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { Calendar, CheckSquare, MessageSquare, Paperclip, GripVertical } from 'lucide-react';
import { mockDb } from '../services/mockDb';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : undefined,
  };

  const users = mockDb.getUsers();
  const assignee = users.find((u) => u.id === task.assigneeId);

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const priorityVariants = {
    low: 'low' as const,
    medium: 'medium' as const,
    high: 'high' as const,
    urgent: 'urgent' as const,
  };

  // Prevent drag listener from hijacking click behavior
  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked drag handle, let it drag. Otherwise open details.
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      return;
    }
    onClick();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleCardClick}
      className={`p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/35 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col gap-3 group relative text-left select-none ${
        isDragging ? 'ring-2 ring-indigo-500/40' : ''
      }`}
    >
      {/* Priority Badge & Drag Handle */}
      <div className="flex justify-between items-center">
        <Badge variant={priorityVariants[task.priority]}>
          {task.priority}
        </Badge>
        
        <div
          {...attributes}
          {...listeners}
          className="drag-handle opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-grab active:cursor-grabbing transition-opacity shrink-0"
          title="Drag to reorder"
          aria-label="Drag handle"
        >
          <GripVertical className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {task.title}
      </h4>

      {/* Description Preview */}
      {task.description && (
        <p className="text-xs text-slate-400 dark:text-zinc-500 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags Block */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 border border-slate-200/20 dark:border-zinc-700/25"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <hr className="border-slate-100 dark:border-zinc-800/60 my-0.5" />

      {/* Card Footer Indicators */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">
        <div className="flex items-center gap-3 shrink-0">
          {/* Due date indicator */}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          )}

          {/* Subtasks fractional count */}
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1" title="Subtasks progress">
              <CheckSquare className="h-3 w-3" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          {/* Comments count */}
          {task.comments.length > 0 && (
            <div className="flex items-center gap-1" title="Comments count">
              <MessageSquare className="h-3 w-3" />
              <span>{task.comments.length}</span>
            </div>
          )}

          {/* Attachments count */}
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1" title="Attachments count">
              <Paperclip className="h-3 w-3" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        {/* Assignee initials badge */}
        {assignee && (
          <Avatar
            name={assignee.name}
            src={assignee.avatarUrl}
            size="xs"
            className="ring-2 ring-white dark:ring-zinc-950"
          />
        )}
      </div>
    </div>
  );
};
