import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockDb } from '../services/mockDb';
import { useUiStore } from '../store/uiStore';
import { Button } from '../components/Button';
import { TaskModal } from './TaskModal';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Badge } from '../components/Badge';

export const Calendar: React.FC = () => {
  const { activeWorkspaceId, isTaskModalOpen, setTaskModalOpen, selectedTaskId, setSelectedTaskId } = useUiStore();
  
  // Track currently viewed month/year in calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', activeWorkspaceId],
    queryFn: () => mockDb.getTasksByWorkspace(activeWorkspaceId),
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculations for calendar cells
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Tasks with due dates mapped to calendar cells
  const getTasksForDate = (day: number) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === currentMonth &&
        taskDate.getFullYear() === currentYear
      );
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleCellClick = (_day: number) => {
    setSelectedTaskId(null);
    setTaskModalOpen(true);
  };

  const handleTaskClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setSelectedTaskId(taskId);
    setTaskModalOpen(true);
  };

  // Render calendar grid days
  const renderCells = () => {
    const cells = [];
    // Render blank cells for offset
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="min-h-[100px] border border-slate-100 dark:border-zinc-800 bg-slate-100/20 dark:bg-zinc-900/10"
        />
      );
    }

    // Render month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTasks = getTasksForDate(day);
      const isToday =
        day === new Date().getDate() &&
        currentMonth === new Date().getMonth() &&
        currentYear === new Date().getFullYear();

      cells.push(
        <div
          key={`day-${day}`}
          onClick={() => handleCellClick(day)}
          className={`min-h-[100px] p-2 border border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/35 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors flex flex-col gap-1 cursor-pointer text-left ${
            isToday ? 'ring-2 ring-indigo-500/20 bg-indigo-50/10' : ''
          }`}
        >
          <div className="flex justify-between items-center shrink-0">
            <span
              className={`text-xs font-bold leading-none flex items-center justify-center h-6 w-6 rounded-full ${
                isToday
                  ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                  : 'text-slate-500 dark:text-zinc-400'
              }`}
            >
              {day}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[80px]">
            {dayTasks.map((task) => {
              const priorityColors = {
                low: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
                medium: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
                high: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
                urgent: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
              };
              return (
                <div
                  key={task.id}
                  onClick={(e) => handleTaskClick(e, task.id)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border truncate ${
                    priorityColors[task.priority]
                  } hover:scale-[1.02] transition-transform`}
                  title={task.title}
                >
                  {task.title}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return cells;
  };

  // Find upcoming deadlines within next 7 days
  const upcomingDeadlines = tasks
    .filter((t) => {
      if (!t.dueDate || t.columnId === 'done') return false;
      const due = new Date(t.dueDate).getTime();
      const diff = due - Date.now();
      return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  return (
    <div className="p-6 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full h-full text-left">
      {/* Main Calendar Viewport */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Calendar Nav Toolbar */}
        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold font-display text-slate-800 dark:text-zinc-50">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <Button
              variant="secondary"
              onClick={() => setCurrentDate(new Date())}
              size="sm"
            >
              Today
            </Button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Month grid layout */}
        <div className="border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
          {/* Days of week header */}
          <div className="grid grid-cols-7 bg-slate-100/60 dark:bg-zinc-900/20 border-b border-slate-200 dark:border-zinc-800/80 py-2.5">
            {daysOfWeek.map((day) => (
              <span
                key={day}
                className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 text-center"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Grid cells */}
          <div className="grid grid-cols-7 bg-slate-50/50 dark:bg-zinc-950/20">
            {renderCells()}
          </div>
        </div>
      </div>

      {/* Deadlines sidebar Panel */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
        <div className="glass-panel p-5 rounded-2xl shadow-sm">
          <h3 className="text-md font-bold font-display text-slate-800 dark:text-zinc-100 flex items-center gap-1.5 mb-4 pb-2 border-b border-slate-100 dark:border-zinc-800/80">
            <Clock className="h-4.5 w-4.5 text-rose-500" /> Upcoming Deadlines
          </h3>

          <div className="flex flex-col gap-3">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No active deadlines due in the next 7 days.
              </p>
            ) : (
              upcomingDeadlines.map((task) => (
                <div
                  key={task.id}
                  onClick={(e) => handleTaskClick(e, task.id)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/20 hover:border-indigo-500 transition-all cursor-pointer flex flex-col gap-1.5"
                >
                  <div className="flex justify-between items-center">
                    <Badge variant={task.priority === 'urgent' ? 'urgent' : 'high'}>
                      {task.priority}
                    </Badge>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                      {task.dueDate}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-zinc-100 truncate">
                    {task.title}
                  </h4>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Modal Editor container */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        taskId={selectedTaskId}
      />
    </div>
  );
};
export default Calendar;
