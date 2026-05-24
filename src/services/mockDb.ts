import type { Task, Column, Workspace, User, Notification, Activity, Comment } from '../types';

// Helper to delay execution (simulating network request latency)
export const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_USERS: Omit<User, 'activeWorkspaceId'>[] = [
  {
    id: 'user-me',
    name: 'John Doe',
    email: 'john.doe@taskflow.so',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.j@taskflow.so',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-david',
    name: 'David Chen',
    email: 'david.c@taskflow.so',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-emma',
    name: 'Emma Watson',
    email: 'emma.w@taskflow.so',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'Todo', color: '#6366f1' }, // Indigo
  { id: 'in-progress', title: 'In Progress', color: '#0ea5e9' }, // Sky
  { id: 'in-review', title: 'In Review', color: '#f59e0b' }, // Amber
  { id: 'done', title: 'Done', color: '#10b981' }, // Emerald
];

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: 'ws-acme',
    name: 'Acme Product Team',
    slug: 'acme-product',
    description: 'Main product team workspace for Acme SaaS applications development.',
    members: [
      { userId: 'user-me', name: 'John Doe', email: 'john.doe@taskflow.so', avatarUrl: DEFAULT_USERS[0].avatarUrl, role: 'owner' },
      { userId: 'user-sarah', name: 'Sarah Jenkins', email: 'sarah.j@taskflow.so', avatarUrl: DEFAULT_USERS[1].avatarUrl, role: 'admin' },
      { userId: 'user-david', name: 'David Chen', email: 'david.c@taskflow.so', avatarUrl: DEFAULT_USERS[2].avatarUrl, role: 'member' },
      { userId: 'user-emma', name: 'Emma Watson', email: 'emma.w@taskflow.so', avatarUrl: DEFAULT_USERS[3].avatarUrl, role: 'viewer' },
    ],
  },
  {
    id: 'ws-personal',
    name: 'Personal Space',
    slug: 'personal-space',
    description: 'Personal task flow dashboard, side projects, and study tracking.',
    members: [
      { userId: 'user-me', name: 'John Doe', email: 'john.doe@taskflow.so', avatarUrl: DEFAULT_USERS[0].avatarUrl, role: 'owner' },
    ],
  },
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Design System & Glassmorphism Theme',
    description: 'Create a premium visual identity inspired by Linear and Notion. Implement customizable light and dark modes with glassmorphic cards and soft glowing borders.',
    columnId: 'done',
    priority: 'high',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assigneeId: 'user-me',
    workspaceId: 'ws-acme',
    subtasks: [
      { id: 'sub-1-1', title: 'Choose HSL typography & spacing system', completed: true },
      { id: 'sub-1-2', title: 'Design sidebar & header layouts', completed: true },
      { id: 'sub-1-3', title: 'Add dark/light theme context classes', completed: true },
    ],
    tags: ['design', 'fe-core'],
    comments: [
      {
        id: 'c-1',
        userId: 'user-sarah',
        userName: 'Sarah Jenkins',
        userAvatar: DEFAULT_USERS[1].avatarUrl,
        content: 'This theme looks absolutely stunning. The dark mode feels incredibly premium!',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    attachments: [
      { id: 'att-1', name: 'dribbble-shot.png', size: '1.2 MB', url: '#' }
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Integrate Zustand State Managers',
    description: 'Implement a highly performant and scalable global state store using Zustand. Set up active workspace, tasks mapping, notifications count, and session storage sync.',
    columnId: 'in-progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assigneeId: 'user-me',
    workspaceId: 'ws-acme',
    subtasks: [
      { id: 'sub-2-1', title: 'Define TaskStore actions & mutators', completed: true },
      { id: 'sub-2-2', title: 'Hook state with React Query API calls', completed: false },
      { id: 'sub-2-3', title: 'Optimize task list rendering paths', completed: false },
    ],
    tags: ['state', 'zustand'],
    comments: [
      {
        id: 'c-2',
        userId: 'user-david',
        userName: 'David Chen',
        userAvatar: DEFAULT_USERS[2].avatarUrl,
        content: 'Make sure we persist the current workspace selection so it reloads correctly.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    attachments: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-3',
    title: 'DnD Board Drag & Drop Layout',
    description: 'Use @dnd-kit/core and @dnd-kit/sortable to create smooth, interactive drag-and-drop transitions for column and card shifting. Add keyboard accessibility options.',
    columnId: 'todo',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assigneeId: 'user-david',
    workspaceId: 'ws-acme',
    subtasks: [
      { id: 'sub-3-1', title: 'Set up DndContext, Sensors and Overlays', completed: false },
      { id: 'sub-3-2', title: 'Handle multi-column item transfer logic', completed: false },
      { id: 'sub-3-3', title: 'Add keyboard navigation handlers', completed: false },
    ],
    tags: ['dnd-kit', 'accessibility'],
    comments: [],
    attachments: [],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Analytics Charts & Reporting Integration',
    description: 'Implement a comprehensive analytics dashboard displaying team performance, weekly completions, task priorities, and velocity metrics using Recharts.',
    columnId: 'in-review',
    priority: 'medium',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assigneeId: 'user-sarah',
    workspaceId: 'ws-acme',
    subtasks: [
      { id: 'sub-4-1', title: 'Format task distribution datasets', completed: true },
      { id: 'sub-4-2', title: 'Create Weekly Velocity LineChart', completed: true },
      { id: 'sub-4-3', title: 'Build Priority Distribution PieChart', completed: false },
    ],
    tags: ['analytics', 'charts'],
    comments: [
      {
        id: 'c-3',
        userId: 'user-me',
        userName: 'John Doe',
        userAvatar: DEFAULT_USERS[0].avatarUrl,
        content: 'I will finish the priority chart by this evening. Recharts is set up.',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
    ],
    attachments: [],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-5',
    title: 'Calendar Views & Deadlines Manager',
    description: 'Implement a monthly view of tasks using a custom calendar grid. Allow users to visualize due dates, reschedule tasks by drag-and-drop, and create quick tasks.',
    columnId: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assigneeId: 'user-emma',
    workspaceId: 'ws-acme',
    subtasks: [
      { id: 'sub-5-1', title: 'Build custom Month Grid calendar component', completed: false },
      { id: 'sub-5-2', title: 'Map task due dates to calendar cells', completed: false },
    ],
    tags: ['calendar', 'scheduling'],
    comments: [],
    attachments: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-6',
    title: 'Draft Project Specs',
    description: 'Write down all technical scope documents and feature checklists for client onboarding.',
    columnId: 'done',
    priority: 'low',
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assigneeId: 'user-emma',
    workspaceId: 'ws-acme',
    subtasks: [],
    tags: ['docs'],
    comments: [],
    attachments: [],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Personal workspace task
  {
    id: 'task-p1',
    title: 'Study System Design & Scaling',
    description: 'Read Whitepapers on CDN architectures, horizontal database partitioning, and rate limiters.',
    columnId: 'in-progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assigneeId: 'user-me',
    workspaceId: 'ws-personal',
    subtasks: [
      { id: 'sub-p1', title: 'Review DynamoDB write scaling models', completed: true },
      { id: 'sub-p2', title: 'Sketch consistent hashing rings', completed: false },
    ],
    tags: ['study'],
    comments: [],
    attachments: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Mentioned in Design System',
    message: 'Sarah Jenkins commented on "Design System & Glassmorphism Theme"',
    type: 'mention',
    read: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    taskId: 'task-1',
  },
  {
    id: 'notif-2',
    title: 'Task Assigned',
    message: 'Sarah Jenkins assigned you to "Integrate Zustand State Managers"',
    type: 'assignment',
    read: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    taskId: 'task-2',
  },
  {
    id: 'notif-3',
    title: 'Task In Review',
    message: 'David Chen pushed "Analytics Charts & Reporting Integration" to In Review',
    type: 'update',
    read: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    taskId: 'task-4',
  },
];

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    userId: 'user-me',
    userName: 'John Doe',
    userAvatar: DEFAULT_USERS[0].avatarUrl,
    action: 'moved to Done',
    taskTitle: 'Design System & Glassmorphism Theme',
    taskId: 'task-1',
    workspaceId: 'ws-acme',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-2',
    userId: 'user-sarah',
    userName: 'Sarah Jenkins',
    userAvatar: DEFAULT_USERS[1].avatarUrl,
    action: 'commented on',
    taskTitle: 'Design System & Glassmorphism Theme',
    taskId: 'task-1',
    workspaceId: 'ws-acme',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-3',
    userId: 'user-me',
    userName: 'John Doe',
    userAvatar: DEFAULT_USERS[0].avatarUrl,
    action: 'started working on',
    taskTitle: 'Integrate Zustand State Managers',
    taskId: 'task-2',
    workspaceId: 'ws-acme',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-4',
    userId: 'user-david',
    userName: 'David Chen',
    userAvatar: DEFAULT_USERS[2].avatarUrl,
    action: 'created task',
    taskTitle: 'Calendar Views & Deadlines Manager',
    taskId: 'task-5',
    workspaceId: 'ws-acme',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper to initialize and retrieve localStorage items
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const mockDb = {
  getUsers: (): User[] => {
    const rawUsers = getStorageItem<Omit<User, 'activeWorkspaceId'>[]>('tf_users', DEFAULT_USERS);
    const activeWorkspace = mockDb.getActiveWorkspaceId();
    return rawUsers.map(u => ({ ...u, activeWorkspaceId: activeWorkspace }));
  },

  getCurrentUser: (): User => {
    const users = mockDb.getUsers();
    const currentUserId = localStorage.getItem('tf_current_user_id') || 'user-me';
    const user = users.find(u => u.id === currentUserId);
    if (user) {
      return user;
    }
    // Fallback to John Doe
    const fallbackUser = users.find(u => u.id === 'user-me') || {
      id: 'user-me',
      name: 'John Doe',
      email: 'john.doe@taskflow.so',
      avatarUrl: DEFAULT_USERS[0].avatarUrl,
      activeWorkspaceId: 'ws-acme',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    return { ...fallbackUser, activeWorkspaceId: mockDb.getActiveWorkspaceId() };
  },

  updateCurrentUserProfile: (name: string, email: string, avatarUrl?: string): User => {
    const rawUsers = getStorageItem<Omit<User, 'activeWorkspaceId'>[]>('tf_users', DEFAULT_USERS);
    const currentUserId = localStorage.getItem('tf_current_user_id') || 'user-me';
    const updated = rawUsers.map(u => u.id === currentUserId ? { ...u, name, email, avatarUrl: avatarUrl || u.avatarUrl } : u);
    setStorageItem('tf_users', updated);
    return mockDb.getCurrentUser();
  },

  registerUser: (name: string, email: string): User => {
    const rawUsers = getStorageItem<Omit<User, 'activeWorkspaceId'>[]>('tf_users', DEFAULT_USERS);
    
    // Check if user already exists
    const existingUser = rawUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      localStorage.setItem('tf_current_user_id', existingUser.id);
      return mockDb.getCurrentUser();
    }
    
    const id = 'user-' + Math.random().toString(36).substring(2, 9);
    const avatarUrl = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 99999)}?w=100&h=100&fit=crop&crop=faces`;
    
    const newUser: Omit<User, 'activeWorkspaceId'> = {
      id,
      name,
      email,
      avatarUrl,
      createdAt: new Date().toISOString(),
    };
    
    rawUsers.push(newUser);
    setStorageItem('tf_users', rawUsers);
    localStorage.setItem('tf_current_user_id', id);
    
    // Add to workspaces
    const workspaces = mockDb.getWorkspaces();
    
    // 1. Add to Acme Product Team
    const acmeWorkspace = workspaces.find(w => w.id === 'ws-acme');
    if (acmeWorkspace) {
      const alreadyMember = acmeWorkspace.members.some(m => m.userId === id);
      if (!alreadyMember) {
        acmeWorkspace.members.push({
          userId: id,
          name,
          email,
          avatarUrl,
          role: 'member'
        });
      }
    }
    
    // 2. Create a personal workspace for them
    const personalWorkspaceId = 'ws-personal-' + id;
    const personalWorkspace: Workspace = {
      id: personalWorkspaceId,
      name: `${name}'s Space`,
      slug: `personal-${id}`,
      description: 'Personal task flow dashboard, side projects, and study tracking.',
      members: [
        { userId: id, name, email, avatarUrl, role: 'owner' }
      ]
    };
    workspaces.push(personalWorkspace);
    
    setStorageItem('tf_workspaces', workspaces);
    localStorage.setItem('tf_active_workspace_id', 'ws-acme');
    
    return mockDb.getCurrentUser();
  },

  loginUser: (email: string): User => {
    const rawUsers = getStorageItem<Omit<User, 'activeWorkspaceId'>[]>('tf_users', DEFAULT_USERS);
    const existingUser = rawUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!existingUser) {
      // If user does not exist, let's auto-register them using their email prefix as name
      const namePrefix = email.split('@')[0];
      const name = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1).replace('.', ' ');
      return mockDb.registerUser(name, email);
    }
    
    localStorage.setItem('tf_current_user_id', existingUser.id);
    
    // Find if the workspace is set or if they are in Acme Product Team
    const workspaces = mockDb.getWorkspaces();
    const userWorkspace = workspaces.find(w => w.members.some(m => m.userId === existingUser.id));
    if (userWorkspace) {
      localStorage.setItem('tf_active_workspace_id', userWorkspace.id);
    } else {
      // Add them to ws-acme
      const acmeWorkspace = workspaces.find(w => w.id === 'ws-acme');
      if (acmeWorkspace) {
        acmeWorkspace.members.push({
          userId: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          avatarUrl: existingUser.avatarUrl,
          role: 'member'
        });
        setStorageItem('tf_workspaces', workspaces);
      }
      localStorage.setItem('tf_active_workspace_id', 'ws-acme');
    }
    
    return mockDb.getCurrentUser();
  },

  getWorkspaces: (): Workspace[] => {
    return getStorageItem<Workspace[]>('tf_workspaces', DEFAULT_WORKSPACES);
  },

  getActiveWorkspaceId: (): string => {
    const id = localStorage.getItem('tf_active_workspace_id');
    if (!id) {
      localStorage.setItem('tf_active_workspace_id', 'ws-acme');
      return 'ws-acme';
    }
    return id;
  },

  setActiveWorkspaceId: (id: string): void => {
    localStorage.setItem('tf_active_workspace_id', id);
  },

  createWorkspace: (name: string, description?: string): Workspace => {
    const workspaces = mockDb.getWorkspaces();
    const id = 'ws-' + Math.random().toString(36).substring(2, 9);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const currentUser = mockDb.getCurrentUser();
    const newWorkspace: Workspace = {
      id,
      name,
      slug,
      description,
      members: [
        { userId: currentUser.id, name: currentUser.name, email: currentUser.email, avatarUrl: currentUser.avatarUrl, role: 'owner' }
      ]
    };
    workspaces.push(newWorkspace);
    setStorageItem('tf_workspaces', workspaces);
    return newWorkspace;
  },

  inviteMember: (workspaceId: string, email: string, role: 'admin' | 'member' | 'viewer'): Workspace => {
    const workspaces = mockDb.getWorkspaces();
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    const name = email.split('@')[0].replace('.', ' ');
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    // Add custom avatar placeholder
    const avatarUrl = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 99999)}?w=100&h=100&fit=crop&crop=faces`;
    const newMember = {
      userId: 'user-' + Math.random().toString(36).substring(2, 9),
      name: formattedName,
      email,
      avatarUrl,
      role
    };
    workspace.members.push(newMember);
    setStorageItem('tf_workspaces', workspaces);
    return workspace;
  },

  removeMember: (workspaceId: string, userId: string): Workspace => {
    const workspaces = mockDb.getWorkspaces();
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) throw new Error('Workspace not found');
    workspace.members = workspace.members.filter(m => m.userId !== userId);
    setStorageItem('tf_workspaces', workspaces);
    return workspace;
  },

  changeMemberRole: (workspaceId: string, userId: string, role: 'admin' | 'member' | 'viewer' | 'owner'): Workspace => {
    const workspaces = mockDb.getWorkspaces();
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) throw new Error('Workspace not found');
    const member = workspace.members.find(m => m.userId === userId);
    if (member) {
      member.role = role as any;
    }
    setStorageItem('tf_workspaces', workspaces);
    return workspace;
  },

  getTasks: (): Task[] => {
    return getStorageItem<Task[]>('tf_tasks', DEFAULT_TASKS);
  },

  getTasksByWorkspace: (workspaceId: string): Task[] => {
    const tasks = mockDb.getTasks();
    return tasks.filter(t => t.workspaceId === workspaceId);
  },

  getColumns: (): Column[] => {
    return DEFAULT_COLUMNS;
  },

  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments'>): Task => {
    const tasks = mockDb.getTasks();
    const newTask: Task = {
      ...taskData,
      id: 'task-' + Math.random().toString(36).substring(2, 9),
      comments: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    setStorageItem('tf_tasks', tasks);

    // Log Activity
    const currentUser = mockDb.getCurrentUser();
    mockDb.logActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      action: 'created task',
      taskTitle: newTask.title,
      taskId: newTask.id,
      workspaceId: newTask.workspaceId,
    });

    return newTask;
  },

  updateTask: (taskId: string, updates: Partial<Task>): Task => {
    const tasks = mockDb.getTasks();
    let updatedTask: Task | null = null;
    const currentUser = mockDb.getCurrentUser();
    
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        // Track status movements
        if (updates.columnId && updates.columnId !== t.columnId) {
          const toCol = DEFAULT_COLUMNS.find(c => c.id === updates.columnId)?.title || updates.columnId;
          mockDb.logActivity({
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatarUrl,
            action: `moved to ${toCol}`,
            taskTitle: t.title,
            taskId: t.id,
            workspaceId: t.workspaceId,
          });
        }
        updatedTask = {
          ...t,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        return updatedTask;
      }
      return t;
    });

    if (!updatedTask) throw new Error('Task not found');
    
    setStorageItem('tf_tasks', updatedTasks);
    return updatedTask;
  },

  deleteTask: (taskId: string): void => {
    const tasks = mockDb.getTasks();
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;
    
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    setStorageItem('tf_tasks', filteredTasks);

    // Log Activity
    const currentUser = mockDb.getCurrentUser();
    mockDb.logActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      action: 'deleted task',
      taskTitle: taskToDelete.title,
      taskId: taskToDelete.id,
      workspaceId: taskToDelete.workspaceId,
    });
  },

  addComment: (taskId: string, content: string): Comment => {
    const tasks = mockDb.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const currentUser = mockDb.getCurrentUser();
    const comment: Comment = {
      id: 'c-' + Math.random().toString(36).substring(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      content,
      createdAt: new Date().toISOString(),
    };

    task.comments.push(comment);
    setStorageItem('tf_tasks', tasks);

    mockDb.logActivity({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      action: 'commented on',
      taskTitle: task.title,
      taskId: task.id,
      workspaceId: task.workspaceId,
    });

    return comment;
  },

  getNotifications: (): Notification[] => {
    return getStorageItem<Notification[]>('tf_notifications', DEFAULT_NOTIFICATIONS);
  },

  markNotificationRead: (id: string): void => {
    const notifications = mockDb.getNotifications();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setStorageItem('tf_notifications', updated);
  },

  markAllNotificationsRead: (): void => {
    const notifications = mockDb.getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    setStorageItem('tf_notifications', updated);
  },

  getActivities: (workspaceId: string): Activity[] => {
    const activities = getStorageItem<Activity[]>('tf_activities', DEFAULT_ACTIVITIES);
    return activities.filter(a => a.workspaceId === workspaceId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  logActivity: (activityData: Omit<Activity, 'id' | 'createdAt'>): Activity => {
    const activities = getStorageItem<Activity[]>('tf_activities', DEFAULT_ACTIVITIES);
    const newActivity: Activity = {
      ...activityData,
      id: 'act-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    activities.unshift(newActivity);
    setStorageItem('tf_activities', activities);
    return newActivity;
  },
};
