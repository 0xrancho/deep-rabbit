// Data extraction helpers to work with existing assessment data structure
// Flexibly extracts metrics and budget info from whatever fields exist

interface AssessmentData {
  sessionId: string;
  fullName: string;
  company: string;
  email: string;
  subscribeUpdates: boolean;
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

// Extract success metrics from various possible field formats
export function extractSuccessMetrics(data: AssessmentData): string {
  // Check for explicit KPI structures (if they exist)
  if (data.successIndicators && Array.isArray(data.successIndicators)) {
    return data.successIndicators
      .map((kpi: any) => `${kpi.metric}: ${kpi.currentValue}${kpi.unit} → ${kpi.targetValue}${kpi.unit}`)
      .join(', ');
  }
  
  // Check metricsQuantified field
  if (data.metricsQuantified && Object.keys(data.metricsQuantified).length > 0) {
    return Object.entries(data.metricsQuantified)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }
  
  // Check generic metrics field
  if (data.metrics && typeof data.metrics === 'object') {
    const metricsStr = Object.entries(data.metrics)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    if (metricsStr) return metricsStr;
  }
  
  // Check for goals/kpis fields
  if (data.goals && typeof data.goals === 'string') {
    return data.goals;
  }
  
  if (data.kpis && typeof data.kpis === 'string') {
    return data.kpis;
  }
  
  // Fallback: infer from challenge and process description
  const primaryChallenge = data.challenges?.[0] || 'operational efficiency';
  const processDesc = data.processDescription || data.teamProcess || '';
  
  // Extract time/effort indicators from process description
  if (processDesc.toLowerCase().includes('hours') || processDesc.toLowerCase().includes('days')) {
    return `reducing time spent on ${primaryChallenge} (currently described as: "${processDesc.substring(0, 100)}...")`;
  }
  
  // Default metric based on challenge type
  const metricMap: Record<string, string> = {
    'manual data entry and processing': 'reduce processing time by 60-80%',
    'inefficient communication and collaboration': 'improve response time and reduce meeting overhead',
    'time-consuming reporting and analysis': 'automate reporting to save 70% of manual effort',
    'customer service response times': 'achieve sub-2-hour response times',
    'quality control and consistency issues': 'reduce error rates by 80%',
    'scaling operations and processes': 'increase throughput capacity by 200%'
  };
  
  return metricMap[primaryChallenge] || `improving ${primaryChallenge} efficiency`;
}

// Extract budget range from existing investment level or infer from business context
export function extractBudgetRange(data: AssessmentData): { min: number; max: number } {
  // Safety check - if data is undefined or null, return default
  if (!data) {
    console.warn('extractBudgetRange: data is undefined, returning default budget range');
    return { min: 5000, max: 25000 };
  }
  
  // Check for explicit budget fields
  if (data.budgetRange && typeof data.budgetRange === 'object') {
    return {
      min: data.budgetRange.min || 2000,
      max: data.budgetRange.max || 10000
    };
  }
  
  if (data.budget && typeof data.budget === 'object') {
    return {
      min: data.budget.min || 2000,
      max: data.budget.max || 10000
    };
  }
  
  // Map investment level to budget ranges
  if (data.investmentLevel) {
    const level = data.investmentLevel.toLowerCase();
    
    if (level.includes('quick win') || level.includes('low') || level.includes('conservative')) {
      return { min: 2000, max: 5000 };
    }
    
    if (level.includes('transformation') || level.includes('moderate') || level.includes('balanced')) {
      return { min: 5000, max: 15000 };
    }
    
    if (level.includes('enterprise') || level.includes('aggressive') || level.includes('comprehensive')) {
      return { min: 10000, max: 30000 };
    }
  }
  
  // Infer from business type and team size
  const businessType = data.businessType || '';
  const teamDesc = data.teamDescription || '';
  
  // Extract team size indicators
  const teamSizeMatch = teamDesc.match(/(\d+)\s*(?:people|person|team|member|employee)/i);
  const teamSize = teamSizeMatch ? parseInt(teamSizeMatch[1]) : 5;
  
  // Estimate budget based on team size and business type
  if (businessType.toLowerCase().includes('enterprise') || teamSize > 20) {
    return { min: 8000, max: 25000 };
  }
  
  if (businessType.toLowerCase().includes('saas') || businessType.toLowerCase().includes('technology')) {
    return { min: 5000, max: 15000 };
  }
  
  // Default for most businesses
  return { min: 3000, max: 12000 };
}

// Extract pain level from description and context
export function extractPainLevel(data: AssessmentData): number {
  const painIndicators = [
    data.additionalContext,
    data.processDescription,
    data.teamDescription,
    data.challenges?.join(' ')
  ].filter(Boolean).join(' ').toLowerCase();
  
  // High pain indicators (8-10)
  const highPainWords = ['critical', 'urgent', 'crisis', 'failing', 'breaking', 'impossible', 'disaster'];
  if (highPainWords.some(word => painIndicators.includes(word))) {
    return 9;
  }
  
  // Medium-high pain indicators (6-8)
  const medHighPainWords = ['significant', 'major', 'serious', 'struggling', 'difficult', 'problem'];
  if (medHighPainWords.some(word => painIndicators.includes(word))) {
    return 7;
  }
  
  // Medium pain indicators (4-6)
  const medPainWords = ['inefficient', 'slow', 'manual', 'time-consuming', 'bottleneck'];
  if (medPainWords.some(word => painIndicators.includes(word))) {
    return 5;
  }
  
  // Default moderate pain
  return 6;
}

// Extract team size information
export function extractTeamInfo(data: AssessmentData): { affected: number; department: string } {
  const teamDesc = data.teamDescription || '';
  
  // Try to extract number of people
  const teamSizeMatch = teamDesc.match(/(\d+)\s*(?:people|person|team|member|employee|analyst|specialist)/i);
  const affected = teamSizeMatch ? parseInt(teamSizeMatch[1]) : 5;
  
  // Try to extract department from various fields
  const deptIndicators = [
    data.teamDescription,
    data.opportunityFocus,
    data.businessType,
    data.processDescription
  ].filter(Boolean).join(' ').toLowerCase();
  
  const deptMap = {
    'sales': ['sales', 'selling', 'revenue', 'lead', 'prospect'],
    'operations': ['operations', 'process', 'workflow', 'service', 'delivery'],
    'it': ['it', 'technology', 'technical', 'development', 'software'],
    'customer service': ['customer', 'support', 'service', 'client'],
    'finance': ['finance', 'accounting', 'financial', 'billing'],
    'hr': ['hr', 'human resources', 'recruiting', 'hiring'],
    'marketing': ['marketing', 'campaign', 'content', 'digital']
  };
  
  for (const [dept, keywords] of Object.entries(deptMap)) {
    if (keywords.some(keyword => deptIndicators.includes(keyword))) {
      return { affected, department: dept.charAt(0).toUpperCase() + dept.slice(1) };
    }
  }
  
  return { affected, department: 'Operations' };
}

// Extract urgency level from context
export function extractUrgency(data: AssessmentData): 'exploring' | 'ready-to-buy' | 'urgent-need' {
  const contextText = [
    data.additionalContext,
    data.processDescription,
    data.challenges?.join(' ')
  ].filter(Boolean).join(' ').toLowerCase();
  
  // Urgent need indicators
  const urgentWords = ['urgent', 'asap', 'immediately', 'crisis', 'critical', 'now', 'emergency'];
  if (urgentWords.some(word => contextText.includes(word))) {
    return 'urgent-need';
  }
  
  // Ready to buy indicators
  const readyWords = ['ready', 'planning', 'budget', 'timeline', 'soon', 'next quarter'];
  if (readyWords.some(word => contextText.includes(word))) {
    return 'ready-to-buy';
  }
  
  // Default to ready-to-buy since they're completing assessment
  return 'ready-to-buy';
}

// Create enhanced assessment data from existing data
export function enhanceAssessmentData(data: AssessmentData): any {
  return {
    ...data,
    // Semantic aliases
    businessName: data.company,
    icpType: data.businessType || 'Professional Services',
    revenueChallenge: data.challenges?.[0] || 'operational efficiency',
    teamProcess: data.processDescription || 'manual processes requiring optimization',
    solutionStack: data.techStack?.join(', ') || 'legacy systems',
    
    // Extracted/inferred enhanced fields
    successMetrics: extractSuccessMetrics(data),
    budgetRange: extractBudgetRange(data),
    painLevel: extractPainLevel(data),
    urgency: extractUrgency(data),
    teamInfo: extractTeamInfo(data),
    
    // For backward compatibility
    successIndicators: [{
      metric: extractSuccessMetrics(data),
      description: `Based on ${data.challenges?.[0] || 'current process'}`
    }]
  };
}