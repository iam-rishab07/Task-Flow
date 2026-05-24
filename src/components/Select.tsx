import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 cursor-pointer ${
            error ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : ''
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-xs text-rose-500 font-medium leading-none">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
