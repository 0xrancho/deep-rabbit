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
  | 'Current State Assessment'
  | 'Pain Points & Challenges'
  | 'Desired Future State'
  | 'Constraints & Requirements'
  | 'Decision Process & Timeline'
  | 'Budget & Resources'
  | 'Success Metrics'
  | 'Stakeholders & Politics';

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
  'Current State Assessment',
  'Pain Points & Challenges',
  'Desired Future State',
  'Constraints & Requirements',
  'Decision Process & Timeline',
  'Budget & Resources',
  'Success Metrics',
  'Stakeholders & Politics'
];

export const DISCOVERY_AREA_PROMPTS = {
  'Current State Assessment': {
    description: 'Understand how they operate today - systems, processes, and workflows',
    initialQuestions: [
      'Walk me through how this area operates today?',
      'What systems, processes, or tools currently handle this?',
      'How does the workflow actually function day-to-day?'
    ]
  },
  'Pain Points & Challenges': {
    description: 'Identify what is broken, inefficient, or causing problems',
    initialQuestions: [
      'What are your biggest bottlenecks or frustrations in this area?',
      'Where do things break down or require workarounds?',
      'What problems keep coming up repeatedly?'
    ]
  },
  'Desired Future State': {
    description: 'Understand their vision and goals for the ideal future state',
    initialQuestions: [
      'What would success look like in 12 months?',
      'If you could wave a magic wand, how would this work ideally?',
      'What capabilities do you wish you had that you don\'t have today?'
    ]
  },
  'Constraints & Requirements': {
    description: 'Gather non-negotiable requirements and limiting factors',
    initialQuestions: [
      'What are the non-negotiable requirements for any solution?',
      'What regulatory, compliance, or policy constraints apply?',
      'What technical or business constraints do we need to work within?'
    ]
  },
  'Decision Process & Timeline': {
    description: 'Map out their decision-making process and timeline',
    initialQuestions: [
      'Who needs to approve any solution or changes?',
      'What criteria will be used to evaluate options?',
      'What timeline are you working with for making decisions?'
    ]
  },
  'Budget & Resources': {
    description: 'Understand budget constraints and resource availability',
    initialQuestions: [
      'What budget range has been discussed for this initiative?',
      'How are you thinking about ROI and cost justification?',
      'What internal resources do you have available?'
    ]
  },
  'Success Metrics': {
    description: 'Define what success looks like and how it will be measured',
    initialQuestions: [
      'How will you measure success for this initiative?',
      'What specific metrics or outcomes are you targeting?',
      'How do you track performance in this area today?'
    ]
  },
  'Stakeholders & Politics': {
    description: 'Understand who influences decisions and organizational dynamics',
    initialQuestions: [
      'Who else would be impacted by changes in this area?',
      'Which groups or departments have stakes in how this works?',
      'What internal dynamics could influence the success of changes?'
    ]
  }
} as const;