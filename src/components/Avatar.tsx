import React from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className = '',
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Deterministic bg color based on name
  const getBgColor = (name: string) => {
    const colors = [
      'bg-indigo-500 text-white',
      'bg-emerald-500 text-white',
      'bg-rose-500 text-white',
      'bg-amber-500 text-white',
      'bg-sky-500 text-white',
      'bg-violet-500 text-white',
      'bg-teal-500 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden select-none border border-slate-200/20 dark:border-zinc-800/30 ${
        sizes[size]
      } ${!src ? getBgColor(name) : ''} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Remove image tag if loading error occurs so it falls back to initials
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <span className="font-semibold tracking-wider font-display">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};
