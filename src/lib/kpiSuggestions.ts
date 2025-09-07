// KPI Suggestions System for Success Metrics Capture
import type { KPISuggestion } from '@/types/assessment';

// Challenge-based KPI mapping
const CHALLENGE_KPI_MAP: Record<string, KPISuggestion[]> = {
  'Manual data entry and processing': [
    {
      metric: 'Manual Processing Time',
      unit: 'hours',
      typical_current: 20,
      typical_target: 5,
      timeframe: '30 days',
      category: 'efficiency'
    },
    {
      metric: 'Data Entry Errors',
      unit: '%',
      typical_current: 5,
      typical_target: 1,
      timeframe: '90 days',
      category: 'quality'
    },
    {
      metric: 'Processing Cost per Transaction',
      unit: '$',
      typical_current: 15,
      typical_target: 3,
      timeframe: '6 months',
      category: 'cost'
    }
  ],
  
  'Inefficient communication and collaboration': [
    {
      metric: 'Time Spent in Meetings',
      unit: 'hours',
      typical_current: 15,
      typical_target: 8,
      timeframe: '30 days',
      category: 'efficiency'
    },
    {
      metric: 'Project Delivery Time',
      unit: 'days',
      typical_current: 30,
      typical_target: 20,
      timeframe: '90 days',
      category: 'efficiency'
    },
    {
      metric: 'Communication Response Time',
      unit: 'hours',
      typical_current: 4,
      typical_target: 1,
      timeframe: '30 days',
      category: 'efficiency'
    }
  ],
  
  'Time-consuming reporting and analysis': [
    {
      metric: 'Report Generation Time',
      unit: 'hours',
      typical_current: 8,
      typical_target: 1,
      timeframe: '30 days',
      category: 'efficiency'
    },
    {
      metric: 'Data Analysis Turnaround',
      unit: 'days',
      typical_current: 5,
      typical_target: 1,
      timeframe: '30 days',
      category: 'efficiency'
    },
    {
      metric: 'Reporting Accuracy',
      unit: '%',
      typical_current: 85,
      typical_target: 98,
      timeframe: '90 days',
      category: 'quality'
    }
  ],
  
  'Customer service response times': [
    {
      metric: 'First Response Time',
      unit: 'hours',
      typical_current: 4,
      typical_target: 1,
      timeframe: '30 days',
      category: 'efficiency'
    },
    {
      metric: 'Resolution Time',
      unit: 'hours',
      typical_current: 24,
      typical_target: 8,
      timeframe: '30 days',
      category: 'efficiency'
    },
    {
      metric: 'Customer Satisfaction Score',
      unit: '%',
      typical_current: 75,
      typical_target: 90,
      timeframe: '90 days',
      category: 'quality'
    }
  ],
  
  'Quality control and consistency issues': [
    {
      metric: 'Error Rate',
      unit: '%',
      typical_current: 8,
      typical_target: 2,
      timeframe: '90 days',
      category: 'quality'
    },
    {
      metric: 'Rework Time',
      unit: 'hours',
      typical_current: 10,
      typical_target: 2,
      timeframe: '30 days',
      category: 'efficiency'
    },
    {
      metric: 'Quality Score',
      unit: '%',
      typical_current: 80,
      typical_target: 95,
      timeframe: '6 months',
      category: 'quality'
    }
  ],
  
  'Scaling operations and processes': [
    {
      metric: 'Processing Capacity per Hour',
      unit: 'count',
      typical_current: 20,
      typical_target: 80,
      timeframe: '6 months',
      category: 'efficiency'
    },
    {
      metric: 'Cost per Unit Processed',
      unit: '$',
      typical_current: 10,
      typical_target: 4,
      timeframe: '6 months',
      category: 'cost'
    },
    {
      metric: 'Revenue per Employee',
      unit: '$',
      typical_current: 100000,
      typical_target: 150000,
      timeframe: '12 months',
      category: 'revenue'
    }
  ]
};

// Business type specific KPIs
const BUSINESS_TYPE_KPI_MAP: Record<string, KPISuggestion[]> = {
  'IT Service Management (ITSM)': [
    {
      metric: 'Ticket Resolution Time',
      unit: 'hours',
      typical_current: 12,
      typical_target: 4,
      timeframe: '30 days',
      category: 'efficiency'
    },
    {
      metric: 'First Call Resolution Rate',
      unit: '%',
      typical_current: 65,
      typical_target: 85,
      timeframe: '90 days',
      category: 'quality'
    },
    {
      metric: 'System Uptime',
      unit: '%',
      typical_current: 95,
      typical_target: 99.5,
      timeframe: '30 days',
      category: 'quality'
    }
  ],
  
  'Custom Development': [
    {
      metric: 'Development Velocity',
      unit: 'count',
      typical_current: 15,
      typical_target: 30,
      timeframe: '30 days',
      category: 'efficiency'
    },
    {
      metric: 'Bug Fix Time',
      unit: 'hours',
      typical_current: 8,
      typical_target: 2,
      timeframe: '30 days',
      category: 'efficiency'
    },
    {
      metric: 'Code Quality Score',
      unit: '%',
      typical_current: 80,
      typical_target: 95,
      timeframe: '90 days',
      category: 'quality'
    }
  ],
  
  'SaaS Platform': [
    {
      metric: 'Customer Acquisition Cost',
      unit: '$',
      typical_current: 150,
      typical_target: 100,
      timeframe: '6 months',
      category: 'cost'
    },
    {
      metric: 'Monthly Recurring Revenue',
      unit: '$',
      typical_current: 50000,
      typical_target: 100000,
      timeframe: '12 months',
      category: 'revenue'
    },
    {
      metric: 'Customer Churn Rate',
      unit: '%',
      typical_current: 5,
      typical_target: 2,
      timeframe: '6 months',
      category: 'revenue'
    }
  ],
  
  'Professional Services': [
    {
      metric: 'Billable Hours Utilization',
      unit: '%',
      typical_current: 65,
      typical_target: 85,
      timeframe: '90 days',
      category: 'revenue'
    },
    {
      metric: 'Project Delivery Time',
      unit: 'days',
      typical_current: 45,
      typical_target: 30,
      timeframe: '90 days',
      category: 'efficiency'
    },
    {
      metric: 'Client Satisfaction Score',
      unit: '%',
      typical_current: 80,
      typical_target: 95,
      timeframe: '6 months',
      category: 'quality'
    }
  ]
};

// Universal KPIs that apply to most businesses
const UNIVERSAL_KPIS: KPISuggestion[] = [
  {
    metric: 'Process Completion Time',
    unit: 'minutes',
    typical_current: 60,
    typical_target: 15,
    timeframe: '30 days',
    category: 'efficiency'
  },
  {
    metric: 'Employee Productivity Score',
    unit: '%',
    typical_current: 70,
    typical_target: 90,
    timeframe: '90 days',
    category: 'efficiency'
  },
  {
    metric: 'Operational Cost Reduction',
    unit: '%',
    typical_current: 0,
    typical_target: 25,
    timeframe: '6 months',
    category: 'cost'
  },
  {
    metric: 'Customer Satisfaction',
    unit: '%',
    typical_current: 75,
    typical_target: 90,
    timeframe: '90 days',
    category: 'quality'
  }
];

// Main function to get KPI suggestions
export const getKPISuggestions = (
  revenueChallenge?: string,
  businessType?: string
): KPISuggestion[] => {
  const suggestions: KPISuggestion[] = [];
  
  // Add challenge-specific KPIs
  if (revenueChallenge && CHALLENGE_KPI_MAP[revenueChallenge]) {
    suggestions.push(...CHALLENGE_KPI_MAP[revenueChallenge]);
  }
  
  // Add business type-specific KPIs
  if (businessType && BUSINESS_TYPE_KPI_MAP[businessType]) {
    suggestions.push(...BUSINESS_TYPE_KPI_MAP[businessType]);
  }
  
  // Add universal KPIs if we don't have many suggestions yet
  if (suggestions.length < 3) {
    suggestions.push(...UNIVERSAL_KPIS.slice(0, 4 - suggestions.length));
  }
  
  // Remove duplicates and limit to 6 suggestions
  const uniqueSuggestions = suggestions
    .filter((suggestion, index, array) => 
      array.findIndex(s => s.metric === suggestion.metric) === index
    )
    .slice(0, 6);
    
  return uniqueSuggestions;
};

// Helper function to create a KPI from a suggestion
export const createKPIFromSuggestion = (suggestion: KPISuggestion) => ({
  metric: suggestion.metric,
  currentValue: suggestion.typical_current,
  targetValue: suggestion.typical_target,
  unit: suggestion.unit,
  timeframe: suggestion.timeframe
});

// Function to get default KPIs for empty state
export const getDefaultKPIs = (): KPISuggestion[] => {
  return UNIVERSAL_KPIS.slice(0, 3);
};