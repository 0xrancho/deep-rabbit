// GABI AI Assessment Prompt Engineering System
// Carefully crafted prompts for consistent, high-quality AI analysis

import type { AssessmentRecord } from '@/lib/supabase';

// Industry benchmarks and context data
const INDUSTRY_BENCHMARKS = {
  'IT Service Management (ITSM)': {
    typical_challenges: ['Ticket volume management', 'Response time optimization', 'Knowledge base maintenance'],
    automation_opportunities: ['Automated ticket routing', 'Predictive maintenance', 'Self-service portals'],
    average_roi: '250-400%',
    implementation_time: '3-6 months'
  },
  'Custom Development': {
    typical_challenges: ['Project scoping accuracy', 'Code quality consistency', 'Client communication'],
    automation_opportunities: ['Code generation', 'Automated testing', 'Project estimation'],
    average_roi: '200-350%',
    implementation_time: '4-8 months'
  },
  'Marketing Agency': {
    typical_challenges: ['Campaign performance tracking', 'Content creation scale', 'Lead qualification'],
    automation_opportunities: ['Content generation', 'Campaign optimization', 'Lead scoring'],
    average_roi: '300-500%',
    implementation_time: '2-4 months'
  },
  'Management Consulting': {
    typical_challenges: ['Research efficiency', 'Report generation', 'Client insights'],
    automation_opportunities: ['Data analysis', 'Report automation', 'Insight generation'],
    average_roi: '200-300%',
    implementation_time: '3-6 months'
  },
  'Systems Integration': {
    typical_challenges: ['Integration complexity', 'Testing thoroughness', 'Documentation'],
    automation_opportunities: ['Integration testing', 'Documentation generation', 'System monitoring'],
    average_roi: '250-400%',
    implementation_time: '4-8 months'
  },
  'Data & Analytics Consulting': {
    typical_challenges: ['Data quality', 'Insight generation', 'Report automation'],
    automation_opportunities: ['Data cleaning', 'Automated analysis', 'Dashboard creation'],
    average_roi: '300-600%',
    implementation_time: '3-6 months'
  },
  'Cybersecurity Services': {
    typical_challenges: ['Threat detection', 'Compliance reporting', 'Risk assessment'],
    automation_opportunities: ['Threat analysis', 'Compliance automation', 'Risk scoring'],
    average_roi: '200-350%',
    implementation_time: '4-8 months'
  },
  'Sales/Corporate Training': {
    typical_challenges: ['Content personalization', 'Progress tracking', 'Effectiveness measurement'],
    automation_opportunities: ['Personalized training', 'Progress analytics', 'Content generation'],
    average_roi: '250-400%',
    implementation_time: '2-4 months'
  }
};

// Investment level mappings
const INVESTMENT_LEVELS = {
  'Quick Win': {
    budget_range: '$5,000 - $15,000',
    timeline: '3-5 weeks',
    scope: 'Single tool or automation',
    typical_solutions: ['Workflow automation', 'Simple AI integration', 'Process optimization']
  },
  'Transformation': {
    budget_range: '$15,000 - $50,000',
    timeline: '3-6 months',
    scope: 'Department-wide system',
    typical_solutions: ['Multi-tool integration', 'AI-powered analytics', 'Process redesign']
  },
  'Enterprise': {
    budget_range: '$50,000 - $200,000+',
    timeline: '6-12 months',
    scope: 'Company-wide AI operations',
    typical_solutions: ['Enterprise AI platform', 'Custom AI development', 'Organization transformation']
  }
};

// Helper function to get industry context
export const getIndustryContext = (businessType: string) => {
  return INDUSTRY_BENCHMARKS[businessType as keyof typeof INDUSTRY_BENCHMARKS] || {
    typical_challenges: ['Process inefficiencies', 'Manual overhead', 'Scalability issues'],
    automation_opportunities: ['Process automation', 'Data analysis', 'Customer service'],
    average_roi: '200-300%',
    implementation_time: '3-6 months'
  };
};

// Helper function to get investment context
export const getInvestmentContext = (investmentLevel: string) => {
  return INVESTMENT_LEVELS[investmentLevel as keyof typeof INVESTMENT_LEVELS] || INVESTMENT_LEVELS['Transformation'];
};

// Core system prompt for GABI personality
export const GABI_SYSTEM_PROMPT = `You are GABI (Generative AI Business Intelligence), an expert AI transformation consultant with deep experience helping service businesses implement AI solutions.

Your personality:
- Professional yet approachable
- Data-driven and specific
- Focused on practical, actionable recommendations
- Honest about challenges and realistic about timelines
- Enthusiastic about AI potential but grounded in business reality

Your expertise:
- AI transformation strategy
- Business process optimization
- ROI analysis and projection
- Implementation planning
- Industry-specific solutions

Always provide:
- Specific, actionable recommendations
- Realistic timelines and budgets
- Clear ROI projections with methodology
- Risk assessment and mitigation strategies
- Next steps that move the client forward

Format all responses as valid JSON unless specifically requested otherwise.`;

// Confidence evaluation prompt
export const buildConfidencePrompt = (assessmentData: AssessmentRecord): string => {
  const industryContext = getIndustryContext(assessmentData.business_type || '');
  
  return `
Evaluate the completeness and quality of this AI transformation assessment. Score from 0.0 to 1.0 based on how well we can generate actionable recommendations.

CLIENT PROFILE:
Company: ${assessmentData.company}
Business Type: ${assessmentData.business_type || 'Not specified'}
Opportunity Focus: ${assessmentData.opportunity_focus || 'Not specified'}
Investment Level: ${assessmentData.investment_level || 'Not specified'}

ASSESSMENT DATA COMPLETENESS:
Business Context:
- Revenue Model: ${assessmentData.revenue_model ? `"${assessmentData.revenue_model}"` : 'Not provided'}
- Team Structure: ${assessmentData.team_description ? `"${assessmentData.team_description}"` : 'Not provided'}

Process Analysis:
- Current Process: ${assessmentData.process_description ? `"${assessmentData.process_description}"` : 'Not provided'}
- Key Challenges: ${assessmentData.challenges?.length ? assessmentData.challenges.join(', ') : 'Not specified'}
- Current Tech: ${assessmentData.tech_stack?.length ? assessmentData.tech_stack.join(', ') : 'Not specified'}

EVALUATION CRITERIA:
1. Process Clarity (40% weight): Can we understand their current workflow well enough to recommend specific improvements?
2. Challenge Specificity (25% weight): Are the challenges specific enough to target with AI solutions?  
3. Technical Context (20% weight): Do we understand their current tools and capabilities?
4. Business Context (15% weight): Do we understand their business model and constraints?

INDUSTRY CONTEXT:
This is a ${assessmentData.business_type} business. Typical challenges include: ${industryContext.typical_challenges.join(', ')}.
Common automation opportunities: ${industryContext.automation_opportunities.join(', ')}.

Return JSON with this exact structure:
{
  "score": 0.0-1.0,
  "gaps": ["specific missing information that would improve recommendations"],
  "follow_up_questions": ["specific questions to ask if score < 0.7"],
  "reasoning": "detailed explanation of the score focusing on actionability",
  "data_quality": {
    "process_clarity": 0.0-1.0,
    "challenge_specificity": 0.0-1.0, 
    "technical_context": 0.0-1.0,
    "business_context": 0.0-1.0
  }
}

Focus on: Can we generate specific, actionable AI recommendations based on this data?
`;
};

// Report generation prompt
export const buildReportPrompt = (assessmentData: AssessmentRecord): string => {
  const industryContext = getIndustryContext(assessmentData.business_type || '');
  const investmentContext = getInvestmentContext(assessmentData.investment_level || 'Transformation');
  
  return `
Generate a comprehensive AI transformation assessment report for this client. Make it specific, actionable, and valuable.

CLIENT PROFILE:
Company: ${assessmentData.company}
Contact: ${assessmentData.full_name}
Business: ${assessmentData.business_type} - ${assessmentData.opportunity_focus}
Investment Level: ${assessmentData.investment_level} (${investmentContext.budget_range}, ${investmentContext.timeline})

CURRENT STATE ANALYSIS:
Revenue Model: ${assessmentData.revenue_model || 'Not specified'}
Team Structure: ${assessmentData.team_description || 'Not specified'}

Current Process: ${assessmentData.process_description || 'Not specified'}

Key Challenges:
${assessmentData.challenges?.map(c => `- ${c}`).join('\n') || '- Not specified'}

Current Technology Stack:
${assessmentData.tech_stack?.map(t => `- ${t}`).join('\n') || '- Not specified'}

Additional Context: ${assessmentData.additional_context || 'None provided'}

INDUSTRY BENCHMARKS FOR ${assessmentData.business_type}:
- Typical Challenges: ${industryContext.typical_challenges.join(', ')}
- Automation Opportunities: ${industryContext.automation_opportunities.join(', ')}  
- Average ROI: ${industryContext.average_roi}
- Typical Implementation: ${industryContext.implementation_time}

INVESTMENT LEVEL CONTEXT:
Budget: ${investmentContext.budget_range}
Timeline: ${investmentContext.timeline}
Scope: ${investmentContext.scope}
Typical Solutions: ${investmentContext.typical_solutions.join(', ')}

REQUIREMENTS:
1. Executive Summary: 2-3 paragraphs with key findings, primary opportunity, and expected ROI
2. Current State: Analysis of their specific process, pain points, and inefficiencies  
3. AI Opportunities: 4-5 specific AI applications relevant to their challenges and industry
4. Recommendations: Prioritized solutions that fit their investment level and timeline
5. Roadmap: 3-phase implementation plan with specific milestones
6. ROI Projections: Quantified benefits with methodology (time savings, cost reduction, revenue impact)
7. Next Steps: 3-4 immediate actions they can take

Make recommendations specific to their:
- Stated challenges (${assessmentData.challenges?.join(', ') || 'general optimization'})
- Current tech stack integration
- Investment level and timeline constraints
- Business model and revenue structure

Return JSON with this exact structure:
{
  "id": "report_${Date.now()}",
  "sections": {
    "executive_summary": {
      "title": "Executive Summary",
      "content": "2-3 paragraphs with key findings and ROI potential",
      "key_takeaways": ["3-4 bullet points of main insights"]
    },
    "current_state": {
      "title": "Current State Analysis",
      "content": "Analysis of current processes and pain points",
      "inefficiencies": ["specific inefficiencies identified"],
      "strengths": ["existing strengths to build upon"]
    },
    "opportunities": {
      "title": "AI Transformation Opportunities", 
      "content": "Overview of AI potential for this business",
      "specific_applications": [
        {
          "name": "Application Name",
          "description": "What it does",
          "impact": "Expected business impact",
          "effort": "Implementation effort level"
        }
      ]
    },
    "recommendations": {
      "title": "Recommended Solutions",
      "content": "Prioritized recommendations overview",
      "priority_solutions": [
        {
          "name": "Solution Name",
          "description": "Detailed description",
          "business_case": "Why this solution first",
          "estimated_cost": "Cost range",
          "timeline": "Implementation time"
        }
      ]
    },
    "roadmap": {
      "title": "Implementation Roadmap",
      "content": "Phased approach overview",
      "phases": [
        {
          "name": "Phase Name",
          "duration": "Timeline",
          "objectives": ["Key objectives"],
          "deliverables": ["What gets delivered"],
          "success_metrics": ["How to measure success"]
        }
      ]
    },
    "roi_projections": {
      "title": "ROI Projections",
      "content": "Financial impact analysis",
      "projections": {
        "time_savings": "X hours/week",
        "cost_reduction": "$X,XXX annually", 
        "revenue_impact": "$X,XXX potential increase",
        "efficiency_gains": "X% improvement",
        "payback_period": "X months"
      },
      "methodology": "How these numbers were calculated"
    },
    "next_steps": {
      "title": "Next Steps",
      "content": "Immediate actions overview",
      "immediate_actions": ["3-4 things they can do now"],
      "follow_up": ["How to continue the conversation"]
    }
  },
  "confidence_score": 0.0-1.0,
  "generation_metadata": {
    "tokens_used": estimated_tokens,
    "model_version": "gpt-4o",
    "analysis_approach": "industry-specific with investment level matching"
  }
}

Focus on being specific and actionable. Avoid generic advice. Reference their specific business context throughout.
`;
};

// Process validation prompt
export const buildProcessValidationPrompt = (
  businessType: string,
  processDescription: string,
  challenges: string[]
): string => {
  const industryContext = getIndustryContext(businessType);
  
  return `
Validate this business process description for actionable AI recommendation generation.

BUSINESS CONTEXT:
Type: ${businessType}
Industry Typical Challenges: ${industryContext.typical_challenges.join(', ')}

PROCESS DESCRIPTION TO VALIDATE:
"${processDescription}"

STATED CHALLENGES:
${challenges.map(c => `- ${c}`).join('\n')}

VALIDATION CRITERIA:
1. Specificity: Are concrete steps and tools mentioned?
2. Pain Points: Are inefficiencies and bottlenecks clear?
3. Workflow: Is the sequence of activities understandable? 
4. Integration: Can we identify where AI solutions would fit?
5. Measurability: Are there quantifiable aspects we can improve?

Return JSON:
{
  "isValid": true/false,
  "score": 0.0-1.0,
  "strengths": ["what's good about this description"],
  "gaps": ["what's missing for AI recommendations"],
  "suggestions": ["specific questions to ask for better detail"],
  "ai_opportunities": ["potential AI applications based on current description"]
}

Be constructive and specific in suggestions.
`;
};

// Quick recommendation prompt for step validation
export const buildQuickRecommendationPrompt = (
  assessmentData: Partial<AssessmentRecord>,
  currentStep: number
): string => {
  return `
Provide quick validation and next-step guidance for this assessment in progress.

CURRENT DATA (Step ${currentStep}/10):
${JSON.stringify(assessmentData, null, 2)}

Based on what we know so far, provide:
1. Data quality assessment
2. Early opportunity identification  
3. Guidance for remaining steps

Return JSON:
{
  "data_quality": "assessment of current data",
  "early_opportunities": ["potential AI applications visible already"],
  "guidance": "what to focus on in remaining steps",
  "confidence": 0.0-1.0
}

Keep it brief but insightful.
`;
};

// Follow-up question generation
export const buildFollowUpPrompt = (
  assessmentData: AssessmentRecord,
  gaps: string[]
): string => {
  return `
Generate specific follow-up questions to fill these gaps in the AI assessment:

CLIENT: ${assessmentData.company} (${assessmentData.business_type})

IDENTIFIED GAPS:
${gaps.map(g => `- ${g}`).join('\n')}

CURRENT DATA:
- Process: ${assessmentData.process_description || 'Not provided'}
- Challenges: ${assessmentData.challenges?.join(', ') || 'Not specified'}
- Tech Stack: ${assessmentData.tech_stack?.join(', ') || 'Not specified'}

Generate 3-5 specific, actionable questions that would help us provide better AI recommendations.

Return JSON:
{
  "questions": [
    {
      "question": "Specific question text",
      "purpose": "Why this question helps AI recommendations",
      "category": "process|technology|business|metrics"
    }
  ]
}

Make questions conversational but precise.
`;
};

// Export all prompt builders
export const prompts = {
  buildConfidencePrompt,
  buildReportPrompt,
  buildProcessValidationPrompt,
  buildQuickRecommendationPrompt,
  buildFollowUpPrompt
};

export default prompts;