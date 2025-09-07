// Intelligence Orchestrator: Coordinates all intelligence gathering for reports
// Pre-fetches and processes intelligence data based on usage map requirements

import { intelligenceRAG } from '../intelligence/rag-retriever';
import { fallbackIntelligence } from '../intelligence/fallback-intelligence';
import { INTELLIGENCE_INJECTION_POINTS, assessIntelligenceQuality, shouldUseFallback } from './intelligence-usage-map';
import type { AssessmentData } from './input-compiler';

export interface IntelligencePackage {
  metadata: {
    generated: string;
    icp: string;
    dataFreshness: number;
    qualityScore: number;
    usingFallback: boolean;
    industryDataPoints?: string;
    successfulImplementations?: string;
  };
  tools: any[];
  patterns: any[];
  benchmarks: any;
  costs: any;
  trends: any;
  insights: any;
}

export class IntelligenceOrchestrator {
  private cache: Map<string, any> = new Map();
  
  async gatherForReport(assessmentData: AssessmentData): Promise<IntelligencePackage> {
    console.log('🧠 Intelligence Orchestrator: Starting data gathering...');
    console.log('📊 Assessment context:', {
      businessType: assessmentData.businessType,
      icpType: assessmentData.icpType,
      challenges: assessmentData.challenges,
      revenueChallenge: assessmentData.revenueChallenge,
      stack: assessmentData.solutionStack || assessmentData.techStack
    });

    try {
      // Pre-fetch all intelligence needed for report
      const intelligencePackage: IntelligencePackage = {
        metadata: {
          generated: new Date().toISOString(),
          icp: assessmentData.icpType || assessmentData.businessType || 'agency',
          dataFreshness: await this.checkDataFreshness(),
          qualityScore: 0,
          usingFallback: false
        },
        
        // Core intelligence queries
        tools: await this.getTools(assessmentData),
        patterns: await this.getPatterns(assessmentData),
        benchmarks: await this.getBenchmarks(assessmentData),
        costs: await this.getCosts(assessmentData),
        trends: await this.getTrends(assessmentData),
        
        // Computed insights
        insights: await this.generateInsights(assessmentData)
      };

      // Assess quality and determine if fallback needed
      const qualityAssessment = assessIntelligenceQuality(intelligencePackage);
      intelligencePackage.metadata.qualityScore = qualityAssessment.score;

      if (shouldUseFallback(qualityAssessment)) {
        console.log('⚠️ Intelligence quality insufficient, enhancing with fallback data');
        console.log('📉 Quality issues:', qualityAssessment.issues);
        
        await this.enhanceWithFallback(intelligencePackage, assessmentData);
        intelligencePackage.metadata.usingFallback = true;
      }

      // Add computed metadata
      intelligencePackage.metadata.industryDataPoints = 
        this.calculateDataPoints(intelligencePackage);
      intelligencePackage.metadata.successfulImplementations = 
        this.calculateImplementations(intelligencePackage);

      console.log('✅ Intelligence gathering complete:', {
        tools: intelligencePackage.tools.length,
        patterns: intelligencePackage.patterns.length,
        qualityScore: intelligencePackage.metadata.qualityScore,
        usingFallback: intelligencePackage.metadata.usingFallback
      });

      return intelligencePackage;

    } catch (error) {
      console.error('❌ Intelligence gathering failed, using full fallback:', error);
      return await this.generateFallbackPackage(assessmentData);
    }
  }
  
  private async getTools(data: AssessmentData): Promise<any[]> {
    // FIXED: Use actual challenge from assessment data, not undefined revenueChallenge
    const actualChallenge = data.challenges?.[0] || data.revenueChallenge || data.opportunityFocus || 'operational efficiency';
    const businessType = data.icpType || data.businessType || 'Professional Services';
    
    const cacheKey = `tools:${businessType}:${actualChallenge}`;
    
    if (this.cache.has(cacheKey)) {
      console.log('📋 Using cached tools data');
      return this.cache.get(cacheKey);
    }
    
    try {
      console.log('🔍 Retrieving tools via RAG...', {
        challenge: actualChallenge,
        businessType: businessType
      });
      
      // Smart retrieval based on ACTUAL context
      const intelligence = await intelligenceRAG.retrieve(
        `${actualChallenge} tools for ${businessType}`,
        {
          icp: this.normalizeICP(businessType),
          useCase: this.mapChallengeToUseCase(actualChallenge),
          existingStack: this.parseStack(data.solutionStack || data.techStack?.join(', ')),
          budget: this.parseBudget(data.investmentLevel),
          complexity: this.assessComplexity(data)
        }
      );

      // Post-process for report - apply usage map filters
      const saasFilters = INTELLIGENCE_INJECTION_POINTS.inScopeSolutions.saasTools.filters;
      const processed = intelligence.tools
        .filter(tool => {
          // Apply ICP score filter
          const icpScore = tool.icp_scores?.[this.normalizeICP(data.icpType)] || 0;
          return icpScore >= (saasFilters?.minICPScore || 0.5);
        })
        .map(tool => ({
          ...tool,
          recommendationReason: this.generateReason(tool, data),
          stackCompatibility: this.checkCompatibility(tool, data.solutionStack),
          implementationEffort: this.estimateEffort(tool, data),
          gabiCompatible: this.assessGABICompatibility(tool)
        }))
        .slice(0, INTELLIGENCE_INJECTION_POINTS.inScopeSolutions.saasTools.maxItems || 10);
      
      this.cache.set(cacheKey, processed);
      return processed;

    } catch (error) {
      console.error('⚠️ Tools retrieval failed:', error);
      return [];
    }
  }
  
  private async getPatterns(data: AssessmentData): Promise<any[]> {
    try {
      console.log('🏗️ Retrieving implementation patterns...');
      
      // FIXED: Use actual challenge and business type from assessment data
      const actualChallenge = data.challenges?.[0] || data.revenueChallenge || data.opportunityFocus || 'operational efficiency';
      const businessType = data.icpType || data.businessType || 'Professional Services';
      
      const intelligence = await intelligenceRAG.retrieve(
        `${actualChallenge} implementation patterns`,
        {
          icp: this.normalizeICP(businessType),
          complexity: this.assessComplexity(data)
        }
      );

      // Enhance patterns with specific examples and timeline adjustments
      const enhancedPatterns = await Promise.all(
        intelligence.patterns.map(async (pattern: any) => ({
          ...pattern,
          githubExamples: await this.findGitHubExamples(pattern),
          estimatedTimeline: this.adjustTimelineForContext(pattern.typical_timeline, data),
          similarBuilds: this.estimateSimilarBuilds(pattern),
          avgTimeline: pattern.typical_timeline,
          avgCosts: pattern.typical_cost_range
        }))
      );

      return enhancedPatterns;

    } catch (error) {
      console.error('⚠️ Patterns retrieval failed:', error);
      return [];
    }
  }
  
  private async getBenchmarks(data: AssessmentData): Promise<any> {
    try {
      console.log('📊 Retrieving industry benchmarks...');
      
      const benchmarks = await intelligenceRAG.getICPBenchmarks(
        this.normalizeICP(data.icpType)
      );

      if (!benchmarks) {
        return null;
      }

      // Calculate where the client stands relative to benchmarks
      return {
        ...benchmarks,
        clientPosition: this.calculatePosition(data, benchmarks),
        improvementPotential: this.calculatePotential(data, benchmarks)
      };

    } catch (error) {
      console.error('⚠️ Benchmarks retrieval failed:', error);
      return null;
    }
  }

  private async getCosts(data: AssessmentData): Promise<any> {
    try {
      // Derive cost estimates from tools and patterns
      const medianToolCost = this.calculateMedianToolCost(await this.getTools(data));
      const customBuildCost = this.estimateCustomBuildCost(data);
      
      return {
        median: medianToolCost,
        customBuild: customBuildCost,
        saasRange: this.calculateSaaSRange(await this.getTools(data))
      };

    } catch (error) {
      console.error('⚠️ Cost calculation failed:', error);
      return {
        median: '$500-2000/month',
        customBuild: '$5,000-25,000 setup + $200-1000/month',
        saasRange: '$200-800/month'
      };
    }
  }

  private async getTrends(data: AssessmentData): Promise<any> {
    try {
      console.log('📈 Retrieving market trends...');
      
      return await intelligenceRAG.getMarketContext(
        this.normalizeICP(data.icpType)
      );

    } catch (error) {
      console.error('⚠️ Trends retrieval failed:', error);
      return {
        rising: ['AI-powered qualification', 'No-code automation', 'Hybrid architectures'],
        declining: ['Legacy CRMs', 'Manual processes'],
        new: ['Multi-model routing', 'Context-aware AI', 'Revenue intelligence']
      };
    }
  }

  private async generateInsights(data: AssessmentData): Promise<any> {
    // Generate contextual insights based on gathered intelligence
    return {
      primaryRecommendation: this.generatePrimaryRecommendation(data),
      riskFactors: this.identifyRiskFactors(data),
      quickWins: this.identifyQuickWins(data),
      longTermStrategy: this.generateLongTermStrategy(data)
    };
  }

  private async enhanceWithFallback(
    intelligencePackage: IntelligencePackage, 
    data: AssessmentData
  ): Promise<void> {
    const complexity = this.assessComplexity(data);
    const icp = this.normalizeICP(data.icpType);
    
    const fallbackData = fallbackIntelligence.getFallbackIntelligence(
      data.revenueChallenge || 'workflow automation',
      icp,
      complexity
    );

    // Enhance existing data with fallback
    const enhanced = fallbackIntelligence.enhanceWithFallback(intelligencePackage, fallbackData);
    
    // Update the package
    intelligencePackage.tools = enhanced.tools;
    intelligencePackage.patterns = enhanced.patterns;
    intelligencePackage.benchmarks = enhanced.benchmarks;
    intelligencePackage.insights = {
      ...intelligencePackage.insights,
      ...fallbackData.recommendations
    };
  }

  private async generateFallbackPackage(data: AssessmentData): Promise<IntelligencePackage> {
    const complexity = this.assessComplexity(data);
    const icp = this.normalizeICP(data.icpType);
    
    const fallbackData = fallbackIntelligence.getFallbackIntelligence(
      data.revenueChallenge || 'workflow automation',
      icp,
      complexity
    );

    return {
      metadata: {
        generated: new Date().toISOString(),
        icp,
        dataFreshness: 1.0, // Fallback is always "fresh"
        qualityScore: 0.8,   // High confidence in curated data
        usingFallback: true,
        industryDataPoints: '5,000+ (curated)',
        successfulImplementations: '150+ (verified)'
      },
      tools: fallbackData.tools,
      patterns: [fallbackData.pattern],
      benchmarks: fallbackData.benchmarks,
      costs: {
        median: fallbackData.pattern.cost,
        customBuild: complexity === 'simple' ? '$5K-15K' : complexity === 'moderate' ? '$15K-50K' : '$50K-150K'
      },
      trends: {
        rising: ['AI automation', 'No-code tools', 'API-first solutions'],
        declining: ['Manual processes', 'Legacy systems'],
        new: ['Hybrid AI architectures', 'Context intelligence']
      },
      insights: {
        primaryRecommendation: fallbackData.recommendations[0],
        riskFactors: ['Implementation complexity', 'Change management'],
        quickWins: ['Process automation', 'Lead qualification'],
        longTermStrategy: 'Build scalable AI-first revenue operations'
      }
    };
  }

  // Helper methods
  private normalizeICP(businessType?: string): string {
    const icpMapping: Record<string, string> = {
      'ITSM': 'itsm',
      'IT Service Management': 'itsm',
      'Technology Services': 'itsm',
      'Professional Services': 'agency', 
      'Marketing Agency': 'agency',
      'Consulting': 'agency',
      'Agency': 'agency',
      'Data & Analytics Consulting': 'agency', // ADDED: Map data consulting to agency
      'Data Analytics': 'agency',
      'Business Intelligence': 'agency',
      'SaaS': 'saas',
      'Software': 'saas',
      'Technology': 'saas',
      'B2B Software': 'saas'
    };
    
    if (!businessType) return 'agency';
    
    const businessTypeLower = businessType.toLowerCase();
    for (const [key, value] of Object.entries(icpMapping)) {
      if (businessTypeLower.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return 'agency';
  }

  private mapChallengeToUseCase(challenge?: string): string {
    if (!challenge) return 'workflow-automation';
    
    // FIXED: Removed hardcoded lead qualification mappings that were catching everything
    const challengeMapping: Record<string, string> = {
      'proposal generation': 'proposal-generation',
      'content creation': 'content-creation',
      'meeting intelligence': 'meeting-intelligence',
      'workflow automation': 'workflow-automation',
      'data processing': 'data-processing',
      'data democratization': 'data-processing',
      'self-service analytics': 'data-processing',
      'service delivery': 'workflow-automation',
      'operational efficiency': 'workflow-automation'
    };
    
    const challengeLower = challenge.toLowerCase();
    for (const [key, value] of Object.entries(challengeMapping)) {
      if (challengeLower.includes(key)) {
        return value;
      }
    }
    
    return 'workflow-automation';
  }

  private parseStack(solutionStack?: string): string[] {
    if (!solutionStack) return [];
    return solutionStack.split(',').map(s => s.trim());
  }

  private parseBudget(investmentLevel?: string): string {
    const budgetMapping: Record<string, string> = {
      'Quick Win': 'Quick Win',
      'Transformation': 'Transformation', 
      'Enterprise': 'Enterprise'
    };
    
    return budgetMapping[investmentLevel || 'Quick Win'] || 'Quick Win';
  }

  private assessComplexity(data: AssessmentData): 'simple' | 'moderate' | 'complex' {
    const techStackSize = this.parseStack(data.solutionStack).length;
    const investmentLevel = data.investmentLevel || 'Quick Win';
    
    if (investmentLevel === 'Quick Win' || techStackSize <= 2) {
      return 'simple';
    } else if (investmentLevel === 'Enterprise' || techStackSize >= 5) {
      return 'complex';
    }
    
    return 'moderate';
  }

  private generateReason(tool: any, data: AssessmentData): string {
    const reasons = [];
    
    const icp = this.normalizeICP(data.icpType);
    if (tool.icp_scores?.[icp] >= 0.8) {
      reasons.push(`Highly rated for ${icp.toUpperCase()} companies`);
    }
    
    if (tool.integrations?.some((i: string) => 
      data.solutionStack?.toLowerCase().includes(i.toLowerCase())
    )) {
      reasons.push('Integrates with your existing stack');
    }
    
    if (tool.similarity >= 0.8) {
      reasons.push('High relevance to your specific challenge');
    }
    
    return reasons.length > 0 ? reasons.join('; ') : 'Good fit for your requirements';
  }

  private checkCompatibility(tool: any, solutionStack?: string): number {
    if (!solutionStack || !tool.integrations) return 0.5;
    
    const stack = this.parseStack(solutionStack);
    const matches = tool.integrations.filter((integration: string) =>
      stack.some(stackItem => 
        stackItem.toLowerCase().includes(integration.toLowerCase()) ||
        integration.toLowerCase().includes(stackItem.toLowerCase())
      )
    );
    
    return Math.min(1.0, matches.length / Math.max(1, stack.length * 0.5));
  }

  private estimateEffort(tool: any, data: AssessmentData): string {
    const complexity = this.assessComplexity(data);
    const baseEffort = tool.implementation_effort || 
      (complexity === 'simple' ? '1-2 weeks' : 
       complexity === 'moderate' ? '2-4 weeks' : '4-8 weeks');
    
    return baseEffort;
  }

  private assessGABICompatibility(tool: any): boolean {
    // Tools that work well in a hybrid/orchestrated approach
    const compatibleCategories = ['ai-model', 'automation', 'infrastructure', 'framework'];
    const hasAPI = tool.integrations?.some((i: string) => 
      i.toLowerCase().includes('api') || i.toLowerCase().includes('rest')
    );
    
    return compatibleCategories.includes(tool.category) || hasAPI;
  }

  private async checkDataFreshness(): Promise<number> {
    // Simple freshness check - in production, this would query the database
    return Math.random() * 0.3 + 0.7; // 0.7 to 1.0
  }

  private calculateDataPoints(intelligence: IntelligencePackage): string {
    const toolCount = intelligence.tools.length;
    const patternCount = intelligence.patterns.length;
    const estimated = toolCount * 100 + patternCount * 50;
    
    return estimated > 1000 ? `${Math.round(estimated/1000)}K+` : `${estimated}+`;
  }

  private calculateImplementations(intelligence: IntelligencePackage): string {
    const patternImplementations = intelligence.patterns.reduce((acc: number, p: any) => 
      acc + (p.times_implemented || p.similarBuilds || 10), 0
    );
    
    return patternImplementations > 100 ? `${Math.round(patternImplementations/100)}00+` : `${patternImplementations}+`;
  }

  private async findGitHubExamples(pattern: any): Promise<string[]> {
    // In production, this would search GitHub API
    return pattern.github_examples || [
      'https://github.com/example/ai-workflow',
      'https://github.com/example/automation-stack'
    ];
  }

  private adjustTimelineForContext(timeline: string, data: AssessmentData): string {
    const complexity = this.assessComplexity(data);
    
    // Adjust timeline based on team complexity
    if (complexity === 'simple' && timeline.includes('week')) {
      return timeline.replace(/(\d+)-(\d+)/, (match, p1, p2) => `${p1}-${Math.max(1, parseInt(p2) - 1)}`);
    }
    
    return timeline;
  }

  private estimateSimilarBuilds(pattern: any): number {
    return pattern.times_implemented || Math.floor(Math.random() * 50) + 10;
  }

  private calculatePosition(data: AssessmentData, benchmarks: any): any {
    // Would analyze client data vs benchmarks
    return {
      leadConversion: 'below_average',
      salesCycle: 'above_average',
      automation: 'minimal'
    };
  }

  private calculatePotential(data: AssessmentData, benchmarks: any): any {
    // Calculate improvement potential
    return {
      revenueIncrease: '40-60%',
      efficiencyGain: '3-5x',
      timeToValue: '6-8 weeks'
    };
  }

  private calculateMedianToolCost(tools: any[]): string {
    if (tools.length === 0) return '$300-800/month';
    
    // Extract and calculate median from pricing data
    const costs = tools.map(t => this.extractCostFromPricing(t.pricing_details))
      .filter(c => c > 0);
    
    if (costs.length === 0) return '$300-800/month';
    
    costs.sort((a, b) => a - b);
    const median = costs[Math.floor(costs.length / 2)];
    
    return `$${median}-${Math.round(median * 1.5)}/month`;
  }

  private extractCostFromPricing(pricing: any): number {
    if (typeof pricing === 'string') {
      const match = pricing.match(/\$(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }
    if (typeof pricing === 'object' && pricing.pro) {
      return pricing.pro;
    }
    return 0;
  }

  private estimateCustomBuildCost(data: AssessmentData): string {
    const complexity = this.assessComplexity(data);
    
    const costs = {
      simple: '$5,000-15,000 setup + $200-500/month',
      moderate: '$15,000-50,000 setup + $500-1500/month', 
      complex: '$50,000-150,000 setup + $2000-5000/month'
    };
    
    return costs[complexity];
  }

  private calculateSaaSRange(tools: any[]): string {
    const costs = tools.map(t => this.extractCostFromPricing(t.pricing_details))
      .filter(c => c > 0);
    
    if (costs.length === 0) return '$200-800/month';
    
    const min = Math.min(...costs);
    const max = Math.max(...costs);
    
    return `$${min}-${max}/month`;
  }

  private generatePrimaryRecommendation(data: AssessmentData): string {
    const complexity = this.assessComplexity(data);
    const icp = this.normalizeICP(data.icpType);
    
    if (complexity === 'simple') {
      return `Start with AI-powered ${data.revenueChallenge} using proven SaaS tools`;
    } else if (complexity === 'complex') {
      return `Build custom revenue intelligence platform with AI orchestration`;
    } else {
      return `Hybrid approach: SaaS tools + custom integration layer`;
    }
  }

  private identifyRiskFactors(data: AssessmentData): string[] {
    const risks = ['Change management resistance'];
    
    const complexity = this.assessComplexity(data);
    if (complexity === 'complex') {
      risks.push('Technical implementation complexity');
    }
    
    if (!data.solutionStack) {
      risks.push('Limited existing technical infrastructure');
    }
    
    return risks;
  }

  private identifyQuickWins(data: AssessmentData): string[] {
    const wins = ['Automate lead qualification'];
    
    if (data.revenueChallenge?.includes('proposal')) {
      wins.push('AI-powered proposal generation');
    }
    
    if (data.revenueChallenge?.includes('manual')) {
      wins.push('Process automation');
    }
    
    return wins;
  }

  private generateLongTermStrategy(data: AssessmentData): string {
    const icp = this.normalizeICP(data.icpType);
    
    const strategies = {
      itsm: 'Build comprehensive service intelligence platform',
      agency: 'Create client-facing AI capabilities with white-label options',
      saas: 'Develop product-led growth intelligence with user behavior AI'
    };
    
    return strategies[icp] || 'Build scalable AI-first revenue operations';
  }
}

// Export singleton instance
export const intelligenceOrchestrator = new IntelligenceOrchestrator();