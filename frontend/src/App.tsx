import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { dailyReset } from './services/api';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {

  
 // Runs once on every page load / refresh
useEffect(() => {
    dailyReset()
      .then((res) => {
        console.log("[Daily Reset]", res.message);
        console.log("[Daily Reset] Cleared files:", res.deleted_files);
      })
      .catch((err) => {
        console.error("[Daily Reset] Failed:", err);
      });
  }, []);   // ← empty deps = fires on mount (i.e. every fresh page load)


  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WorkspaceProvider>
          <Dashboard />
        </WorkspaceProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
