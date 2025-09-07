// Enhanced Metric Definitions with Quantification Prompts
// Provides tactical precision for process optimization

export interface MetricDefinition {
  id: string;
  label: string;
  description: string;
  quantificationPrompts: {
    baseline: string;
    friction: string;
  };
  exampleValues?: string[];
}

export interface ChallengeArea {
  id: string;
  label: string;
  description: string;
  metrics: MetricDefinition[];
}

export const REVENUE_CHALLENGE_AREAS: ChallengeArea[] = [
  {
    id: 'lead_management',
    label: 'Lead Management',
    description: 'Pipeline volume, velocity, qualification, and conversion metrics',
    metrics: [
      {
        id: 'pipeline_volume_velocity',
        label: 'Pipeline Volume & Velocity',
        description: 'Number of leads and speed through pipeline stages',
        quantificationPrompts: {
          baseline: 'How many leads enter your pipeline monthly and how quickly do they move through stages?',
          friction: 'What slows down lead progression through your pipeline?'
        },
        exampleValues: ['200 leads/month, 21 days to opportunity', '500 leads/month, 14 days to opportunity', '1000 leads/month, 7 days to opportunity']
      },
      {
        id: 'lead_qualification',
        label: 'Lead Qualification (ICP, Attribution, Segmentation)',
        description: 'Multi-dimensional lead scoring including source attribution and segment fit',
        quantificationPrompts: {
          baseline: 'How do you currently qualify leads across ICP match, source, and segment?',
          friction: 'What qualification data is missing or takes too long to gather?'
        },
        exampleValues: ['Manual ICP scoring only', 'Basic attribution + ICP match', 'Full multi-touch attribution with segment scoring']
      },
      {
        id: 'lead_to_opportunity_conversion',
        label: 'Lead-to-Opportunity Conversion Rate',
        description: 'Percentage of qualified leads that become sales opportunities',
        quantificationPrompts: {
          baseline: 'What percentage of qualified leads convert to opportunities?',
          friction: 'Where do qualified leads drop off before becoming opportunities?'
        },
        exampleValues: ['15% conversion', '25% conversion', '40% conversion']
      },
      {
        id: 'opportunity_to_close_rate',
        label: 'Opportunity-to-Close Rate',
        description: 'Percentage of opportunities that result in closed deals',
        quantificationPrompts: {
          baseline: 'What percentage of opportunities convert to closed deals?',
          friction: 'Why do opportunities fail to close?'
        },
        exampleValues: ['20% close rate', '35% close rate', '50% close rate']
      },
      {
        id: 'cost_per_qualified_lead',
        label: 'Cost per Qualified Lead',
        description: 'Total marketing/sales cost divided by qualified leads',
        quantificationPrompts: {
          baseline: 'What does it cost you to generate one qualified lead?',
          friction: 'Which lead sources have the best cost-to-quality ratio?'
        },
        exampleValues: ['$150/lead', '$400/lead', '$800/lead']
      }
    ]
  },

  {
    id: 'presales_discovery_scoping',
    label: 'Pre-Sales Discovery & Scoping',
    description: 'Research, qualification, demos, proposals, pricing',
    metrics: [
      {
        id: 'discovery_to_proposal_time',
        label: 'Discovery-to-Proposal Time',
        description: 'Time from first discovery call to proposal delivery',
        quantificationPrompts: {
          baseline: 'How long does it take from first discovery call to delivering a proposal?',
          friction: 'What specific activities consume the most time in your proposal process?'
        },
        exampleValues: ['3-5 days', '2 weeks', '1 month']
      },
      {
        id: 'proposal_win_rate',
        label: 'Proposal Win Rate',
        description: 'Percentage of proposals that result in closed deals',
        quantificationPrompts: {
          baseline: 'What percentage of your proposals result in closed deals?',
          friction: 'Why do prospects choose competitors or decide not to move forward?'
        },
        exampleValues: ['25% win rate', '45% win rate', '65% win rate']
      },
      {
        id: 'average_deal_size',
        label: 'Average Deal Size',
        description: 'Average contract value of closed deals',
        quantificationPrompts: {
          baseline: 'What is the average contract value of your closed deals?',
          friction: 'What prevents you from closing larger deals consistently?'
        },
        exampleValues: ['$15K average', '$50K average', '$150K average']
      },
      {
        id: 'scoping_accuracy',
        label: 'Scoping Accuracy',
        description: 'How often initial scope matches actual delivery requirements',
        quantificationPrompts: {
          baseline: 'How often does your initial project scope match actual delivery requirements?',
          friction: 'What causes scope creep or inaccurate initial estimates?'
        },
        exampleValues: ['60% accurate', '80% accurate', '95% accurate']
      }
    ]
  },

  {
    id: 'client_activation_onboarding_adoption',
    label: 'Client Activation, Onboarding, Adoption',
    description: 'Implementation, adoption, time-to-value, user engagement',
    metrics: [
      {
        id: 'time_to_first_value',
        label: 'Time to First Value',
        description: 'Time from signup/contract to client achieving first meaningful outcome',
        quantificationPrompts: {
          baseline: 'How long does it take new clients to achieve their first meaningful outcome?',
          friction: 'What delays clients from getting value quickly after signing up?'
        },
        exampleValues: ['1 week', '30 days', '90 days']
      },
      {
        id: 'onboarding_completion_rate',
        label: 'Onboarding Completion Rate',
        description: 'Percentage of clients who complete the full onboarding process',
        quantificationPrompts: {
          baseline: 'What percentage of new clients complete your onboarding process?',
          friction: 'Where do clients drop off or stall during onboarding?'
        },
        exampleValues: ['60% complete', '75% complete', '90% complete']
      },
      {
        id: 'feature_adoption_rate',
        label: 'Feature Adoption Rate',
        description: 'Percentage of available features/services clients actually use',
        quantificationPrompts: {
          baseline: 'What percentage of your features/services do clients actively use?',
          friction: 'What prevents clients from using more of your capabilities?'
        },
        exampleValues: ['30% adoption', '50% adoption', '70% adoption']
      },
      {
        id: 'user_engagement_score',
        label: 'User Engagement Score',
        description: 'Frequency and depth of client interaction with your service',
        quantificationPrompts: {
          baseline: 'How often do clients actively engage with your service/product?',
          friction: 'What causes clients to disengage or reduce usage?'
        },
        exampleValues: ['Weekly active use', 'Daily active use', '3x per week']
      }
    ]
  },

  {
    id: 'account_management',
    label: 'Account Management',
    description: 'Post-sale revenue growth - User growth, Services/Support, Re-marketing',
    metrics: [
      {
        id: 'user_growth_rate',
        label: 'User Growth Rate',
        description: 'Monthly growth in active users within existing accounts',
        quantificationPrompts: {
          baseline: 'What is your monthly user growth rate within existing accounts?',
          friction: 'What prevents faster user adoption within client organizations?'
        },
        exampleValues: ['5% monthly growth', '10% monthly growth', '20% monthly growth']
      },
      {
        id: 'service_attach_rate',
        label: 'Service Attach Rate',
        description: 'Percentage of accounts purchasing additional services/support',
        quantificationPrompts: {
          baseline: 'What percentage of accounts purchase additional services beyond the initial contract?',
          friction: 'What prevents clients from purchasing more services?'
        },
        exampleValues: ['20% attach rate', '40% attach rate', '60% attach rate']
      },
      {
        id: 'support_to_revenue_conversion',
        label: 'Support to Revenue Conversion',
        description: 'Revenue generated from support interactions leading to upsells',
        quantificationPrompts: {
          baseline: 'How much revenue comes from support-initiated upsells or expansions?',
          friction: 'What prevents support interactions from generating more revenue?'
        },
        exampleValues: ['$50K/quarter', '$150K/quarter', '$500K/quarter']
      },
      {
        id: 'remarketing_success_rate',
        label: 'Re-marketing Success Rate',
        description: 'Success rate of re-engaging dormant or underutilized accounts',
        quantificationPrompts: {
          baseline: 'What percentage of dormant accounts do you successfully re-engage?',
          friction: 'What prevents better re-engagement of underutilized accounts?'
        },
        exampleValues: ['15% success', '30% success', '50% success']
      }
    ]
  }
];

// Dynamic metric filtering based on opportunity area
export const OPPORTUNITY_AREA_TO_RELEVANT_CHALLENGES: Record<string, string[]> = {
  // Custom Development Agencies - Show all 4 options
  'enterprise_software_development': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'saas_product_development': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'mobile_cross_platform': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'integration_automation': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],

  // Digital Transformation Consultancies - Show all 4 options
  'enterprise_modernization': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'process_automation': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'data_analytics_transformation': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'customer_experience': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],

  // System Integration Specialists - Show all 4 options
  'crm_integration': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'revops_platform_integration': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'erp_integration': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'middleware_ipaas': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],

  // Data & Analytics Consultancies - Show all 4 options
  'ai_ml_implementation': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'business_intelligence': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'data_engineering': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'advanced_analytics': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],

  // Managed Service Providers - Show all 4 options
  'cloud_management_services': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'security_operations': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'infrastructure_management': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'strategic_it_services': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],

  // Technology Resellers & Agents - Show all 4 options
  'software_licensing_distribution': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'cloud_brokerage_services': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'unified_communications': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management'],
  'hardware_infrastructure': ['lead_management', 'presales_discovery_scoping', 'client_activation_onboarding_adoption', 'account_management']
};

// Process step interface for workflow mapping
export interface ProcessStep {
  sequence: number;
  description: string;
  role: string; // Who
  action: string; // Does what
  tools: string[]; // Using what
  output: string; // Produces what
  timeInvested?: string; // Optional: how long
}

export interface ProcessBreakdown {
  steps: ProcessStep[];
  breakdownPoint: string;
  primaryBottleneck: 'role' | 'tools' | 'handoff' | 'volume' | 'complexity';
}