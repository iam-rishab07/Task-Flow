import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, KanbanSquare } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50 dark:bg-zinc-950 overflow-hidden transition-colors duration-200">
      {/* Premium Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-600/5 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[100px] dark:bg-violet-600/5 pointer-events-none" />

      {/* Floating Theme Toggle (Auth Pages) */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/50 backdrop-blur-md text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm cursor-pointer"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      <div className="max-w-md w-full flex flex-col items-center gap-8 relative z-5">
        {/* App Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
            <KanbanSquare className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold font-display tracking-tight text-slate-800 dark:text-zinc-50">
            TaskFlow
          </span>
        </div>

        {/* Auth Content Card */}
        <div className="w-full glass-panel rounded-2xl shadow-xl p-8 flex flex-col gap-6">
          {children}
        </div>
        
        {/* App Footer */}
        <span className="text-xs text-slate-400 dark:text-zinc-500">
          Secure, production-grade workspaces. &copy; {new Date().getFullYear()} TaskFlow Inc.
        </span>
      </div>
    </div>
  );
};
