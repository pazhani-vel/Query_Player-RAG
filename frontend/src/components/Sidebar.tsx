import React from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { UploadZone } from './UploadZone';
import { DocumentList } from './DocumentList';
import { Trash2, Library } from 'lucide-react';
import {dailyReset} from '../services/api'

export const Sidebar: React.FC = () => {
  const { clearWorkspace, documents, chatHistory } = useWorkspace();

  const hasData = documents.length > 0 || chatHistory.length > 0;

  return (
    <div className="flex flex-col h-full bg-zinc-55 bg-zinc-50/50 dark:bg-zinc-950/20 border-r border-zinc-150 dark:border-zinc-900 overflow-hidden">
      {/* Sidebar Header */}
      <div className="px-5 py-4 border-b border-zinc-150 dark:border-zinc-900 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-zinc-900 dark:bg-zinc-100 rounded-lg text-white dark:text-zinc-950 shadow-sm">
            <Library className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-extrabold text-zinc-900 font-sans leading-none flex items-center space-x-1">
              <span className='text-[20px] font-semibold text-zinc-400 white:text-zinc-550 mt-1 uppercase tracking-wider leading-none'>Query_Player</span>
            </h1>
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-550 mt-1 uppercase tracking-wider leading-none">
              RAG Workspace
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Upload Section */}
        <div className="space-y-2">
          <UploadZone />
        </div>

        {/* Documents Listing */}
        <div className="pt-2">
          <DocumentList />
        </div>
      </div>

      {/* Bottom Footer Panel with Actions */}
      {hasData && (
        <div className="p-4 border-t border-zinc-150 dark:border-zinc-900 bg-white/40 dark:bg-zinc-950/40 shrink-0">
          <button
            onClick={()=>{
              clearWorkspace();
              dailyReset();
            }}
            className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 bg-zinc-50 hover:bg-red-50 dark:bg-zinc-900/30 dark:hover:bg-red-955/15 border border-zinc-200 hover:border-red-200 dark:border-zinc-800 dark:hover:border-red-900/30 rounded-xl text-xs font-semibold text-zinc-650 hover:text-red-750 dark:text-zinc-400 dark:hover:text-red-300 transition-all cursor-pointer shadow-sm group"
          >
            <Trash2 className="w-3.5 h-3.5 group-hover:scale-105 transition-transform" />
            <span>Reset Workspace</span>
          </button>
        </div>
      )}
    </div>
  );
};
export default Sidebar;
