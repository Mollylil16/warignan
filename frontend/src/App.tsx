import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import AppRouter from './router/AppRouter';

function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
    </ErrorBoundary>
  );
}

export default App;
