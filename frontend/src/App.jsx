import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import './App.css';
import { Toaster } from 'sonner';
import { useAuthStore } from './store';
import ScrollToTop from './components/layout/ScrollToTop';

function App() {
  const initAuth = useAuthStore((s) => s.initAuth);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Chờ initAuth hoàn tất trước khi render routes
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-text-muted text-sm">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>    
      <Toaster richColors position="top-center" />
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
