// Core types for GPT-4o curator with validated, pre-calculated data

export interface ValidatedAssessmentData {
  // Core fields (validated and cleaned)
  sessionId: string;
  company: string;
  email: string;
  businessType: string;
  opportunityFocus: string;
  revenueModel: string;
  revenueChallenge: string;
  teamProcess: string;
  solutionStack: string;
  investmentLevel: string;
  additionalContext: string;
  
  // Extracted/parsed fields (pre-processed for GPT-4o)
  parsed: {
    teamMembers: string[];
    stackComponents: string[];
    budgetRange: { min: number; max: number };
    avgDealSize: number;
    monthlyDeals: number;
    salesCycleMonths: number;
    conversionRate: number;
    employeeCount?: number;
    yearsFounded?: number;
    location?: string;
  };
  
  // Validation flags (for GPT-4o confidence adjustment)
  validation: {
    hasRequiredFields: boolean;
    hasNumericData: boolean;
    dataQuality: 'low' | 'medium' | 'high';
    warnings: string[];
    confidence: number;
    missingCriticalData: string[];
  };
}

export interface StructuredRAGData {
  tools: Array<{
    id: string;
    name: string;
    description: string;
    pricing: string;
    integrations: string[];
    gabiLayer: 'conversational' | 'function' | 'knowledge' | 'context';
    similarity: number;
    bestFor: string;
    implementation: string;
    category: string;
    icpScore: number;
  }>;
  
  metadata: {
    queryUsed: string;
    totalFound: number;
    avgSimilarity: number;
    timestamp: string;
    searchType: 'vector' | 'fallback' | 'local';
    confidence: number;
  };
}

export interface ParsedResearch {
  companyProfile: {
    website?: string;
    employeeCount?: string;
    yearsFounded?: string;
    location?: string;
    description?: string;
    industry?: string;
    competitors?: string[];
  };
  
  implementations: Array<{
    company: string;
    challenge: string;
    solution: string;
    result: string;
    source?: string;
    confidence: number;
  }>;
  
  marketTrends: Array<{
    trend: string;
    relevance: string;
    timeline: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  
  citations: Array<{
    url: string;
    title: string;
    snippet: string;
    confidence: number;
  }>;
  
  metadata: {
    searchQuery: string;
    totalSources: number;
    avgConfidence: number;
    researchDate: string;
  };
}

export interface PreCalculatedMetrics {
  current: {
    monthlyRevenue: number;
    annualRevenue: number;
    conversionRate: number;
    salesCycleMonths: number;
    teamCostMonthly: number;
    toolCostMonthly: number;
    opportunityCostMonthly: number;
    totalCostMonthly: number;
    revenuePerEmployee: number;
    customerAcquisitionCost: number;
  };
  
  target: {
    conversionRate: number;
    salesCycleMonths: number;
    monthlyRevenue: number;
    annualRevenue: number;
    efficiencyGain: number;
    automationLevel: number;
  };
  
  improvement: {
    conversionLift: number;
    conversionLiftPercent: number;
    revenueLift: number;
    revenueLiftPercent: number;
    timeSavingsHours: number;
    timeSavingsPercent: number;
    costReduction: number;
    costReductionPercent: number;
    productivityGain: number;
  };
  
  roi: {
    totalInvestment: number;
    monthlyReturn: number;
    annualReturn: number;
    paybackMonths: number;
    yearOneROI: number;
    threeYearROI: number;
    confidence: number;
    breakEvenMonth: number;
    irr: number; // Internal Rate of Return
  };
  
  benchmarks: {
    industryConversionRate: number;
    industrySalesCycle: number;
    industryDealSize: number;
    performanceGap: {
      conversion: number;
      cycle: number;
      efficiency: number;
    };
  };
}

export interface EnhancedCuratorInput {
  assessmentData: ValidatedAssessmentData;
  ragIntelligence: StructuredRAGData;
  perplexityResearch: ParsedResearch;
  calculations: PreCalculatedMetrics;
  validation: DataValidationReport;
  htmlMapping: HTMLSectionMapping;
  metadata: {
    processingTime: number;
    dataCompleteness: number;
    overallConfidence: number;
    recommendedApproach: 'conservative' | 'balanced' | 'aggressive';
    warningFlags: string[];
  };
}

export interface DataValidationReport {
  dataCompleteness: number; // 0-1 score
  missingFields: string[];
  suspiciousValues: Array<{
    field: string;
    value: any;
    reason: string;
    severity: 'low' | 'medium' | 'high';
    suggestion?: string;
  }>;
  recommendedActions: string[];
  confidence: number;
  qualityScore: number;
  requiresManualReview: boolean;
}

export interface HTMLSectionMapping {
  executiveSummary: 'exec-summary';
  gabiAdvantage: 'features-grid';
  currentState: 'section';
  benchmarks: 'section';
  solutions: 'solution-columns';
  futureState: 'timeline';
  roi: 'roi-table';
  marketContext: 'value-prop';
  recommendations: 'recommendation-cards';
  implementation: 'timeline-steps';
}

// Helper types for structured output
export interface CuratorOutput {
  sections: {
    executiveSummary: string;
    currentState: string;
    gabiAdvantage: string;
    solutions: string;
    futureState: string;
    roi: string;
    marketContext: string;
    recommendations: string;
  };
  
  metadata: {
    processingTime: number;
    dataQuality: string;
    confidence: number;
    warnings: string[];
  };
  
  validation: {
    htmlValid: boolean;
    sectionsComplete: boolean;
    calculationsValid: boolean;
  };
}

// Enums for better type safety
export enum DataQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum GABILayer {
  CONVERSATIONAL = 'conversational',
  FUNCTION = 'function', 
  KNOWLEDGE = 'knowledge',
  CONTEXT = 'context'
}

export enum ICPType {
  ITSM = 'itsm',
  AGENCY = 'agency',
  SAAS = 'saas',
  ENTERPRISE = 'enterprise'
}

// Configuration interfaces
export interface CuratorConfig {
  model: 'gpt-4o' | 'gpt-4o-mini';
  temperature: number;
  maxTokens: number;
  systemPromptTemplate: string;
  validationLevel: 'basic' | 'standard' | 'strict';
  fallbackBehavior: 'conservative' | 'estimated';
  htmlValidation: boolean;
}

export interface ValidationRules {
  requiredFields: string[];
  numericRanges: Record<string, { min: number; max: number }>;
  stringPatterns: Record<string, RegExp>;
  crossFieldValidations: Array<{
    fields: string[];
    rule: (values: any[]) => boolean;
    message: string;
  }>;
}