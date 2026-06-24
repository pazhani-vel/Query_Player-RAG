import React, { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Sidebar } from '../components/Sidebar';
import { ChatContainer } from '../components/ChatContainer';
import { SourcePanel } from '../components/SourcePanel';
import { PDFViewer } from '../components/PDFViewer';
import { Menu, BookOpen, X } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const { documents } = useWorkspace();

  const activeCitationsCount = documents.filter((d) => d.status === 'success').length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Mobile Top Navbar */}
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-800 lg:hidden shrink-0 shadow-sm z-30">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-zinc-650 hover:text-zinc-900 dark:text-zinc-450 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
          title="Open Documents Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="p-1 bg-zinc-900 dark:bg-zinc-100 rounded-lg text-white dark:text-zinc-950 shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider">NotebookLM</span>
        </div>

        <button
          onClick={() => setIsSourcesOpen(true)}
          className="relative p-2 text-zinc-650 hover:text-zinc-900 dark:text-zinc-450 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
          title="Open Sources Panel"
        >
          <BookOpen className="w-5 h-5" />
          {activeCitationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-zinc-900" />
          )}
        </button>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 w-full h-full overflow-hidden relative">
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:block lg:w-76 xl:w-80 h-full shrink-0">
          <Sidebar />
        </aside>

        {/* Center Panel (Chat Interface) */}
        <main className="flex-1 h-full p-3 sm:p-4 md:p-6 overflow-hidden">
          <ChatContainer />
        </main>

        {/* Desktop Right Sidebar */}
        <aside className="hidden lg:block lg:w-76 xl:w-80 h-full shrink-0">
          <SourcePanel />
        </aside>

        {/* Mobile Left Sidebar Drawer */}
        <div className={`fixed inset-0 z-40 flex lg:hidden transition-all duration-300 ${
          isSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}>
          {/* Drawer backdrop */}
          <div
            className={`fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity duration-300 ${
              isSidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Drawer sheet */}
          <div
            className={`relative flex flex-col w-76 max-w-[85vw] h-full bg-white dark:bg-zinc-950 transform transition-transform duration-300 ease-out shadow-2xl ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Close Button Inside Drawer */}
            <div className="absolute top-3 right-3 z-50">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-150 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>

        {/* Mobile Right Sources Drawer */}
        <div className={`fixed inset-0 z-40 flex lg:hidden justify-end transition-all duration-300 ${
          isSourcesOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}>
          {/* Drawer backdrop */}
          <div
            className={`fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity duration-300 ${
              isSourcesOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsSourcesOpen(false)}
          />
          {/* Drawer sheet */}
          <div
            className={`relative flex flex-col w-76 max-w-[85vw] h-full bg-white dark:bg-zinc-950 transform transition-transform duration-300 ease-out shadow-2xl ${
              isSourcesOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Close Button Inside Drawer */}
            <div className="absolute top-3 left-3 z-50">
              <button
                onClick={() => setIsSourcesOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-150 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <SourcePanel />
          </div>
        </div>
      </div>

      {/* Floating full-screen PDF Viewer */}
      <PDFViewer />
    </div>
  );
};
export default Dashboard;
