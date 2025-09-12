// DeepRabbit Business Intelligence Service
// Extracts business context from company domains using GPT web search

import { supabase } from './supabase-auth';

export interface BusinessContext {
  domain: string;
  company_name: string;
  industry: string;
  services: string[];
  target_markets: string[];
  company_size: string;
  revenue_range: string;
  key_differentiators: string[];
  technology_stack: string[];
  geographic_focus: string[];
  business_model: string;
  confidence_score: number;
}

export interface CustomICP {
  name: string;
  description: string;
  target_company_size: string[];
  target_industries: string[];
  target_roles: string[];
  pain_points: string[];
  value_propositions: string[];
  qualification_criteria: Record<string, any>;
  discovery_focus_areas: string[];
  sample_questions: string[];
}

// For now, we'll simulate business intelligence extraction
// In the full implementation, this would use OpenAI GPT-4o with web search
export async function extractBusinessContext(domain: string): Promise<BusinessContext> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate extracted business context based on domain
    const companyName = extractCompanyNameFromDomain(domain);
    
    return {
      domain,
      company_name: companyName,
      industry: getIndustryFromDomain(domain),
      services: getServicesFromDomain(domain),
      target_markets: getTargetMarketsFromDomain(domain),
      company_size: getCompanySizeFromDomain(domain),
      revenue_range: getRevenueRangeFromDomain(domain),
      key_differentiators: getDifferentiatorsFromDomain(domain),
      technology_stack: getTechStackFromDomain(domain),
      geographic_focus: getGeoFocusFromDomain(domain),
      business_model: getBusinessModelFromDomain(domain),
      confidence_score: Math.floor(Math.random() * 30) + 70 // 70-100
    };
  } catch (error) {
    console.error('Error extracting business context:', error);
    
    // Return fallback data
    return {
      domain,
      company_name: extractCompanyNameFromDomain(domain),
      industry: 'Technology',
      services: ['Consulting', 'Software Development'],
      target_markets: ['Enterprise', 'Mid-Market'],
      company_size: 'Unknown',
      revenue_range: 'Unknown',
      key_differentiators: [],
      technology_stack: [],
      geographic_focus: ['Global'],
      business_model: 'Consulting',
      confidence_score: 50
    };
  }
}

// Generate custom ICPs based on business context
export async function generateCustomICPs(businessContext: BusinessContext): Promise<CustomICP[]> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate contextual ICPs based on business context
    const icps: CustomICP[] = [];
    
    if (businessContext.industry.toLowerCase().includes('tech') || 
        businessContext.services.some(s => s.toLowerCase().includes('software'))) {
      icps.push({
        name: 'Enterprise Technology Leaders',
        description: 'Large technology companies needing strategic guidance',
        target_company_size: ['201-1000', '1000+'],
        target_industries: ['Technology', 'SaaS', 'Enterprise Software'],
        target_roles: ['CTO', 'VP Engineering', 'Head of Product'],
        pain_points: ['Technical debt', 'Scalability challenges', 'Team alignment'],
        value_propositions: ['Technical strategy', 'Architecture guidance', 'Team optimization'],
        qualification_criteria: {
          budget_range: '$50K-$500K',
          urgency_indicators: ['System constraints', 'Growth pressures'],
          decision_making_process: 'Committee-based with technical evaluation',
          technical_requirements: ['API integrations', 'Security compliance']
        },
        discovery_focus_areas: ['Current architecture', 'Technical challenges', 'Growth plans'],
        sample_questions: [
          'What technical challenges are limiting your growth?',
          'How do you currently handle system scalability?',
          'What would success look like for your technical team?',
          'How do you approach technical decision making?',
          'What are your biggest concerns about your current tech stack?'
        ]
      });
    }
    
    if (businessContext.target_markets.some(m => m.toLowerCase().includes('healthcare'))) {
      icps.push({
        name: 'Healthcare Innovation Leaders',
        description: 'Healthcare organizations adopting new technologies',
        target_company_size: ['51-200', '201-1000'],
        target_industries: ['Healthcare', 'HealthTech', 'Medical Devices'],
        target_roles: ['CIO', 'VP Technology', 'Chief Medical Officer'],
        pain_points: ['Regulatory compliance', 'Legacy systems', 'Patient data security'],
        value_propositions: ['Compliance expertise', 'Healthcare technology', 'Digital transformation'],
        qualification_criteria: {
          budget_range: '$25K-$250K',
          urgency_indicators: ['Regulatory deadlines', 'Patient outcomes'],
          decision_making_process: 'Multi-stakeholder approval',
          technical_requirements: ['HIPAA compliance', 'EHR integration']
        },
        discovery_focus_areas: ['Compliance requirements', 'Current systems', 'Patient impact'],
        sample_questions: [
          'What compliance challenges are you facing?',
          'How do you currently manage patient data?',
          'What would improve patient outcomes at your organization?',
          'How do you approach healthcare technology investments?',
          'What are your biggest operational inefficiencies?'
        ]
      });
    }
    
    // Always add a general consulting ICP
    icps.push({
      name: `${businessContext.industry} Consulting Clients`,
      description: `Companies in ${businessContext.industry.toLowerCase()} needing strategic consulting`,
      target_company_size: ['11-50', '51-200'],
      target_industries: [businessContext.industry, 'Professional Services'],
      target_roles: ['CEO', 'COO', 'VP Strategy'],
      pain_points: ['Strategic alignment', 'Growth challenges', 'Operational efficiency'],
      value_propositions: ['Strategic guidance', 'Process optimization', 'Growth acceleration'],
      qualification_criteria: {
        budget_range: '$10K-$100K',
        urgency_indicators: ['Market pressures', 'Growth targets'],
        decision_making_process: 'Executive decision',
        technical_requirements: ['Implementation support', 'Change management']
      },
      discovery_focus_areas: ['Strategic goals', 'Current challenges', 'Decision timeline'],
      sample_questions: [
        'What are your top 3 strategic priorities?',
        'What challenges are preventing you from reaching your goals?',
        'How do you currently approach strategic planning?',
        'What would success look like for your organization?',
        'What timeline are you working with for making decisions?'
      ]
    });
    
    return icps;
  } catch (error) {
    console.error('Error generating custom ICPs:', error);
    
    // Return fallback ICPs
    return [{
      name: 'General Consulting Clients',
      description: 'Companies needing strategic consulting services',
      target_company_size: ['11-50', '51-200'],
      target_industries: ['Professional Services', 'Technology'],
      target_roles: ['CEO', 'COO', 'VP Strategy'],
      pain_points: ['Strategic alignment', 'Growth challenges'],
      value_propositions: ['Strategic guidance', 'Process optimization'],
      qualification_criteria: {
        budget_range: '$10K-$100K',
        urgency_indicators: ['Market pressures'],
        decision_making_process: 'Executive decision',
        technical_requirements: ['Implementation support']
      },
      discovery_focus_areas: ['Strategic goals', 'Current challenges'],
      sample_questions: [
        'What are your top strategic priorities?',
        'What challenges are you facing?',
        'How do you approach strategic planning?'
      ]
    }];
  }
}

// Save business context to database
export async function saveBusinessContext(businessContext: BusinessContext): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  // For now, we'll store in localStorage as a simulation
  // In the full implementation, this would use the Supabase database
  const contextData = {
    id: generateId(),
    user_id: user.id,
    ...businessContext,
    created_at: new Date().toISOString()
  };
  
  localStorage.setItem(`business_context_${user.id}`, JSON.stringify(contextData));
  return contextData.id;
}

// Save custom ICPs to database
export async function saveCustomICPs(accountContextId: string, icps: CustomICP[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  // For now, we'll store in localStorage as a simulation
  const icpData = icps.map(icp => ({
    id: generateId(),
    user_id: user.id,
    account_context_id: accountContextId,
    ...icp,
    is_active: true,
    created_at: new Date().toISOString()
  }));
  
  localStorage.setItem(`custom_icps_${user.id}`, JSON.stringify(icpData));
}

// Get user's custom ICPs
export async function getUserCustomICPs(): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const stored = localStorage.getItem(`custom_icps_${user.id}`);
  return stored ? JSON.parse(stored) : [];
}

// Get business context for a domain
export async function getBusinessContext(domain: string): Promise<any | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const stored = localStorage.getItem(`business_context_${user.id}`);
  if (!stored) return null;
  
  const context = JSON.parse(stored);
  return context.domain === domain ? context : null;
}

// Process a new user's email domain for business intelligence
export async function processUserBusinessIntelligence(email: string): Promise<void> {
  try {
    const domain = email.split('@')[1];
    if (!domain || isPersonalEmail(domain)) {
      console.log('Skipping personal email domain:', domain);
      return;
    }

    // Check if we already have context for this domain
    const existingContext = await getBusinessContext(domain);
    if (existingContext && existingContext.confidence_score > 70) {
      console.log('Using existing business context for:', domain);
      return;
    }

    console.log('Extracting business context for:', domain);
    const businessContext = await extractBusinessContext(domain);
    
    console.log('Saving business context...');
    const contextId = await saveBusinessContext(businessContext);
    
    console.log('Generating custom ICPs...');
    const customICPs = await generateCustomICPs(businessContext);
    
    console.log('Saving custom ICPs...');
    await saveCustomICPs(contextId, customICPs);
    
    console.log('Business intelligence processing complete for:', domain);
  } catch (error) {
    console.error('Error processing business intelligence:', error);
  }
}

// Helper functions
function extractCompanyNameFromDomain(domain: string): string {
  return domain
    .replace(/\.(com|org|net|co\.uk|io|ai|tech)$/, '')
    .replace(/\./g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function isPersonalEmail(domain: string): boolean {
  const personalDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'icloud.com', 'protonmail.com', 'aol.com', 'live.com',
    'msn.com', 'yandex.com', 'mail.com', 'zoho.com'
  ];
  return personalDomains.includes(domain.toLowerCase());
}

function getIndustryFromDomain(domain: string): string {
  const domainLower = domain.toLowerCase();
  if (domainLower.includes('tech') || domainLower.includes('software')) return 'Technology';
  if (domainLower.includes('health') || domainLower.includes('medical')) return 'Healthcare';
  if (domainLower.includes('finance') || domainLower.includes('bank')) return 'Financial Services';
  if (domainLower.includes('edu')) return 'Education';
  if (domainLower.includes('consulting')) return 'Consulting';
  return 'Professional Services';
}

function getServicesFromDomain(domain: string): string[] {
  const industry = getIndustryFromDomain(domain);
  const services: Record<string, string[]> = {
    'Technology': ['Software Development', 'Technical Consulting', 'System Integration'],
    'Healthcare': ['Healthcare IT', 'Compliance Consulting', 'Digital Health Solutions'],
    'Financial Services': ['Financial Technology', 'Risk Management', 'Regulatory Compliance'],
    'Consulting': ['Strategic Consulting', 'Management Consulting', 'Business Transformation'],
    'Professional Services': ['Business Consulting', 'Process Optimization', 'Strategic Planning']
  };
  return services[industry] || services['Professional Services'];
}

function getTargetMarketsFromDomain(domain: string): string[] {
  const industry = getIndustryFromDomain(domain);
  const markets: Record<string, string[]> = {
    'Technology': ['Enterprise', 'SaaS Companies', 'Startups'],
    'Healthcare': ['Healthcare Providers', 'HealthTech', 'Medical Devices'],
    'Financial Services': ['Banks', 'FinTech', 'Insurance'],
    'Consulting': ['Enterprise', 'Mid-Market', 'Professional Services'],
    'Professional Services': ['SMB', 'Mid-Market', 'Enterprise']
  };
  return markets[industry] || markets['Professional Services'];
}

function getCompanySizeFromDomain(domain: string): string {
  // Simple heuristic based on domain characteristics
  const domainLower = domain.toLowerCase();
  if (domainLower.includes('corp') || domainLower.includes('global')) return '1000+';
  if (domainLower.includes('group') || domainLower.includes('enterprise')) return '201-1000';
  return '11-50';
}

function getRevenueRangeFromDomain(domain: string): string {
  const companySize = getCompanySizeFromDomain(domain);
  const ranges: Record<string, string> = {
    '1000+': '$100M+',
    '201-1000': '$10M-$100M',
    '51-200': '$1M-$10M',
    '11-50': 'Under $1M'
  };
  return ranges[companySize] || 'Unknown';
}

function getDifferentiatorsFromDomain(domain: string): string[] {
  const industry = getIndustryFromDomain(domain);
  const differentiators: Record<string, string[]> = {
    'Technology': ['Technical Expertise', 'Innovation Focus', 'Scalable Solutions'],
    'Healthcare': ['Regulatory Expertise', 'Patient-Centric Approach', 'Compliance Focus'],
    'Financial Services': ['Risk Management', 'Regulatory Knowledge', 'Security Focus'],
    'Consulting': ['Strategic Thinking', 'Industry Expertise', 'Proven Methodology']
  };
  return differentiators[industry] || ['Industry Expertise', 'Strategic Approach', 'Results-Driven'];
}

function getTechStackFromDomain(domain: string): string[] {
  const industry = getIndustryFromDomain(domain);
  const stacks: Record<string, string[]> = {
    'Technology': ['Cloud Platforms', 'APIs', 'Microservices', 'DevOps'],
    'Healthcare': ['HIPAA Compliance', 'EHR Integration', 'Telehealth'],
    'Financial Services': ['Banking APIs', 'Blockchain', 'Fraud Detection'],
    'Consulting': ['CRM Systems', 'Analytics Platforms', 'Project Management']
  };
  return stacks[industry] || ['Web Technologies', 'Cloud Services', 'Analytics'];
}

function getGeoFocusFromDomain(domain: string): string[] {
  // Simple heuristic based on TLD
  if (domain.endsWith('.co.uk')) return ['United Kingdom', 'Europe'];
  if (domain.endsWith('.ca')) return ['Canada', 'North America'];
  if (domain.endsWith('.au')) return ['Australia', 'Asia Pacific'];
  return ['United States', 'Global'];
}

function getBusinessModelFromDomain(domain: string): string {
  const domainLower = domain.toLowerCase();
  if (domainLower.includes('saas') || domainLower.includes('app')) return 'SaaS';
  if (domainLower.includes('consulting')) return 'Consulting';
  if (domainLower.includes('agency')) return 'Agency';
  if (domainLower.includes('product')) return 'Product';
  return 'Consulting';
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}