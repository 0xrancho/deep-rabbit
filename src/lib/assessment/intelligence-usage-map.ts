// Intelligence Usage Map: Where & How It's Called in Reports
// Maps specific report sections to required intelligence data

export interface IntelligenceInjectionPoint {
  intelligence: string[];
  usage: string;
  required: boolean;
  fallback: string | null;
  maxItems?: number;
  filters?: Record<string, any>;
}

export interface QualityScore {
  score: number;
  issues: string[];
}

export const INTELLIGENCE_INJECTION_POINTS = {
  
  // SECTION: Executive Summary
  executiveSummary: {
    intelligence: ['market_context', 'icp_benchmarks'],
    usage: `
      "Based on our analysis of {intelligenceData.toolsAnalyzed} tools 
      and {intelligenceData.implementationsTracked} implementations 
      in the {assessmentData.icpType} space..."
    `,
    required: false, // Nice to have, not critical
    fallback: 'Generic summary without market data'
  },
  
  // SECTION: Industry Benchmarks
  industryBenchmarks: {
    intelligence: ['icp_metrics', 'performance_benchmarks', 'adoption_rates'],
    usage: `
      "Current {assessmentData.icpType} benchmarks ({currentMonth} data):
      - Lead conversion: {intelligence.benchmarks.leadConversion}%
      - Sales cycle: {intelligence.benchmarks.salesCycle} days
      - Tech adoption: {intelligence.benchmarks.aiAdoption}% using AI"
    `,
    required: true, // Critical for credibility
    fallback: 'Use hardcoded industry averages'
  },
  
  // SECTION: Current State Analysis
  currentStateAnalysis: {
    intelligence: ['similar_companies', 'common_problems'],
    usage: `
      "Among {intelligence.similarCompanies.count} similar {assessmentData.icpType} companies,
      {intelligence.similarCompanies.percentWithSameProblem}% face the same 
      {assessmentData.revenueChallenge} challenges."
    `,
    required: false,
    fallback: 'Skip comparison'
  },
  
  // SECTION: In-Scope Solutions (THREE COLUMNS)
  inScopeSolutions: {
    
    // Column 1: Off-the-shelf SaaS
    saasTools: {
      intelligence: ['tools_by_category', 'pricing_current', 'integration_matrix'],
      usage: `
        // For each relevant tool:
        {
          name: tool.name,
          category: tool.category,
          pricing: tool.pricing_details, // MUST be current
          integrations: tool.integrations.filter(i => 
            assessmentData.solutionStack.includes(i)
          ),
          icpFit: tool.icp_scores[assessmentData.icpType],
          whyRecommended: generateReason(tool, assessmentData)
        }
      `,
      required: true, // Core value prop
      maxItems: 5, // Don't overwhelm
      filters: {
        minICPScore: 0.7,
        mustIntegrateWith: 'existing_stack',
        priceRange: 'budget_appropriate'
      }
    },
    
    // Column 2: Custom Build
    customBuild: {
      intelligence: ['implementation_patterns', 'tech_stack_trends', 'build_costs'],
      usage: `
        "Based on {intelligence.patterns.similarBuilds} similar implementations:
        
        **Recommended Architecture:**
        {intelligence.patterns.mostSuccessful.architecture}
        
        **Typical Stack ({currentMonth}):**
        {intelligence.techStack.current.join(', ')}
        
        **Build Timeline:** {intelligence.patterns.avgTimeline}
        **Monthly Costs:** {intelligence.patterns.avgCosts}
        
        **GitHub Examples:**
        {intelligence.patterns.githubExamples.slice(0,3)}"
      `,
      required: true,
      fallback: 'Generic build recommendations'
    },
    
    // Column 3: GABI Hybrid
    gabiHybrid: {
      intelligence: ['competitive_positioning', 'hybrid_examples'],
      usage: `
        "GABI orchestrates best-in-class tools:
        {intelligence.tools.filter(t => t.gabiCompatible).map(t => t.name)}
        
        Plus proprietary intelligence layer trained on:
        - {intelligence.dataPoints.industrySpecific} {assessmentData.icpType} data points
        - {intelligence.implementations.successful} successful implementations"
      `,
      required: false, // GABI positioning works without this
      fallback: 'Standard GABI pitch'
    }
  },
  
  // SECTION: Implementation Roadmap
  implementationRoadmap: {
    intelligence: ['implementation_patterns', 'common_pitfalls', 'success_factors'],
    usage: `
      "Based on {intelligence.patterns.count} implementations:
      
      **Week 1-2:** {intelligence.patterns.phase1.common}
      **Week 3-4:** {intelligence.patterns.phase2.common}
      **Week 5-8:** {intelligence.patterns.phase3.common}
      
      **Common Pitfalls:**
      {intelligence.pitfalls.forStack(assessmentData.solutionStack)}
      
      **Success Factors:**
      {intelligence.successFactors.forICP(assessmentData.icpType)}"
    `,
    required: false,
    fallback: 'Generic implementation timeline'
  },
  
  // SECTION: ROI Calculation
  roiCalculation: {
    intelligence: ['cost_benchmarks', 'roi_examples', 'payback_periods'],
    usage: `
      "Based on {intelligence.roiExamples.count} similar implementations:
      
      **Typical Investment:** {intelligence.costs.median}
      **Payback Period:** {intelligence.payback.median} months
      **12-Month ROI:** {intelligence.roi.median}%
      
      **Best Case Example:**
      {intelligence.roiExamples.best.company}: {intelligence.roiExamples.best.roi}% ROI"
    `,
    required: true, // People want to see real numbers
    fallback: 'Calculate based on assumptions'
  },
  
  // SECTION: Market Context (New Section)
  marketContext: {
    intelligence: ['trending_tools', 'dying_tools', 'emerging_patterns'],
    usage: `
      "**What's Happening in {assessmentData.icpType} RevOps ({currentMonth}):**
      
      🔥 **Rising:** {intelligence.trending.rising.slice(0,3)}
      📉 **Declining:** {intelligence.trending.declining.slice(0,2)}
      🆕 **New Entrants:** {intelligence.trending.new.slice(0,3)}
      
      **Emerging Pattern:** {intelligence.patterns.newest.description}
      
      **Why This Matters to You:**
      {contextualizeForBusiness(intelligence, assessmentData)}"
    `,
    required: false, // Valuable but not essential
    fallback: null // Skip section if no data
  }
} as const;

// Helper function to assess intelligence data quality
export function assessIntelligenceQuality(intelligence: any): QualityScore {
  let score = 0;
  const issues: string[] = [];

  // Check tools data
  if (intelligence.tools?.length > 0) {
    score += 0.3;
    if (intelligence.tools.length >= 5) score += 0.1; // Bonus for good coverage
  } else {
    issues.push('No relevant tools found');
  }

  // Check patterns data
  if (intelligence.patterns?.length > 0) {
    score += 0.2;
  } else {
    issues.push('No implementation patterns found');
  }

  // Check data freshness
  if (intelligence.metadata?.generated) {
    const dataAge = Date.now() - new Date(intelligence.metadata.generated).getTime();
    const daysSinceUpdate = dataAge / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate < 7) {
      score += 0.2;
    } else if (daysSinceUpdate < 14) {
      score += 0.1;
    } else {
      issues.push('Intelligence data is stale');
    }
  } else {
    issues.push('No metadata about data freshness');
  }

  // Check benchmarks
  if (intelligence.benchmarks?.leadConversion) {
    score += 0.15;
  } else {
    issues.push('No industry benchmarks available');
  }

  // Check costs/pricing data
  if (intelligence.costs?.median || 
      (intelligence.tools?.some((t: any) => t.pricing_details))) {
    score += 0.15;
  } else {
    issues.push('No pricing/cost data available');
  }

  return { score, issues };
}

// Helper to determine if fallback should be used
export function shouldUseFallback(qualityScore: QualityScore): boolean {
  return qualityScore.score < 0.5;
}

// Helper to format intelligence for template substitution
export function formatIntelligenceForTemplate(
  intelligence: any, 
  assessmentData: any
): Record<string, any> {
  const currentMonth = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return {
    currentMonth,
    intelligenceData: {
      toolsAnalyzed: intelligence.tools?.length || 0,
      implementationsTracked: intelligence.patterns?.reduce((acc: number, p: any) => 
        acc + (p.times_implemented || 0), 0) || 0,
    },
    intelligence: {
      benchmarks: intelligence.benchmarks || {},
      patterns: intelligence.patterns || [],
      tools: intelligence.tools || [],
      costs: intelligence.costs || {},
      trending: intelligence.trends || {},
      dataPoints: {
        industrySpecific: intelligence.metadata?.industryDataPoints || '10,000+'
      },
      implementations: {
        successful: intelligence.metadata?.successfulImplementations || '200+'
      }
    },
    assessmentData
  };
}