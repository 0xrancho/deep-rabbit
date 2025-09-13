// Enhanced Conversation Generator Service
// Uses business context analysis to generate highly targeted conversations

import { openaiService } from './openai';
import { BusinessContext } from './websiteAnalyzer';

export interface EnhancedConversationContext {
  businessContext: BusinessContext;
}

export interface GeneratedConversation {
  preHistoryContext: string;
  deepRabbitQuestion1: string;
  userResponse: string;
  deepRabbitQuestion2: string;
  metadata?: {
    prospectCompany?: string;
    prospectIndustry?: string;
    keyPainPoint?: string;
    businessCase?: string;
    catalyst?: string;
  };
}

export class EnhancedConversationGeneratorService {
  private static instance: EnhancedConversationGeneratorService;
  
  private constructor() {}
  
  static getInstance(): EnhancedConversationGeneratorService {
    if (!EnhancedConversationGeneratorService.instance) {
      EnhancedConversationGeneratorService.instance = new EnhancedConversationGeneratorService();
    }
    return EnhancedConversationGeneratorService.instance;
  }

  async generateConversation(context: EnhancedConversationContext): Promise<GeneratedConversation> {
    const { businessContext } = context;
    
    try {
      const conversationPrompt = this.buildConversationPrompt(businessContext);
      
      console.log('🤖 Generating conversation with business context:', businessContext);
      
      const response = await openaiService.generateCompletion(conversationPrompt, {
        temperature: 0.8,
        maxTokens: 800
      });

      const conversation = this.parseConversationResponse(response, businessContext);
      
      console.log('✅ Generated conversation:', conversation);
      
      return conversation;
    } catch (error) {
      console.error('❌ Error generating conversation:', error);
      return this.generateFallbackConversation(businessContext);
    }
  }

  private buildConversationPrompt(businessContext: BusinessContext): string {
    const { yourCompany, prospect, businessCase, catalyst } = businessContext;
    
    return `Generate a realistic pain point discovery conversation between DeepRabbit (an AI discovery assistant) and a prospect from ${prospect.name}.

CONTEXT:
- Your Company: ${yourCompany.name} (${yourCompany.subIndustry}) offering ${yourCompany.services.join(', ')}
- Prospect: ${prospect.name} (${prospect.orgType} in ${prospect.industry})
- Business Case: ${businessCase}
- Catalyst: ${catalyst}

CRITICAL: This conversation must focus EXCLUSIVELY on discovering and drilling into PAIN POINTS.

Generate exactly:
1. Pre-history context (1 sentence about the catalyst/situation)
2. DeepRabbit Q1: Broad pain discovery question related to the catalyst
3. Prospect Response: Realistic answer revealing a pain point with specifics
4. DeepRabbit Q2: Drilling deeper into impact, scale, or frequency of that pain

RULES:
- Focus on PROBLEMS, never solutions
- Use industry-specific language for ${prospect.industry}
- Be specific to the catalyst: ${catalyst}
- Prospect responses should reveal genuine business pain
- Questions should feel natural and consultative

FORMAT:
CONTEXT: [Pre-history context]
Q1: [Broad pain question]
RESPONSE: [Prospect's pain revelation]
Q2: [Deeper drill-down question]`;
  }

  private parseConversationResponse(response: string, businessContext: BusinessContext): GeneratedConversation {
    const lines = response.trim().split('\n').filter(line => line.trim());
    
    let preHistoryContext = '';
    let deepRabbitQuestion1 = '';
    let userResponse = '';
    let deepRabbitQuestion2 = '';

    // Parse the response format
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('CONTEXT:')) {
        preHistoryContext = trimmed.replace('CONTEXT:', '').trim();
      } else if (trimmed.startsWith('Q1:')) {
        deepRabbitQuestion1 = trimmed.replace('Q1:', '').trim();
      } else if (trimmed.startsWith('RESPONSE:')) {
        userResponse = trimmed.replace('RESPONSE:', '').trim();
      } else if (trimmed.startsWith('Q2:')) {
        deepRabbitQuestion2 = trimmed.replace('Q2:', '').trim();
      }
    }

    // Fallback parsing if structured format fails
    if (!deepRabbitQuestion1 || !userResponse || !deepRabbitQuestion2) {
      const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
      if (sentences.length >= 3) {
        deepRabbitQuestion1 = deepRabbitQuestion1 || sentences[0].trim() + '?';
        userResponse = userResponse || sentences[1].trim() + '.';
        deepRabbitQuestion2 = deepRabbitQuestion2 || sentences[2].trim() + '?';
      }
    }

    return {
      preHistoryContext: preHistoryContext || `Discussing ${businessContext.catalyst.toLowerCase()}`,
      deepRabbitQuestion1: deepRabbitQuestion1 || `How is ${businessContext.catalyst.toLowerCase()} affecting your current operations?`,
      userResponse: userResponse || `We're experiencing some challenges with ${businessContext.prospect.industry} operations.`,
      deepRabbitQuestion2: deepRabbitQuestion2 || `Can you walk me through the specific impact this is having?`,
      metadata: {
        prospectCompany: businessContext.prospect.name,
        prospectIndustry: businessContext.prospect.industry,
        businessCase: businessContext.businessCase,
        catalyst: businessContext.catalyst,
        keyPainPoint: 'operational efficiency'
      }
    };
  }

  private generateFallbackConversation(businessContext: BusinessContext): GeneratedConversation {
    const { yourCompany, prospect, businessCase, catalyst } = businessContext;
    
    return {
      preHistoryContext: `Discussing ${catalyst.toLowerCase()} and its impact on ${prospect.name}`,
      deepRabbitQuestion1: `Given the ${catalyst.toLowerCase()}, how is this affecting your ${prospect.industry} operations at ${prospect.name}?`,
      userResponse: `We're seeing significant challenges in our ${prospect.industry} processes. The ${catalyst.toLowerCase()} has created bottlenecks and we're struggling to maintain efficiency.`,
      deepRabbitQuestion2: `When these bottlenecks occur, what's the typical impact on your team and timeline?`,
      metadata: {
        prospectCompany: prospect.name,
        prospectIndustry: prospect.industry,
        businessCase: businessCase,
        catalyst: catalyst,
        keyPainPoint: 'operational bottlenecks'
      }
    };
  }

  async generateFollowUp(conversationHistory: any[], businessContext: BusinessContext): Promise<{ followUpQuestion: string }> {
    const lastProspectMessage = conversationHistory
      .filter(msg => msg.role === 'prospect')
      .pop()?.content || '';

    const prompt = `Based on this pain point discovery conversation context:
Business Case: ${businessContext.businessCase}
Catalyst: ${businessContext.catalyst}
Last prospect response: "${lastProspectMessage}"

Generate ONE specific follow-up question that:
1. Digs deeper into the pain point impact
2. Explores scale, frequency, or business consequences  
3. Stays focused on problems (no solutions)
4. Uses natural discovery language

Return just the question:`;

    try {
      const response = await openaiService.generateCompletion(prompt, {
        temperature: 0.7,
        maxTokens: 150
      });

      return { followUpQuestion: response.trim() };
    } catch (error) {
      console.error('Error generating follow-up:', error);
      return { 
        followUpQuestion: "That's really insightful. Can you tell me more about how frequently this impacts your operations?" 
      };
    }
  }
}

export const enhancedConversationGenerator = EnhancedConversationGeneratorService.getInstance();