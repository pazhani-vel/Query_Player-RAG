import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useWorkspace } from '../contexts/WorkspaceContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDFjs Worker from CDN to align perfectly with Vite bundling and versions
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PDFViewer: React.FC = () => {
  const {
    activeDocument,
    activePage,
    isViewerOpen,
    closePDFViewer,
    setActivePage,
  } = useWorkspace();

  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [pageWidth, setPageWidth] = useState<number | undefined>(undefined);
  const [isFitWidth, setIsFitWidth] = useState<boolean>(false);

  // Sync internal page counter with activePage context from citation click
  useEffect(() => {
    if (activePage) {
      // Ensure we stay within document page bounds if pages are loaded
      if (numPages && activePage > numPages) {
        setActivePage(numPages);
      }
    }
  }, [activePage, numPages, setActivePage]);

  // Adjust page width if Fit Width is active
  useEffect(() => {
    const handleResize = () => {
      if (isFitWidth) {
        const viewerContainer = document.getElementById('pdf-render-container');
        if (viewerContainer) {
          // Leave some padding
          setPageWidth(viewerContainer.clientWidth - 32);
        }
      } else {
        setPageWidth(undefined);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFitWidth, isViewerOpen]);

  if (!isViewerOpen || !activeDocument) return null;

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setErrorState(null);
  };

  const [errorState, setErrorState] = useState<string | null>(null);
  const handleDocumentLoadError = (err: any) => {
    console.error('PDF Load Error:', err);
    setErrorState(err.message || 'Failed to render PDF. The file may be corrupt or invalid.');
  };

  const changePage = (offset: number) => {
    if (!numPages) return;
    const nextPage = activePage + offset;
    if (nextPage >= 1 && nextPage <= numPages) {
      setActivePage(nextPage);
    }
  };

  const handleZoom = (type: 'in' | 'out') => {
    setIsFitWidth(false);
    setScale((prev) => {
      if (type === 'in') return Math.min(prev + 0.2, 2.5);
      return Math.max(prev - 0.2, 0.5);
    });
  };

  const toggleFitWidth = () => {
    setIsFitWidth((prev) => !prev);
    setScale(1.0);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
      {/* Top Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 text-white shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <span className="text-xs font-semibold px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">PDF PREVIEW</span>
          <h2 className="text-sm font-bold truncate max-w-[200px] sm:max-w-md" title={activeDocument.name}>
            {activeDocument.name}
          </h2>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 border border-zinc-700/50">
            <button
              onClick={() => handleZoom('out')}
              className="p-1.5 hover:bg-zinc-700 rounded-md transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-zinc-300" />
            </button>
            <span className="text-xs font-semibold px-2 text-zinc-300 select-none min-w-[3rem] text-center">
              {isFitWidth ? 'Fit' : `${Math.round(scale * 100)}%`}
            </span>
            <button
              onClick={() => handleZoom('in')}
              className="p-1.5 hover:bg-zinc-700 rounded-md transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-zinc-300" />
            </button>
          </div>

          <button
            onClick={toggleFitWidth}
            className={`p-2 hover:bg-zinc-800 border rounded-lg transition-colors cursor-pointer ${
              isFitWidth
                ? 'bg-zinc-800 border-zinc-650 text-white'
                : 'border-zinc-700/50 text-zinc-300 hover:text-white'
            }`}
            title={isFitWidth ? 'Custom Scale' : 'Fit to Width'}
          >
            {isFitWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <span className="w-px h-6 bg-zinc-800 hidden sm:block" />

          {/* Page navigation */}
          <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 border border-zinc-700/50">
            <button
              disabled={activePage <= 1}
              onClick={() => changePage(-1)}
              className="p-1.5 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <span className="text-xs font-semibold px-2 text-zinc-300 select-none min-w-[5rem] text-center">
              Page {activePage} of {numPages || '?'}
            </span>
            <button
              disabled={numPages ? activePage >= numPages : true}
              onClick={() => changePage(1)}
              className="p-1.5 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>

          <span className="w-px h-6 bg-zinc-800" />

          {/* Close button */}
          <button
            onClick={closePDFViewer}
            className="p-2 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-350 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Close Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main viewer viewport */}
      <div className="flex-1 overflow-auto bg-zinc-900 p-4 flex justify-center items-start" id="pdf-render-container">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-2 select-none overflow-hidden max-w-full">
          {errorState ? (
            <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1.5">PDF Loading Failed</h3>
              <p className="text-xs text-zinc-400 mb-4">{errorState}</p>
              <button
                onClick={closePDFViewer}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Close Viewer
              </button>
            </div>
          ) : (
            <Document
              file={activeDocument.file}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleDocumentLoadError}
              loading={
                <div className="flex flex-col items-center justify-center p-16 space-y-3">
                  <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
                  <p className="text-xs font-semibold text-zinc-400">Loading document pages...</p>
                </div>
              }
            >
              <Page
                pageNumber={activePage}
                scale={isFitWidth ? undefined : scale}
                width={pageWidth}
                loading={
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                  </div>
                }
              />
            </Document>
          )}
        </div>
      </div>
    </div>
  );
};
export default PDFViewer;
