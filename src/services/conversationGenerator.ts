// Conversation Generator Service
// Combines Firecrawl web scraping with GPT to generate realistic discovery conversations

import OpenAI from 'openai';
import { firecrawlService } from './firecrawl';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('⚠️ OpenAI API key not configured! Please set VITE_OPENAI_API_KEY in .env.local');
} else {
  console.log('✅ OpenAI API key loaded, length:', OPENAI_API_KEY.length);
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface ConversationContext {
  userBusiness: string;
  userService: string;
  prospectWebsite: string;
  prospectRole?: string;
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
  };
}

export class ConversationGeneratorService {
  private static instance: ConversationGeneratorService;
  
  private constructor() {}
  
  static getInstance(): ConversationGeneratorService {
    if (!ConversationGeneratorService.instance) {
      ConversationGeneratorService.instance = new ConversationGeneratorService();
    }
    return ConversationGeneratorService.instance;
  }
  
  /**
   * Generate a realistic discovery conversation based on web-scraped context
   */
  async generateConversation(context: ConversationContext): Promise<GeneratedConversation> {
    try {
      // Step 1: Scrape the prospect's website for context
      console.log('🔍 Starting Firecrawl for:', context.prospectWebsite);
      const prospectData = await firecrawlService.extractBusinessContext(context.prospectWebsite);
      
      if (!prospectData.success || !prospectData.context) {
        console.log('⚠️ Firecrawl failed or no context, falling back to generateWithoutScraping');
        // Fallback to generating without scraped data
        return this.generateWithoutScraping(context);
      }
      
      console.log('✅ Firecrawl successful! Got context:', {
        companyName: prospectData.context.companyName,
        industries: prospectData.context.industries,
        contentLength: prospectData.context.content?.length
      });
      
      const { companyName, description, services, industries, content } = prospectData.context;
      
      // Step 2: Generate conversation using GPT with scraped context
      const prompt = this.buildConversationPrompt(context, {
        companyName,
        description,
        services,
        industries,
        contentSnippet: content?.substring(0, 2000) // Limit context length
      });
      
      console.log('🤖 Calling GPT-4 with prompt length:', prompt.length);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert at pain point discovery conversations. Your ONLY focus is eliciting specific operational pain points.
            Start broad, then drill deeper into the SAME pain with each question.
            Never offer solutions. Only uncover problems, their frequency, impact, and failed attempts to fix them.
            Make it feel like a natural conversation where someone genuinely wants to understand what's broken.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      const response = completion.choices[0]?.message?.content;
      console.log('📝 GPT Response received, length:', response?.length);
      
      if (!response) {
        throw new Error('No response from GPT');
      }
      
      // Parse the JSON response
      const conversation = this.parseConversationResponse(response);
      console.log('✨ Conversation parsed successfully');
      
      // Add metadata
      conversation.metadata = {
        prospectCompany: companyName,
        prospectIndustry: industries?.[0],
        keyPainPoint: this.extractKeyPainPoint(conversation.userResponse)
      };
      
      return conversation;
      
    } catch (error) {
      console.error('❌ Error generating conversation:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      // Fallback to mock data
      return this.generateMockConversation(context);
    }
  }
  
  /**
   * Build the prompt for GPT based on scraped context
   */
  private buildConversationPrompt(
    context: ConversationContext,
    prospectInfo: any
  ): string {
    return `Generate a realistic pain point discovery conversation between DeepRabbit (an AI discovery assistant) and a prospect from ${prospectInfo.companyName || context.prospectWebsite}.

CONTEXT:
- Consultant offers: ${context.userService}
- Prospect Company: ${prospectInfo.companyName || context.prospectWebsite}
- Prospect Description: ${prospectInfo.description || 'Not available'}
- Prospect Services: ${prospectInfo.services?.join(', ') || 'Not specified'}
- Prospect Industries: ${prospectInfo.industries?.join(', ') || 'Not specified'}

PROSPECT WEBSITE CONTENT:
${prospectInfo.contentSnippet || 'No content available'}

CRITICAL: This conversation must focus EXCLUSIVELY on discovering and drilling into PAIN POINTS.

Generate a JSON response with this EXACT structure:
{
  "preHistoryContext": "A specific business reason connecting ${context.userService} to a suspected pain point at ${prospectInfo.companyName || 'the prospect'} (e.g., 'Discussing how inefficient manual ${context.userService} processes are impacting delivery timelines')",
  "deepRabbitQuestion1": "A broad opening question about their CURRENT PAIN with something related to ${context.userService} - identify a general problem area",
  "userResponse": "A response revealing a SPECIFIC OPERATIONAL PAIN POINT they experience (2-3 sentences describing the actual problem)",
  "deepRabbitQuestion2": "A follow-up that digs DEEPER into that specific pain - asking about frequency, impact, or failed solutions"
}

PAIN POINT ELICITATION RULES:
1. Q1: Surface-level pain discovery - "What's breaking?"
2. User Response: Reveals a specific operational pain point
3. Q2: Drill into that pain - "How often/How much/What happens when?"
4. Each question must go DEEPER into the SAME pain point, not switch topics
5. Questions should uncover: Current broken state → Impact/Cost → Failed attempts to fix
6. Never offer solutions - only elicit pain facts
7. Use the prospect's actual business context from their website

Example progression:
Q1: "What challenges are you facing with [broad area]?"
Response: "We struggle with [specific pain]"
Q2: "When [specific pain] happens, what's the actual impact on [specific metric]?"`;
  }
  
  /**
   * Parse GPT response into structured conversation
   */
  private parseConversationResponse(response: string): GeneratedConversation {
    try {
      console.log('📋 Raw GPT response to parse:', response.substring(0, 500));
      
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in GPT response');
        throw new Error('No JSON found in response');
      }
      
      console.log('🔍 Found JSON in response:', jsonMatch[0].substring(0, 200));
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed JSON:', Object.keys(parsed));
      
      return {
        preHistoryContext: parsed.preHistoryContext || 'Exploring digital transformation opportunities',
        deepRabbitQuestion1: parsed.deepRabbitQuestion1 || this.getDefaultQuestion1(),
        userResponse: parsed.userResponse || this.getDefaultResponse(),
        deepRabbitQuestion2: parsed.deepRabbitQuestion2 || this.getDefaultQuestion2()
      };
    } catch (error) {
      console.error('❌ Error parsing GPT response:', error);
      console.error('Full response was:', response);
      // Return sensible defaults
      return this.generateMockConversation({} as ConversationContext);
    }
  }
  
  /**
   * Generate without web scraping (fallback)
   */
  private async generateWithoutScraping(context: ConversationContext): Promise<GeneratedConversation> {
    const prompt = `Generate a PAIN POINT discovery conversation for:
    - Service offered: ${context.userService}
    - Prospect: ${context.prospectWebsite}
    
    Focus ONLY on discovering operational pain points related to ${context.userService}.
    Q1: Broad pain discovery
    Response: Specific pain revealed
    Q2: Drill deeper into that SAME pain (frequency/impact/cost)
    
    Return JSON with: preHistoryContext, deepRabbitQuestion1, userResponse, deepRabbitQuestion2`;
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Generate pain point discovery conversations. Focus only on eliciting problems, never solutions. Each question digs deeper into the SAME pain.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      });
      
      const response = completion.choices[0]?.message?.content || '';
      return this.parseConversationResponse(response);
    } catch (error) {
      return this.generateMockConversation(context);
    }
  }
  
  /**
   * Extract key pain point from user response
   */
  private extractKeyPainPoint(response: string): string {
    // Simple extraction - look for key phrases
    const painIndicators = ['struggle', 'challenge', 'difficult', 'problem', 'issue', 'lack', 'need'];
    const sentences = response.split(/[.!?]/);
    
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      for (const indicator of painIndicators) {
        if (lower.includes(indicator)) {
          return sentence.trim();
        }
      }
    }
    
    return sentences[0]?.trim() || 'Process optimization';
  }
  
  /**
   * Generate mock conversation (ultimate fallback)
   */
  private generateMockConversation(context: ConversationContext): GeneratedConversation {
    return {
      preHistoryContext: `Exploring how manual ${context.userService || 'processes'} are creating bottlenecks in daily operations`,
      deepRabbitQuestion1: `What's the biggest challenge you're currently facing with your ${context.userService || 'workflow management'} processes?`,
      userResponse: `Our team spends about 3-4 hours daily just on manual data entry and validation for ${context.userService || 'our workflows'}. The worst part is that errors still slip through, causing rework downstream that impacts client deliverables.`,
      deepRabbitQuestion2: "When those errors slip through and cause rework, how many additional hours does your team typically spend fixing them, and how often does this happen per week?"
    };
  }
  
  // Default fallback questions focused on pain points
  private getDefaultQuestion1(): string {
    return "What's the most frustrating bottleneck in your current workflow that's eating up your team's time?";
  }
  
  private getDefaultResponse(): string {
    return "We lose about 15 hours per week on manual report generation and data reconciliation. The worst part is when discrepancies are found after the reports go out, we have to redo everything and explain the errors to stakeholders.";
  }
  
  private getDefaultQuestion2(): string {
    return "When you have to redo those reports and explain errors to stakeholders, how much credibility damage does that cause, and how many additional hours go into damage control?";
  }

  /**
   * Generate a dynamic follow-up question based on conversation history
   */
  async generateFollowUp(context: {
    conversationHistory: any[];
    userService: string;
    prospectWebsite: string;
  }): Promise<{ followUpQuestion: string }> {
    try {
      console.log('🔄 Generating dynamic follow-up question...');
      
      const conversationSummary = context.conversationHistory
        .filter(msg => msg.role !== 'context')
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const prompt = `Based on this pain point discovery conversation, generate DeepRabbit's THIRD question that drills EVEN DEEPER into the SAME pain point.

CONVERSATION HISTORY:
${conversationSummary}

CONTEXT:
- Service being sold: ${context.userService}
- Prospect company: ${context.prospectWebsite}

CRITICAL PAIN POINT ELICITATION RULES:
1. You are generating Q3 - this must be the MOST SPECIFIC question yet
2. STAY ON THE SAME PAIN POINT - do not switch topics
3. Drill into measurable impact: time lost, money wasted, opportunities missed
4. Ask about specific instances, frequencies, or failed workarounds
5. Get granular: "How many hours per week?" "What's the error rate?" "How many people affected?"

Q3 FOCUS AREAS (pick the most relevant):
- Quantify the pain: "How many [specific instances] per [timeframe]?"
- Failed solutions: "What have you tried to fix this, and why didn't it work?"
- Cascade effects: "When this happens, what else breaks downstream?"
- Peak pain moments: "Tell me about the last time this caused a major issue"
- Hidden costs: "Beyond the obvious impact, what indirect costs does this create?"

Generate a question that makes them think "Wow, you really understand our specific problem."

Return ONLY the question text, no JSON or formatting.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are DeepRabbit, an expert pain point discovery AI. Your ONLY job is to elicit deeper and deeper facts about the SPECIFIC pain point already being discussed. Never switch topics. Never offer solutions. Only dig deeper into the pain to understand its full impact, frequency, and failed attempts to solve it. Make each question more specific than the last.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      const followUpQuestion = completion.choices[0]?.message?.content?.trim() || 
        "That's interesting. Can you tell me more about the specific challenges that creates for your team?";

      console.log('✅ Generated follow-up:', followUpQuestion.substring(0, 100));
      
      return { followUpQuestion };
    } catch (error) {
      console.error('❌ Error generating follow-up:', error);
      return { 
        followUpQuestion: "That's really insightful. What would you say is the biggest impact that has on your daily operations?" 
      };
    }
  }
}

export const conversationGenerator = ConversationGeneratorService.getInstance();