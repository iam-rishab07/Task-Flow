import { create } from 'zustand';
import { mockDb } from '../services/mockDb';

interface UiState {
  activeWorkspaceId: string;
  sidebarCollapsed: boolean;
  searchQuery: string;
  priorityFilter: string;
  assigneeFilter: string;
  selectedTaskId: string | null;
  isTaskModalOpen: boolean;
  isInviteModalOpen: boolean;
  isWorkspaceModalOpen: boolean;
  
  // Actions
  setActiveWorkspaceId: (id: string) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setPriorityFilter: (priority: string) => void;
  setAssigneeFilter: (assignee: string) => void;
  setSelectedTaskId: (id: string | null) => void;
  setTaskModalOpen: (open: boolean) => void;
  setInviteModalOpen: (open: boolean) => void;
  setWorkspaceModalOpen: (open: boolean) => void;
  resetFilters: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeWorkspaceId: mockDb.getActiveWorkspaceId(),
  sidebarCollapsed: false,
  searchQuery: '',
  priorityFilter: 'all',
  assigneeFilter: 'all',
  selectedTaskId: null,
  isTaskModalOpen: false,
  isInviteModalOpen: false,
  isWorkspaceModalOpen: false,

  setActiveWorkspaceId: (id) => {
    mockDb.setActiveWorkspaceId(id);
    set({ activeWorkspaceId: id, searchQuery: '', priorityFilter: 'all', assigneeFilter: 'all' });
  },
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  setAssigneeFilter: (assignee) => set({ assigneeFilter: assignee }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setTaskModalOpen: (open) => set({ isTaskModalOpen: open }),
  setInviteModalOpen: (open) => set({ isInviteModalOpen: open }),
  setWorkspaceModalOpen: (open) => set({ isWorkspaceModalOpen: open }),
  resetFilters: () => set({ searchQuery: '', priorityFilter: 'all', assigneeFilter: 'all' }),
}));
