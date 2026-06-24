import React, { useCallback, useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Upload, AlertCircle } from 'lucide-react';

export const UploadZone: React.FC = () => {
  const { uploadDocuments, documents } = useWorkspace();
  const [isDragActive, setIsDragActive] = useState(false);

  const totalCount = documents.length;
  const isLimitReached = totalCount >= 10;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (isLimitReached) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      uploadDocuments(files);
    }
  }, [uploadDocuments, isLimitReached]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLimitReached) return;

    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      uploadDocuments(files);
    }
  }, [uploadDocuments, isLimitReached]);

  return (
    <div className="w-full space-y-3">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center border border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
          isLimitReached
            ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 cursor-not-allowed opacity-60'
            : isDragActive
            ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900/40 shadow-sm'
            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/10'
        }`}
      >
        <input
          type="file"
          id="pdf-upload"
          multiple
          accept=".pdf"
          disabled={isLimitReached}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-zinc-650 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-700/50">
            <Upload className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-zinc-850 dark:text-zinc-150">
              {isLimitReached ? 'Workspace is full' : 'Upload PDF documents'}
            </p>
            <p className="text-[10px] text-zinc-500">
              {isLimitReached ? 'Limit of 10 PDFs reached' : 'Drag & drop or click to choose'}
            </p>
          </div>
        </div>
      </div>

      {isLimitReached && (
        <div className="flex items-center space-x-2 p-2.5 bg-amber-50 dark:bg-amber-955/15 border border-amber-200/50 dark:border-amber-900/35 rounded-lg text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[11px] font-medium leading-none">
            Maximum limit of 10 PDFs has been reached. (Upload one by one)
          </span>
        </div>
      )}
    </div>
  );
};
export default UploadZone;
