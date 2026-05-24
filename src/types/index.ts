export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  columnId: string;
  priority: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  workspaceId: string;
  subtasks: SubTask[];
  tags: string[];
  comments: Comment[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  color: string;
}

export type UserWorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface WorkspaceMember {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserWorkspaceRole;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  members: WorkspaceMember[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  activeWorkspaceId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'mention' | 'assignment' | 'update' | 'alert';
  read: boolean;
  createdAt: string;
  taskId?: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  taskTitle: string;
  taskId: string;
  workspaceId: string;
  createdAt: string;
}
