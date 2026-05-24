import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDb } from '../services/mockDb';
import { useUiStore } from '../store/uiStore';
import { useToast } from '../contexts/ToastContext';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { BoardColumnSkeleton } from '../components/Skeleton';
import { Plus, Search, Filter, XCircle } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, Workspace, WorkspaceMember } from '../types';

export const KanbanBoard: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const {
    activeWorkspaceId,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    assigneeFilter,
    setAssigneeFilter,
    selectedTaskId,
    setSelectedTaskId,
    isTaskModalOpen,
    setTaskModalOpen,
    resetFilters
  } = useUiStore();

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Configure sensors for drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag begins only after dragging 8px to avoid hijacking click
      },
    })
  );

  // Fetch workspaces list
  const { data: workspaces = [] } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: mockDb.getWorkspaces
  });
  const currentWorkspace = workspaces.find((w: Workspace) => w.id === activeWorkspaceId);

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', activeWorkspaceId],
    queryFn: () => mockDb.getTasksByWorkspace(activeWorkspaceId),
  });

  // Columns layout
  const columns = mockDb.getColumns();

  // Mutations
  const updateTaskMutation = useMutation({
    mutationFn: async (payload: { id: string; updates: Partial<Task> }) => {
      return mockDb.updateTask(payload.id, payload.updates);
    },
    onMutate: async (newDrag) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['tasks', activeWorkspaceId] });

      // Snapshot the previous state
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', activeWorkspaceId]);

      // Optimistically update cache
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ['tasks', activeWorkspaceId],
          previousTasks.map(t => t.id === newDrag.id ? { ...t, ...newDrag.updates } : t)
        );
      }

      return { previousTasks };
    },
    onError: (_err, _newDrag, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', activeWorkspaceId], context.previousTasks);
      }
      showToast('Failed to shift task status.', 'error');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['activities', activeWorkspaceId] });
    },
  });

  // Filter tasks based on search & selectors
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assigneeId === assigneeFilter;

    return matchesSearch && matchesPriority && matchesAssignee;
  });

  // Drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  // Drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const draggedTask = tasks.find((t) => t.id === activeId);
    if (!draggedTask) return;

    // Check if dragging over column directly
    const isColumn = columns.some((c) => c.id === overId);

    if (isColumn) {
      if (draggedTask.columnId !== overId) {
        updateTaskMutation.mutate({ id: activeId, updates: { columnId: overId } });
      }
    } else {
      // Dragging over another card
      const targetTask = tasks.find((t) => t.id === overId);
      if (targetTask && draggedTask.columnId !== targetTask.columnId) {
        updateTaskMutation.mutate({ id: activeId, updates: { columnId: targetTask.columnId } });
      }
    }
  };

  const activeDraggedTask = activeDragId ? tasks.find((t) => t.id === activeDragId) : null;

  // Active filters count
  const activeFiltersCount =
    (priorityFilter !== 'all' ? 1 : 0) +
    (assigneeFilter !== 'all' ? 1 : 0) +
    (searchQuery !== '' ? 1 : 0);

  return (
    <div className="p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full h-full overflow-hidden text-left">
      {/* Board Header Title & Controls */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-slate-800 dark:text-zinc-50">
            Kanban Board
          </h1>
          <p className="text-sm text-slate-400 dark:text-zinc-500">
            Drag cards between status columns to track progress
          </p>
        </div>
        
        <Button
          onClick={() => {
            setSelectedTaskId(null);
            setTaskModalOpen(true);
          }}
          className="flex items-center gap-1.5"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Filters Bar Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-4 rounded-2xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900/10 shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          {/* Priority dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-900/40 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-zinc-800/80">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs font-semibold text-slate-600 dark:text-zinc-300 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Assignee dropdown filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-900/40 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-zinc-800/80">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="text-xs font-semibold text-slate-600 dark:text-zinc-300 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Assignees</option>
              {currentWorkspace?.members.map((m: WorkspaceMember) => (
                <option key={m.userId} value={m.userId}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters action */}
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:text-rose-500 font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
            >
              <XCircle className="h-4.5 w-4.5" />
              <span>Clear filters ({activeFiltersCount})</span>
            </button>
          )}
        </div>

        {/* Board Search input */}
        <div className="relative flex items-center max-w-xs w-full">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Board Columns Viewport */}
      {tasksLoading ? (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          <BoardColumnSkeleton />
          <BoardColumnSkeleton />
          <BoardColumnSkeleton />
          <BoardColumnSkeleton />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex gap-6 overflow-x-auto pb-4 items-start scroll-smooth">
            {columns.map((column) => {
              const colTasks = filteredTasks.filter((t) => t.columnId === column.id);
              return (
                <div
                  key={column.id}
                  id={column.id}
                  className="flex flex-col gap-4 w-72 shrink-0 bg-slate-100/40 dark:bg-zinc-900/10 p-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800/40 max-h-[70vh] overflow-hidden"
                >
                  {/* Column Header */}
                  <div className="flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: column.color }}
                      />
                      <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                        {column.title}
                      </h3>
                      <Badge variant="outline" className="px-1.5 py-0">
                        {colTasks.length}
                      </Badge>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedTaskId(null);
                        setPriorityFilter('all');
                        setAssigneeFilter('all');
                        setSearchQuery('');
                        // Trigger add modal setting this column
                        setSelectedTaskId(null);
                        setTaskModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-lg hover:bg-slate-200/30 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    >
                      <Plus className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Task list container under Sortable context */}
                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
                    <SortableContext
                      items={colTasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {colTasks.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">No tasks here</p>
                        </div>
                      ) : (
                        colTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onClick={() => {
                              setSelectedTaskId(task.id);
                              setTaskModalOpen(true);
                            }}
                          />
                        ))
                      )}
                    </SortableContext>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Drag Overlay */}
          <DragOverlay>
            {activeDraggedTask ? (
              <TaskCard task={activeDraggedTask} onClick={() => {}} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Task Modal Editor container */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        taskId={selectedTaskId}
      />
    </div>
  );
};
export default KanbanBoard;
