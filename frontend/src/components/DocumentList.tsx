import React from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { FileText, Trash2, Eye, AlertTriangle, Loader2 } from 'lucide-react';
import { formatFileSize } from '../utils/formatters';

export const DocumentList: React.FC = () => {
  const { documents, removeDocument, openPDFViewer } = useWorkspace();

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/20">
        <FileText className="w-7 h-7 text-zinc-400 dark:text-zinc-650 mb-2 animate-pulse" />
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No documents uploaded</p>
        <p className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-0.5">Upload PDFs to start querying</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
          Workspace Files (Upload one by one)
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-full text-zinc-650 dark:text-zinc-450">
          {documents.length} / 10
        </span>
      </div>

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {documents.map((doc) => {
          const isUploading = doc.status === 'uploading';
          const isError = doc.status === 'error';
          const isSuccess = doc.status === 'success';

          return (
            <div
              key={doc.id}
              className={`group flex flex-col p-2.5 rounded-xl border transition-all ${
                isError
                  ? 'border-red-100 bg-red-50/20 dark:border-red-950/20 dark:bg-red-950/5'
                  : 'border-zinc-150 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/10 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    isError
                      ? 'bg-red-55/10 text-red-500 dark:bg-red-950/30'
                      : isUploading
                      ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800/80 animate-pulse'
                      : 'bg-zinc-100 text-zinc-650 dark:bg-zinc-800/80 dark:text-zinc-400'
                  }`}>
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isError ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-tight" title={doc.name}>
                      {doc.name}
                    </p>
                    <p className="text-[9.5px] text-zinc-450 dark:text-zinc-500 mt-0.5">
                      {formatFileSize(doc.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-0.5 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="p-1 text-zinc-400 hover:text-red-650 dark:text-zinc-450 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                    title="Remove Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {isUploading && (
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-zinc-900 dark:bg-zinc-100 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${doc.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
                    <span>Uploading...</span>
                    <span>{doc.progress}%</span>
                  </div>
                </div>
              )}

              {isError && (
                <div className="mt-1 text-[9px] text-red-500 dark:text-red-400 font-medium leading-none">
                  {doc.error || 'Upload failed'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DocumentList;
