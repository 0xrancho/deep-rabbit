import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download,
  Phone,
  CreditCard,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Star,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { saveFeedback, trackCTAClick, trackAnalyticsEvent } from "@/lib/supabase";
import type { EnhancedAssessmentData } from "@/types/assessment";

const EnhancedAssessmentReport = () => {
  const navigate = useNavigate();
  const [assessmentData, setAssessmentData] = useState<EnhancedAssessmentData | null>(null);
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    console.log('📊 EnhancedAssessmentReport: Component mounted');
    loadAssessmentAndReport();
  }, []);

  const loadAssessmentAndReport = async () => {
    console.log('🔍 Loading assessment and report...');
    try {
      // Load assessment session data
      const sessionData = localStorage.getItem('assessment_session');
      console.log('📦 Session data found:', !!sessionData);
      if (!sessionData) {
        console.log('❌ No session data, navigating to /assessment');
        navigate('/assessment');
        return;
      }

      const data = JSON.parse(sessionData);
      console.log('✅ Assessment data loaded:', data);
      setAssessmentData(data);

      // Load deep report HTML
      const reportKey = `deep_report_${data.sessionId}`;
      console.log('🔑 Looking for report with key:', reportKey);
      const reportHtml = localStorage.getItem(reportKey);
      
      if (reportHtml) {
        console.log('✅ Report HTML found, length:', reportHtml.length);
        setReportHtml(reportHtml);
      } else {
        console.log('❌ No deep report found in localStorage');
        // Fallback: try loading from the old report system
        setError('Report not found. Please regenerate your assessment.');
      }

      setLoading(false);

    } catch (error) {
      console.error('❌ Error loading assessment report:', error);
      setError('Failed to load report data.');
      setLoading(false);
    }
  };

  const handleCTAClick = async (ctaType: 'free_call' | 'paid_consult' | 'gabi_signup') => {
    if (assessmentData) {
      await trackCTAClick({
        assessment_id: assessmentData.sessionId,
        cta_type: ctaType
      });

      await trackAnalyticsEvent({
        session_id: assessmentData.sessionId,
        event_type: 'cta_clicked',
        event_data: {
          cta_type: ctaType,
          company: assessmentData.businessName
        }
      });
    }

    // Handle different CTA actions
    if (ctaType === 'free_call') {
      window.open('https://calendly.com/arthur-archie/ai-transformation-consultation', '_blank');
    } else if (ctaType === 'paid_consult') {
      window.open('https://buy.stripe.com/your-stripe-link', '_blank');
    } else if (ctaType === 'gabi_signup') {
      window.open('https://gabi-intelligence.com/signup', '_blank');
    }
  };

  const handleFeedback = async (isPositive: boolean) => {
    if (!assessmentData) return;

    try {
      await saveFeedback({
        assessment_id: assessmentData.sessionId,
        rating: isPositive ? 5 : 2,
        feedback_text: isPositive ? 'Positive feedback' : 'Needs improvement',
        interested_in_meeting: isPositive,
        session_duration_ms: Date.now() - new Date(assessmentData.sessionId).getTime()
      });

      await trackAnalyticsEvent({
        session_id: assessmentData.sessionId,
        event_type: 'feedback_submitted',
        event_data: {
          rating: isPositive ? 5 : 2,
          is_positive: isPositive
        }
      });

      setFeedbackSubmitted(true);
      setShowFeedback(false);

    } catch (error) {
      console.error('Failed to save feedback:', error);
    }
  };

  const downloadReport = async () => {
    if (!reportHtml || !assessmentData) return;

    try {
      // Create a blob with the HTML content
      const blob = new Blob([reportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${assessmentData.businessName}_AI_Transformation_Report.html`;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);

      // Track download
      await trackAnalyticsEvent({
        session_id: assessmentData.sessionId,
        event_type: 'report_downloaded',
        event_data: {
          company: assessmentData.businessName,
          format: 'html'
        }
      });

    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const regenerateReport = () => {
    navigate('/assessment/step/10'); // Go back to success metrics step
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gabi-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Report Not Available</h3>
            <p className="text-text-secondary mb-4">{error}</p>
            <div className="space-x-2">
              <Button onClick={regenerateReport} className="btn-gabi">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Report
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/assessment')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reportHtml || !assessmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">No report data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Report Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-interactive-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/assessment')}
                className="text-text-secondary hover:text-text-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                New Assessment
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-text-primary">
                  {assessmentData.businessName} - AI Transformation Report
                </h1>
                <p className="text-sm text-text-secondary">
                  Deep Research Analysis • {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={downloadReport}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </Button>
              
              {!feedbackSubmitted && (
                <Button
                  variant="ghost"
                  onClick={() => setShowFeedback(!showFeedback)}
                  className="flex items-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Feedback
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Panel */}
      {showFeedback && (
        <div className="bg-gabi-purple/10 border-b border-gabi-purple/20 p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <p className="text-text-primary">How was your GABI Intelligence experience?</p>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleFeedback(true)}
                  className="flex items-center gap-2 text-green-600 border-green-300 hover:bg-green-50"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Great Experience
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleFeedback(false)}
                  className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Needs Improvement
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {feedbackSubmitted && (
        <div className="bg-green-50 border-b border-green-200 p-4">
          <div className="container mx-auto">
            <p className="text-green-800 text-center">
              Thank you for your feedback! We'll use it to improve GABI Intelligence.
            </p>
          </div>
        </div>
      )}

      {/* Report Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Report iframe */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <iframe
                srcDoc={reportHtml}
                style={{ 
                  width: '100%', 
                  minHeight: '800px', 
                  border: 'none',
                  backgroundColor: '#fafafa'
                }}
                title="AI Transformation Report"
                sandbox="allow-same-origin allow-scripts"
              />
            </CardContent>
          </Card>

          {/* Call-to-Action Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => handleCTAClick('free_call')}>
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Free Consultation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary text-sm mb-4">
                  45-minute strategic session to discuss your AI transformation roadmap
                </p>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  $0 Value: $500
                </Badge>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer border-gabi-purple/30" 
                  onClick={() => handleCTAClick('paid_consult')}>
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gabi-purple/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-gabi-purple" />
                </div>
                <CardTitle className="text-lg">Deep Dive Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary text-sm mb-4">
                  Comprehensive 2-hour assessment with detailed implementation plan
                </p>
                <Badge variant="outline" className="bg-gabi-purple/10 text-gabi-purple border-gabi-purple/30">
                  $997
                </Badge>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer border-yellow-300" 
                  onClick={() => handleCTAClick('gabi_signup')}>
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">Deploy GABI Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary text-sm mb-4">
                  White-label GABI for your own clients and prospects
                </p>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Enterprise Solution
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="mt-8 text-center">
            <p className="text-text-secondary text-sm">
              This report was generated using GABI Intelligence™ - Context Intelligence for AI transformation.
              <br />
              Questions? Email us at <a href="mailto:hello@gabi-intelligence.com" className="text-gabi-purple hover:underline">hello@gabi-intelligence.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAssessmentReport;