import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DiscoverySetup from "./pages/DiscoverySetup";
import DiscoveryICP from "./pages/DiscoveryICP";
import DiscoveryContext from "./pages/DiscoveryContext";
import DiscoverySessionV2 from "./pages/DiscoverySessionV2";
import DiscoveryScopingReview from "./pages/DiscoveryScopingReview";
import DiscoverySummary from "./pages/DiscoverySummary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
            {/* Default route - redirect to Discovery Wizard */}
            <Route path="/" element={<DiscoverySetup />} />
            
            {/* Discovery Wizard Flow */}
            <Route path="/discovery/setup" element={<DiscoverySetup />} />
            <Route path="/discovery/icp/:sessionId" element={<DiscoveryICP />} />
            <Route path="/discovery/context/:sessionId" element={<DiscoveryContext />} />
            <Route path="/discovery/session/:sessionId" element={<DiscoverySessionV2 />} />
            <Route path="/discovery/scoping/:sessionId" element={<DiscoveryScopingReview />} />
            <Route path="/discovery/summary/:sessionId" element={<DiscoverySummary />} />
            
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;