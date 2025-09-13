import OpenAI from 'openai';
import type { DiscoverySession, DiscoveryNote, DiscoveryAreaName } from '@/types/discovery';
import { ICP_CONFIGS } from '@/types/discovery';
import { ElicitationDepthManager, getQuestionProgression, ELICITATION_PATTERNS } from './elicitationEngine';

// Environment variables
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o';
const mockResponses = import.meta.env.VITE_MOCK_AI_RESPONSES === 'true';

// OpenAI client setup
let openai: OpenAI | null = null;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';
const allowBrowserMode = import.meta.env.VITE_ALLOW_BROWSER_AI === 'true';

if (isBrowser && !allowBrowserMode) {
  // SECURITY: Never initialize OpenAI client in the browser for production
  // This would expose your API key to attackers
  console.warn('🔒 OpenAI client disabled in browser for security. Using mock responses or server-side API.');
  openai = null;
} else if (apiKey) {
  // Initialize OpenAI client with browser support if allowed
  openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: allowBrowserMode
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

// Enhanced rate limiting for discovery sessions
class DiscoveryRateLimiter {
  private requests: number[] = [];
  private maxRequests = 10; // Increased for discovery sessions
  private windowMs = 60000; // 1 minute
  private sessionCount = 0;
  private sessionStart = Date.now();

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    // Session limits (100 requests per session)
    if (this.sessionCount > 100) {
      console.warn('🚨 Session limit reached - please refresh browser');
      return false;
    }
    
    // Rate limiting (10 per minute)
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    this.sessionCount++;
    return true;
  }

  getWaitTime(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }

  getSessionStats(): { count: number; sessionMinutes: number } {
    const sessionMinutes = Math.round((Date.now() - this.sessionStart) / 60000);
    return { count: this.sessionCount, sessionMinutes };
  }
}

const rateLimiter = new DiscoveryRateLimiter();

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
  maxTokens: number = 8000
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
      Analyze this discovery session and market research to generate a strategic assessment report.
      
      Your task is to EXTRACT and PRIORITIZE the most valuable intelligence from the discovery notes and research.

      === CLIENT CONTEXT ===
      Company: ${assessmentData.company}
      Contact: ${assessmentData.full_name} (${assessmentData.team_description})
      Industry: ${assessmentData.business_type}
      Focus Area: ${assessmentData.opportunity_focus}
      Budget Range: ${assessmentData.investment_level}
      Next Step Goal: ${assessmentData.revenue_model}

      === DISCOVERY INSIGHTS (FULL NOTES FROM SESSION) ===
      ${assessmentData.process_description || 'Not captured'}

      === PAIN POINTS & CHALLENGES (BY AREA) ===
      ${assessmentData.challenges?.join('\n') || 'Not specified'}

      === ADDITIONAL CONTEXT & MARKET RESEARCH ===
      ${assessmentData.additional_context || 'Not specified'}

      === ANALYSIS REQUIREMENTS ===
      1. EXTRACT CRITICAL INSIGHTS:
         - Quantified pain points ($ amounts, time lost, efficiency gaps)
         - Political dynamics and decision makers (who has veto power?)
         - Failed previous solutions (what vendors/approaches didn't work?)
         - Urgent timelines and deadlines mentioned
         - Compliance/regulatory pressures
         - Competitive threats or lost opportunities

      2. CORRELATE WITH MARKET RESEARCH:
         - Match discovered pain points with industry trends
         - Identify relevant case studies from the research
         - Extract cost benchmarks and ROI data
         - Surface vendor/solution options that fit their needs
         - Highlight regulatory developments that impact them

      3. PRIORITIZE BY BUSINESS IMPACT:
         - Rank issues by revenue impact or cost
         - Identify quick wins vs strategic initiatives
         - Consider political feasibility (based on decision dynamics)
         - Account for timeline pressures and urgency

      4. GENERATE ACTIONABLE INTELLIGENCE:
         - Specific solution recommendations (not generic)
         - Risk factors unique to their situation
         - Political navigation strategy
         - Competitive differentiation approach
         - Concrete next steps matching their goal

      Generate a report that demonstrates deep understanding of their SPECIFIC situation, not generic recommendations.
      Return JSON with this exact structure:
      {
        "id": "unique_report_id",
        "sections": {
          "executive_summary": {
            "title": "Executive Summary",
            "content": "3-4 bullet points of the MOST CRITICAL findings: biggest pain point with $ impact, key decision maker dynamics, urgent timeline driver, and primary opportunity. Be specific with names, amounts, and dates from the discovery."
          },
          "current_state": {
            "title": "Critical Pain Points & Quantified Impact", 
            "content": "Extract and prioritize their specific pain points WITH NUMBERS: $7.7M ITAR costs, 3-5 day review cycles, 8% vs 34% win rates. Include failed solutions they've already tried. Reference specific systems and processes they mentioned."
          },
          "opportunities": {
            "title": "Market Intelligence & Competitive Analysis",
            "content": "Connect their specific challenges to market research findings. Include relevant case studies, competitor moves, regulatory changes, and industry benchmarks that directly relate to their situation. Surface vendor options that fit their constraints."
          },
          "recommendations": {
            "title": "Strategic Recommendations & Political Navigation",
            "content": "Specific solutions that account for their political dynamics (Martha's veto, Sarah's influence), timeline pressures (38 days left), and failed vendors. Include HOW to navigate their specific decision process."
          },
          "roadmap": {
            "title": "Implementation Roadmap & Risk Mitigation",
            "content": "Phased plan that addresses their urgent needs first, accounts for their constraints, and includes specific risk mitigations for issues they raised. Reference their actual timeline pressures and decision points."
          },
          "roi_projections": {
            "title": "Business Case & Investment Analysis",
            "content": "Tie ROI directly to their stated pain points: reducing $7.7M ITAR costs, improving 8% international win rate, preventing Sarah's departure. Use their actual numbers to build the case."
          },
          "next_steps": {
            "title": "Immediate Actions & Deal Strategy",
            "content": "Specific next steps that match their stated goal, navigate their political landscape, and address their urgency. Include WHO to engage, WHAT to demonstrate, and HOW to position against their evaluation criteria."
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

    const systemPrompt = `You are an elite business intelligence analyst specializing in B2B software consulting. Your role is to:

1. EXTRACT critical business intelligence from discovery notes - look for specifics like dollar amounts, timeframes, names, failed vendors, political dynamics
2. CORRELATE discovered pain points with market research findings - connect their specific challenges to industry trends and solutions
3. PRIORITIZE insights by business impact - what will move the needle for THIS specific client based on their unique situation
4. SURFACE hidden opportunities and risks - what did they reveal that they might not even realize is important?
5. GENERATE hyper-specific recommendations - no generic advice, everything tied to their exact context

Your analysis should demonstrate that you deeply understand their specific situation, political dynamics, urgency drivers, and unique constraints.
Focus on actionable intelligence that will help close the deal and deliver value. Always return valid JSON.`;

    const response = await callOpenAI(prompt, systemPrompt, 8000);
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

// Discovery question generation
export interface DiscoveryQuestionRequest {
  session: DiscoverySession;
  currentArea: DiscoveryAreaName;
  discoveryNotes: DiscoveryNote[];
  currentNotes: string;
}

export interface DiscoveryQuestionResult {
  question: string;
  reasoning: string;
}

export const generateDiscoveryQuestion = async (
  request: DiscoveryQuestionRequest
): Promise<DiscoveryQuestionResult> => {
  try {
    if (mockResponses || !isOpenAIAvailable()) {
      return generateMockDiscoveryQuestion(request);
    }

    const { session, currentArea, discoveryNotes, currentNotes } = request;
    const icpConfig = ICP_CONFIGS[session.client_icp as keyof typeof ICP_CONFIGS];
    const currentAreaNote = discoveryNotes.find(note => note.areaName === currentArea);

    // Enhanced CBAP-grade elicitation prompt
    const depthManager = new ElicitationDepthManager();
    const currentDepth = currentAreaNote?.questions.length || 0;
    const previousNotes = currentAreaNote?.questions.map(q => q.notes) || [];
    
    // Assess note quality if we have previous responses
    const noteQuality = previousNotes.length > 0 ? 
      depthManager.assessNoteQuality(previousNotes.join(' ')) :
      { hasUncoveredComplexity: false, hasSpecificRequirements: false, hasQuantification: false, hasTechnicalDetail: false, overallQuality: 'low' as const };
    
    const depthGuidance = depthManager.getDepthGuidance(currentDepth, noteQuality);
    const questionProgression = getQuestionProgression(currentArea, currentDepth, previousNotes);

    const prompt = `
      You are a Certified Business Analysis Professional conducting discovery.

      PRE-KNOWLEDGE CONTEXT:
      - Prospect: ${session.contact_name}, ${session.contact_role}
      - Industry: ${session.client_icp} - ${icpConfig?.description}
      - Business Area: ${session.business_area}
      - Discovery Catalyst: ${session.discovery_context}
      - Expected Solution Scope: ${session.solution_scope}
      - Expected Next Step: ${session.next_step_goal}

      CURRENT ELICITATION AREA: ${currentArea}
      QUESTION DEPTH: ${currentDepth} (${currentDepth < 2 ? 'Foundation' : currentDepth < 4 ? 'Deep Dive' : 'Synthesis'})
      
      DEPTH GUIDANCE: ${depthGuidance}
      PROGRESSION TEMPLATE: ${questionProgression}

      ${currentDepth === 0 ? 
        `Generate an initial question that:
         1. Addresses ${currentArea} specifically for their ${session.business_area}
         2. Connects directly to their discovery catalyst: "${session.discovery_context}"
         3. Is specific enough to avoid generic answers
         4. Uses industry terminology relevant to ${session.client_icp}
         
         Format: "Given your [specific context], how does [specific area focus] currently handle [specific challenge/process]?"
         ` 
        : 
        `PREVIOUS RESPONSES IN THIS AREA:
         ${currentAreaNote?.questions.map((q, i) => `Q${i+1}: ${q.questionText}\nResponse: ${q.notes}`).join('\n\n')}
         
         NOTE QUALITY ANALYSIS:
         - Complexity uncovered: ${noteQuality.hasUncoveredComplexity ? 'Yes' : 'No'}
         - Specific requirements: ${noteQuality.hasSpecificRequirements ? 'Yes' : 'No'}  
         - Quantification present: ${noteQuality.hasQuantification ? 'Yes' : 'No'}
         - Technical details: ${noteQuality.hasTechnicalDetail ? 'Yes' : 'No'}
         - Overall quality: ${noteQuality.overallQuality}

         Generate a DEEPER follow-up question that:
         1. References specific details from their previous answers
         2. ${!noteQuality.hasQuantification ? 'Probes for specific metrics, numbers, timeframes' : 'Builds on quantified insights'}
         3. ${!noteQuality.hasTechnicalDetail && currentArea.includes('Tech') ? 'Digs into technical architecture and systems' : 'Explores business implications'}
         4. ${!noteQuality.hasSpecificRequirements ? 'Uncovers concrete requirements and constraints' : 'Prioritizes competing requirements'}
         5. Connects to the discovery catalyst: "${session.discovery_context}"
         
         Pattern: "You mentioned [specific detail from response]. This suggests [insight/risk/opportunity]. 
         [Deeper probing question that connects to business impact]?"
         `
      }

      CONTEXT FROM OTHER AREAS:
      ${discoveryNotes.filter(note => note.areaName !== currentArea && note.questions.length > 0).map(note => `
      ${note.areaName}: Key insight - ${note.questions[note.questions.length - 1]?.notes}
      `).join('\n') || 'No other areas explored yet'}

      The question should feel like it comes from an expert who deeply understands ${session.client_icp} industry challenges.
      It must sound natural and conversational, not like a template.

      Return JSON with this exact structure:
      {
        "question": "Your next strategic elicitation question",
        "reasoning": "Why this specific question will uncover critical insights for ${session.solution_scope}"
      }
    `;

    const systemPrompt = `You are an expert B2B software consultant specializing in ${session.client_icp} industry. Ask probing, strategic questions that uncover business pain, quantify impact, and identify specific opportunities. Focus on gathering actionable intelligence for solution design.`;

    const response = await callOpenAI(prompt, systemPrompt, 2000);
    const result = JSON.parse(response);

    // Validate response structure
    if (!result.question || typeof result.question !== 'string') {
      throw new Error('Invalid question generation response from OpenAI');
    }

    return result;
  } catch (error: any) {
    console.error('Discovery question generation failed:', error);
    
    // Fallback to mock question
    return generateMockDiscoveryQuestion(request);
  }
};

// Enhanced mock discovery question generator using elicitation intelligence
const generateMockDiscoveryQuestion = (request: DiscoveryQuestionRequest): DiscoveryQuestionResult => {
  const { session, currentArea, discoveryNotes, currentNotes } = request;
  const currentAreaNote = discoveryNotes.find(note => note.areaName === currentArea);
  const currentDepth = currentAreaNote?.questions.length || 0;
  const previousNotes = currentAreaNote?.questions.map(q => q.notes) || [];
  
  // Use elicitation engine for intelligent mock responses
  const depthManager = new ElicitationDepthManager();
  const questionProgression = getQuestionProgression(currentArea, currentDepth, previousNotes);
  
  // If we have previous notes, assess quality and generate contextual follow-up
  if (previousNotes.length > 0) {
    const noteQuality = depthManager.assessNoteQuality(previousNotes.join(' '));
    const lastNote = previousNotes[previousNotes.length - 1];
    
    // Extract key terms for contextual references
    const systemMatch = lastNote.match(/\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\b/);
    const numberMatch = lastNote.match(/\d+\s*(?:hours?|days?|weeks?|months?|dollars?|\$|%)/);
    const challengeMatch = lastNote.match(/(?:challenge|issue|problem|bottleneck):\s*([^.]+)/i);
    
    // Generate contextual follow-up based on note quality
    let contextualQuestion = questionProgression;
    
    if (systemMatch && contextualQuestion.includes('[specific system mentioned]')) {
      contextualQuestion = contextualQuestion.replace('[specific system mentioned]', systemMatch[0]);
    }
    
    if (challengeMatch && contextualQuestion.includes('[specific pain mentioned]')) {
      contextualQuestion = contextualQuestion.replace('[specific pain mentioned]', challengeMatch[1]);
    }
    
    // Add industry-specific context
    const icpConfig = ICP_CONFIGS[session.client_icp as keyof typeof ICP_CONFIGS];
    if (icpConfig && contextualQuestion.includes('[compliance/security concern]')) {
      contextualQuestion = contextualQuestion.replace('[compliance/security concern]', icpConfig.keywords[0]);
    }
    
    return {
      question: contextualQuestion,
      reasoning: `Generated depth-${currentDepth} question based on ${noteQuality.overallQuality} quality notes, targeting ${!noteQuality.hasQuantification ? 'quantification' : !noteQuality.hasTechnicalDetail ? 'technical details' : 'requirements'}.`
    };
  }
  
  // For initial questions, use context-aware templates
  const contextualQuestions = {
    'Current State Assessment': `Given your ${session.business_area} operations and ${session.discovery_context}, walk me through how things currently work in this area?`,
    'Pain Points & Challenges': `What's the biggest operational challenge in your ${session.business_area} that relates to ${session.discovery_context}?`,
    'Desired Future State': `What would success look like for ${session.discovery_context} in your ${session.business_area} operations?`,
    'Constraints & Requirements': `Given your ${session.client_icp} industry requirements, what are the non-negotiable constraints for addressing ${session.discovery_context}?`,
    'Decision Process & Timeline': `For addressing ${session.discovery_context}, who needs to be involved in the decision process?`,
    'Budget & Resources': `What's the business case driving investment in solving ${session.discovery_context}?`,
    'Success Metrics': `How would you measure the success of resolving ${session.discovery_context} in your ${session.business_area}?`,
    'Stakeholders & Politics': `Who else in your organization would be impacted by changes to ${session.discovery_context} in ${session.business_area}?`
  };
  
  const question = contextualQuestions[currentArea] || `Tell me about how ${session.discovery_context} affects your ${session.business_area} operations.`;
  
  return {
    question,
    reasoning: `Generated contextual initial question for ${currentArea}, incorporating discovery catalyst "${session.discovery_context}" and ${session.client_icp} industry context.`
  };
};

// Simple completion generation for other services
export const generateCompletion = async (
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> => {
  if (!apiKey) {
    throw new Error('OpenAI API key not configured - please set VITE_OPENAI_API_KEY in your environment');
  }

  if (!openai) {
    // Check if we're in browser mode without permission
    if (isBrowser && !allowBrowserMode) {
      throw new Error('OpenAI client disabled in browser for security. Set VITE_ALLOW_BROWSER_AI=true to enable.');
    }
    throw new Error('OpenAI client not initialized - check API key and browser settings');
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 500
  });

  return completion.choices[0]?.message?.content || '';
};

export const openaiService = {
  generateCompletion
};

export default {
  evaluateConfidence,
  generateReport,
  validateProcessDescription,
  batchAnalyze,
  generateDiscoveryQuestion,
  isOpenAIAvailable,
  generateCompletion
};