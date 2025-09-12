import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-auth";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import OnboardingV2 from "./pages/OnboardingV2";
import DiscoverySetup from "./pages/DiscoverySetup";
import DiscoveryICP from "./pages/DiscoveryICP";
import DiscoveryContext from "./pages/DiscoveryContext";
import DiscoverySessionV2 from "./pages/DiscoverySessionV2";
import DiscoveryScopingReview from "./pages/DiscoveryScopingReview";
import DiscoverySummary from "./pages/DiscoverySummary";
import LandingDemo from "./pages/LandingDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check Supabase auth session
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('ProtectedRoute: Session check:', session ? 'Authenticated' : 'Not authenticated');
      setIsAuthenticated(!!session);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('ProtectedRoute: Auth state changed:', event, !!session);
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/auth" />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/demo" element={<LandingDemo />} />
            
            {/* Protected routes */}
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingV2 />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Discovery Wizard Flow (Protected) */}
            <Route path="/discovery/setup" element={
              <ProtectedRoute>
                <DiscoverySetup />
              </ProtectedRoute>
            } />
            <Route path="/discovery/icp/:sessionId" element={
              <ProtectedRoute>
                <DiscoveryICP />
              </ProtectedRoute>
            } />
            <Route path="/discovery/context/:sessionId" element={
              <ProtectedRoute>
                <DiscoveryContext />
              </ProtectedRoute>
            } />
            <Route path="/discovery/session/:sessionId" element={
              <ProtectedRoute>
                <DiscoverySessionV2 />
              </ProtectedRoute>
            } />
            <Route path="/discovery/scoping/:sessionId" element={
              <ProtectedRoute>
                <DiscoveryScopingReview />
              </ProtectedRoute>
            } />
            <Route path="/discovery/summary/:sessionId" element={
              <ProtectedRoute>
                <DiscoverySummary />
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;