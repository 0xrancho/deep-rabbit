import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Brain, TrendingUp, Target, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { createDeepReportGenerator, type DeepResearchProgress } from "@/services/deepReportGenerator";
import { trackAnalyticsEvent } from "@/lib/supabase";
interface Props {
  data: any; // Accept original assessment data structure
  updateData: (updates: any) => void;
  onNext: () => void;
}

const DeepReportGeneration = ({ data, updateData }: Props) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<DeepResearchProgress[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [totalTokens, setTotalTokens] = useState<number>(0);

  useEffect(() => {
    console.log('🚀 DeepReportGeneration: Component mounted, starting generation');
    console.log('📊 Assessment Data:', data);
    generateDeepReport();
  }, []);

  const generateDeepReport = async () => {
    console.log('📝 DeepReportGeneration: Starting report generation process');
    try {
      // Track generation start
      console.log('📊 Tracking analytics event: deep_report_generation_started');
      await trackAnalyticsEvent({
        session_id: data.sessionId,
        event_type: 'deep_report_generation_started',
        event_data: {
          company: data.company,
          business_type: data.businessType,
          challenges_count: data.challenges?.length || 0,
          investment_level: data.investmentLevel
        },
        step_number: 10 // Final step
      });

      // Create a variable to store the HTML outside of state
      let capturedReportHtml: string | null = null;
      
      // Create report generator with progress tracking
      console.log('🔧 Creating deep report generator with progress callback');
      const reportGenerator = createDeepReportGenerator((progressUpdate) => {
        console.log('📈 Progress Update:', progressUpdate);
        setProgress(prev => [...prev, progressUpdate]);
        
        if (progressUpdate.type === 'progress') {
          console.log('⚙️ Current Step:', progressUpdate.step);
          setCurrentStep(progressUpdate.step || '');
        } else if (progressUpdate.type === 'report') {
          console.log('✅ Report HTML received, length:', progressUpdate.html?.length);
          capturedReportHtml = progressUpdate.html || null;
          setReportHtml(progressUpdate.html || null);
          
          // Save immediately to localStorage when received
          if (progressUpdate.html) {
            const reportKey = `deep_report_${data.sessionId}`;
            console.log('💾 Saving report immediately to localStorage with key:', reportKey);
            localStorage.setItem(reportKey, progressUpdate.html);
          }
          
          if (progressUpdate.metrics) {
            setTotalDuration(progressUpdate.metrics.duration);
            setTotalTokens(progressUpdate.metrics.tokens);
          }
        } else if (progressUpdate.type === 'error') {
          console.error('❌ Error in progress:', progressUpdate.message);
          setError(progressUpdate.message || 'Unknown error occurred');
        }
      });

      // Generate the deep research report
      console.log('🚀 Calling generateDeepResearchReport...');
      const result = await reportGenerator.generateDeepResearchReport(data);
      console.log('📊 Report generation result:', result);

      if (result.success) {
        console.log('✅ Report generation successful');
        console.log('📄 Report HTML from result:', !!result.reportHtml);
        console.log('📄 Report HTML from captured variable:', !!capturedReportHtml);
        
        // Update local data with completion info
        updateData({ 
          completedAt: new Date().toISOString(),
          status: 'completed'
        });

        // Track successful generation
        await trackAnalyticsEvent({
          session_id: data.sessionId,
          event_type: 'deep_report_generated_successfully',
          event_data: {
            generation_time_ms: result.metadata.duration,
            tokens_used: result.metadata.totalTokens,
            confidence_score: result.metadata.confidence,
            phases_completed: result.metadata.phases
          },
          step_number: 10
        });

        // Navigate to report display after brief delay
        // Note: Report was already saved in the progress callback
        setTimeout(() => {
          console.log('🚀 Navigating to report page...');
          navigate('/assessment/report');
        }, 2000);

      } else {
        setError(result.error || 'Report generation failed');
        
        await trackAnalyticsEvent({
          session_id: data.sessionId,
          event_type: 'deep_report_generation_failed',
          event_data: {
            error: result.error,
            duration_ms: result.metadata.duration,
            phases_completed: result.metadata.phases
          },
          step_number: 10
        });
      }

    } catch (error: any) {
      console.error('Deep report generation error:', error);
      setError(error.message || 'An unexpected error occurred');
      
      await trackAnalyticsEvent({
        session_id: data.sessionId,
        event_type: 'deep_report_generation_error',
        event_data: {
          error: error.message
        },
        step_number: 10
      });
    }
  };

  const retryGeneration = () => {
    setError(null);
    setProgress([]);
    setCurrentStep('');
    setReportHtml(null);
    generateDeepReport();
  };

  const getStatusIcon = () => {
    if (error) return AlertCircle;
    if (reportHtml) return CheckCircle;
    
    // Rotate through different icons based on current step
    if (currentStep.includes('value') || currentStep.includes('ROI')) return TrendingUp;
    if (currentStep.includes('benchmark') || currentStep.includes('industry')) return Target;
    if (currentStep.includes('roadmap') || currentStep.includes('implementation')) return Calendar;
    return Brain;
  };

  const Icon = getStatusIcon();

  // Show error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-8 max-w-md">
          <div className="w-24 h-24 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-primary">
              Deep Analysis Failed
            </h3>
            <p className="text-text-secondary text-sm">
              {error}
            </p>
            <button
              onClick={retryGeneration}
              className="btn-gabi px-6 py-2"
            >
              Retry Deep Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show completed state
  if (reportHtml) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-8 max-w-lg">
          <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-text-primary">
              Deep Analysis Complete!
            </h3>
            <p className="text-text-secondary">
              Your comprehensive AI transformation roadmap for {data.businessName} is ready.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
              <div className="bg-interactive-bg/30 border border-interactive-border rounded-lg p-3">
                <div className="font-medium text-gabi-purple">{totalDuration.toFixed(1)}s</div>
                <div className="text-text-secondary text-xs">Analysis Time</div>
              </div>
              <div className="bg-interactive-bg/30 border border-interactive-border rounded-lg p-3">
                <div className="font-medium text-gabi-purple">{totalTokens.toLocaleString()}</div>
                <div className="text-text-secondary text-xs">AI Tokens Used</div>
              </div>
              <div className="bg-interactive-bg/30 border border-interactive-border rounded-lg p-3">
                <div className="font-medium text-gabi-purple">{progress.filter(p => p.type === 'complete').length}</div>
                <div className="text-text-secondary text-xs">Research Steps</div>
              </div>
            </div>
            
            <p className="text-xs text-text-muted mt-4">
              Redirecting to your personalized report...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show generation progress
  const completedSteps = progress.filter(p => p.type === 'complete');
  const currentProgress = Math.min(95, (completedSteps.length / 8) * 100); // 8 research steps

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md">
        {/* Animated Icon */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gabi-purple to-gabi-pink flex items-center justify-center animate-pulse">
            <Icon className="w-12 h-12 text-white" style={{ animation: 'spin 3s linear infinite' }} />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gabi-purple to-gabi-pink opacity-20 animate-ping" />
        </div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="progress-bar">
            <div 
              className="progress-fill transition-all duration-1000 ease-out"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
          
          <p className="text-sm text-text-muted">
            {Math.round(currentProgress)}% Complete
          </p>
        </div>

        {/* Current Step */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-text-primary animate-fade-in">
            {currentStep || 'Initializing deep research...'}
          </h3>
          
          <p className="text-text-secondary text-sm">
            GABI Intelligence is performing comprehensive analysis for{" "}
            <span className="text-user-accent font-medium">{data.company}</span>
          </p>
        </div>

        {/* Research Progress List */}
        <div className="bg-interactive-bg/30 border border-interactive-border rounded-lg p-4">
          <h4 className="text-sm font-medium text-text-primary mb-3">Research Progress:</h4>
          <div className="space-y-2 text-xs">
            {progress.filter(p => p.type === 'complete').map((step, index) => (
              <div key={index} className="flex items-center gap-2 text-success">
                <CheckCircle className="w-3 h-3" />
                <span>{step.step}</span>
                {step.duration && (
                  <span className="text-text-muted">({step.duration.toFixed(1)}s)</span>
                )}
              </div>
            ))}
            {currentStep && (
              <div className="flex items-center gap-2 text-gabi-purple">
                <div className="w-3 h-3 rounded-full bg-gabi-purple animate-pulse" />
                <span>{currentStep}</span>
              </div>
            )}
          </div>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gabi-purple rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>

        {/* ETA */}
        <div className="text-text-muted text-xs">
          Deep research typically takes 90-120 seconds
        </div>
      </div>
    </div>
  );
};

export default DeepReportGeneration;