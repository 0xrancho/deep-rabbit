// Context Inference System for Business Maturity and Hidden Multipliers
import type { ContextInferences } from '@/types/assessment';

// Business maturity scoring weights
const MATURITY_INDICATORS = {
  teamSize: {
    'startup-chaos': [1, 10],      // 1-10 people
    'scaling-friction': [11, 50],   // 11-50 people
    'enterprise-inefficiency': [51, 1000] // 51+ people
  },
  
  budgetRange: {
    'startup-chaos': [0, 5000],         // $0-5k/month
    'scaling-friction': [5001, 25000],   // $5-25k/month
    'enterprise-inefficiency': [25001, 500000] // $25k+/month
  },

  processMaturity: {
    keywords: {
      'startup-chaos': ['manual', 'spreadsheet', 'email', 'ad-hoc', 'no process', 'chaos'],
      'scaling-friction': ['inconsistent', 'different teams', 'multiple tools', 'growing pains', 'scaling'],
      'enterprise-inefficiency': ['legacy system', 'bureaucracy', 'complex approval', 'compliance', 'enterprise']
    }
  }
};

// Hidden multiplier patterns - what other problems likely exist
const MULTIPLIER_PATTERNS = {
  'Manual data entry and processing': [
    'Data quality issues cascading to reporting',
    'High error rates affecting customer trust', 
    'Employee burnout from repetitive tasks',
    'Inability to scale without proportional headcount increase'
  ],
  
  'Inefficient communication and collaboration': [
    'Duplicate work across teams',
    'Delayed decision making impacting competitiveness',
    'Knowledge silos creating single points of failure',
    'Client delivery delays due to internal friction'
  ],
  
  'Time-consuming reporting and analysis': [
    'Delayed strategic decision making',
    'Missed market opportunities due to slow insights',
    'Management overhead consuming productive time',
    'Difficulty tracking ROI and performance metrics'
  ],
  
  'Customer service response times': [
    'Customer churn increasing acquisition costs',
    'Negative brand reputation in market',
    'Staff stress and turnover in support teams',
    'Lost revenue from dissatisfied customers'
  ],
  
  'Quality control and consistency issues': [
    'Rework costs consuming profit margins',
    'Customer complaints damaging relationships',
    'Regulatory compliance risks',
    'Competitive disadvantage from unreliable delivery'
  ],
  
  'Scaling operations and processes': [
    'Operational costs growing faster than revenue',
    'Team burnout from unsustainable growth',
    'Quality degradation under increased volume',
    'Infrastructure limitations creating bottlenecks'
  ]
};

// Competitive pressure indicators
const COMPETITIVE_PRESSURE_INDICATORS = {
  urgency: {
    'exploring': 'low',
    'ready-to-buy': 'medium', 
    'urgent-need': 'high'
  },
  
  painLevel: {
    low: [1, 4],    // 1-4 pain = low competitive pressure
    medium: [5, 7], // 5-7 pain = medium competitive pressure  
    high: [8, 10]   // 8-10 pain = high competitive pressure
  },

  businessType: {
    high: ['SaaS Platform', 'E-commerce', 'FinTech', 'Digital Marketing'],
    medium: ['Professional Services', 'Custom Development', 'Healthcare', 'Education'],
    low: ['Non-profit', 'Government', 'Utilities', 'Manufacturing']
  }
};

// Rule-based context inference function
export async function inferBusinessContext(data: any): Promise<ContextInferences> {
  // Determine maturity level
  const maturityLevel = determineMaturityLevel(data);
  
  // Identify hidden multipliers
  const hiddenMultipliers = identifyHiddenMultipliers(data);
  
  // Assess competitive pressure
  const competitivePressure = assessCompetitivePressure(data);
  
  return {
    maturityLevel,
    hiddenMultipliers,
    competitivePressure
  };
}

function determineMaturityLevel(data: any): ContextInferences['maturityLevel'] {
  let score = 0;
  let factors = 0;

  // Team size scoring - extract from teamDescription or default
  const teamDesc = data.teamDescription || '';
  const teamSizeMatch = teamDesc.match(/(\d+)\s*(?:people|person|team|member|employee)/i);
  const teamAffected = teamSizeMatch ? parseInt(teamSizeMatch[1]) : 5;
  if (teamAffected <= 10) {
    score += 1; // startup-chaos
  } else if (teamAffected <= 50) {
    score += 2; // scaling-friction
  } else {
    score += 3; // enterprise-inefficiency
  }
  factors++;

  // Budget range scoring - infer from investment level
  const investmentLevel = data.investmentLevel || '';
  let avgBudget = 5000; // default
  if (investmentLevel.toLowerCase().includes('quick win')) {
    avgBudget = 3500;
  } else if (investmentLevel.toLowerCase().includes('enterprise')) {
    avgBudget = 20000;
  } else if (investmentLevel.toLowerCase().includes('transformation')) {
    avgBudget = 10000;
  }
  if (avgBudget <= 5000) {
    score += 1; // startup-chaos
  } else if (avgBudget <= 25000) {
    score += 2; // scaling-friction
  } else {
    score += 3; // enterprise-inefficiency
  }
  factors++;

  // Process description analysis
  const processText = (data.teamProcess || data.processDescription || '').toLowerCase();
  let processScore = 2; // default to scaling-friction

  const chaosKeywords = MATURITY_INDICATORS.processMaturity.keywords['startup-chaos'];
  const enterpriseKeywords = MATURITY_INDICATORS.processMaturity.keywords['enterprise-inefficiency'];
  
  if (chaosKeywords.some(keyword => processText.includes(keyword))) {
    processScore = 1; // startup-chaos
  } else if (enterpriseKeywords.some(keyword => processText.includes(keyword))) {
    processScore = 3; // enterprise-inefficiency
  }
  
  score += processScore;
  factors++;

  // Tech stack complexity
  const techStackCount = data.techStack?.length || 0;
  if (techStackCount <= 2) {
    score += 1; // simple stack = startup-chaos
  } else if (techStackCount <= 5) {
    score += 2; // moderate stack = scaling-friction
  } else {
    score += 3; // complex stack = enterprise-inefficiency
  }
  factors++;

  // Calculate average score
  const avgScore = score / factors;

  if (avgScore <= 1.5) return 'startup-chaos';
  if (avgScore <= 2.5) return 'scaling-friction';
  return 'enterprise-inefficiency';
}

function identifyHiddenMultipliers(data: any): string[] {
  const multipliers: string[] = [];
  
  // Primary challenge multipliers
  const primaryChallenge = data.challenges?.[0] || 'operational efficiency';
  if (primaryChallenge && MULTIPLIER_PATTERNS[primaryChallenge]) {
    multipliers.push(...MULTIPLIER_PATTERNS[primaryChallenge]);
  }

  // Cross-reference with other indicators
  
  // High pain level multipliers - infer from context
  const allText = [data.additionalContext, data.processDescription, data.teamDescription].filter(Boolean).join(' ');
  if (allText.toLowerCase().includes('critical') || allText.toLowerCase().includes('urgent')) {
    multipliers.push('Crisis mode operations draining leadership focus');
    multipliers.push('Staff morale issues affecting overall productivity');
  }
  
  // Budget constraints multipliers
  if (data.investmentLevel?.toLowerCase().includes('quick win')) {
    multipliers.push('Limited budget constraining solution options');
  }
  
  // Team size vs complexity multipliers  
  const teamDesc = data.teamDescription || '';
  const teamSizeMatch = teamDesc.match(/(\d+)\s*(?:people|person|team|member|employee)/i);
  const teamAffected = teamSizeMatch ? parseInt(teamSizeMatch[1]) : 5;
  const challengeCount = data.challenges?.length || 1;
  if (challengeCount > 2 && teamAffected < 10) {
    multipliers.push('Small team handling multiple complex challenges');
  }

  // Process complexity multipliers
  if (data.processDescription && data.processDescription.length > 200) {
    multipliers.push('Complex manual processes creating bottlenecks across operations');
  }

  // Remove duplicates and limit to most relevant
  const uniqueMultipliers = [...new Set(multipliers)];
  return uniqueMultipliers.slice(0, 4); // Limit to 4 most relevant multipliers
}

function assessCompetitivePressure(data: any): ContextInferences['competitivePressure'] {
  let pressureScore = 0;
  let factors = 0;

  // Urgency-based pressure - infer from context
  const contextText = [data.additionalContext, data.processDescription].filter(Boolean).join(' ').toLowerCase();
  if (contextText.includes('urgent') || contextText.includes('asap') || contextText.includes('critical')) {
    pressureScore += 3; // high urgency
  } else if (contextText.includes('soon') || contextText.includes('planning')) {
    pressureScore += 2; // medium urgency
  } else {
    pressureScore += 1; // low urgency
  }
  factors++;

  // Pain level pressure - infer from description
  if (contextText.includes('critical') || contextText.includes('failing') || contextText.includes('crisis')) {
    pressureScore += 3; // high pain
  } else if (contextText.includes('significant') || contextText.includes('struggling') || contextText.includes('difficult')) {
    pressureScore += 2; // medium pain
  } else {
    pressureScore += 1; // low pain
  }
  factors++;

  // Business type pressure
  const businessType = data.icpType || data.businessType || '';
  const highPressureTypes = COMPETITIVE_PRESSURE_INDICATORS.businessType.high;
  const mediumPressureTypes = COMPETITIVE_PRESSURE_INDICATORS.businessType.medium;
  
  if (highPressureTypes.some(type => businessType.includes(type))) {
    pressureScore += 3;
  } else if (mediumPressureTypes.some(type => businessType.includes(type))) {
    pressureScore += 2;
  } else {
    pressureScore += 1;
  }
  factors++;

  // Process complexity pressure (complex processes suggest competitive pressure)
  if (data.processDescription && data.processDescription.length > 150) {
    pressureScore += 1; // Complex processes suggest need for competitive advantage
    factors++;
  }

  const avgPressure = pressureScore / factors;

  if (avgPressure <= 1.5) return 'low';
  if (avgPressure <= 2.5) return 'medium';
  return 'high';
}

// OpenAI-powered context inference (enhanced version)
export async function inferBusinessContextWithAI(data: EnhancedAssessmentData): Promise<ContextInferences> {
  // For now, fallback to rule-based inference
  // In production, this could use OpenAI API for more nuanced analysis
  
  try {
    // Placeholder for OpenAI API call
    // This would analyze the full context more deeply using LLM reasoning
    
    const prompt = `
Analyze this business profile and infer:

Company: ${data.businessName}
Team Size: ${data.teamSize?.affected} in ${data.teamSize?.department}
Budget Range: $${data.budgetRange?.min}-${data.budgetRange?.max}/month
Pain Level: ${data.painLevel}/10
Challenge: ${data.revenueChallenge}
Process: ${data.teamProcess}
Tech Stack: ${data.solutionStack}
Urgency: ${data.urgency}

Provide analysis of:
1. Company maturity level (startup-chaos, scaling-friction, or enterprise-inefficiency)
2. Hidden multiplier effects (what other problems exist due to this challenge)
3. Competitive pressure level (low, medium, high)

Return structured insights with reasoning.
    `;

    // For now, use rule-based inference
    return await inferBusinessContext(data);
    
  } catch (error) {
    console.error('AI context inference failed, using rule-based fallback:', error);
    return await inferBusinessContext(data);
  }
}

// Utility function to get maturity-specific recommendations
export function getMaturitySpecificInsights(maturityLevel: ContextInferences['maturityLevel']) {
  const insights = {
    'startup-chaos': {
      focus: 'Establish foundational processes',
      timeframe: '1-3 months',
      approach: 'Quick wins and process standardization',
      risks: ['Over-engineering solutions', 'Premature optimization'],
      opportunities: ['High impact from basic automation', 'Flexible implementation']
    },
    'scaling-friction': {
      focus: 'Optimize and systematize existing processes',
      timeframe: '3-6 months', 
      approach: 'Balanced automation with change management',
      risks: ['Resistance to change', 'Integration complexity'],
      opportunities: ['Leverage existing investments', 'Clear ROI measurement']
    },
    'enterprise-inefficiency': {
      focus: 'Legacy modernization and compliance-aware automation',
      timeframe: '6-12 months',
      approach: 'Phased transformation with governance',
      risks: ['Regulatory compliance', 'Change management scale'],
      opportunities: ['Massive scale benefits', 'Strategic competitive advantage']
    }
  };

  return insights[maturityLevel];
}

// Export utility functions
export {
  MATURITY_INDICATORS,
  MULTIPLIER_PATTERNS,
  COMPETITIVE_PRESSURE_INDICATORS
};