import { openaiService } from './openai';

// Firecrawl service integration
const FIRECRAWL_API_KEY = import.meta.env.VITE_FIRECRAWL_API_KEY;
const FIRECRAWL_BASE_URL = 'https://api.firecrawl.dev/v1';

export interface CompanyInfo {
  name: string;
  subIndustry: string;
  services: string[];
  typicalClients: string[];
}

export interface ProspectInfo {
  name: string;
  orgType: string;
  industry: string;
  currentNeeds: string[];
}

export interface BusinessContext {
  yourCompany: CompanyInfo;
  prospect: ProspectInfo;
  businessCase: string;
  catalyst: string;
}

// Firecrawl scraping function
async function scrapeWebsite(url: string): Promise<string> {
  if (!FIRECRAWL_API_KEY) {
    throw new Error('Firecrawl API key not configured');
  }

  try {
    const response = await fetch(`${FIRECRAWL_BASE_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: 30000
      })
    });

    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.markdown || data.data?.content || '';
  } catch (error) {
    console.error('Firecrawl scraping error:', error);
    throw error;
  }
}

// Extract your company information
export async function extractYourCompany(url: string): Promise<CompanyInfo> {
  try {
    const content = await scrapeWebsite(url);
    
    const prompt = `
      From this website content, extract:
      1. Company name
      2. Specific sub-industry (be precise: "civil engineering" not "engineering")
      3. Services offered (list top 3-5)
      4. Typical client types
      
      Content: ${content.substring(0, 4000)}
      
      Return as JSON: {
        "name": "",
        "subIndustry": "",
        "services": [],
        "typicalClients": []
      }
    `;

    const response = await openaiService.generateCompletion(prompt, {
      temperature: 0.3,
      maxTokens: 500
    });

    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', response);
      throw new Error('Invalid response format from AI model');
    }
  } catch (error) {
    console.error('Error extracting company info:', error);
    throw new Error(`Failed to analyze company website: ${url}`);
  }
}

// Extract prospect information
export async function extractProspect(url: string): Promise<ProspectInfo> {
  try {
    const content = await scrapeWebsite(url);
    
    const prompt = `
      From this website content, extract:
      1. Organization name
      2. Organization type (company, government, nonprofit, etc.)
      3. Industry/sector
      4. Current initiatives or needs (from news, about, procurement pages)
      
      Content: ${content.substring(0, 4000)}
      
      Return as JSON: {
        "name": "",
        "orgType": "",
        "industry": "",
        "currentNeeds": []
      }
    `;

    const response = await openaiService.generateCompletion(prompt, {
      temperature: 0.3,
      maxTokens: 500
    });

    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', response);
      throw new Error('Invalid response format from AI model');
    }
  } catch (error) {
    console.error('Error extracting prospect info:', error);
    throw new Error(`Failed to analyze prospect website: ${url}`);
  }
}

// Generate business case
export async function generateBusinessCase(yourCompany: CompanyInfo, prospect: ProspectInfo): Promise<string> {
  const prompt = `
    Create a specific business case for:
    Seller: ${yourCompany.name} - a ${yourCompany.subIndustry} firm offering ${yourCompany.services.join(', ')}
    Buyer: ${prospect.name} - a ${prospect.orgType} in ${prospect.industry}
    
    Which of the seller's services would this buyer most likely need?
    Create one specific, realistic business case sentence.
    
    Format: "${yourCompany.name} helping ${prospect.name} with [specific service] for [specific use case]"
  `;

  return await openaiService.generateCompletion(prompt, {
    temperature: 0.7,
    maxTokens: 100
  });
}

// Generate catalyst for urgency
export async function generateCatalyst(businessCase: string): Promise<string> {
  const prompt = `
    Given this business case: "${businessCase}"
    
    What is the most likely urgent catalyst for why they're talking RIGHT NOW?
    Consider: deadlines, regulations, incidents, competition, funding, failures
    
    Return one specific, timely catalyst (one sentence).
  `;

  return await openaiService.generateCompletion(prompt, {
    temperature: 0.7,
    maxTokens: 80
  });
}

// Main analysis function
export async function analyzeBusinessContext(yourCompanyUrl: string, prospectUrl: string): Promise<BusinessContext> {
  try {
    console.log('Starting business context analysis...');
    
    // Step 1: Parallel website extraction
    const [yourCompany, prospect] = await Promise.all([
      extractYourCompany(yourCompanyUrl),
      extractProspect(prospectUrl)
    ]);

    console.log('Extracted companies:', { yourCompany: yourCompany.name, prospect: prospect.name });

    // Step 2: Generate business case
    const businessCase = await generateBusinessCase(yourCompany, prospect);

    // Step 3: Generate catalyst
    const catalyst = await generateCatalyst(businessCase);

    return {
      yourCompany,
      prospect,
      businessCase,
      catalyst
    };
  } catch (error) {
    console.error('Error analyzing business context:', error);
    // Fail gracefully - let the caller handle the error
    throw error;
  }
}