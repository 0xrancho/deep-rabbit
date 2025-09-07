// Enhanced Assessment Types for Deep Research Implementation
// Based on GABI Assessment Report Generation - Final Implementation Spec

export interface SuccessIndicator {
  metric: string;
  currentValue: number;
  targetValue: number;
  unit: '%' | 'hours' | 'days' | '$' | 'count' | 'minutes';
  timeframe: '30 days' | '90 days' | '6 months' | '12 months';
}

export interface BudgetRange {
  min: number;
  max: number;
  preference: 'crawl' | 'walk' | 'run';
}

export interface TeamSize {
  affected: number;
  department: string;
}

// Context inference results
export interface ContextInferences {
  maturityLevel: 'startup-chaos' | 'scaling-friction' | 'enterprise-inefficiency';
  hiddenMultipliers: string[];
  competitivePressure: 'low' | 'medium' | 'high';
}

// Enhanced assessment data extending existing interface
export interface EnhancedAssessmentData {
  // Base session data
  sessionId: string;
  fullName: string;
  company: string;
  email: string;
  subscribeUpdates: boolean;
  
  // Core assessment fields (existing)
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
  
  // Enhanced fields for deep research
  successIndicators: SuccessIndicator[];
  budgetRange: BudgetRange;
  painLevel: number; // 1-10 scale
  urgency: 'exploring' | 'ready-to-buy' | 'urgent-need';
  teamSize: TeamSize;
  desiredOutcome?: string; // Optional: "What does success look like?"
  
  // Renamed/aliased fields for better semantic meaning
  businessName: string; // alias for company
  icpType: string; // alias for businessType
  revenueChallenge: string; // derived from challenges[0]
  teamProcess: string; // alias for processDescription
  solutionStack: string; // derived from techStack
  
  // Status tracking
  status?: 'in_progress' | 'completed' | 'generating_report';
  completedAt?: string;
  reportId?: string;
  
  [key: string]: any;
}

// Research pipeline types
export interface ResearchResult {
  name: string;
  content: string;
  wasRetry?: boolean;
}

export interface ResearchStep {
  name: string;
  displayName: string;
  promptGenerator: (
    data: EnhancedAssessmentData,
    inferences: ContextInferences,
    previousResults: ResearchResult[]
  ) => string;
}

// KPI suggestion system
export interface KPISuggestion {
  metric: string;
  unit: SuccessIndicator['unit'];
  typical_current: number;
  typical_target: number;
  timeframe: SuccessIndicator['timeframe'];
  category: 'efficiency' | 'revenue' | 'cost' | 'quality';
}

// Report generation progress (extending existing)
export interface ReportGenerationProgress {
  status: 'initializing' | 'researching' | 'analyzing' | 'generating' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  step?: string;
  phase?: 'researching' | 'complete';
  estimated_remaining_ms?: number;
  duration?: number;
}

// Utility type for converting between existing and enhanced types
export type AssessmentDataConverter = {
  toEnhanced: (data: any) => EnhancedAssessmentData;
  fromEnhanced: (data: EnhancedAssessmentData) => any;
};