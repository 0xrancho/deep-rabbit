import OpenAI from 'openai';
import type { AssessmentRecord } from '@/lib/supabase';

// Environment variables
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o';
const mockResponses = import.meta.env.VITE_MOCK_AI_RESPONSES === 'true';

// OpenAI client setup
let openai: OpenAI | null = null;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  // SECURITY: Never initialize OpenAI client in the browser
  // This would expose your API key to attackers
  console.warn('🔒 OpenAI client disabled in browser for security. Using mock responses or server-side API.');
  openai = null;
} else if (apiKey) {
  // Only initialize in Node.js/server environment
  openai = new OpenAI({
    apiKey
  });
} else {
  console.warn('OpenAI API key not found. Using mock responses.');
}

// Request interfaces
export interface AnalysisRequest {
  assessmentData: AssessmentRecord;
  analysisType: 'confidence' | 'report' | 'validation' | 'recommendations';
}

export interface ConfidenceResult {
  score: number;
  gaps: string[];
  follow_up_questions: string[];
  reasoning: string;
}

export interface ReportSection {
  title: string;
  content: string;
  subsections?: ReportSection[];
}

export interface GeneratedReport {
  id: string;
  sections: {
    executive_summary: ReportSection;
    current_state: ReportSection;
    opportunities: ReportSection;
    recommendations: ReportSection;
    roadmap: ReportSection;
    roi_projections: ReportSection;
    next_steps: ReportSection;
  };
  confidence_score: number;
  generation_metadata: {
    tokens_used: number;
    generation_time_ms: number;
    model_version: string;
  };
}

// Utility function to check if OpenAI is available
export const isOpenAIAvailable = (): boolean => {
  return openai !== null && !mockResponses;
};

// Enhanced error handling
class OpenAIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'OpenAIServiceError';
  }
}

// Rate limiting helper
class RateLimiter {
  private requests: number[] = [];
  private maxRequests = 5;
  private windowMs = 60000; // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getWaitTime(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }
}

const rateLimiter = new RateLimiter();

// Mock response generator for development
const generateMockResponse = (analysisType: string, assessmentData: AssessmentRecord): any => {
  console.log(`Generating mock ${analysisType} response for:`, assessmentData.company);

  switch (analysisType) {
    case 'confidence':
      return {
        score: 0.85,
        gaps: assessmentData.process_description ? [] : ['More detailed process description needed'],
        follow_up_questions: [],
        reasoning: 'Assessment data is comprehensive with detailed responses across all sections.'
      };

    case 'report':
      return {
        id: `mock_${Date.now()}`,
        sections: {
          executive_summary: {
            title: 'Executive Summary',
            content: `Based on our analysis of ${assessmentData.company}'s ${assessmentData.business_type} operations, we've identified significant opportunities for AI transformation in ${assessmentData.opportunity_focus}. Your organization shows strong readiness for automation with an estimated ROI of 300% within 12 months.`,
          },
          current_state: {
            title: 'Current State Analysis',
            content: `${assessmentData.company} operates as a ${assessmentData.business_type} company with primary challenges in ${assessmentData.challenges?.join(' and ')}. Your current process involves manual steps that could benefit from automation.`,
          },
          opportunities: {
            title: 'AI Transformation Opportunities',
            content: 'We\'ve identified three key areas where AI can drive immediate impact: process automation, intelligent analytics, and enhanced customer experience.',
          },
          recommendations: {
            title: 'Recommended Solutions',
            content: `For your ${assessmentData.investment_level} investment level, we recommend starting with quick wins in automation, followed by more comprehensive AI integration.`,
          },
          roadmap: {
            title: 'Implementation Roadmap',
            content: 'A phased 6-month approach: Discovery (Weeks 1-2), Pilot Implementation (Weeks 3-8), Scale & Optimize (Weeks 9-24).',
          },
          roi_projections: {
            title: 'ROI Projections',
            content: 'Estimated 40% time savings, $50,000+ annual cost reduction, and 25% improvement in process efficiency.',
          },
          next_steps: {
            title: 'Next Steps',
            content: 'Schedule a strategy session to dive deeper into your specific requirements and begin the transformation journey.',
          }
        },
        confidence_score: 0.85,
        generation_metadata: {
          tokens_used: 1250,
          generation_time_ms: 2000,
          model_version: 'mock-v1'
        }
      };

    default:
      return { error: `Unknown analysis type: ${analysisType}` };
  }
};

// Main OpenAI interaction function
const callOpenAI = async (
  prompt: string,
  systemPrompt?: string,
  maxTokens: number = 2000
): Promise<string> => {
  if (!isOpenAIAvailable()) {
    throw new OpenAIServiceError(
      'OpenAI service not available',
      'SERVICE_UNAVAILABLE',
      false
    );
  }

  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getWaitTime();
    throw new OpenAIServiceError(
      `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`,
      'RATE_LIMITED',
      true
    );
  }

  try {
    const startTime = Date.now();
    
    const completion = await openai!.chat.completions.create({
      model,
      messages: [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        { role: 'user' as const, content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const endTime = Date.now();
    console.log(`OpenAI request completed in ${endTime - startTime}ms`);

    if (!completion.choices[0]?.message?.content) {
      throw new OpenAIServiceError(
        'Empty response from OpenAI',
        'EMPTY_RESPONSE',
        true
      );
    }

    return completion.choices[0].message.content;
  } catch (error: any) {
    if (error.code === 'rate_limit_exceeded') {
      throw new OpenAIServiceError(
        'OpenAI rate limit exceeded',
        'RATE_LIMITED',
        true
      );
    }
    
    if (error.code === 'insufficient_quota') {
      throw new OpenAIServiceError(
        'OpenAI quota exceeded',
        'QUOTA_EXCEEDED',
        false
      );
    }

    throw new OpenAIServiceError(
      `OpenAI API error: ${error.message}`,
      'API_ERROR',
      true
    );
  }
};

// Confidence evaluation
export const evaluateConfidence = async (
  assessmentData: AssessmentRecord
): Promise<ConfidenceResult> => {
  try {
    if (mockResponses || !isOpenAIAvailable()) {
      return generateMockResponse('confidence', assessmentData) as ConfidenceResult;
    }

    const prompt = `
      Evaluate the completeness and quality of this AI assessment data. Score from 0.0 to 1.0.

      Assessment Data:
      - Business Type: ${assessmentData.business_type || 'Not specified'}
      - Opportunity Focus: ${assessmentData.opportunity_focus || 'Not specified'}
      - Revenue Model: ${assessmentData.revenue_model || 'Not specified'}
      - Challenges: ${assessmentData.challenges?.join(', ') || 'Not specified'}
      - Team Description: ${assessmentData.team_description || 'Not specified'}
      - Process Description: ${assessmentData.process_description || 'Not specified'}
      - Tech Stack: ${assessmentData.tech_stack?.join(', ') || 'Not specified'}
      - Investment Level: ${assessmentData.investment_level || 'Not specified'}

      Evaluate based on:
      - Specificity of process description (0.3 weight)
      - Quantification of metrics (0.2 weight)
      - Clarity of tech stack (0.2 weight)
      - Completeness of challenge identification (0.3 weight)

      Return JSON with this exact structure:
      {
        "score": 0.0-1.0,
        "gaps": ["list of missing information"],
        "follow_up_questions": ["specific questions to ask if score < 0.7"],
        "reasoning": "explanation of the score"
      }
    `;

    const systemPrompt = `You are an AI assessment evaluator. Analyze data completeness and quality objectively. Always return valid JSON.`;

    const response = await callOpenAI(prompt, systemPrompt, 1000);
    const result = JSON.parse(response);

    // Validate response structure
    if (typeof result.score !== 'number' || !Array.isArray(result.gaps)) {
      throw new Error('Invalid response structure from OpenAI');
    }

    return result;
  } catch (error: any) {
    console.error('Confidence evaluation failed:', error);
    
    // Fallback to rule-based confidence scoring
    const score = calculateFallbackConfidence(assessmentData);
    return {
      score,
      gaps: score < 0.7 ? ['Some assessment sections need more detail'] : [],
      follow_up_questions: [],
      reasoning: 'Calculated using fallback method due to API unavailability'
    };
  }
};

// Fallback confidence calculation
const calculateFallbackConfidence = (data: AssessmentRecord): number => {
  let score = 0;
  let maxScore = 0;

  // Check each field and assign weights
  const checks = [
    { field: data.business_type, weight: 0.1 },
    { field: data.opportunity_focus, weight: 0.1 },
    { field: data.revenue_model, weight: 0.15 },
    { field: data.challenges?.length, weight: 0.15 },
    { field: data.team_description, weight: 0.15 },
    { field: data.process_description, weight: 0.25 },
    { field: data.tech_stack?.length, weight: 0.1 }
  ];

  checks.forEach(check => {
    maxScore += check.weight;
    if (check.field) {
      if (typeof check.field === 'string' && check.field.length > 10) {
        score += check.weight;
      } else if (typeof check.field === 'number' && check.field > 0) {
        score += check.weight;
      }
    }
  });

  return Math.min(score / maxScore, 1);
};

// Report generation
export const generateReport = async (
  assessmentData: AssessmentRecord
): Promise<GeneratedReport> => {
  try {
    if (mockResponses || !isOpenAIAvailable()) {
      return generateMockResponse('report', assessmentData) as GeneratedReport;
    }

    const startTime = Date.now();

    const prompt = `
      Generate a comprehensive AI transformation assessment report for this client:

      Client: ${assessmentData.company}
      Contact: ${assessmentData.full_name}
      Business Type: ${assessmentData.business_type}
      Opportunity Focus: ${assessmentData.opportunity_focus}
      Investment Level: ${assessmentData.investment_level}
      
      Current Challenges:
      ${assessmentData.challenges?.join('\n') || 'Not specified'}
      
      Current Process:
      ${assessmentData.process_description || 'Not specified'}
      
      Current Tech Stack:
      ${assessmentData.tech_stack?.join(', ') || 'Not specified'}
      
      Team Structure:
      ${assessmentData.team_description || 'Not specified'}
      
      Revenue Model:
      ${assessmentData.revenue_model || 'Not specified'}

      Generate a professional, actionable report with specific recommendations.
      Return JSON with this exact structure:
      {
        "id": "unique_report_id",
        "sections": {
          "executive_summary": {
            "title": "Executive Summary",
            "content": "2-3 paragraph summary with key findings and ROI potential"
          },
          "current_state": {
            "title": "Current State Analysis", 
            "content": "Analysis of current processes, pain points, and inefficiencies"
          },
          "opportunities": {
            "title": "AI Transformation Opportunities",
            "content": "Specific AI applications relevant to their business"
          },
          "recommendations": {
            "title": "Recommended Solutions",
            "content": "Prioritized recommendations matching their investment level"
          },
          "roadmap": {
            "title": "Implementation Roadmap",
            "content": "Phased implementation plan with timelines"
          },
          "roi_projections": {
            "title": "ROI Projections",
            "content": "Estimated costs, savings, and payback period"
          },
          "next_steps": {
            "title": "Next Steps",
            "content": "Immediate actions and follow-up recommendations"
          }
        },
        "confidence_score": 0.0-1.0,
        "generation_metadata": {
          "tokens_used": estimated_tokens,
          "generation_time_ms": ${Date.now() - startTime},
          "model_version": "${model}"
        }
      }
    `;

    const systemPrompt = `You are GABI, an expert AI transformation consultant. Generate specific, actionable, professional assessment reports. Focus on practical recommendations that match the client's investment level and business context. Always return valid JSON.`;

    const response = await callOpenAI(prompt, systemPrompt, 3000);
    const result = JSON.parse(response);

    // Add actual generation time
    result.generation_metadata.generation_time_ms = Date.now() - startTime;
    
    // Validate response structure
    if (!result.sections || !result.sections.executive_summary) {
      throw new Error('Invalid report structure from OpenAI');
    }

    return result;
  } catch (error: any) {
    console.error('Report generation failed:', error);
    
    // Return fallback report
    return generateMockResponse('report', assessmentData) as GeneratedReport;
  }
};

// Quick validation of process description
export const validateProcessDescription = async (
  businessType: string,
  processDescription: string
): Promise<{ isValid: boolean; suggestions: string[] }> => {
  if (mockResponses || !isOpenAIAvailable()) {
    return {
      isValid: processDescription.length > 50,
      suggestions: processDescription.length <= 50 
        ? ['Add more detail about your current workflow', 'Include specific tools and steps used']
        : []
    };
  }

  try {
    const prompt = `
      Validate this process description for a ${businessType} business:
      
      "${processDescription}"
      
      Return JSON:
      {
        "isValid": true/false,
        "suggestions": ["specific improvement suggestions"]
      }
    `;

    const systemPrompt = `You validate business process descriptions. Provide constructive feedback. Always return valid JSON.`;
    
    const response = await callOpenAI(prompt, systemPrompt, 500);
    return JSON.parse(response);
  } catch (error) {
    console.error('Process validation failed:', error);
    return {
      isValid: processDescription.length > 50,
      suggestions: []
    };
  }
};

// Batch processing for multiple requests
export const batchAnalyze = async (
  requests: AnalysisRequest[]
): Promise<any[]> => {
  const results = [];
  
  for (const request of requests) {
    try {
      let result;
      switch (request.analysisType) {
        case 'confidence':
          result = await evaluateConfidence(request.assessmentData);
          break;
        case 'report':
          result = await generateReport(request.assessmentData);
          break;
        default:
          result = { error: `Unsupported analysis type: ${request.analysisType}` };
      }
      results.push(result);
    } catch (error) {
      results.push({ error: error.message });
    }
    
    // Add delay between requests to avoid rate limiting
    if (requests.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
};

export default {
  evaluateConfidence,
  generateReport,
  validateProcessDescription,
  batchAnalyze,
  isOpenAIAvailable
};