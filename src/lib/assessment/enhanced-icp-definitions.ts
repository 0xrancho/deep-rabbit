// Enhanced ICP Definitions with Opportunity Area Branching
// Provides surgical precision for solution matching

export interface OpportunityArea {
  id: string;
  label: string;
  description: string;
  commonProjects: string[];
  revenueModelSuggestions: string[];
  challengeAreas: string[];
}

export interface ICPDefinition {
  id: string;
  label: string;
  icon: string;
  description: string;
  opportunityAreas: OpportunityArea[];
}

export const ENHANCED_ICP_DEFINITIONS: ICPDefinition[] = [
  {
    id: 'custom_development_agencies',
    label: 'Custom Development Agencies',
    icon: '💻',
    description: 'Build custom software solutions for enterprise and mid-market clients',
    opportunityAreas: [
      {
        id: 'enterprise_software_development',
        label: 'Enterprise Software Development',
        description: 'Large-scale enterprise applications and systems',
        commonProjects: [
          'Legacy Modernization Projects',
          'Digital Transformation Initiatives', 
          'Custom ERP/CRM Extensions'
        ],
        revenueModelSuggestions: [
          'Fixed-price project contracts ($50K-500K)',
          'Time & materials with monthly invoicing',
          'Retainer for ongoing development ($/month)',
          'Milestone-based with maintenance tail'
        ],
        challengeAreas: ['Lead Management', 'Pre-Sales Discovery & Scoping', 'Client Onboarding & Activation']
      },
      {
        id: 'saas_product_development',
        label: 'SaaS Product Development',
        description: 'Build and scale software-as-a-service platforms',
        commonProjects: [
          'MVP to Scale-up Builds',
          'Multi-tenant Architecture',
          'API-First Platforms'
        ],
        revenueModelSuggestions: [
          'MVP development + ongoing product development',
          'Revenue share or equity participation',
          'Platform licensing + customization fees',
          'Technical co-founder arrangements'
        ],
        challengeAreas: ['Pre-Sales Discovery & Scoping', 'Sales Execution & Deal Progression', 'Account Management & Expansion']
      },
      {
        id: 'mobile_cross_platform',
        label: 'Mobile & Cross-Platform',
        description: 'Native and cross-platform mobile applications',
        commonProjects: [
          'Enterprise Mobile Apps',
          'Consumer App Development',
          'Progressive Web Apps (PWA)'
        ],
        revenueModelSuggestions: [
          'App development + store submission',
          'Cross-platform conversion projects',
          'Ongoing app maintenance contracts',
          'Performance-based mobile optimization'
        ],
        challengeAreas: ['Lead Management', 'Pre-Sales Discovery & Scoping', 'Client Onboarding & Activation']
      },
      {
        id: 'integration_automation',
        label: 'Integration & Automation',
        description: 'Connect systems and automate business processes',
        commonProjects: [
          'System Integration Projects',
          'Workflow Automation Solutions',
          'Data Pipeline Development'
        ],
        revenueModelSuggestions: [
          'Integration project + monitoring/maintenance',
          'Per-integration pricing model',
          'Transaction/volume-based pricing',
          'Automation ROI sharing arrangements'
        ],
        challengeAreas: ['Pre-Sales Discovery & Scoping', 'Sales Execution & Deal Progression', 'Account Management & Expansion']
      }
    ]
  },

  {
    id: 'digital_transformation_consultancies',
    label: 'Digital Transformation Consultancies',
    icon: '🚀',
    description: 'Guide organizations through technology-enabled business transformation',
    opportunityAreas: [
      {
        id: 'enterprise_modernization',
        label: 'Enterprise Modernization',
        description: 'Modernize legacy systems and technical architecture',
        commonProjects: [
          'Cloud Migration Strategy',
          'Monolith to Microservices',
          'Technical Debt Remediation'
        ],
        revenueModelSuggestions: [
          'Assessment + roadmap + implementation',
          'Transformation retainer (3-18 months)',
          'Success fee based on cost savings',
          'Hybrid consulting + managed services'
        ],
        challengeAreas: ['Lead Management', 'Pre-Sales Discovery & Scoping', 'Sales Execution & Deal Progression']
      },
      {
        id: 'process_automation',
        label: 'Process Automation',
        description: 'Automate manual business processes with AI and RPA',
        commonProjects: [
          'RPA Implementation',
          'BPM/BPMN Solutions',
          'AI-Powered Workflows'
        ],
        revenueModelSuggestions: [
          'Process discovery + automation development',
          'Per-process automation pricing',
          'ROI-sharing on efficiency gains',
          'Automation-as-a-Service subscription'
        ],
        challengeAreas: ['Pre-Sales Discovery & Scoping', 'Client Onboarding & Activation', 'Account Management & Expansion']
      },
      {
        id: 'data_analytics_transformation',
        label: 'Data & Analytics Transformation',
        description: 'Transform data into actionable business insights',
        commonProjects: [
          'Data Lake/Warehouse Setup',
          'BI Dashboard Development',
          'Predictive Analytics Implementation'
        ],
        revenueModelSuggestions: [
          'Data strategy + platform implementation',
          'Analytics-as-a-Service subscription',
          'Performance-based analytics pricing',
          'Managed analytics team model'
        ],
        challengeAreas: ['Lead Management', 'Pre-Sales Discovery & Scoping', 'Client Onboarding & Activation']
      },
      {
        id: 'customer_experience',
        label: 'Customer Experience (CX)',
        description: 'Design and implement customer-centric digital experiences',
        commonProjects: [
          'Omnichannel Strategy',
          'Personalization Engines',
          'Customer Journey Mapping'
        ],
        revenueModelSuggestions: [
          'CX assessment + implementation roadmap',
          'Experience improvement retainer',
          'Performance fees tied to CX metrics',
          'Omnichannel platform licensing'
        ],
        challengeAreas: ['Lead Management', 'Sales Execution & Deal Progression', 'Account Management & Expansion']
      }
    ]
  },

  {
    id: 'system_integration_specialists',
    label: 'System Integration Specialists',
    icon: '🔗',
    description: 'Connect disparate systems and optimize data flow across platforms',
    opportunityAreas: [
      {
        id: 'crm_integration',
        label: 'CRM Integration',
        description: 'Implement and optimize customer relationship management systems',
        commonProjects: [
          'Salesforce Implementation',
          'HubSpot Optimization',
          'Multi-CRM Synchronization'
        ],
        revenueModelSuggestions: [
          'Implementation project + ongoing admin',
          'Per-seat management fees',
          'Integration complexity pricing',
          'CRM optimization retainer'
        ],
        challengeAreas: ['Pre-Sales Discovery & Scoping', 'Client Onboarding & Activation', 'Account Management & Expansion']
      },
      {
        id: 'revops_platform_integration',
        label: 'RevOps Platform Integration',
        description: 'Optimize revenue operations through integrated platforms',
        commonProjects: [
          'Lead-to-Cash Automation',
          'CPQ Implementation',
          'Commission/Incentive Systems'
        ],
        revenueModelSuggestions: [
          'RevOps assessment + platform integration',
          'Success fee on revenue improvement',
          'Per-transaction/deal processing fees',
          'Ongoing RevOps managed services'
        ],
        challengeAreas: ['Lead Management', 'Sales Execution & Deal Progression', 'Account Management & Expansion']
      },
      {
        id: 'erp_integration',
        label: 'ERP Integration',
        description: 'Enterprise resource planning system implementation and optimization',
        commonProjects: [
          'SAP/Oracle Implementation',
          'NetSuite Customization',
          'Manufacturing Systems (MES)'
        ],
        revenueModelSuggestions: [
          'ERP selection + implementation project',
          'Module-based pricing structure',
          'Go-live success milestone payments',
          'Post-implementation support contracts'
        ],
        challengeAreas: ['Pre-Sales Discovery & Scoping', 'Sales Execution & Deal Progression', 'Client Onboarding & Activation']
      },
      {
        id: 'middleware_ipaas',
        label: 'Middleware & iPaaS',
        description: 'Integration platform and middleware architecture solutions',
        commonProjects: [
          'API Gateway Development',
          'Event-Driven Architecture',
          'Master Data Management'
        ],
        revenueModelSuggestions: [
          'Platform architecture + implementation',
          'Per-integration or per-endpoint pricing',
          'Transaction volume-based fees',
          'Managed integration services'
        ],
        challengeAreas: ['Pre-Sales Discovery & Scoping', 'Sales Execution & Deal Progression', 'Account Management & Expansion']
      }
    ]
  },

  {
    id: 'data_analytics_consultancies',
    label: 'Data & Analytics Consultancies',
    icon: '📊',
    description: 'Transform data into competitive advantage through advanced analytics and AI',
    opportunityAreas: [
      {
        id: 'ai_ml_implementation',
        label: 'AI/ML Implementation',
        description: 'Build and deploy artificial intelligence and machine learning solutions',
        commonProjects: [
          'Predictive Model Development',
          'NLP/Conversational AI',
          'Computer Vision Solutions'
        ],
        revenueModelSuggestions: [
          'Proof-of-concept to production pathway',
          'Model development + ongoing optimization',
          'Performance-based pricing (results/accuracy)',
          'AI-as-a-Service subscription model'
        ],
        challengeAreas: ['Lead Management', 'Pre-Sales Discovery & Scoping', 'Client Onboarding & Activation']
      },
      {
        id: 'business_intelligence',
        label: 'Business Intelligence',
        description: 'Create actionable insights through BI dashboards and reporting',
        commonProjects: [
          'Executive Dashboard Design',
          'Self-Service Analytics',
          'Real-time Reporting Systems'
        ],
        revenueModelSuggestions: [
          'BI platform setup + dashboard development',
          'Per-dashboard or per-user licensing',
          'Analytics managed service model',
          'Data insights subscription service'
        ],
        challengeAreas: ['Pre-Sales Discovery & Scoping', 'Client Onboarding & Activation', 'Account Management & Expansion']
      },
      {
        id: 'data_engineering',
        label: 'Data Engineering',
        description: 'Build robust data infrastructure and processing pipelines',
        commonProjects: [
          'ETL/ELT Pipeline Design',
          'Data Quality Management',
          'DataOps Implementation'
        ],
        revenueModelSuggestions: [
          'Data architecture + pipeline development',
          'Data processing volume-based pricing',
          'Managed data platform services',
          'DataOps transformation retainer'
        ],
        challengeAreas: ['Pre-Sales Discovery & Scoping', 'Sales Execution & Deal Progression', 'Account Management & Expansion']
      },
      {
        id: 'advanced_analytics',
        label: 'Advanced Analytics',
        description: 'Deploy sophisticated analytics for strategic business optimization',
        commonProjects: [
          'Customer Analytics & Segmentation',
          'Revenue Attribution Modeling',
          'Operational Optimization'
        ],
        revenueModelSuggestions: [
          'Analytics strategy + model development',
          'Performance improvement sharing',
          'Strategic analytics retainer',
          'Insights-as-a-Service model'
        ],
        challengeAreas: ['Lead Management', 'Pre-Sales Discovery & Scoping', 'Account Management & Expansion']
      }
    ]
  },

  {
    id: 'managed_service_providers',
    label: 'Managed Service Providers (MSPs)',
    icon: '🛠️',
    description: 'Provide ongoing technology management and strategic IT services',
    opportunityAreas: [
      {
        id: 'cloud_management_services',
        label: 'Cloud Management Services',
        description: 'Manage and optimize cloud infrastructure and operations',
        commonProjects: [
          'Multi-Cloud Orchestration',
          'FinOps/Cost Optimization',
          'Disaster Recovery as a Service'
        ],
        revenueModelSuggestions: [
          'Monthly per-resource management fees',
          'Cloud cost optimization sharing',
          'Tiered service level pricing',
          'Infrastructure-as-a-Service model'
        ],
        challengeAreas: ['Lead Management', 'Sales Execution & Deal Progression', 'Account Management & Expansion']
      },
      {
        id: 'security_operations',
        label: 'Security Operations',
        description: 'Provide comprehensive cybersecurity monitoring and compliance',
        commonProjects: [
          'SOC as a Service',
          'Compliance Management (HIPAA, SOC2)',
          'Zero Trust Implementation'
        ],
        revenueModelSuggestions: [
          'Per-device/endpoint security pricing',
          'Compliance certification project fees',
          '24/7 SOC monitoring subscriptions',
          'Security incident response retainer'
        ],
        challengeAreas: ['Lead Management', 'Pre-Sales Discovery & Scoping', 'Account Management & Expansion']
      },
      {
        id: 'infrastructure_management',
        label: 'Infrastructure Management',
        description: 'Monitor and maintain critical IT infrastructure',
        commonProjects: [
          'Network Operations Center (NOC)',
          'Database Administration',
          'Application Performance Management'
        ],
        revenueModelSuggestions: [
          'All-inclusive managed service contracts',
          'Per-server/application monitoring fees',
          'SLA-based pricing with penalties',
          'Hybrid on-site/remote management'
        ],
        challengeAreas: ['Sales Execution & Deal Progression', 'Client Onboarding & Activation', 'Account Management & Expansion']
      },
      {
        id: 'strategic_it_services',
        label: 'Strategic IT Services',
        description: 'Provide virtual CIO/CTO leadership and strategic planning',
        commonProjects: [
          'vCIO/vCTO Services',
          'IT Roadmap Planning',
          'Digital Workplace Solutions'
        ],
        revenueModelSuggestions: [
          'Monthly strategic advisor retainer',
          'IT assessment + roadmap projects',
          'Part-time executive placement model',
          'Technology transformation consulting'
        ],
        challengeAreas: ['Lead Management', 'Sales Execution & Deal Progression', 'Account Management & Expansion']
      }
    ]
  },

  {
    id: 'technology_resellers_agents',
    label: 'Technology Resellers & Agents',
    icon: '🏪',
    description: 'Distribute and support technology solutions as authorized partners',
    opportunityAreas: [
      {
        id: 'software_licensing_distribution',
        label: 'Software Licensing & Distribution',
        description: 'Resell and support enterprise software licenses',
        commonProjects: [
          'Microsoft/O365 Licensing',
          'Adobe Creative Suite',
          'Enterprise Security Software'
        ],
        revenueModelSuggestions: [
          'License markup + implementation fees',
          'Annual license renewal commissions',
          'Volume discount tier structuring',
          'Software asset management services'
        ],
        challengeAreas: ['Lead Management', 'Sales Execution & Deal Progression', 'Account Management & Expansion']
      },
      {
        id: 'cloud_brokerage_services',
        label: 'Cloud Brokerage Services',
        description: 'Facilitate cloud service procurement and management',
        commonProjects: [
          'AWS/Azure/GCP Reselling',
          'SaaS Aggregation & Management',
          'Cloud Migration Facilitation'
        ],
        revenueModelSuggestions: [
          'Cloud consumption markup model',
          'Migration project + ongoing management',
          'Multi-cloud brokerage platform fees',
          'Cloud optimization consulting'
        ],
        challengeAreas: ['Lead Management', 'Pre-Sales Discovery & Scoping', 'Account Management & Expansion']
      },
      {
        id: 'unified_communications',
        label: 'Unified Communications',
        description: 'Deploy and manage communication and collaboration platforms',
        commonProjects: [
          'UCaaS Solutions (Teams, Zoom)',
          'Contact Center Platforms',
          'VoIP/Telephony Systems'
        ],
        revenueModelSuggestions: [
          'Per-seat monthly recurring revenue',
          'Communication platform implementation',
          'Usage-based telephony pricing',
          'Unified communications managed service'
        ],
        challengeAreas: ['Pre-Sales Discovery & Scoping', 'Client Onboarding & Activation', 'Account Management & Expansion']
      },
      {
        id: 'hardware_infrastructure',
        label: 'Hardware & Infrastructure',
        description: 'Supply and support physical technology infrastructure',
        commonProjects: [
          'Networking Equipment (Cisco, etc.)',
          'Storage Solutions',
          'Edge Computing Devices'
        ],
        revenueModelSuggestions: [
          'Hardware markup + installation fees',
          'Maintenance contract revenue',
          'Infrastructure refresh cycle planning',
          'Hardware-as-a-Service leasing'
        ],
        challengeAreas: ['Lead Management', 'Sales Execution & Deal Progression', 'Account Management & Expansion']
      }
    ]
  }
];