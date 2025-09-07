import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AssessmentLanding from "./pages/AssessmentLanding";
import AssessmentStep from "./pages/AssessmentStep";
import EnhancedAssessmentReport from "./pages/EnhancedAssessmentReport";
import DiscoverySetup from "./pages/DiscoverySetup";
import DiscoveryICP from "./pages/DiscoveryICP";
import DiscoveryContext from "./pages/DiscoveryContext";
import DiscoverySession from "./pages/DiscoverySession";
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
            <Route path="/discovery/session/:sessionId" element={<DiscoverySession />} />
            
            {/* Legacy Assessment Routes (for backwards compatibility) */}
            <Route path="/assessment" element={<AssessmentLanding />} />
            <Route path="/assessment/step" element={<AssessmentStep />} />
            <Route path="/assessment/report" element={<EnhancedAssessmentReport />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;