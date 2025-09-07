// Local Intelligence Loader
// Loads the local intelligence database for RAG operations

import intelligenceData from './local-intelligence-database.json';

export interface LocalTool {
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description: string;
  website?: string;
  pricing_model: string;
  pricing_details: any;
  api_available: boolean;
  tech_stack: string[];
  deployment_options: string[];
  integrations: string[];
  status: string;
  health_score: number;
  momentum: string;
  maturity_level: string;
  icp_scores: Record<string, number>;
  use_cases: string[];
  best_for: string;
  gabi_layer: string;
  trending_context?: string;
  why_now?: string;
  warning?: string;
}

export interface LocalPattern {
  name: string;
  category: string;
  description: string;
  problem_solved: string;
  typical_stack: string[];
  complexity: string;
  typical_timeline: string;
  typical_cost_range: string;
  architecture: string;
  github_examples: string[];
  success_indicators: string[];
  common_pitfalls: string[];
  icp_scores: Record<string, number>;
}

export class LocalIntelligenceLoader {
  private tools: LocalTool[];
  private patterns: LocalPattern[];
  
  constructor() {
    this.tools = intelligenceData.tools as LocalTool[];
    this.patterns = intelligenceData.patterns as LocalPattern[];
    
    console.log(`📚 Local Intelligence: Loaded ${this.tools.length} tools, ${this.patterns.length} patterns`);
  }
  
  // Search tools by use case
  getToolsByUseCase(useCase: string, limit: number = 5): LocalTool[] {
    const normalizedUseCase = useCase.toLowerCase();
    
    return this.tools
      .filter(tool => 
        tool.use_cases.some(uc => uc.toLowerCase().includes(normalizedUseCase)) ||
        tool.description.toLowerCase().includes(normalizedUseCase) ||
        tool.best_for.toLowerCase().includes(normalizedUseCase)
      )
      .sort((a, b) => b.health_score - a.health_score)
      .slice(0, limit);
  }
  
  // Search tools by category
  getToolsByCategory(category: string, limit: number = 5): LocalTool[] {
    const normalizedCategory = category.toLowerCase();
    
    return this.tools
      .filter(tool => 
        tool.category.toLowerCase().includes(normalizedCategory) ||
        tool.subcategory?.toLowerCase().includes(normalizedCategory)
      )
      .sort((a, b) => b.health_score - a.health_score)
      .slice(0, limit);
  }
  
  // Search tools by GABI layer
  getToolsByGabiLayer(layer: string, limit: number = 5): LocalTool[] {
    const normalizedLayer = layer.toLowerCase();
    
    return this.tools
      .filter(tool => tool.gabi_layer.toLowerCase().includes(normalizedLayer))
      .sort((a, b) => b.health_score - a.health_score)
      .slice(0, limit);
  }
  
  // Search tools by ICP score
  getToolsByICP(icp: string, minScore: number = 0.6, limit: number = 5): LocalTool[] {
    return this.tools
      .filter(tool => (tool.icp_scores[icp] || 0) >= minScore)
      .sort((a, b) => (b.icp_scores[icp] || 0) - (a.icp_scores[icp] || 0))
      .slice(0, limit);
  }
  
  // Get implementation patterns
  getPatternsByComplexity(complexity: string): LocalPattern[] {
    return this.patterns.filter(pattern => 
      pattern.complexity === complexity
    );
  }
  
  // Get patterns by ICP relevance
  getPatternsByICP(icp: string, minScore: number = 0.6): LocalPattern[] {
    return this.patterns
      .filter(pattern => (pattern.icp_scores[icp] || 0) >= minScore)
      .sort((a, b) => (b.icp_scores[icp] || 0) - (a.icp_scores[icp] || 0));
  }
  
  // Smart search combining multiple criteria
  smartSearch(query: string, icp?: string, limit: number = 10): LocalTool[] {
    const queryLower = query.toLowerCase();
    const results: Array<{tool: LocalTool, score: number}> = [];
    
    this.tools.forEach(tool => {
      let score = 0;
      
      // Name match (highest weight)
      if (tool.name.toLowerCase().includes(queryLower)) score += 10;
      
      // Category/subcategory match
      if (tool.category.toLowerCase().includes(queryLower)) score += 8;
      if (tool.subcategory?.toLowerCase().includes(queryLower)) score += 8;
      
      // Description match
      if (tool.description.toLowerCase().includes(queryLower)) score += 6;
      
      // Use case match
      if (tool.use_cases.some(uc => uc.toLowerCase().includes(queryLower))) score += 7;
      
      // Best for match
      if (tool.best_for.toLowerCase().includes(queryLower)) score += 6;
      
      // Integrations match
      if (tool.integrations.some(int => int.toLowerCase().includes(queryLower))) score += 4;
      
      // Tech stack match
      if (tool.tech_stack.some(tech => tech.toLowerCase().includes(queryLower))) score += 3;
      
      // ICP relevance bonus
      if (icp && tool.icp_scores[icp]) {
        score += tool.icp_scores[icp] * 5;
      }
      
      // Health and momentum bonus
      score += tool.health_score * 2;
      if (tool.momentum === 'rising') score += 2;
      if (tool.momentum === 'declining') score -= 2;
      
      if (score > 0) {
        results.push({ tool, score });
      }
    });
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.tool);
  }
  
  // Get comprehensive intelligence for a challenge
  getIntelligenceForChallenge(
    challenge: string, 
    icp: string = 'saas',
    complexity: 'simple' | 'moderate' | 'complex' = 'moderate'
  ) {
    const tools = this.smartSearch(challenge, icp, 5);
    const patterns = this.getPatternsByComplexity(complexity);
    const icpPatterns = this.getPatternsByICP(icp);
    
    return {
      tools,
      patterns: patterns.length > 0 ? patterns : icpPatterns,
      metadata: {
        source: 'local_intelligence',
        generated_at: new Date().toISOString(),
        query: challenge,
        icp,
        complexity,
        total_tools: this.tools.length,
        total_patterns: this.patterns.length
      }
    };
  }
  
  // Get stats for debugging
  getStats() {
    return {
      totalTools: this.tools.length,
      totalPatterns: this.patterns.length,
      categories: [...new Set(this.tools.map(t => t.category))],
      gabiLayers: [...new Set(this.tools.map(t => t.gabi_layer))],
      useCases: [...new Set(this.tools.flatMap(t => t.use_cases))],
      icps: ['itsm', 'agency', 'saas'],
      complexities: [...new Set(this.patterns.map(p => p.complexity))]
    };
  }
}

// Export singleton instance
export const localIntelligence = new LocalIntelligenceLoader();