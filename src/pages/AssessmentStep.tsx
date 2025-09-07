import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { 
  saveAssessment, 
  trackAnalyticsEvent, 
  type AssessmentRecord 
} from "@/lib/supabase";
import { EnhancedAssessmentFlow } from "@/components/EnhancedAssessmentFlow";
import { type AssessmentContext } from "@/lib/assessment/enhanced-assessment-orchestrator";
import DeepReportGeneration from "@/components/assessment/DeepReportGeneration";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";

interface AssessmentData {
  sessionId: string;
  fullName: string;
  company: string;
  email: string;
  subscribeUpdates: boolean;
  // Enhanced assessment data from progressive narrowing
  selectedICP?: string;
  selectedOpportunityArea?: string;
  selectedRevenueModel?: string;
  selectedChallengeArea?: string;
  selectedMetric?: string;
  currentBaseline?: string;
  mainFriction?: string;
  processSteps?: any[];
  processBreakdownPoint?: string;
  processValidated?: boolean;
  // Legacy fields for backward compatibility
  businessType?: string;
  opportunityFocus?: string;
  revenueModel?: string;
  challenges?: string[];
  metrics?: Record<string, any>;
  metricsQuantified?: Record<string, string>;
  teamDescription?: string;
  processDescription?: string;
  techStack?: string[];
  investmentLevel?: string;
  additionalContext?: string;
  [key: string]: any;
}

const AssessmentStep = () => {
  const navigate = useNavigate();
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReportGeneration, setShowReportGeneration] = useState(false);
  const [assessmentProgress, setAssessmentProgress] = useState(15);
  const [currentTier, setCurrentTier] = useState(1);

  useEffect(() => {
    // Load assessment session data
    const sessionData = localStorage.getItem('assessment_session');
    if (!sessionData) {
      navigate('/assessment');
      return;
    }

    try {
      const data = JSON.parse(sessionData);
      setAssessmentData(data);
    } catch (error) {
      console.error('Error parsing assessment data:', error);
      navigate('/assessment');
      return;
    }

    setIsLoading(false);
  }, [navigate]);

  const handleAssessmentComplete = async (context: AssessmentContext) => {
    if (!assessmentData) return;

    console.log('🎉 Assessment completed with context:', context);

    // Convert enhanced assessment context to legacy format for report generation
    const enhancedData: AssessmentData = {
      ...assessmentData,
      // Map new context to legacy fields for backward compatibility
      businessType: context.selectedICP?.label || assessmentData.businessType,
      opportunityFocus: context.selectedOpportunityArea?.label || assessmentData.opportunityFocus,
      revenueModel: context.selectedRevenueModel || assessmentData.revenueModel,
      challenges: context.selectedMetric ? [context.selectedMetric.label] : assessmentData.challenges,
      additionalContext: context.mainFriction || assessmentData.additionalContext,
      processDescription: context.processSteps?.map(step => 
        `${step.role}: ${step.action} using ${step.tools.join(', ')} → ${step.output}`
      ).join('\n') || assessmentData.processDescription,
      // Store enhanced context
      selectedICP: context.selectedICP?.id,
      selectedOpportunityArea: context.selectedOpportunityArea?.id,
      selectedRevenueModel: context.selectedRevenueModel,
      selectedChallengeArea: context.selectedChallengeArea?.id,
      selectedMetric: context.selectedMetric?.id,
      currentBaseline: context.currentBaseline,
      mainFriction: context.mainFriction,
      processSteps: context.processSteps,
      processBreakdownPoint: context.processBreakdownPoint,
      processValidated: context.processValidated
    };

    setAssessmentData(enhancedData);
    localStorage.setItem('assessment_session', JSON.stringify(enhancedData));

    // Save to Supabase
    try {
      const assessmentRecord: AssessmentRecord = {
        session_id: assessmentData.sessionId,
        email: assessmentData.email,
        company: assessmentData.company,
        full_name: assessmentData.fullName,
        subscribe_updates: assessmentData.subscribeUpdates,
        business_type: enhancedData.businessType,
        opportunity_focus: enhancedData.opportunityFocus,
        revenue_model: enhancedData.revenueModel,
        challenges: enhancedData.challenges,
        process_description: enhancedData.processDescription,
        additional_context: enhancedData.additionalContext,
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await saveAssessment(assessmentRecord);

      await trackAnalyticsEvent({
        session_id: assessmentData.sessionId,
        event_type: 'assessment_completed',
        event_data: {
          icp: context.selectedICP?.id,
          opportunity_area: context.selectedOpportunityArea?.id,
          metric: context.selectedMetric?.id,
          company: assessmentData.company,
          assessment_type: 'enhanced_progressive_narrowing'
        }
      });

    } catch (error) {
      console.error('Failed to save completed assessment:', error);
    }

    // Show report generation
    setShowReportGeneration(true);
  };

  const handleBackToStart = () => {
    navigate('/assessment');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gabi-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessmentData) {
    return null;
  }

  // Show report generation if completed
  if (showReportGeneration) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card animate-fade-in">
              <CardContent className="p-8">
                <DeepReportGeneration 
                  data={assessmentData}
                  updateData={(updates: any) => setAssessmentData(prev => prev ? { ...prev, ...updates } : null)}
                  onNext={() => navigate('/assessment/report')}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar - Enhanced Assessment */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-interactive-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              onClick={handleBackToStart}
              className="text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Start Over
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-text-muted">Enhanced Assessment</p>
              <p className="text-xs text-text-secondary font-mono">
                {assessmentData.company} Assessment
              </p>
            </div>

            <div className="w-16" /> {/* Spacer for centering */}
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${assessmentProgress}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-2">
            {[
              'ICP', 'Focus', 'Revenue', 'Challenge', 'Metric', 'Process', 'Validate'
            ].map((tier, i) => (
              <div
                key={tier}
                className={`flex flex-col items-center transition-all duration-300`}
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all duration-300 ${
                  i + 1 < currentTier
                    ? 'bg-user-accent/80 text-white'
                    : i + 1 === currentTier
                    ? 'bg-user-accent text-white animate-glow-pulse'
                    : 'bg-interactive-bg text-text-muted'
                }`}>
                  {i + 1 < currentTier ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-xs text-text-muted mt-1 hidden sm:block">{tier}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Assessment Flow */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card animate-fade-in">
            <CardContent className="p-8">
              <EnhancedAssessmentFlow 
                initialData={{
                  fullName: assessmentData.fullName,
                  company: assessmentData.company,
                  email: assessmentData.email
                }}
                onComplete={handleAssessmentComplete}
                onProgress={(progress, tier) => {
                  setAssessmentProgress(progress);
                  setCurrentTier(tier || 1);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssessmentStep;