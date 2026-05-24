import { create } from 'zustand';
import type { User } from '../types';
import { mockDb, delay } from '../services/mockDb';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string, email: string, avatarUrl?: string) => Promise<void>;
  checkSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkSession: () => {
    // Check if session token exists in non-js readable format, for mock we read from mockDb
    const sessionExists = localStorage.getItem('tf_session_active') === 'true';
    if (sessionExists) {
      const currentUser = mockDb.getCurrentUser();
      set({ user: currentUser, isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    await delay(800); // Simulate API latency
    
    // Simple validation
    if (!email || !password || password.length < 8) {
      set({ isLoading: false });
      return false;
    }
    
    // TODO(security): In production, session tokens must be issued by a backend via secure HttpOnly cookies.
    // We are simulating authentication success here.
    localStorage.setItem('tf_session_active', 'true');
    const currentUser = mockDb.loginUser(email);
    set({ user: currentUser, isAuthenticated: true, isLoading: false });
    return true;
  },

  signup: async (name, email, password) => {
    set({ isLoading: true });
    await delay(1000);
    
    if (!name || !email || !password || password.length < 8) {
      set({ isLoading: false });
      return false;
    }

    // TODO(security): Use Argon2/bcrypt on the server to hash passwords. Never transmit or store plain text passwords.
    localStorage.setItem('tf_session_active', 'true');
    const currentUser = mockDb.registerUser(name, email);
    set({ user: currentUser, isAuthenticated: true, isLoading: false });
    return true;
  },

  logout: () => {
    // TODO(security): Invalidate session on the backend.
    localStorage.removeItem('tf_session_active');
    localStorage.removeItem('tf_current_user_id');
    
    // Clear client-side memory states
    set({ user: null, isAuthenticated: false });
    
    // Clear caches and redirect to prevent local state leaking
    window.location.href = '/login';
  },

  updateProfile: async (name, email, avatarUrl) => {
    set({ isLoading: true });
    await delay(500);
    const updatedUser = mockDb.updateCurrentUserProfile(name, email, avatarUrl);
    set({ user: updatedUser, isLoading: false });
  },
}));
