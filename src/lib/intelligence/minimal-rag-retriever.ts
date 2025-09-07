// Minimal RAG Retriever
// Works with the new minimal schema (8 columns vs 25+)

import { supabase } from '../supabase';
import OpenAI from 'openai';
import { localIntelligence } from './local-intelligence-loader';

// Environment variables with fallback
const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// NEVER initialize OpenAI in the browser - security risk
const openai = !isBrowser && openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

export interface MinimalTool {
  id: string;
  name: string;
  description_full: string;
  icp_fit: Record<string, number>;
  challenge_fit: Record<string, number>;
  budget_range: string[];
  similarity?: number;
}

export interface SearchOptions {
  icp_filter?: string;           // 'itsm', 'agency', 'saas'
  challenge_filter?: string;     // 'lead-qualification', 'proposal-generation', 'workflow-automation'
  budget_filter?: string;        // 'free', 'low', 'medium', 'high'
  match_threshold?: number;      // 0.6 default
  match_count?: number;          // 10 default
}

export class MinimalRAGRetriever {
  private isSupabaseAvailable: boolean;
  
  constructor() {
    this.isSupabaseAvailable = supabase !== null && openai !== null;
    
    if (!this.isSupabaseAvailable) {
      console.log('⚠️  Supabase/OpenAI unavailable - using local intelligence fallback');
    } else {
      console.log('✅ MinimalRAG initialized with Supabase + OpenAI');
    }
  }
  
  async searchTools(query: string, options: SearchOptions = {}): Promise<MinimalTool[]> {
    if (!this.isSupabaseAvailable) {
      return this.searchLocal(query, options);
    }
    
    try {
      // Generate embedding for query
      const embedding = await this.generateEmbedding(query);
      if (!embedding) {
        console.log('❌ Failed to generate embedding, falling back to local');
        return this.searchLocal(query, options);
      }
      
      // Search with minimal schema
      const { data, error } = await supabase!.rpc('vector_search_minimal', {
        query_embedding: embedding,
        icp_filter: options.icp_filter || null,
        challenge_filter: options.challenge_filter || null,
        budget_filter: options.budget_filter || null,
        match_threshold: options.match_threshold || 0.6,
        match_count: options.match_count || 10
      });
      
      if (error) {
        console.error('❌ Vector search failed:', error.message);
        return this.searchLocal(query, options);
      }
      
      console.log(`✅ Found ${data?.length || 0} tools via vector search`);
      return data || [];
      
    } catch (error) {
      console.error('❌ RAG search failed:', (error as Error).message);
      return this.searchLocal(query, options);
    }
  }
  
  async searchLocal(query: string, options: SearchOptions = {}): Promise<MinimalTool[]> {
    console.log('🔍 Using local intelligence fallback for query:', query);
    
    // Map options to local intelligence format
    const icp = options.icp_filter || 'agency';
    const challenge = options.challenge_filter || query;
    
    // Get local intelligence
    const tools = localIntelligence.smartSearch(challenge, icp, options.match_count || 10);
    
    // Convert to minimal format
    return tools.map(tool => ({
      id: tool.slug,
      name: tool.name,
      description_full: this.buildRichDescription(tool),
      icp_fit: tool.icp_scores,
      challenge_fit: this.mapToChallengeFit(tool.use_cases, tool.icp_scores[icp] || 0.5),
      budget_range: this.mapToBudgetRange(tool.pricing_details),
      similarity: 0.8 // High confidence in local curated data
    }));
  }
  
  private buildRichDescription(tool: any): string {
    return `
Tool: ${tool.name}

Category: ${tool.category} ${tool.subcategory || ''}

Description: ${tool.description}

Best For: ${tool.best_for}

Pricing: ${tool.pricing_model} - ${JSON.stringify(tool.pricing_details)}

Use Cases: ${tool.use_cases.join(', ')}

Integrations: ${tool.integrations.join(', ')}

Technical Stack: ${tool.tech_stack.join(', ')}

Deployment: ${tool.deployment_options.join(', ')}

GABI Layer: ${tool.gabi_layer}

Trending Context: ${tool.trending_context || 'Established solution'}

Why Now: ${tool.why_now || 'Proven and reliable'}

Health Score: ${tool.health_score}/1.0 (Momentum: ${tool.momentum})

ICP Fit Scores:
- ITSM: ${tool.icp_scores.itsm}
- Agency: ${tool.icp_scores.agency}  
- SaaS: ${tool.icp_scores.saas}

Status: ${tool.status} (${tool.maturity_level})
    `.trim();
  }
  
  private mapToChallengeFit(useCases: string[], baseScore: number): Record<string, number> {
    const challengeMap: Record<string, number> = {
      'lead-qualification': 0.3,
      'proposal-generation': 0.3,
      'workflow-automation': 0.3
    };
    
    // Boost scores based on use cases
    useCases.forEach(useCase => {
      const normalized = useCase.toLowerCase();
      if (normalized.includes('lead') || normalized.includes('qualification')) {
        challengeMap['lead-qualification'] = Math.min(1.0, baseScore + 0.2);
      }
      if (normalized.includes('proposal') || normalized.includes('content')) {
        challengeMap['proposal-generation'] = Math.min(1.0, baseScore + 0.2);
      }
      if (normalized.includes('workflow') || normalized.includes('automation')) {
        challengeMap['workflow-automation'] = Math.min(1.0, baseScore + 0.2);
      }
    });
    
    return challengeMap;
  }
  
  private mapToBudgetRange(pricingDetails: any): string[] {
    const ranges: string[] = [];
    
    if (!pricingDetails) return ['medium'];
    
    const pricingStr = JSON.stringify(pricingDetails).toLowerCase();
    
    if (pricingStr.includes('free') || pricingStr.includes('"0"') || pricingStr.includes('0,')) {
      ranges.push('free');
    }
    
    // Simple price extraction
    const numbers = pricingStr.match(/\d+/g);
    if (numbers) {
      const prices = numbers.map(n => parseInt(n)).filter(n => n > 0);
      const minPrice = Math.min(...prices);
      
      if (minPrice < 100) {
        ranges.push('low');
      } else if (minPrice < 1000) {
        ranges.push('medium');
      } else {
        ranges.push('high');
      }
    }
    
    return ranges.length > 0 ? ranges : ['medium'];
  }
  
  private async generateEmbedding(text: string): Promise<number[] | null> {
    if (!openai) return null;
    
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ Embedding generation failed:', (error as Error).message);
      return null;
    }
  }
  
  async getToolById(id: string): Promise<MinimalTool | null> {
    if (!this.isSupabaseAvailable) {
      // Search local by ID/slug
      const tools = localIntelligence.smartSearch(id, undefined, 1);
      return tools.length > 0 ? this.searchLocal(id, {})[0] || null : null;
    }
    
    try {
      const { data, error } = await supabase!
        .from('tools_minimal')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error || !data) {
        console.log(`Tool ${id} not found in minimal schema`);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('❌ Tool lookup failed:', (error as Error).message);
      return null;
    }
  }
  
  async validateConnection(): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const { data, error } = await supabase
        .from('tools_minimal')
        .select('count', { count: 'exact', head: true });
        
      if (error) {
        console.log('❌ Minimal schema not available:', error.message);
        return false;
      }
      
      console.log(`✅ Connected to minimal schema. ${data?.length || 0} tools available.`);
      return true;
    } catch (error) {
      console.log('❌ Connection validation failed:', (error as Error).message);
      return false;
    }
  }
  
  // Get intelligence for specific challenge (simplified interface)
  async getIntelligenceForChallenge(
    challenge: string,
    icp: string = 'agency',
    budgetRange?: string
  ) {
    const tools = await this.searchTools(challenge, {
      icp_filter: icp,
      challenge_filter: challenge,
      budget_filter: budgetRange,
      match_count: 8
    });
    
    return {
      tools,
      patterns: [], // Patterns removed in minimal schema
      metadata: {
        source: this.isSupabaseAvailable ? 'minimal_rag' : 'local_intelligence',
        query: challenge,
        icp,
        results_count: tools.length,
        confidence: this.isSupabaseAvailable ? 0.9 : 0.8
      }
    };
  }
}

// Export singleton
export const minimalRAG = new MinimalRAGRetriever();