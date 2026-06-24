import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {

  
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
