import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from './pages/Index';
import { useAuthStore } from './lib/useAuthStore';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30000,
            refetchOnWindowFocus: false,
        },
    },
});

// Auth initializer — restores session from token on page load
function AuthInit() {
    const initAuth = useAuthStore(s => s.initAuth);
    useEffect(() => {
        initAuth();
    }, [initAuth]);
    return null;
}

const App = () => (
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
            <AuthInit />
            <Routes>
                <Route path="/" element={<Index />} />
            </Routes>
        </BrowserRouter>
        <Toaster position="top-right" theme="dark" />
    </QueryClientProvider>
);

export default App;
