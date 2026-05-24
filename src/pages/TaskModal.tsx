import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDb } from '../services/mockDb';
import { useUiStore } from '../store/uiStore';
import { useToast } from '../contexts/ToastContext';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import {
  Calendar,
  Trash2,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Tag,
  Square,
  CheckCircle2,
  X
} from 'lucide-react';
import type { Task, TaskPriority, SubTask, Workspace, WorkspaceMember } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null; // null for "Add Task" mode
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskId }) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { activeWorkspaceId } = useUiStore();

  // Fetch data
  const { data: workspaces = [] } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: mockDb.getWorkspaces
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', activeWorkspaceId],
    queryFn: () => mockDb.getTasksByWorkspace(activeWorkspaceId),
  });

  const currentWorkspace = workspaces.find((w: Workspace) => w.id === activeWorkspaceId);
  const assigneeOptions = currentWorkspace?.members.map((m: WorkspaceMember) => ({
    value: m.userId,
    label: m.name
  })) || [];

  const statusOptions = mockDb.getColumns().map(c => ({
    value: c.id,
    label: c.title
  }));

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const existingTask = taskId ? tasks.find(t => t.id === taskId) : null;

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState('todo');
  const [priority, setPriority] = useState<TaskPriority>('low');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [commentInput, setCommentInput] = useState('');

  // Sync state with selected task
  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description);
      setColumnId(existingTask.columnId);
      setPriority(existingTask.priority);
      setDueDate(existingTask.dueDate || '');
      setAssigneeId(existingTask.assigneeId || '');
      setTags(existingTask.tags);
      setSubtasks(existingTask.subtasks);
    } else {
      setTitle('');
      setDescription('');
      setColumnId('todo');
      setPriority('low');
      setDueDate('');
      setAssigneeId(assigneeOptions[0]?.value || '');
      setTags([]);
      setSubtasks([]);
    }
    setCommentInput('');
  }, [existingTask, isOpen, activeWorkspaceId]);

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments'>) => {
      return mockDb.createTask(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeWorkspaceId] });
      showToast('Task created successfully!', 'success');
      onClose();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (payload: { id: string; updates: Partial<Task> }) => {
      return mockDb.updateTask(payload.id, payload.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeWorkspaceId] });
      showToast('Task updated successfully!', 'success');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      mockDb.deleteTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeWorkspaceId] });
      showToast('Task deleted', 'info');
      onClose();
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (payload: { id: string; content: string }) => {
      return mockDb.addComment(payload.id, payload.content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeWorkspaceId] });
      setCommentInput('');
      showToast('Comment posted', 'success');
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Task title is required', 'error');
      return;
    }

    const taskPayload = {
      title,
      description,
      columnId,
      priority,
      dueDate: dueDate || undefined,
      assigneeId: assigneeId || undefined,
      workspaceId: activeWorkspaceId,
      subtasks,
      tags,
    };

    if (taskId) {
      updateTaskMutation.mutate({ id: taskId, updates: taskPayload });
      onClose();
    } else {
      createTaskMutation.mutate(taskPayload);
    }
  };

  const handleDelete = () => {
    if (taskId && window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleToggleSubtask = (subId: string) => {
    const updated = subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
    setSubtasks(updated);
    if (taskId) {
      updateTaskMutation.mutate({ id: taskId, updates: { subtasks: updated } });
    }
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    const newSub: SubTask = {
      id: 'sub-' + Math.random().toString(36).substring(2, 9),
      title: subtaskInput,
      completed: false
    };
    const updated = [...subtasks, newSub];
    setSubtasks(updated);
    setSubtaskInput('');
    if (taskId) {
      updateTaskMutation.mutate({ id: taskId, updates: { subtasks: updated } });
    }
  };

  const handleRemoveSubtask = (subId: string) => {
    const updated = subtasks.filter(s => s.id !== subId);
    setSubtasks(updated);
    if (taskId) {
      updateTaskMutation.mutate({ id: taskId, updates: { subtasks: updated } });
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (tags.includes(tagInput.trim())) return;
      const updated = [...tags, tagInput.trim()];
      setTags(updated);
      setTagInput('');
      if (taskId) {
        updateTaskMutation.mutate({ id: taskId, updates: { tags: updated } });
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter(t => t !== tagToRemove);
    setTags(updated);
    if (taskId) {
      updateTaskMutation.mutate({ id: taskId, updates: { tags: updated } });
    }
  };

  const handlePostComment = () => {
    if (!commentInput.trim() || !taskId) return;
    addCommentMutation.mutate({ id: taskId, content: commentInput });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskId ? 'Task Details' : 'Create Task'}
      size="xl"
    >
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Title, Description, Subtasks, Comments */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Input
            label="Task Title"
            placeholder="e.g. Implement drag-and-drop mechanics"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              // Optimistic update local text
            }}
            required
            className="text-base font-bold font-display"
          />

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Description
            </label>
            <textarea
              placeholder="Provide a thorough spec description for this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 h-28 resize-none"
            />
          </div>

          {/* Subtasks Section */}
          <div className="flex flex-col gap-3 text-left">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4" /> Checklist Subtasks
            </h4>
            
            <div className="flex flex-col gap-2">
              {subtasks.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between group p-1 hover:bg-slate-50 dark:hover:bg-zinc-900/40 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(sub.id)}
                    className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-zinc-300 cursor-pointer"
                  >
                    {sub.completed ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Square className="h-4.5 w-4.5 text-slate-300 dark:text-zinc-700 shrink-0" />
                    )}
                    <span className={sub.completed ? 'line-through text-slate-400' : ''}>
                      {sub.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add subtask checklist item..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <Button type="button" variant="secondary" onClick={handleAddSubtask} size="sm">
                Add
              </Button>
            </div>
          </div>

          {/* Comments Feed section (Only shown for existing tasks) */}
          {taskId && (
            <div className="flex flex-col gap-3 text-left pt-4 border-t border-slate-100 dark:border-zinc-800/80">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" /> Comments ({existingTask?.comments.length || 0})
              </h4>
              
              <div className="flex flex-col gap-3 max-h-52 overflow-y-auto mb-2">
                {existingTask?.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 text-xs">
                    <Avatar name={comment.userName} src={comment.userAvatar} size="xs" />
                    <div className="flex-1 bg-slate-100/60 dark:bg-zinc-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/20">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 dark:text-zinc-100">{comment.userName}</span>
                        <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 dark:text-zinc-300 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Post a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePostComment();
                    }
                  }}
                  className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <Button type="button" variant="secondary" onClick={handlePostComment} size="sm">
                  Post
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Settings Panel */}
        <div className="flex flex-col gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-zinc-900/20 border border-slate-200/50 dark:border-zinc-800/40 text-left">
          <Select
            label="Column Status"
            value={columnId}
            onChange={(e) => {
              setColumnId(e.target.value);
              if (taskId) updateTaskMutation.mutate({ id: taskId, updates: { columnId: e.target.value } });
            }}
            options={statusOptions}
          />

          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value as TaskPriority);
              if (taskId) updateTaskMutation.mutate({ id: taskId, updates: { priority: e.target.value as TaskPriority } });
            }}
            options={priorityOptions}
          />

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              if (taskId) updateTaskMutation.mutate({ id: taskId, updates: { dueDate: e.target.value } });
            }}
            leftIcon={<Calendar className="h-4 w-4 text-slate-400" />}
          />

          <Select
            label="Assignee"
            value={assigneeId}
            onChange={(e) => {
              setAssigneeId(e.target.value);
              if (taskId) updateTaskMutation.mutate({ id: taskId, updates: { assigneeId: e.target.value } });
            }}
            options={[{ value: '', label: 'Unassigned' }, ...assigneeOptions]}
          />

          {/* Tags Manager */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Tags
            </label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                >
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-rose-500 cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Press Enter to add tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full px-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          {/* Attachments Section */}
          {taskId && (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <Paperclip className="h-3.5 w-3.5" /> Attachments
              </h4>
              <div className="flex flex-col gap-1.5">
                {existingTask?.attachments.map(att => (
                  <div key={att.id} className="flex justify-between items-center p-1.5 bg-slate-100/40 dark:bg-zinc-900/30 rounded-lg text-xs border border-slate-200/20">
                    <span className="truncate max-w-[130px] font-medium text-slate-700 dark:text-zinc-300">{att.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{att.size}</span>
                  </div>
                ))}
                
                {/* Mock Upload trigger */}
                <button
                  type="button"
                  onClick={() => showToast('Mock File uploading trigger', 'info')}
                  className="w-full p-2 border border-dashed border-slate-300 dark:border-zinc-800 hover:border-indigo-500 rounded-xl text-center text-xs text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
                >
                  + Upload File (Mock)
                </button>
              </div>
            </div>
          )}

          {/* Dialog Footer Actions */}
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
            <Button type="submit" variant="primary" className="justify-center">
              {taskId ? 'Save Changes' : 'Create Task'}
            </Button>
            {taskId && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                className="justify-center"
              >
                Delete Task
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
