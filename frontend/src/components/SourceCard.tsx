import React from 'react';
import type { Source } from '../types';
import { FileText } from 'lucide-react';

interface SourceCardProps {
  source: Source;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {

  return (
    <div
      className="w-full text-left p-3 bg-white hover:bg-zinc-50 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/60 border border-zinc-150 hover:border-zinc-250 dark:border-zinc-800 dark:hover:border-zinc-700 rounded-xl transition-all cursor-pointer group flex flex-col space-y-1.5 shadow-sm"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2 min-w-0">
          <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-zinc-950 dark:group-hover:text-white" title={source.document}>
            {source.document}
          </span>
        </div>
        <span className="text-[9.5px] font-bold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-md shrink-0">
          Page {source.page}
        </span>
      </div>
      
      {source.text && (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-450 leading-relaxed line-clamp-3 italic">
          "{source.text}"
        </p>
      )}

      <div className="flex items-center justify-end w-full pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[9.5px] font-bold text-zinc-850 dark:text-zinc-300 inline-flex items-center space-x-0.5">
          Content picked...
        </span>
      </div>
    </div>
  );
};
export default SourceCard;
