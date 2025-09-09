// Discovery Wizard Type Definitions

export interface Organization {
  id: string;
  name: string;
  domain: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Consultant' | 'Senior Consultant' | 'Principal' | 'Manager';
  organization_id: string;
  organization?: Organization;
  created_at: Date;
  updated_at: Date;
}

export interface DiscoverySession {
  id: string;
  account_name: string;
  contact_name: string;
  contact_role: string;
  consultant_id: string;
  consultant?: User;
  client_icp: ClientICP;
  business_area: string;
  discovery_context: string;
  solution_scope: SolutionScope;
  next_step_goal: NextStepGoal;
  status: 'in_progress' | 'completed' | 'archived';
  created_at: Date;
  updated_at: Date;
}

export type ClientICP = 
  | 'Aerospace/Defense'
  | 'Healthcare/Medical'
  | 'Automotive'
  | 'IoT/Industrial'
  | 'Construction'
  | 'Precision Agriculture'
  | 'Financial Services'
  | 'Education Technology';

export type SolutionScope = 
  | 'Software consultation ($10K-$50K)'
  | 'Custom development project ($50K-$200K)'
  | 'Enterprise system integration ($200K-$1M+)'
  | 'Long-term development partnership ($1M+)';

export type NextStepGoal = 
  | 'Technical deep-dive meeting'
  | 'Architecture assessment'
  | 'Proposal development'
  | 'Proof of concept discussion';

export interface ProspectDiscovery {
  id: string;
  session_id: string;
  
  // Contact Details
  contact_string_1?: string;
  contact_string_2?: string;
  contact_string_3?: string;
  
  // Decision Makers
  decision_string_1?: string;
  decision_string_2?: string;
  decision_string_3?: string;
  
  // Pain Statements
  pain_string_1?: string;
  pain_string_2?: string;
  pain_string_3?: string;
  
  // Assumptions
  assumption_string_1?: string;
  assumption_string_2?: string;
  assumption_string_3?: string;
  
  // Opportunities
  opportunity_string_1?: string;
  opportunity_string_2?: string;
  opportunity_string_3?: string;
  
  // Timeline & Urgency
  timeline_string_1?: string;
  timeline_string_2?: string;
  timeline_string_3?: string;
  
  // Budget
  budget_string_1?: string;
  budget_string_2?: string;
  budget_string_3?: string;
  
  // Process
  process_string_1?: string;
  process_string_2?: string;
  process_string_3?: string;
  
  raw_conversation_data: any;
  completion_percentage: number;
  created_at: Date;
  updated_at: Date;
}

export type DiscoveryAreaName = 
  | 'Current Technology Stack'
  | 'Pain Points & Challenges'
  | 'Business Impact & Urgency'
  | 'Decision Process & Timeline'
  | 'Budget & Resource Allocation'
  | 'Technical Requirements'
  | 'Integration & Infrastructure'
  | 'Success Metrics & Outcomes';

export interface DiscoveryArea {
  id: string;
  session_id: string;
  area_name: DiscoveryAreaName;
  completion_percentage: number;
  conversation_data: ConversationMessage[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ConversationMessage {
  id: string;
  sender: 'gabi' | 'consultant';
  message: string;
  timestamp: Date;
  question_suggestions?: string[];
}

// New types for document-style discovery
export interface QuestionBlock {
  id: string;
  questionText: string;
  questionNumber: number;
  notes: string;
  isCollapsed: boolean;
  timestamp: Date;
}

export interface DiscoveryNote {
  areaId: string;
  areaName: string;
  questions: QuestionBlock[];
  currentNotes: string;
  lastUpdated: Date;
}

export interface ProgressTracking {
  totalAssessments: number;      // Target: 16
  completedAssessments: number;  // Current count
  areaBreakdown: {
    [areaName: string]: {
      questionsAsked: number;    // Target: 2 per area
      hasNotes: boolean;
      lastUpdated: Date;
    }
  };
  isComplete: boolean;           // completedAssessments >= 16
}

// ICP Configurations with industry-specific context
export const ICP_CONFIGS = {
  'Aerospace/Defense': {
    label: 'Aerospace/Defense',
    description: 'Flight systems, defense contracts, regulatory (FAA)',
    icon: '🚀',
    keywords: ['DO-178', 'RTCA', 'FAA', 'safety-critical', 'avionics', 'defense'],
    questions: {
      tech: 'What certification requirements (DO-178, RTCA) apply to your systems?',
      process: 'How do you currently manage configuration and version control?',
      validation: "What's your approach to safety-critical system validation?"
    }
  },
  'Healthcare/Medical': {
    label: 'Healthcare/Medical',
    description: 'Medical devices, healthcare IT, clinical systems',
    icon: '🏥',
    keywords: ['HIPAA', 'FDA', 'HL7', 'FHIR', 'clinical', 'patient data'],
    questions: {
      compliance: 'What compliance requirements (HIPAA, FDA, SOX) impact your current systems?',
      integration: 'How do you currently handle patient data integration across systems?',
      workflow: "What's your experience with clinical workflow automation?"
    }
  },
  'Automotive': {
    label: 'Automotive',
    description: 'Connected vehicles, autonomous systems, supply chain',
    icon: '🚗',
    keywords: ['AUTOSAR', 'ISO 26262', 'V2X', 'autonomous', 'telematics'],
    questions: {
      connectivity: 'How are you approaching vehicle connectivity and data management?',
      safety: 'What functional safety standards (ISO 26262) do you need to meet?',
      supply: "What's your strategy for supply chain visibility and management?"
    }
  },
  'IoT/Industrial': {
    label: 'IoT/Industrial',
    description: 'Smart manufacturing, sensor networks, edge computing',
    icon: '🏭',
    keywords: ['MQTT', 'OPC UA', 'edge computing', 'predictive maintenance', 'SCADA'],
    questions: {
      protocols: 'What protocols do your devices currently use for communication?',
      edge: 'How do you handle edge computing vs cloud processing decisions?',
      lifecycle: "What's your strategy for device lifecycle management?"
    }
  },
  'Construction': {
    label: 'Construction',
    description: 'Equipment management, project tracking, safety systems',
    icon: '🏗️',
    keywords: ['BIM', 'project management', 'equipment tracking', 'safety compliance'],
    questions: {
      tracking: 'How do you currently track equipment and resource utilization?',
      safety: 'What safety compliance and reporting requirements do you have?',
      collaboration: "What's your approach to project collaboration across sites?"
    }
  },
  'Precision Agriculture': {
    label: 'Precision Agriculture',
    description: 'Farm automation, crop monitoring, supply chain',
    icon: '🌾',
    keywords: ['precision farming', 'IoT sensors', 'yield optimization', 'supply chain'],
    questions: {
      sensors: 'What types of sensors and data collection are you using in the field?',
      analytics: 'How are you analyzing yield and optimization data?',
      integration: "What's your strategy for integrating with existing farm management systems?"
    }
  },
  'Financial Services': {
    label: 'Financial Services',
    description: 'Fintech, payment systems, trading platforms',
    icon: '💰',
    keywords: ['PCI DSS', 'SOX', 'real-time processing', 'fraud detection', 'APIs'],
    questions: {
      compliance: 'What regulatory compliance requirements (PCI DSS, SOX) do you face?',
      processing: 'How do you handle real-time transaction processing and reconciliation?',
      security: "What's your approach to fraud detection and security?"
    }
  },
  'Education Technology': {
    label: 'Education Technology',
    description: 'Learning platforms, assessment tools, student systems',
    icon: '🎓',
    keywords: ['LMS', 'FERPA', 'assessment', 'adaptive learning', 'analytics'],
    questions: {
      privacy: 'How do you handle student data privacy (FERPA) requirements?',
      integration: 'What existing learning management systems do you need to integrate with?',
      analytics: "What's your approach to learning analytics and outcomes measurement?"
    }
  }
} as const;

// Discovery Area Configurations
export const DISCOVERY_AREAS: DiscoveryAreaName[] = [
  'Current Technology Stack',
  'Pain Points & Challenges',
  'Business Impact & Urgency',
  'Decision Process & Timeline',
  'Budget & Resource Allocation',
  'Technical Requirements',
  'Integration & Infrastructure',
  'Success Metrics & Outcomes'
];

export const DISCOVERY_AREA_PROMPTS = {
  'Current Technology Stack': {
    description: 'Understand their existing systems, languages, frameworks, and infrastructure',
    initialQuestions: [
      "What's your current technology stack?",
      'What programming languages and frameworks are you using?',
      'How is your infrastructure currently set up?'
    ]
  },
  'Pain Points & Challenges': {
    description: 'Identify technical and business challenges they face',
    initialQuestions: [
      'What are your biggest technical challenges right now?',
      'Where are the bottlenecks in your current system?',
      'What problems keep coming up repeatedly?'
    ]
  },
  'Business Impact & Urgency': {
    description: 'Quantify the business impact and timeline pressures',
    initialQuestions: [
      'How is this impacting your business today?',
      'What happens if nothing changes?',
      "What's driving the urgency for a solution?"
    ]
  },
  'Decision Process & Timeline': {
    description: 'Map out their decision-making process and timeline',
    initialQuestions: [
      "What's your decision-making process for this project?",
      'Who needs to be involved in the decision?',
      'What timeline are you working with?'
    ]
  },
  'Budget & Resource Allocation': {
    description: 'Understand budget constraints and resource availability',
    initialQuestions: [
      'What budget range have you allocated for this initiative?',
      'How are you thinking about ROI for this investment?',
      'What resources do you have available internally?'
    ]
  },
  'Technical Requirements': {
    description: 'Gather specific technical requirements and constraints',
    initialQuestions: [
      'What are your must-have technical requirements?',
      'What constraints do we need to work within?',
      'What are your performance and scalability needs?'
    ]
  },
  'Integration & Infrastructure': {
    description: 'Understand integration needs and infrastructure requirements',
    initialQuestions: [
      'What systems will this need to integrate with?',
      'What are your deployment preferences?',
      'How do you handle DevOps and CI/CD currently?'
    ]
  },
  'Success Metrics & Outcomes': {
    description: 'Define what success looks like and how it will be measured',
    initialQuestions: [
      'How will you measure success for this project?',
      'What outcomes are you expecting?',
      'What KPIs will this impact?'
    ]
  }
} as const;