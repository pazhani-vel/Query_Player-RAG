import React from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { SourceCard } from './SourceCard';
import { BookOpen, Files, Database, HelpCircle } from 'lucide-react';
import { formatFileSize } from '../utils/formatters';

export const SourcePanel: React.FC = () => {
  const { chatHistory, documents } = useWorkspace();

  // Extract the latest assistant message sources
  const assistantMessages = chatHistory.filter((m) => m.role === 'assistant');
  const latestMessage = assistantMessages[assistantMessages.length - 1];
  const latestSources = latestMessage?.sources || [];

  // Calculate workspace stats
  const uploadedDocs = documents.filter((d) => d.status === 'success');
  const totalSize = uploadedDocs.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="flex flex-col h-full bg-zinc-50/30 dark:bg-zinc-950/20 border-l border-zinc-150 dark:border-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-150 dark:border-zinc-900 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md shrink-0">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-zinc-650 dark:text-zinc-400" />
          <span>Sources &amp; Workspace</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Section 1: Latest Citations */}
        <div className="space-y-3">
          <div className="flex items-center space-x-1.5 px-1">
            <span className="text-[10.5px] font-semibold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
              Referenced Citations
            </span>
          </div>

          {latestSources.length > 0 ? (
            <div className="space-y-2">
              {latestSources.map((source, idx) => (
                <SourceCard key={idx} source={source} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/20 dark:bg-zinc-900/5">
              <HelpCircle className="w-6 h-6 text-zinc-400 dark:text-zinc-650 mb-1.5 animate-pulse" />
              <p className="text-[11.5px] font-semibold text-zinc-650 dark:text-zinc-400">No references loaded</p>
              <p className="text-[9.5px] text-zinc-450 mt-0.5 max-w-[180px]">
                Ask questions to generate answer citations
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Referenced Pages Overview */}
        <div className="space-y-3">
          <div className="flex items-center space-x-1.5 px-1">
            <Files className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-550" />
            <span className="text-[10.5px] font-semibold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
              Workspace Overview
            </span>
          </div>

          {uploadedDocs.length > 0 ? (
            <div className="divide-y divide-zinc-150 dark:divide-zinc-900 border border-zinc-150 dark:border-zinc-900 bg-white/40 dark:bg-zinc-900/10 rounded-xl overflow-hidden shadow-sm">
              {uploadedDocs.map((doc) => (
                <div key={doc.id} className="p-3 flex items-center justify-between text-xs hover:bg-white/60 dark:hover:bg-zinc-900/20 transition-colors">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-zinc-850 dark:text-zinc-200 truncate" title={doc.name}>
                      {doc.name}
                    </p>
                    <p className="text-[9px] text-zinc-450 mt-0.5">
                      Type: PDF • Size: {formatFileSize(doc.size)}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 rounded-md">
                    Ready
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-zinc-450 italic px-1">
              No files active in current workspace.
            </p>
          )}
        </div>

        {/* Section 3: Workspace Metadata */}
        <div className="space-y-3">
          <div className="flex items-center space-x-1.5 px-1">
            <Database className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-550" />
            <span className="text-[10.5px] font-semibold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
              Workspace Info
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-white/40 dark:bg-zinc-900/15 border border-zinc-150 dark:border-zinc-900 rounded-xl flex flex-col space-y-0.5 shadow-sm">
              <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500">Indexed Files</span>
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-250">
                {uploadedDocs.length}
              </span>
            </div>
            <div className="p-3 bg-white/40 dark:bg-zinc-900/15 border border-zinc-150 dark:border-zinc-900 rounded-xl flex flex-col space-y-0.5 shadow-sm">
              <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500">Storage Size</span>
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-250">
                {formatFileSize(totalSize)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SourcePanel;
