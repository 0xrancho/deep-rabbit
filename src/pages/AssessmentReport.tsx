import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  Calendar,
  DollarSign,
  ArrowRight,
  Star,
  Download,
  Phone,
  CreditCard,
  Sparkles,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { loadExistingReport, type ProcessedReportData } from "@/services/reportGenerator";
import { loadReport, saveFeedback, trackCTAClick } from "@/lib/supabase";

interface AssessmentData {
  sessionId: string;
  fullName: string;
  company: string;
  email: string;
  businessType?: string;
  opportunityFocus?: string;
  revenueModel?: string;
  challenges?: string[];
  teamDescription?: string;
  processDescription?: string;
  techStack?: string[];
  investmentLevel?: string;
  additionalContext?: string;
}

const AssessmentReport = () => {
  const navigate = useNavigate();
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [reportData, setReportData] = useState<ProcessedReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    loadReportData();
  }, [navigate]);

  const loadReportData = async () => {
    try {
      // Load assessment data from localStorage
      const sessionData = localStorage.getItem('assessment_session');
      if (!sessionData) {
        navigate('/assessment');
        return;
      }

      const data = JSON.parse(sessionData);
      setAssessmentData(data);

      // Load report data - first try from generated report
      let report: ProcessedReportData | null = null;
      
      if (data.reportId) {
        // Try to load existing report by ID
        report = await loadExistingReport(data.reportId);
      }

      if (!report && data.sessionId) {
        // Try to load report by session ID (from Supabase)
        const reportRecord = await loadReport(data.sessionId);
        if (reportRecord?.report_data?.processed_data) {
          report = reportRecord.report_data.processed_data;
        }
      }

      if (report) {
        setReportData(report);
        
        // Show feedback modal after 10 seconds
        const timer = setTimeout(() => {
          setShowFeedback(true);
        }, 10000);

        return () => clearTimeout(timer);
      } else {
        // No report found - generate fallback static report
        setReportData(generateFallbackReport(data));
        
        const timer = setTimeout(() => {
          setShowFeedback(true);
        }, 10000);

        return () => clearTimeout(timer);
      }

    } catch (error: any) {
      console.error('Error loading report data:', error);
      setError(error.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  // Generate fallback report if AI generation failed or not available
  const generateFallbackReport = (data: AssessmentData): ProcessedReportData => {
    return {
      readiness_score: 'High',
      potential_savings: '$50,000+',
      implementation_timeline: '6 months',
      summary_text: `Based on our analysis of ${data.company}'s ${data.businessType || 'business'} operations, we've identified significant opportunities for AI transformation. Your organization shows strong potential for automation and efficiency improvements.`,
      
      business_focus: data.businessType || 'Service Business',
      primary_opportunity: data.opportunityFocus || 'Process Optimization',
      key_challenges: data.challenges || ['Manual processes', 'Efficiency bottlenecks'],
      current_tech: data.techStack || ['Email', 'Spreadsheets'],
      
      transformation_opportunities: [
        { title: 'Process Automation', description: 'Automate repetitive manual tasks', impact_level: 'High' },
        { title: 'Intelligent Analytics', description: 'AI-powered insights and reporting', impact_level: 'Medium' },
        { title: 'Customer Experience', description: 'Enhanced client interactions', impact_level: 'Medium' },
        { title: 'Predictive Modeling', description: 'Forecast outcomes and optimize resources', impact_level: 'Medium' }
      ],
      
      implementation_phases: [
        { 
          phase: 'Discovery & Planning', 
          duration: 'Weeks 1-2', 
          objectives: ['Process analysis', 'Technology assessment', 'ROI modeling'], 
          deliverables: ['Assessment report', 'Implementation plan', 'Team training'] 
        },
        { 
          phase: 'Pilot Implementation', 
          duration: 'Weeks 3-8', 
          objectives: ['MVP development', 'Team training', 'Initial testing'], 
          deliverables: ['Working prototype', 'User training', 'Performance metrics'] 
        },
        { 
          phase: 'Scale & Optimize', 
          duration: 'Weeks 9-16', 
          objectives: ['Full deployment', 'Performance monitoring', 'Continuous improvement'], 
          deliverables: ['Production system', 'Success metrics', 'Ongoing optimization'] 
        }
      ],
      
      cta_customization: {
        primary_message: `Ready to transform ${data.company}? Let's discuss your optimization strategy.`,
        consultation_focus: `We'll dive deep into your ${data.businessType || 'business'} processes and create a detailed roadmap.`,
        gabi_pitch: `Deploy GABI for ${data.company} to run assessments like this for your own clients.`
      }
    };
  };

  const handleFeedbackSubmit = async () => {
    if (!assessmentData?.sessionId) return;

    try {
      // Save feedback to Supabase
      await saveFeedback({
        assessment_id: assessmentData.sessionId, // Using session_id as assessment_id for now
        rating,
        feedback_text: feedback,
        interested_in_meeting: rating >= 4,
        user_agent: navigator.userAgent,
        session_duration_ms: Date.now() - new Date(assessmentData.startedAt || Date.now()).getTime()
      });

      console.log('Feedback saved successfully');
    } catch (error) {
      console.error('Failed to save feedback:', error);
    }

    setShowFeedback(false);
  };

  const handleCTAClick = async (action: 'free_call' | 'paid_consult' | 'gabi_signup') => {
    if (!assessmentData?.sessionId) return;

    try {
      // Track CTA click
      await trackCTAClick({
        assessment_id: assessmentData.sessionId,
        cta_type: action
      });

      // Generate URLs with session context
      const calendlyUrl = `https://calendly.com/gabi-ai-consultation?session_id=${assessmentData.sessionId}&company=${encodeURIComponent(assessmentData.company)}`;
      
      switch (action) {
        case 'free_call':
          window.open(calendlyUrl, '_blank');
          break;
        case 'paid_consult':
          // In production, integrate with actual payment processor
          window.open(`https://buy.stripe.com/consultation?session_id=${assessmentData.sessionId}`, '_blank');
          break;
        case 'gabi_signup':
          // In production, integrate with actual GABI signup flow
          window.open(`https://gabi-ai.com/signup?session_id=${assessmentData.sessionId}`, '_blank');
          break;
      }
    } catch (error) {
      console.error('Failed to track CTA click:', error);
      // Continue with navigation even if tracking fails
    }
  };

  const retryReportGeneration = () => {
    setError(null);
    setLoading(true);
    loadReportData();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-gabi-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading your AI assessment report...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-16 h-16 text-error mx-auto" />
          <h2 className="text-xl font-semibold text-text-primary">Report Loading Failed</h2>
          <p className="text-text-secondary">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={retryReportGeneration} className="btn-gabi">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button onClick={() => navigate('/assessment')} variant="outline">
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Missing data
  if (!assessmentData || !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-warning mx-auto" />
          <h2 className="text-xl font-semibold text-text-primary">No Report Found</h2>
          <p className="text-text-secondary">Unable to load your assessment report.</p>
          <Button onClick={() => navigate('/assessment')} className="btn-gabi">
            Start New Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-gabi-purple/10 to-gabi-pink/10 border-b border-interactive-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                AI Transformation Assessment Report
              </h1>
              <p className="text-text-secondary">
                Prepared for <span className="text-user-accent font-medium">{assessmentData.fullName}</span> at{" "}
                <span className="text-user-accent font-medium">{assessmentData.company}</span>
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="glass-card sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Report Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  'Executive Summary',
                  'Current State Analysis', 
                  'AI Opportunities',
                  'Recommended Solutions',
                  'Implementation Roadmap',
                  'ROI Projections',
                  'Next Steps'
                ].map((section) => (
                  <button
                    key={section}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-interactive-hover transition-colors"
                  >
                    {section}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Executive Summary */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gabi-purple" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`text-center p-4 rounded-lg ${
                    reportData.readiness_score === 'High' 
                      ? 'bg-success/10 border border-success/20' 
                      : reportData.readiness_score === 'Medium'
                      ? 'bg-warning/10 border border-warning/20'
                      : 'bg-error/10 border border-error/20'
                  }`}>
                    <div className={`text-2xl font-bold mb-1 ${
                      reportData.readiness_score === 'High' ? 'text-success' :
                      reportData.readiness_score === 'Medium' ? 'text-warning' : 'text-error'
                    }`}>
                      {reportData.readiness_score}
                    </div>
                    <div className="text-sm text-text-secondary">AI Readiness</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="text-2xl font-bold text-warning mb-1">{reportData.potential_savings}</div>
                    <div className="text-sm text-text-secondary">Potential Annual Savings</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gabi-purple/10 border border-gabi-purple/20">
                    <div className="text-2xl font-bold text-gabi-purple mb-1">{reportData.implementation_timeline}</div>
                    <div className="text-sm text-text-secondary">Implementation Timeline</div>
                  </div>
                </div>
                
                <p className="text-text-secondary leading-relaxed">
                  {reportData.summary_text}
                </p>
              </CardContent>
            </Card>

            {/* Current State Analysis */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-user-accent" />
                  Current State Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Business Focus</h4>
                  <Badge variant="secondary" className="mb-2">{reportData.business_focus}</Badge>
                  <p className="text-text-secondary text-sm">
                    Primary opportunity area: {reportData.primary_opportunity}
                  </p>
                </div>

                {reportData.key_challenges.length > 0 && (
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Key Challenges</h4>
                    <div className="space-y-2">
                      {reportData.key_challenges.map((challenge, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-error mt-2 flex-shrink-0" />
                          <span className="text-text-secondary text-sm">{challenge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reportData.current_tech.length > 0 && (
                  <div>
                    <h4 className="font-medium text-text-primary mb-2">Current Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {reportData.current_tech.map((tool, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Transformation Opportunities */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-gabi-pink" />
                  AI Transformation Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportData.transformation_opportunities.map((opportunity, index) => (
                    <div key={index} className="p-4 rounded-lg border border-interactive-border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-text-primary">{opportunity.title}</h4>
                        <Badge 
                          variant={opportunity.impact_level === 'High' ? 'default' : 'secondary'}
                          className={`text-xs ${
                            opportunity.impact_level === 'High' ? 'bg-success text-white' :
                            opportunity.impact_level === 'Medium' ? 'bg-warning text-white' : 
                            'bg-text-muted text-white'
                          }`}
                        >
                          {opportunity.impact_level}
                        </Badge>
                      </div>
                      <p className="text-text-secondary text-sm">
                        {opportunity.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Implementation Roadmap */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-success" />
                  Implementation Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reportData.implementation_phases.map((phase, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-user-accent flex items-center justify-center text-white text-sm font-medium">
                          {index + 1}
                        </div>
                        {index < reportData.implementation_phases.length - 1 && (
                          <div className="w-px h-16 bg-interactive-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-text-primary">{phase.phase}</h4>
                          <Badge variant="outline" className="text-xs">{phase.duration}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-text-muted font-medium mb-1">Objectives:</p>
                            <ul className="space-y-1">
                              {phase.objectives.map((objective, objIndex) => (
                                <li key={objIndex} className="text-text-secondary text-sm flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full bg-success" />
                                  {objective}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs text-text-muted font-medium mb-1">Deliverables:</p>
                            <ul className="space-y-1">
                              {phase.deliverables.map((deliverable, delIndex) => (
                                <li key={delIndex} className="text-text-secondary text-sm flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full bg-user-accent" />
                                  {deliverable}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16">
          <Separator className="mb-8" />
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Ready to Transform?</h2>
            <p className="text-text-secondary">{reportData.cta_customization.primary_message}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Strategy Call */}
            <Card className="selection-card text-center">
              <CardContent className="p-6">
                <Phone className="w-12 h-12 mx-auto mb-4 text-success" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Implement this plan!
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  {reportData.cta_customization.consultation_focus}
                </p>
                <Button 
                  onClick={() => handleCTAClick('free_call')}
                  className="btn-gabi w-full"
                >
                  Schedule Free Strategy Call
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Paid Consultation */}
            <Card className="selection-card text-center">
              <CardContent className="p-6">
                <Star className="w-12 h-12 mx-auto mb-4 text-warning" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Get personalized guidance
                </h3>
                <p className="text-text-secondary text-sm mb-2">
                  60 minutes of personalized AI consulting
                </p>
                <p className="text-user-accent font-semibold mb-4">
                  $100 - Includes detailed recommendations
                </p>
                <Button 
                  onClick={() => handleCTAClick('paid_consult')}
                  variant="outline"
                  className="w-full border-user-accent text-user-accent hover:bg-user-accent hover:text-white"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Book Consultation
                </Button>
              </CardContent>
            </Card>

            {/* GABI Signup */}
            <Card className="selection-card text-center">
              <CardContent className="p-6">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-gabi-purple" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Get GABI for your business
                </h3>
                <p className="text-text-secondary text-sm mb-2">
                  {reportData.cta_customization.gabi_pitch}
                </p>
                <p className="text-gabi-purple font-semibold mb-4">
                  $300/month + Implementation call
                </p>
                <Button 
                  onClick={() => handleCTAClick('gabi_signup')}
                  className="btn-gabi w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start with GABI
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="glass-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">
                <span className="gabi-text">GABI says:</span> How does this assessment land with you?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-colors ${
                      star <= rating ? 'text-warning' : 'text-text-muted'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Optional feedback..."
                className="input-field min-h-20 resize-none"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowFeedback(false)}
                  variant="outline" 
                  className="flex-1"
                >
                  Skip
                </Button>
                <Button 
                  onClick={handleFeedbackSubmit}
                  className="btn-gabi flex-1"
                >
                  Thanks for the feedback!
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AssessmentReport;