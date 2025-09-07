// RAG Intelligence Retrieval System
// Semantic search and contextual intelligence for assessment reports

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface RetrievalContext {
  icp?: string;           // 'itsm', 'agency', 'saas'
  useCase?: string;       // 'lead-qualification', 'proposal-generation', etc.
  budget?: string;        // 'Quick Win', 'Transformation', 'Enterprise'
  existingStack?: string[];
  complexity?: 'simple' | 'moderate' | 'complex';
}

export interface ToolResult {
  id: string;
  name: string;
  category: string;
  description: string;
  pricing_details: any;
  integrations: string[];
  use_cases: string[];
  best_for: string;
  icp_scores: Record<string, number>;
  similarity: number;
  recommendation_reason?: string;
  stack_compatibility?: number;
}

export interface PatternResult {
  id: string;
  name: string;
  category: string;
  description: string;
  complexity: string;
  typical_timeline: string;
  typical_cost_range: string;
  github_examples: string[];
  success_indicators: string[];
  common_pitfalls: string[];
  similarity: number;
}

export interface IntelligencePackage {
  tools: ToolResult[];
  patterns: PatternResult[];
  benchmarks: any;
  trends: any;
  metadata: {
    query: string;
    context: RetrievalContext;
    generated_at: string;
    freshness_score: number;
  };
}

export class IntelligenceRAG {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  async retrieve(
    query: string, 
    context: RetrievalContext = {}
  ): Promise<IntelligencePackage> {
    console.log('🧠 RAG: Retrieving intelligence for query:', query);
    console.log('📊 Context:', context);

    try {
      // 1. Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // 2. Semantic search for relevant tools
      const tools = await this.searchTools(queryEmbedding, context);
      
      // 3. Find relevant patterns
      const patterns = await this.searchPatterns(queryEmbedding, context);
      
      // 4. Get benchmarks for ICP
      const benchmarks = context.icp ? await this.getBenchmarks(context.icp) : null;
      
      // 5. Get recent trends
      const trends = await this.getTrends(context.icp);
      
      // 6. Enhance results with context
      const enhancedTools = await this.enhanceTools(tools, context);
      
      const intelligence: IntelligencePackage = {
        tools: enhancedTools,
        patterns,
        benchmarks,
        trends,
        metadata: {
          query,
          context,
          generated_at: new Date().toISOString(),
          freshness_score: await this.calculateFreshness()
        }
      };

      console.log(`✅ RAG: Retrieved ${tools.length} tools, ${patterns.length} patterns`);
      return intelligence;

    } catch (error) {
      console.error('❌ RAG retrieval failed:', error);
      throw error;
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const cacheKey = `embedding:${text}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI embedding error: ${response.status}`);
      }

      const data = await response.json();
      const embedding = data.data[0].embedding;

      // Cache for 1 hour
      this.cache.set(cacheKey, {
        data: embedding,
        timestamp: Date.now(),
        ttl: 60 * 60 * 1000
      });

      return embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  private async searchTools(
    queryEmbedding: number[],
    context: RetrievalContext
  ): Promise<ToolResult[]> {
    try {
      const { data, error } = await supabase.rpc('vector_search', {
        query_embedding: queryEmbedding,
        table_name: 'tools',
        match_threshold: 0.6,
        match_count: context.icp ? 15 : 10
      });

      if (error) {
        console.error('Tool search error:', error);
        return [];
      }

      let filtered = data || [];

      // Apply ICP filtering
      if (context.icp && filtered.length > 0) {
        filtered = filtered
          .filter(tool => {
            const icpScore = tool.icp_scores?.[context.icp];
            return icpScore && icpScore >= 0.5;
          })
          .sort((a, b) => (b.icp_scores[context.icp] || 0) - (a.icp_scores[context.icp] || 0));
      }

      // Apply use case filtering
      if (context.useCase && filtered.length > 0) {
        const useCaseFiltered = filtered.filter(tool => 
          tool.use_cases?.includes(context.useCase)
        );
        
        // If we get good matches, use them; otherwise keep semantic matches
        if (useCaseFiltered.length >= 3) {
          filtered = useCaseFiltered;
        }
      }

      return filtered.slice(0, 10);
    } catch (error) {
      console.error('Tool search failed:', error);
      return [];
    }
  }

  private async searchPatterns(
    queryEmbedding: number[],
    context: RetrievalContext
  ): Promise<PatternResult[]> {
    try {
      const { data, error } = await supabase.rpc('pattern_search', {
        query_embedding: queryEmbedding,
        icp: context.icp || null,
        complexity: context.complexity || null,
        match_threshold: 0.6,
        match_count: 5
      });

      if (error) {
        console.error('Pattern search error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Pattern search failed:', error);
      return [];
    }
  }

  private async getBenchmarks(icp: string) {
    const cacheKey = `benchmarks:${icp}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.data;
    }

    // For now, return hardcoded benchmarks
    // In production, this would query a benchmarks table
    const benchmarks = {
      itsm: {
        leadConversion: '3-7%',
        salesCycle: '6-9 months',
        aiAdoption: '15-25%',
        averageTicketCount: '500-2000/month',
        automationLevel: '20-40%'
      },
      agency: {
        leadConversion: '5-12%',
        salesCycle: '3-6 months',
        aiAdoption: '25-40%',
        averageProjectValue: '$5,000-50,000',
        automationLevel: '30-60%'
      },
      saas: {
        leadConversion: '10-20%',
        salesCycle: '2-4 months',
        aiAdoption: '40-60%',
        averageDealSize: '$1,000-10,000',
        automationLevel: '50-80%'
      }
    };

    const result = benchmarks[icp as keyof typeof benchmarks] || benchmarks.agency;
    
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      ttl: 24 * 60 * 60 * 1000
    });

    return result;
  }

  private async getTrends(icp?: string) {
    try {
      // Get the most recent intelligence update
      const { data } = await supabase
        .from('intelligence_updates')
        .select('*')
        .eq('update_type', 'weekly')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!data) return null;

      const trends = {
        rising: data.rising_tools || [],
        declining: data.declining_tools || [],
        newEntrants: data.new_tools || [],
        categoryTrends: data.category_trends || {},
        icpRecommendations: icp ? data.icp_recommendations?.[icp] : null
      };

      return trends;
    } catch (error) {
      console.error('Failed to get trends:', error);
      return null;
    }
  }

  private async enhanceTools(
    tools: ToolResult[],
    context: RetrievalContext
  ): Promise<ToolResult[]> {
    return tools.map(tool => ({
      ...tool,
      recommendation_reason: this.generateRecommendationReason(tool, context),
      stack_compatibility: this.calculateStackCompatibility(tool, context.existingStack)
    }));
  }

  private generateRecommendationReason(tool: ToolResult, context: RetrievalContext): string {
    const reasons = [];

    if (context.icp && tool.icp_scores[context.icp] >= 0.8) {
      reasons.push(`Highly rated for ${context.icp.toUpperCase()} companies`);
    }

    if (context.useCase && tool.use_cases.includes(context.useCase)) {
      reasons.push(`Purpose-built for ${context.useCase.replace('-', ' ')}`);
    }

    if (context.existingStack) {
      const compatibility = this.calculateStackCompatibility(tool, context.existingStack);
      if (compatibility >= 0.7) {
        reasons.push('Integrates well with your existing stack');
      }
    }

    if (tool.similarity >= 0.8) {
      reasons.push('High relevance to your specific challenge');
    }

    return reasons.length > 0 
      ? reasons.join('; ') 
      : 'Good fit for your requirements';
  }

  private calculateStackCompatibility(tool: ToolResult, existingStack?: string[]): number {
    if (!existingStack || !tool.integrations) return 0.5;

    const stackLower = existingStack.map(s => s.toLowerCase());
    const integrationLower = tool.integrations.map(i => i.toLowerCase());

    const matches = integrationLower.filter(integration => 
      stackLower.some(stack => 
        stack.includes(integration) || integration.includes(stack)
      )
    );

    return Math.min(1.0, matches.length / Math.max(1, existingStack.length * 0.5));
  }

  private async calculateFreshness(): Promise<number> {
    try {
      const { data } = await supabase
        .from('intelligence_updates')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!data) return 0;

      const lastUpdate = new Date(data.created_at);
      const now = new Date();
      const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

      // Freshness score decreases over time
      // 1.0 = updated today, 0.5 = 7 days old, 0.0 = 14+ days old
      return Math.max(0, 1 - (daysSinceUpdate / 14));
    } catch (error) {
      console.error('Failed to calculate freshness:', error);
      return 0;
    }
  }

  // Specific retrieval methods for report sections
  async getToolsForSolution(
    challenge: string,
    icp: string,
    budget: string,
    existingStack: string[]
  ): Promise<ToolResult[]> {
    const query = `${challenge} solutions for ${icp} companies`;
    const intelligence = await this.retrieve(query, {
      icp,
      budget,
      existingStack,
      useCase: this.mapChallengeToUseCase(challenge)
    });

    // Filter and sort for solution section
    return intelligence.tools
      .filter(tool => tool.icp_scores[icp] >= 0.7)
      .sort((a, b) => (b.icp_scores[icp] || 0) - (a.icp_scores[icp] || 0))
      .slice(0, 5);
  }

  async getImplementationPattern(
    challenge: string,
    icp: string,
    complexity: 'simple' | 'moderate' | 'complex'
  ): Promise<PatternResult | null> {
    const query = `${challenge} implementation pattern`;
    const intelligence = await this.retrieve(query, {
      icp,
      complexity
    });

    // Return the best matching pattern
    return intelligence.patterns.length > 0 ? intelligence.patterns[0] : null;
  }

  async getICPBenchmarks(icp: string) {
    return this.getBenchmarks(icp);
  }

  async getMarketContext(icp: string) {
    return this.getTrends(icp);
  }

  private mapChallengeToUseCase(challenge: string): string {
    const mapping = {
      'manual lead qualification': 'lead-qualification',
      'proposal generation': 'proposal-generation',
      'meeting intelligence': 'meeting-intelligence',
      'workflow automation': 'workflow-automation',
      'data processing': 'data-processing',
      'content creation': 'content-creation'
    };

    const challengeLower = challenge.toLowerCase();
    for (const [key, value] of Object.entries(mapping)) {
      if (challengeLower.includes(key)) {
        return value;
      }
    }

    return 'workflow-automation'; // Default fallback
  }
}

// Export singleton instance
export const intelligenceRAG = new IntelligenceRAG();