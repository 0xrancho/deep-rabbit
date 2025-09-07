// Fallback Intelligence System
// Always-reliable recommendations when live data fails or is insufficient

export interface FallbackTool {
  name: string;
  category: string;
  description: string;
  pricing: string;
  integrations: string[];
  best_for: string;
  pros: string[];
  cons: string[];
  implementation_effort: string;
  icp_score: number;
}

export interface FallbackPattern {
  name: string;
  description: string;
  architecture: string;
  timeline: string;
  cost: string;
  stack: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  pros: string[];
  cons: string[];
  success_indicators: string[];
  common_pitfalls: string[];
}

export interface FallbackBenchmarks {
  leadConversion: string;
  salesCycle: string;
  aiAdoption: string;
  automationLevel: string;
  [key: string]: string;
}

export class FallbackIntelligence {
  // Curated, always-valid tool recommendations
  private readonly STABLE_TOOLS: Record<string, FallbackTool[]> = {
    'lead-qualification': [
      {
        name: 'OpenAI GPT-4o-mini',
        category: 'ai-model',
        description: 'Cost-effective language model for high-volume lead qualification',
        pricing: '$0.15 per million input tokens, $0.60 per million output tokens',
        integrations: ['REST API', 'Python SDK', 'Node.js SDK', 'Any platform via API'],
        best_for: 'Automated lead scoring and qualification at scale',
        pros: [
          '40x cheaper than GPT-4o for simple tasks',
          'Fast response times (< 1 second)',
          'Excellent for structured data extraction',
          'High rate limits'
        ],
        cons: [
          'Less capable than GPT-4o for complex reasoning',
          'May need more specific prompts',
          'Limited context window vs larger models'
        ],
        implementation_effort: '1-2 weeks',
        icp_score: 0.9
      },
      {
        name: 'Anthropic Claude-3-haiku',
        category: 'ai-model',
        description: 'Balanced model for lead qualification with better reasoning',
        pricing: '$0.25 per million input tokens, $1.25 per million output tokens',
        integrations: ['REST API', 'Anthropic SDK', 'Custom integrations'],
        best_for: 'Complex lead qualification requiring nuanced understanding',
        pros: [
          'Better reasoning than GPT-4o-mini',
          'Strong safety and reliability',
          'Good for complex qualification criteria',
          'Consistent performance'
        ],
        cons: [
          'More expensive than GPT-4o-mini',
          'Newer ecosystem than OpenAI',
          'Requires separate API integration'
        ],
        implementation_effort: '1-2 weeks',
        icp_score: 0.8
      }
    ],
    
    'proposal-generation': [
      {
        name: 'OpenAI GPT-4o',
        category: 'ai-model',
        description: 'Premium model for high-quality proposal and content generation',
        pricing: '$5 per million input tokens, $15 per million output tokens',
        integrations: ['REST API', 'Python SDK', 'Node.js SDK', 'LangChain'],
        best_for: 'Professional proposals requiring creativity and detail',
        pros: [
          'Highest quality content generation',
          'Excellent at long-form writing',
          'Strong understanding of business context',
          'Mature ecosystem and tooling'
        ],
        cons: [
          'Most expensive option',
          'Slower than smaller models',
          'May be overkill for simple proposals'
        ],
        implementation_effort: '1-3 weeks',
        icp_score: 0.9
      }
    ],

    'workflow-automation': [
      {
        name: 'n8n',
        category: 'automation',
        description: 'Open-source workflow automation with AI node support',
        pricing: 'Free self-hosted, $20/month cloud starter, $50/month pro',
        integrations: ['400+ pre-built nodes', 'Custom API endpoints', 'AI models', 'Databases'],
        best_for: 'Custom automation workflows without vendor lock-in',
        pros: [
          'Complete control over workflows',
          'No vendor lock-in',
          'Strong AI integration support',
          'Visual workflow builder',
          'Active open-source community'
        ],
        cons: [
          'Requires technical setup and maintenance',
          'Self-hosting complexity',
          'Smaller ecosystem than Zapier'
        ],
        implementation_effort: '2-4 weeks',
        icp_score: 0.8
      },
      {
        name: 'Zapier',
        category: 'automation',
        description: 'Popular no-code automation platform with extensive integrations',
        pricing: 'Free (100 tasks), $19.99/month starter, $49/month professional',
        integrations: ['5000+ app integrations', 'AI models', 'Custom webhooks'],
        best_for: 'Quick integrations between popular business tools',
        pros: [
          'Massive integration library',
          'No technical setup required',
          'Reliable and stable',
          'Great for non-technical users'
        ],
        cons: [
          'Can get expensive at scale',
          'Limited customization options',
          'Vendor lock-in concerns',
          'Task limits on lower tiers'
        ],
        implementation_effort: '1-2 weeks',
        icp_score: 0.7
      },
      {
        name: 'Pipedream',
        category: 'automation',
        description: 'Developer-friendly automation platform with code steps',
        pricing: 'Free (3000 invocations), $19/month basic, $49/month advanced',
        integrations: ['1000+ pre-built actions', 'Custom code steps', 'AI APIs'],
        best_for: 'Automation workflows requiring custom logic and code',
        pros: [
          'Code and no-code hybrid approach',
          'Developer-friendly interface',
          'Custom JavaScript/Python steps',
          'Good free tier'
        ],
        cons: [
          'Requires some technical knowledge',
          'Smaller community than Zapier',
          'Less enterprise features'
        ],
        implementation_effort: '1-3 weeks',
        icp_score: 0.8
      }
    ],

    'data-processing': [
      {
        name: 'Supabase',
        category: 'infrastructure',
        description: 'Open-source backend with PostgreSQL and real-time features',
        pricing: 'Free (up to 500MB), $25/month Pro, $599/month Team',
        integrations: ['PostgreSQL', 'REST API', 'GraphQL', 'Real-time subscriptions'],
        best_for: 'Rapid backend development with SQL database',
        pros: [
          'Full PostgreSQL database',
          'Built-in authentication',
          'Real-time subscriptions',
          'Excellent developer experience'
        ],
        cons: [
          'PostgreSQL learning curve',
          'Less mature than Firebase',
          'Fewer third-party integrations'
        ],
        implementation_effort: '1-2 weeks',
        icp_score: 0.8
      }
    ]
  };

  // Implementation patterns with proven architectures
  private readonly STABLE_PATTERNS: Record<string, FallbackPattern> = {
    simple: {
      name: 'Webhook → AI → Database',
      description: 'Direct webhook processing with AI analysis and result storage',
      architecture: 'Vercel Edge Function → OpenAI API → Supabase',
      timeline: '1 week',
      cost: '$50-200/month',
      stack: ['Vercel', 'OpenAI API', 'Supabase'],
      complexity: 'simple',
      pros: [
        'Quick to implement',
        'Low operational overhead',
        'Serverless scaling',
        'Cost-effective for low volume'
      ],
      cons: [
        'Limited to simple workflows',
        'No complex orchestration',
        'Vendor dependent'
      ],
      success_indicators: [
        'Sub-second response times',
        '99.9% uptime',
        'Linear cost scaling'
      ],
      common_pitfalls: [
        'Not handling API failures gracefully',
        'Insufficient input validation',
        'Missing error logging'
      ]
    },

    moderate: {
      name: 'Queue → AI Router → Multi-Model',
      description: 'Queued processing with intelligent model routing and result storage',
      architecture: 'Node.js + BullMQ → LiteLLM Router → PostgreSQL',
      timeline: '2-4 weeks',
      cost: '$200-1000/month',
      stack: ['Node.js', 'BullMQ', 'Redis', 'LiteLLM', 'PostgreSQL'],
      complexity: 'moderate',
      pros: [
        'Handles high volume reliably',
        'Cost optimization through model routing',
        'Fault tolerance and retries',
        'Detailed analytics and monitoring'
      ],
      cons: [
        'More complex to set up',
        'Requires infrastructure management',
        'Multiple moving parts'
      ],
      success_indicators: [
        '1000+ jobs/hour processing',
        '30-50% cost savings vs single model',
        '99.5% job completion rate'
      ],
      common_pitfalls: [
        'Queue backlog management',
        'Model routing logic complexity',
        'Monitoring blind spots'
      ]
    },

    complex: {
      name: 'Event Streaming → ML Pipeline',
      description: 'Real-time event processing with ML pipeline and AI orchestration',
      architecture: 'Kafka → Databricks → Multiple AI APIs → Data Warehouse',
      timeline: '2-3 months',
      cost: '$2000+/month',
      stack: ['Apache Kafka', 'Databricks', 'Multiple AI APIs', 'Snowflake/BigQuery'],
      complexity: 'complex',
      pros: [
        'Enterprise-scale processing',
        'Real-time analytics and insights',
        'Advanced ML capabilities',
        'Multi-modal AI integration'
      ],
      cons: [
        'High complexity and cost',
        'Requires ML/Data engineering expertise',
        'Long implementation timeline'
      ],
      success_indicators: [
        '10,000+ events/second processing',
        'Real-time (<100ms) insights',
        'Multi-model ensemble accuracy'
      ],
      common_pitfalls: [
        'Over-engineering for actual needs',
        'Data pipeline complexity',
        'Model drift and monitoring'
      ]
    }
  };

  // Conservative, defensible benchmarks by ICP
  private readonly STABLE_BENCHMARKS: Record<string, FallbackBenchmarks> = {
    itsm: {
      leadConversion: '3-7%',
      salesCycle: '6-9 months',
      aiAdoption: '15-25%',
      automationLevel: '20-40%',
      averageTicketCount: '500-2000/month',
      customerSatisfaction: '75-85%'
    },
    agency: {
      leadConversion: '5-12%',
      salesCycle: '3-6 months',
      aiAdoption: '25-40%',
      automationLevel: '30-60%',
      averageProjectValue: '$5,000-50,000',
      clientRetention: '60-80%'
    },
    saas: {
      leadConversion: '10-20%',
      salesCycle: '2-4 months',
      aiAdoption: '40-60%',
      automationLevel: '50-80%',
      averageDealSize: '$1,000-10,000',
      churnRate: '5-15%'
    }
  };

  getFallbackTools(category: string, icp?: string): FallbackTool[] {
    const tools = this.STABLE_TOOLS[category] || this.STABLE_TOOLS['workflow-automation'];
    
    // Filter by ICP score if provided
    if (icp) {
      return tools
        .filter(tool => tool.icp_score >= 0.6)
        .sort((a, b) => b.icp_score - a.icp_score);
    }
    
    return tools;
  }

  getFallbackPattern(complexity: string): FallbackPattern {
    return this.STABLE_PATTERNS[complexity] || this.STABLE_PATTERNS.moderate;
  }

  getFallbackBenchmarks(icp: string): FallbackBenchmarks {
    return this.STABLE_BENCHMARKS[icp] || this.STABLE_BENCHMARKS.agency;
  }

  // Generate a complete fallback intelligence package
  getFallbackIntelligence(challenge: string, icp: string, complexity: 'simple' | 'moderate' | 'complex') {
    const useCase = this.mapChallengeToUseCase(challenge);
    
    return {
      tools: this.getFallbackTools(useCase, icp),
      pattern: this.getFallbackPattern(complexity),
      benchmarks: this.getFallbackBenchmarks(icp),
      recommendations: this.generateRecommendations(challenge, icp, complexity),
      metadata: {
        source: 'fallback',
        generated_at: new Date().toISOString(),
        reliability: 'high'
      }
    };
  }

  private mapChallengeToUseCase(challenge: string): string {
    // FIXED: Stop using brittle keyword matching that destroys user intent
    const challengeLower = challenge.toLowerCase();
    
    // Be much more specific to avoid false matches
    if (challengeLower.includes('proposal') || challengeLower.includes('content generation')) {
      return 'proposal-generation';
    }
    if (challengeLower.includes('data') || challengeLower.includes('analytics') || 
        challengeLower.includes('insights') || challengeLower.includes('reporting') ||
        challengeLower.includes('dashboard') || challengeLower.includes('self-service')) {
      return 'data-processing';
    }
    if (challengeLower.includes('workflow') || challengeLower.includes('automation') ||
        challengeLower.includes('process') || challengeLower.includes('efficiency')) {
      return 'workflow-automation';
    }
    // REMOVED: Overly broad 'lead' matching that was catching everything
    if (challengeLower.includes('qualification') && challengeLower.includes('prospect')) {
      return 'lead-qualification';
    }
    
    // Default to workflow-automation for process challenges
    return 'workflow-automation';
  }

  private generateRecommendations(challenge: string, icp: string, complexity: string): string[] {
    const recommendations = [];

    // ICP-specific recommendations
    switch (icp) {
      case 'itsm':
        recommendations.push('Focus on ticket automation and service desk integration');
        recommendations.push('Prioritize reliability over cutting-edge features');
        break;
      case 'agency':
        recommendations.push('Emphasize proposal quality and client presentation');
        recommendations.push('Consider white-label solutions for client delivery');
        break;
      case 'saas':
        recommendations.push('Build for scale and integration from day one');
        recommendations.push('Invest in analytics and user behavior tracking');
        break;
    }

    // Complexity-specific recommendations
    switch (complexity) {
      case 'simple':
        recommendations.push('Start with proven, simple solutions');
        recommendations.push('Focus on quick wins and immediate ROI');
        break;
      case 'moderate':
        recommendations.push('Plan for growth but avoid over-engineering');
        recommendations.push('Implement monitoring and error handling early');
        break;
      case 'complex':
        recommendations.push('Ensure you have the technical expertise in-house');
        recommendations.push('Plan for 2-3x longer implementation than estimated');
        break;
    }

    return recommendations;
  }

  // Quality assessment for when to use fallbacks
  assessIntelligenceQuality(intelligence: any): { score: number; issues: string[]; useFallback: boolean } {
    let score = 1.0;
    const issues = [];

    // Check tools data
    if (!intelligence.tools || intelligence.tools.length === 0) {
      score -= 0.4;
      issues.push('No relevant tools found');
    } else if (intelligence.tools.length < 3) {
      score -= 0.2;
      issues.push('Limited tool options available');
    }

    // Check patterns data
    if (!intelligence.patterns || intelligence.patterns.length === 0) {
      score -= 0.3;
      issues.push('No implementation patterns found');
    }

    // Check data freshness
    if (intelligence.metadata?.freshness_score < 0.3) {
      score -= 0.2;
      issues.push('Intelligence data is stale');
    }

    // Check benchmarks
    if (!intelligence.benchmarks) {
      score -= 0.1;
      issues.push('No benchmark data available');
    }

    const useFallback = score < 0.5;

    return { score, issues, useFallback };
  }

  // Merge fallback data with live intelligence
  enhanceWithFallback(liveIntelligence: any, fallbackData: any) {
    return {
      tools: [
        ...(liveIntelligence.tools || []),
        ...fallbackData.tools.slice(0, 3 - (liveIntelligence.tools?.length || 0))
      ].slice(0, 5),
      
      patterns: liveIntelligence.patterns?.length > 0 
        ? liveIntelligence.patterns 
        : [fallbackData.pattern],
      
      benchmarks: liveIntelligence.benchmarks || fallbackData.benchmarks,
      
      recommendations: [
        ...(liveIntelligence.recommendations || []),
        ...fallbackData.recommendations
      ],
      
      metadata: {
        ...liveIntelligence.metadata,
        enhanced_with_fallback: true,
        fallback_items: {
          tools: Math.max(0, 3 - (liveIntelligence.tools?.length || 0)),
          patterns: liveIntelligence.patterns?.length === 0 ? 1 : 0,
          benchmarks: !liveIntelligence.benchmarks,
          recommendations: fallbackData.recommendations.length
        }
      }
    };
  }
}

// Export singleton instance
export const fallbackIntelligence = new FallbackIntelligence();