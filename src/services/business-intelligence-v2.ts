// Enhanced Business Intelligence Extraction Service
// Extracts service definition, detailed ICPs, and CTAs from company websites

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface DetailedICP {
  id: string;
  name: string;
  industry: string;
  subSegment: string;
  typicalProblem: string;
  budgetRange: string;
  decisionMaker: string;
  salesCycle: string;
  indicators: string[];
}

export interface ServiceDefinition {
  primaryService: string;
  serviceType: string; // consulting, implementation, managed services, etc.
  valueProposition: string;
  typicalEngagementSize: string;
  specializations: string[];
}

export interface PostDiscoveryCTA {
  id: string;
  label: string;
  description: string;
  triggerCriteria: string; // When to use this CTA
  intentLevel: 'high' | 'medium' | 'low';
  buyerType: 'technical' | 'business' | 'executive';
}

export interface BusinessContext {
  service: ServiceDefinition;
  icps: DetailedICP[];
  ctas: PostDiscoveryCTA[];
  extractedAt: string;
  confidence: number;
}

// Firecrawl integration (with GPT fallback)
async function scrapeWebsite(url: string): Promise<string> {
  try {
    // Try Firecrawl first (if API key is available)
    if (import.meta.env.VITE_FIRECRAWL_API_KEY) {
      const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          pageOptions: {
            onlyMainContent: true
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data?.content || '';
      }
    }
    
    // Fallback to GPT web search
    return await extractWithGPTWebSearch(url);
  } catch (error) {
    console.error('Scraping error:', error);
    return await extractWithGPTWebSearch(url);
  }
}

// GPT Web Search fallback
async function extractWithGPTWebSearch(domain: string): Promise<string> {
  const searchPrompt = `
    Search for information about the company at ${domain}.
    Extract:
    1. What services they provide
    2. Who their typical clients are
    3. What problems they solve
    4. Their value proposition
    5. Case studies or client examples
    6. Their sales process or engagement model
    
    Return raw text content that describes the company.
  `;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a business intelligence analyst extracting company information from web content.'
      },
      {
        role: 'user',
        content: searchPrompt
      }
    ],
    max_tokens: 2000
  });
  
  return response.choices[0]?.message?.content || '';
}

// Extract structured business context from raw content
async function extractBusinessContext(content: string, domain: string): Promise<BusinessContext> {
  const extractionPrompt = `
    Analyze this company's website content and extract detailed business intelligence.
    
    Website content:
    ${content}
    
    Extract the following structured information:
    
    1. SERVICE DEFINITION:
    - Primary service they provide (be specific)
    - Service type (consulting, implementation, managed services, training, etc.)
    - Unique value proposition
    - Typical engagement size (project budget range)
    - Key specializations or focus areas
    
    2. IDEAL CLIENT PROFILES (2-6 specific ICPs):
    For each ICP, identify:
    - Industry (e.g., Healthcare, Financial Services)
    - Sub-segment (e.g., Regional Hospital Systems, Community Banks)
    - Typical problem they face that this company solves
    - Budget range for engagements
    - Primary decision maker title
    - Typical sales cycle length
    - Indicators that a prospect fits this ICP
    
    3. POST-DISCOVERY CTAs (4-6 common next steps):
    For each CTA, identify:
    - Action label (e.g., "Schedule Technical Deep-Dive")
    - When to use it (trigger criteria)
    - Intent level (high/medium/low)
    - Buyer type (technical/business/executive)
    
    Return as JSON matching this structure:
    {
      "service": {
        "primaryService": "string",
        "serviceType": "string",
        "valueProposition": "string",
        "typicalEngagementSize": "string",
        "specializations": ["string"]
      },
      "icps": [
        {
          "name": "string",
          "industry": "string",
          "subSegment": "string",
          "typicalProblem": "string",
          "budgetRange": "string",
          "decisionMaker": "string",
          "salesCycle": "string",
          "indicators": ["string"]
        }
      ],
      "ctas": [
        {
          "label": "string",
          "description": "string",
          "triggerCriteria": "string",
          "intentLevel": "high|medium|low",
          "buyerType": "technical|business|executive"
        }
      ],
      "confidence": 0.0-1.0
    }
  `;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',  // Use gpt-4o which supports JSON mode
    messages: [
      {
        role: 'system',
        content: 'You are an expert at analyzing B2B service companies and identifying their ICPs and sales patterns. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: extractionPrompt
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 3000,
    temperature: 0.3
  });
  
  const extracted = JSON.parse(response.choices[0]?.message?.content || '{}');
  
  // Add IDs and timestamps
  const context: BusinessContext = {
    service: extracted.service || generateDefaultService(domain),
    icps: (extracted.icps || generateDefaultICPs()).map((icp: any, index: number) => ({
      id: `icp_${index + 1}`,
      ...icp
    })),
    ctas: (extracted.ctas || generateDefaultCTAs()).map((cta: any, index: number) => ({
      id: `cta_${index + 1}`,
      ...cta
    })),
    extractedAt: new Date().toISOString(),
    confidence: extracted.confidence || 0.7
  };
  
  return context;
}

// Generate default service definition if extraction fails
function generateDefaultService(domain: string): ServiceDefinition {
  return {
    primaryService: 'Professional Services',
    serviceType: 'consulting',
    valueProposition: 'Expert consulting and implementation services',
    typicalEngagementSize: '$25,000 - $100,000',
    specializations: ['Strategy', 'Implementation', 'Optimization']
  };
}

// Generate default ICPs if extraction fails
function generateDefaultICPs(): Partial<DetailedICP>[] {
  return [
    {
      name: 'Enterprise Technology',
      industry: 'Technology',
      subSegment: 'Mid-market SaaS Companies',
      typicalProblem: 'Scaling technical operations and improving efficiency',
      budgetRange: '$50K-$200K',
      decisionMaker: 'VP of Engineering',
      salesCycle: '2-3 months',
      indicators: ['100+ employees', 'Series B+', 'Scaling challenges']
    },
    {
      name: 'Financial Services',
      industry: 'Financial Services',
      subSegment: 'Regional Banks & Credit Unions',
      typicalProblem: 'Digital transformation and compliance',
      budgetRange: '$75K-$300K',
      decisionMaker: 'CTO/CIO',
      salesCycle: '3-4 months',
      indicators: ['$1B+ assets', 'Legacy systems', 'Regulatory pressure']
    },
    {
      name: 'Healthcare Systems',
      industry: 'Healthcare',
      subSegment: 'Regional Hospital Networks',
      typicalProblem: 'System integration and workflow optimization',
      budgetRange: '$100K-$500K',
      decisionMaker: 'VP of Clinical Operations',
      salesCycle: '4-6 months',
      indicators: ['Multi-facility', 'EMR modernization', 'Value-based care']
    }
  ];
}

// Generate default CTAs if extraction fails
function generateDefaultCTAs(): Partial<PostDiscoveryCTA>[] {
  return [
    {
      label: 'Schedule Technical Deep-Dive',
      description: 'Detailed technical discussion with implementation team',
      triggerCriteria: 'Strong technical fit, engaged technical buyer',
      intentLevel: 'high',
      buyerType: 'technical'
    },
    {
      label: 'Send ROI Analysis',
      description: 'Custom ROI calculator and business case',
      triggerCriteria: 'Needs business justification, budget concerns',
      intentLevel: 'medium',
      buyerType: 'business'
    },
    {
      label: 'Executive Briefing',
      description: 'High-level presentation for leadership team',
      triggerCriteria: 'Multiple stakeholders, strategic initiative',
      intentLevel: 'medium',
      buyerType: 'executive'
    },
    {
      label: 'Proof of Concept',
      description: 'Limited pilot to demonstrate value',
      triggerCriteria: 'Skeptical buyer, needs validation',
      intentLevel: 'medium',
      buyerType: 'technical'
    },
    {
      label: 'Proposal Presentation',
      description: 'Formal proposal with pricing and timeline',
      triggerCriteria: 'Ready to buy, all questions answered',
      intentLevel: 'high',
      buyerType: 'business'
    },
    {
      label: 'Not a Fit',
      description: 'Refer to partner or decline',
      triggerCriteria: 'Wrong ICP, budget mismatch, different needs',
      intentLevel: 'low',
      buyerType: 'business'
    }
  ];
}

// Main export function
export async function extractBusinessIntelligence(companyUrl: string): Promise<BusinessContext> {
  try {
    // Clean up URL
    const cleanUrl = companyUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const fullUrl = `https://${cleanUrl}`;
    
    // Scrape website content
    console.log('Extracting business intelligence from:', fullUrl);
    const content = await scrapeWebsite(fullUrl);
    
    if (!content) {
      console.warn('No content extracted, using defaults');
      return {
        service: generateDefaultService(cleanUrl),
        icps: generateDefaultICPs().map((icp, index) => ({
          id: `icp_${index + 1}`,
          ...icp
        } as DetailedICP)),
        ctas: generateDefaultCTAs().map((cta, index) => ({
          id: `cta_${index + 1}`,
          ...cta
        } as PostDiscoveryCTA)),
        extractedAt: new Date().toISOString(),
        confidence: 0.3
      };
    }
    
    // Extract structured business context
    const context = await extractBusinessContext(content, cleanUrl);
    
    console.log('Extracted business context:', context);
    return context;
    
  } catch (error) {
    console.error('Business intelligence extraction error:', error);
    
    // Return sensible defaults on error
    return {
      service: generateDefaultService(companyUrl),
      icps: generateDefaultICPs().map((icp, index) => ({
        id: `icp_${index + 1}`,
        ...icp
      } as DetailedICP)),
      ctas: generateDefaultCTAs().map((cta, index) => ({
        id: `cta_${index + 1}`,
        ...cta
      } as PostDiscoveryCTA)),
      extractedAt: new Date().toISOString(),
      confidence: 0.3
    };
  }
}

// Helper function to validate and refine extracted ICPs
export function validateICPs(icps: DetailedICP[]): DetailedICP[] {
  // Ensure we have at least 1 ICP and max 6
  if (icps.length === 0) {
    // If no ICPs extracted, add one default
    const defaults = generateDefaultICPs();
    icps.push({
      id: `icp_1`,
      ...defaults[0]
    } as DetailedICP);
  } else if (icps.length > 6) {
    icps = icps.slice(0, 6);
  }
  
  return icps;
}

// Helper function to validate and refine CTAs
export function validateCTAs(ctas: PostDiscoveryCTA[]): PostDiscoveryCTA[] {
  // Ensure we have 4-6 CTAs
  if (ctas.length < 4) {
    const defaults = generateDefaultCTAs();
    while (ctas.length < 4) {
      ctas.push({
        id: `cta_${ctas.length + 1}`,
        ...defaults[ctas.length]
      } as PostDiscoveryCTA);
    }
  } else if (ctas.length > 6) {
    ctas = ctas.slice(0, 6);
  }
  
  return ctas;
}