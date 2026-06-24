import React from 'react';

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      className={`animate-spin text-zinc-500 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export const TypingLoader: React.FC = () => {
  return (
    <div className="flex items-center space-x-1.5 py-2 px-1">
      <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce" />
    </div>
  );
};

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-2.5 w-full animate-pulse py-2">
      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4" />
      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-11/12" />
      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-5/6" />
      <div className="h-3 bg-zinc-150 dark:bg-zinc-850 rounded-md w-1/2 pt-1" />
    </div>
  );
};
export default LoadingSpinner;
