import { extractSuccessMetrics, extractBudgetRange, extractPainLevel, extractUrgency, extractTeamInfo } from '../dataHelpers';

// Simple interface for assessment data - compatible with existing structure
export interface AssessmentData {
  sessionId: string;
  fullName: string;
  company: string;
  businessName?: string; // alias for company
  email: string;
  subscribeUpdates: boolean;
  businessType?: string;
  icpType?: string; // alias for businessType
  opportunityFocus?: string;
  revenueModel?: string;
  challenges?: string[];
  revenueChallenge?: string; // derived from challenges[0]
  metrics?: Record<string, any>;
  metricsQuantified?: Record<string, string>;
  teamDescription?: string;
  processDescription?: string;
  teamProcess?: string; // alias for processDescription
  techStack?: string[];
  solutionStack?: string; // derived from techStack
  investmentLevel?: string;
  additionalContext?: string;
  [key: string]: any;
}

export interface ResearchTargets {
  companyProfile: string;
  industryBenchmarks: string;
  processAnalysis: string;
  solutionRequirements: string;
  financialContext: string;
}

export interface BusinessInferences {
  maturityLevel: 'startup-chaos' | 'scaling-friction' | 'enterprise-inefficiency';
  hiddenMultipliers: string[];
  urgencyLevel: 'exploring' | 'active-buying' | 'urgent-need';
}

export function compileResearchTargets(data: AssessmentData): ResearchTargets {
  // Extract domain from email for company research
  const domain = data.email?.split('@')[1] || '';
  const businessName = data.businessName || data.company || '';
  const icpType = data.icpType || data.businessType || 'Professional Services';
  const opportunityFocus = data.opportunityFocus || 'operational efficiency';
  const revenueModel = data.revenueModel || 'service-based revenue';
  const revenueChallenge = data.revenueChallenge || data.challenges?.[0] || 'operational efficiency';
  const teamProcess = data.teamProcess || data.processDescription || 'current business processes';
  const solutionStack = data.solutionStack || data.techStack?.join(', ') || 'existing technology stack';
  const investmentLevel = data.investmentLevel || 'moderate investment';
  
  // Build targeted research queries from cross-sections
  return {
    companyProfile: `${businessName} ${domain} company size team specializations ${icpType}`,
    
    industryBenchmarks: `${icpType} ${opportunityFocus} ${revenueModel} industry benchmarks metrics KPIs best practices`,
    
    processAnalysis: `${revenueChallenge} challenges when "${teamProcess}" bottlenecks solutions ${icpType} companies`,
    
    solutionRequirements: `AI automation tools for ${icpType} ${revenueChallenge} that integrate with ${solutionStack}`,
    
    financialContext: `${investmentLevel} budget ROI for ${revenueModel} ${icpType} automation pricing models`
  };
}

export function inferBusinessContext(data: AssessmentData): BusinessInferences {
  const teamProcess = data.teamProcess || data.processDescription || '';
  const solutionStack = data.solutionStack || data.techStack?.join(', ') || '';
  const revenueChallenge = data.revenueChallenge || data.challenges?.[0] || '';
  const additionalContext = data.additionalContext || '';
  const investmentLevel = data.investmentLevel || '';
  
  // Infer maturity from team size and process complexity
  const processComplexity = teamProcess.split(',').length || 1;
  const hasEnterpriseTech = solutionStack.toLowerCase().includes('salesforce') || 
                            solutionStack.toLowerCase().includes('oracle') ||
                            solutionStack.toLowerCase().includes('enterprise');
  
  let maturityLevel: BusinessInferences['maturityLevel'] = 'scaling-friction';
  
  if (processComplexity <= 2 && !hasEnterpriseTech) {
    maturityLevel = 'startup-chaos';
  } else if (processComplexity >= 5 || hasEnterpriseTech) {
    maturityLevel = 'enterprise-inefficiency';
  }
  
  // Infer hidden multipliers from challenge selection
  const hiddenMultipliers: string[] = [];
  
  if (revenueChallenge.toLowerCase().includes('lead') || revenueChallenge.toLowerCase().includes('generation')) {
    hiddenMultipliers.push('weak brand positioning', 'inefficient sales handoffs');
  }
  if (revenueChallenge.toLowerCase().includes('retention') || revenueChallenge.toLowerCase().includes('customer')) {
    hiddenMultipliers.push('poor onboarding', 'product-market fit issues');
  }
  if (revenueChallenge.toLowerCase().includes('sales') || revenueChallenge.toLowerCase().includes('conversion')) {
    hiddenMultipliers.push('pricing model confusion', 'weak value proposition');
  }
  if (revenueChallenge.toLowerCase().includes('manual') || revenueChallenge.toLowerCase().includes('process')) {
    hiddenMultipliers.push('operational bottlenecks', 'resource allocation inefficiencies');
  }
  if (revenueChallenge.toLowerCase().includes('reporting') || revenueChallenge.toLowerCase().includes('data')) {
    hiddenMultipliers.push('poor data visibility', 'decision-making delays');
  }
  
  // If no specific multipliers found, add generic ones
  if (hiddenMultipliers.length === 0) {
    hiddenMultipliers.push('operational inefficiencies', 'scaling bottlenecks');
  }
  
  // Infer urgency from investment level and additional context
  let urgencyLevel: BusinessInferences['urgencyLevel'] = 'exploring';
  
  if (investmentLevel.toLowerCase().includes('transformation') || 
      investmentLevel.toLowerCase().includes('comprehensive') ||
      investmentLevel.toLowerCase().includes('aggressive')) {
    urgencyLevel = 'active-buying';
  }
  if (additionalContext.toLowerCase().includes('urgent') || 
      additionalContext.toLowerCase().includes('asap') ||
      additionalContext.toLowerCase().includes('immediately') ||
      additionalContext.toLowerCase().includes('critical')) {
    urgencyLevel = 'urgent-need';
  }
  // Since they're taking the assessment, assume at least active buying intent
  if (urgencyLevel === 'exploring') {
    urgencyLevel = 'active-buying';
  }
  
  return {
    maturityLevel,
    hiddenMultipliers,
    urgencyLevel
  };
}