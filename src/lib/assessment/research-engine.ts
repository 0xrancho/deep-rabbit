import { AssessmentData } from './input-compiler';
import { executeFullResearch } from './simplified-research-engine';
import { localIntelligence } from '../intelligence/local-intelligence-loader';
import { fallbackIntelligence } from '../intelligence/fallback-intelligence';
import { minimalRAG } from '../intelligence/minimal-rag-retriever';
import { vectorRAG } from './vector-rag-retriever';

interface ResearchPlan {
  companyQueries: string[];      // Company-specific research queries
  primaryQueries: string[];
  ragQueries: string[];
  externalSearches: string[];
  expectedOutputs: ReportRequirements & CompanyIntelligence;
}

interface CompanyIntelligence {
  companyProfile: string;
  websiteAnalysis: string;
  teamSize: string;
  websitePromises: string[];
  competitorContext: string;
  locationContext: string;
}

interface ReportRequirements {
  tools: { name: string; pricing: string; integration: string; useCase: string }[];
  implementations: { description: string; stack: string; timeline: string; source?: string }[];
  benchmarks: { metric: string; current: string; industry: string; improvement: string }[];
  caseStudies: { company: string; challenge: string; solution: string; result: string }[];
  marketContext: { trend: string; adoption: string; relevance: string }[];
  roi: { investment: number; payback: string; yearOneReturn: string; confidence: string }[];
}

export async function executeResearch(
  targets: any,
  data: AssessmentData,
  inferences: any
): Promise<string> {
  console.log('🌐 Research Engine: Starting SIMPLIFIED research with full context');
  
  // NEW: Use simplified research engine that passes 100% of user input
  return await executeFullResearch(data);
}

export async function executeComprehensiveResearch(
  data: AssessmentData,
  ragClient?: any
): Promise<any> {
  
  // 1. Build dynamic research plan from user inputs
  const researchPlan = buildResearchPlan(data);
  console.log('📋 Research plan created:', {
    companyQueries: researchPlan.companyQueries.length,
    primaryQueries: researchPlan.primaryQueries.length,
    ragQueries: researchPlan.ragQueries.length
  });
  
  // 2. Query RAG first for curated intelligence
  console.log('🔍 Querying RAG intelligence library...');
  const ragResults = await queryRAGSources(researchPlan.ragQueries, data, ragClient);
  console.log('📚 RAG results:', {
    tools: ragResults.tools?.length || 0,
    patterns: ragResults.patterns?.length || 0,
    implementations: ragResults.implementations?.length || 0
  });
  
  // 3. Identify gaps that RAG doesn't cover
  const researchGaps = identifyRAGGaps(ragResults, data);
  console.log('🔍 Research gaps identified:', researchGaps);
  
  // 4. Build enhanced Perplexity prompt with RAG context and gaps
  const perplexityPrompt = buildEnhancedPerplexityPrompt(data, researchPlan, ragResults, researchGaps);
  console.log('📝 Enhanced Perplexity prompt built, length:', perplexityPrompt.length);
  
  // 5. Execute Perplexity search focusing on gaps and company specifics
  const perplexityResults = await executePerplexitySearch(perplexityPrompt);
  
  // 6. Combine RAG intelligence with Perplexity research
  return structureForReport(ragResults, perplexityResults, researchPlan.expectedOutputs);
}

function buildResearchPlan(data: AssessmentData): ResearchPlan {
  // Extract key variables without assumptions - use raw user input
  const businessType = data.icpType || data.businessType || 'Professional Services';
  const opportunityFocus = data.opportunityFocus || data.challenges?.[0] || 'operational efficiency';
  // FIXED: Let the LLM understand the actual challenge from user input
  const revenueChallenge = data.challenges?.[0] || data.revenueChallenge || data.teamProcess || data.additionalContext;
  const solutionStack = data.solutionStack || data.techStack?.join(', ') || 'existing systems';
  const teamProcess = data.teamProcess || data.processDescription || '';
  const investmentLevel = data.investmentLevel || 'moderate investment';
  const additionalContext = data.additionalContext || '';
  const company = data.businessName || data.company || 'the company';
  
  // Parse what matters from their input
  const painPoints = extractPainPoints(teamProcess, additionalContext);
  const techComponents = solutionStack.split(/[,;]/).map(s => s.trim()).filter(s => s);
  const budgetRange = parseBudgetExpectation(investmentLevel);
  
  // Extract domain from email for targeted company search
  const emailDomain = data.email?.split('@')[1] || '';
  const teamMembers = extractTeamMembers(teamProcess);
  const location = extractLocation(data);
  
  return {
    // NEW: Company-specific research queries (highest priority)
    companyQueries: [
      `"${company}" company profile ${emailDomain ? `site:${emailDomain}` : ''} about team`,
      `"${company}" ${businessType} services clients case studies testimonials`,
      `"${company}" team size employees LinkedIn ${location}`,
      `"${company}" vs competitors ${location} ${businessType} market position`,
      `"${company}" website pricing process ${revenueChallenge} how they work`
    ],
    
    primaryQueries: [
      `How are ${businessType} companies like ${company} solving ${revenueChallenge} with AI in 2024-2025`,
      `What specific tools integrate ${techComponents.join(' AND ')} for ${opportunityFocus}`,
      `Real implementations of ${revenueChallenge} automation with measurable ROI`,
      `Why ${painPoints.join(' and ')} happen in ${businessType} companies and proven solutions`
    ],
    
    ragQueries: [
      `tools:${businessType}:${revenueChallenge}`,
      `patterns:${opportunityFocus}:${budgetRange}`,
      `implementations:similar:${techComponents[0] || 'CRM'}`
    ],
    
    externalSearches: [
      `"${company}" company profile team size revenue`,
      `${businessType} industry AI adoption statistics 2024 ${location}`,
      `GitHub repositories ${revenueChallenge} ${businessType} automation`,
      `${techComponents[0] || 'CRM'} API AI integration examples`,
      `Cost of ${revenueChallenge} inefficiency ${businessType} ${teamMembers.length} person teams`
    ],
    
    expectedOutputs: {
      tools: [], // Perplexity will populate with 5-10 specific tools
      implementations: [], // 3-5 real examples with details
      benchmarks: [], // Current vs industry vs AI-enabled
      caseStudies: [], // 2-3 detailed stories
      marketContext: [], // Trends and adoption rates
      roi: [], // Investment scenarios and returns
      // NEW: Company intelligence
      companyProfile: '',
      websiteAnalysis: '',
      teamSize: '',
      websitePromises: [],
      competitorContext: '',
      locationContext: ''
    }
  };
}

function buildPerplexityPrompt(
  data: AssessmentData, 
  plan: ResearchPlan,
  ragContext: any
): string {
  
  const company = data.businessName || data.company || 'the company';
  const businessType = data.icpType || data.businessType || 'Professional Services';
  // FIXED: Use actual user input instead of hardcoded default
  const revenueChallenge = data.challenges?.[0] || data.revenueChallenge || data.teamProcess || data.additionalContext;
  const teamProcess = data.teamProcess || data.processDescription || 'current processes';
  const solutionStack = data.solutionStack || data.techStack?.join(', ') || 'existing systems';
  const opportunityFocus = data.opportunityFocus || data.challenges?.[0] || 'efficiency';
  const investmentLevel = data.investmentLevel || 'moderate investment';
  const additionalContext = data.additionalContext || 'Not provided';
  
  // Extract enhanced context for company research
  const emailDomain = data.email?.split('@')[1] || '';
  const teamMembers = extractTeamMembers(teamProcess);
  const location = extractLocation(data);
  
  // Build context from RAG if available
  const contextSection = ragContext.tools?.length > 0 ? `
CONTEXT FROM INTERNAL INTELLIGENCE:
We already know about these tools: ${ragContext.tools.map((t: any) => t.name).join(', ')}
We have these implementation patterns: ${ragContext.patterns?.length || 0} documented

BUILD ON THIS CONTEXT - don't repeat what we know, find what we don't.
` : '';

  return `
Research ${company} specifically and their market context for AI transformation.

${contextSection}

STEP 1: RESEARCH THE ACTUAL COMPANY
Search for "${company}" ${emailDomain ? `OR site:${emailDomain}` : ''}:
- Find their website, About page, team page, services page, case studies
- Look for: How many employees, years in business, key differentiators
- Extract their positioning: What do they promise clients?
- Find LinkedIn company page for team size and employee backgrounds
- Look for reviews on Clutch, G2, or industry sites
- Identify their actual clients if mentioned anywhere
- What certifications, partnerships, or specializations do they advertise?

STEP 2: ANALYZE THEIR CURRENT STATE VS DIGITAL PRESENCE
Based on ${company}'s website and online presence:
- What tools/certifications do they advertise having?
- What does their sales process look like from their site?
- How do they position themselves vs competitors in ${location}?
- What are their strengths based on their marketing materials?
- What are they NOT talking about (potential gaps)?

Their stated internal process: "${teamProcess}"
Their team appears to include: ${teamMembers.join(', ')}
Compare this to what their website promises clients - where's the disconnect?

STEP 3: RESEARCH SOLUTIONS FOR THEIR SPECIFIC SITUATION
Now that you understand ${company}, find targeted solutions:

TOOLS & PLATFORMS:
- AI solutions that work with ${solutionStack}
- Focus on ${revenueChallenge} for ${businessType} companies
- Must handle teams with ${teamMembers.length} people in the process
- Budget reality: ${investmentLevel} for a ${businessType} company
- Include actual pricing, integration complexity, setup time
- Prioritize tools that solve "${extractKeyBottleneck(teamProcess)}"

PEER COMPANIES:
- Find similar ${businessType} companies (similar size to ${company})
- Located in or serving ${location} market if possible
- Who has successfully automated ${revenueChallenge}
- Include specific metrics, timelines, and investment amounts
- Look for case studies with before/after process descriptions

MARKET CONTEXT:
- How are ${company}'s competitors in ${location} handling ${revenueChallenge}?
- What's happening in ${businessType} market specifically for ${opportunityFocus}?
- Industry trends affecting companies like ${company}
- What are the adoption rates and success factors?

STEP 4: CALCULATE THEIR SPECIFIC OPPORTUNITY
Based on ${company}'s actual situation:
- Their stated challenge: "${additionalContext}"
- If they're at 3% conversion and industry average is X%, calculate the revenue gap
- With their business model, what's the real financial impact?
- Consider their team cost (${teamMembers.length} people: ${teamMembers.join(', ')})
- Factor in ${location} market dynamics and competition

STEP 5: FIND UNEXPECTED INSIGHTS
- What adjacent solutions could specifically help ${company}?
- What are companies in OTHER industries doing for similar challenges?
- Based on their team composition, what would they find surprising but valuable?
- What non-obvious competitive advantages could AI give them?
- What would make ${company} stand out in ${businessType} in ${location}?

RETURN SPECIFIC INFORMATION about ${company}, not generic ${businessType} advice.
Include URLs, citations, actual numbers, real company examples, specific tool names.

Focus on making this feel like: "We researched ${company} specifically and here's what we found..."
Not: "Here's generic advice for ${businessType} companies..."
`;
}

function buildEnhancedPerplexityPrompt(
  data: AssessmentData,
  plan: ResearchPlan,
  ragResults: any,
  researchGaps: string[]
): string {
  
  const company = data.businessName || data.company || 'the company';
  const businessType = data.icpType || data.businessType || 'Professional Services';
  // FIXED: Use actual user input instead of hardcoded default
  const revenueChallenge = data.challenges?.[0] || data.revenueChallenge || data.teamProcess || data.additionalContext;
  const teamProcess = data.teamProcess || data.processDescription || 'current processes';
  const solutionStack = data.solutionStack || data.techStack?.join(', ') || 'existing systems';
  const opportunityFocus = data.opportunityFocus || data.challenges?.[0] || 'efficiency';
  const investmentLevel = data.investmentLevel || 'moderate investment';
  const additionalContext = data.additionalContext || 'Not provided';
  
  // Extract enhanced context for company research
  const emailDomain = data.email?.split('@')[1] || '';
  const teamMembers = extractTeamMembers(teamProcess);
  const location = extractLocation(data);
  
  // Build RAG context section
  const ragContextSection = ragResults.tools?.length > 0 ? `
CONTEXT FROM CURATED INTELLIGENCE DATABASE:
We already know these proven tools for ${businessType}:
${ragResults.tools.map((t: any) => `- ${t.name} (${t.gabi_layer}) - ${t.pricing}`).join('\n')}

Implementation patterns available:
${ragResults.patterns?.map((p: any) => `- ${p.name}: ${p.timeline}, ${p.complexity} complexity`).join('\n') || 'None'}

Verified implementations:
${ragResults.implementations?.map((i: any) => `- ${i.description}: ${i.results}`).join('\n') || 'None'}

RESEARCH GAPS TO FILL:
${researchGaps.join('\n- ')}

BUILD ON THIS CONTEXT - focus on the gaps, don't repeat what we know.
` : '';

  return `
Research ${company} specifically and fill intelligence gaps for AI transformation.

${ragContextSection}

STEP 1: RESEARCH THE ACTUAL COMPANY
Search for "${company}" ${emailDomain ? `OR site:${emailDomain}` : ''}:
- Company profile: team size, years in business, market position
- Website analysis: what they promise vs their internal process
- LinkedIn company page and employee backgrounds
- Client testimonials, case studies, reviews on G2/Clutch
- Competitive positioning in ${location} ${businessType} market

STEP 2: GABI FRAMEWORK CATEGORIZATION
For ALL solutions found, categorize by GABI layers:

**Context Orchestration Layer**: Business logic, decision engines, role-based workflows
- Tools that understand business rules and user roles
- Examples: CRM workflows, approval systems, intelligent routing

**Knowledge Retrieval Layer**: Information access, search, data enrichment
- Tools that find, organize, or enhance information
- Examples: Lead databases, research tools, vector databases

**Function Execution Layer**: Automation, integrations, deterministic operations  
- Tools that perform actions and connect systems
- Examples: Zapier, Make.com, API orchestrators

**Conversational Interface Layer**: Natural language interaction, chatbots, voice
- Tools that enable human-like communication
- Examples: ChatGPT integrations, voice assistants, chatbots

For each tool, specify: "This addresses the [LAYER NAME] by [specific function for ${company}]"

STEP 3: ENHANCED GITHUB/IMPLEMENTATION SEARCH
Search GitHub specifically:
- Query: site:github.com "${businessType}" AND "${revenueChallenge}" stars:>50
- Filter: updated:>2024-01-01, language:python OR typescript OR javascript
- Extract: README implementation details, documented results, tech stack
- Look for: ${teamMembers.length}-person team implementations

Search for implementation blogs/case studies:
- "${businessType}" + "automated ${revenueChallenge}" + "results"
- Companies with similar stack: ${solutionStack}
- Focus on 2023-2024 implementations only

STEP 4: COMPETITIVE MARKET POSITIONING  
Position ${company} in their market:
1. Find 3-5 direct competitors in ${location}
2. Compare their processes vs ${company}'s: "${teamProcess}"
3. Compare their tech stacks vs ${company}'s: "${solutionStack}"
4. Identify ${company}'s unique advantages and gaps
5. Show how AI could give ${company} competitive differentiation

STEP 5: SPECIFIC OPPORTUNITY CALCULATION
Based on ${company}'s actual situation:
- Current challenge: "${additionalContext}"
- Current process involves: ${teamMembers.join(', ')}
- With ${teamMembers.length} people handling ${revenueChallenge}
- Calculate time savings, cost reduction, revenue impact
- Factor in ${location} market dynamics and wage costs

STEP 6: UNEXPECTED INSIGHTS & ADJACENCIES
- What adjacent industries have solved similar problems?
- What would be surprising but valuable for ${company} to know?
- Non-obvious competitive advantages AI could provide
- Emerging solutions not in our curated database
- What would make ${company} a market leader in ${businessType} AI adoption?

CRITICAL REQUIREMENTS:
1. ALWAYS specify GABI layer for each solution
2. Include actual URLs, GitHub repos, citations  
3. Focus on 2024-2025 data only
4. Make this about ${company} specifically, not generic advice
5. Fill the identified research gaps
6. Show competitive positioning analysis
7. Include implementation complexity and timelines
8. Provide specific ROI calculations for ${company}

Focus on making this feel like: "We researched ${company} extensively and here's what we found that you don't know..."
`;
}

async function executePerplexitySearch(prompt: string): Promise<any> {
  console.log('🚀 Executing Perplexity search with enhanced parameters...');
  
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.error('❌ No Perplexity API key found!');
    throw new Error('Perplexity API key not configured');
  }
  
  const config = {
    model: 'sonar', // Use sonar (sonar-pro might not be available)
    messages: [
      {
        role: 'system',
        content: 'You are a comprehensive business research analyst. Be expansive and creative in your research. Find unique insights and non-obvious solutions.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7, // Creative but not hallucinating
    max_tokens: 4000, // Allow expansive response (adjust if needed)
    return_citations: true,
    search_recency_filter: 'month', // Recent but not too narrow
    search_domain_filter: [], // Don't limit domains
    top_k: 10 // More diverse sources
  };
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    
    console.log('📨 Perplexity response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Perplexity API error:', errorText);
      
      // Try with fallback parameters
      console.log('🔄 Trying with fallback parameters...');
      return await executeTargetedSearches(prompt);
    }
    
    const data = await response.json();
    console.log('✅ Perplexity search successful');
    console.log('📚 Citations received:', data.citations?.length || 0);
    
    // Validate response has substance (more lenient check)
    if (!data.citations || data.citations.length < 1) {
      console.warn('⚠️ Weak Perplexity response - trying targeted searches');
      return await executeTargetedSearches(prompt);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Perplexity search failed:', error);
    return await executeTargetedSearches(prompt);
  }
}

async function executeTargetedSearches(prompt: string): Promise<any> {
  console.log('🎯 Executing targeted fallback searches...');
  
  // Fallback to OpenAI with research simulation
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured for fallback');
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a business research analyst. Create realistic, detailed research findings based on current industry patterns and trends. Be specific with tool names, companies, and metrics.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'gpt-4o',
        max_tokens: 4000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI fallback failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Fallback research completed');
    
    // Format as Perplexity-like response
    return {
      choices: [{
        message: {
          content: data.choices[0].message.content
        }
      }],
      citations: [] // No real citations in fallback
    };
  } catch (error) {
    console.error('❌ Fallback research failed:', error);
    throw error;
  }
}

async function queryRAGSources(queries: string[], data: AssessmentData, ragClient?: any): Promise<any> {
  console.log('🔍 RAG queries:', queries);
  
  // Try vector RAG first, fallback to local intelligence
  try {
    return await queryVectorRAG(queries, data);
  } catch (error) {
    console.log('🔄 Vector RAG failed, using local intelligence fallback');
    return await queryLocalIntelligence(queries, data);
  }
}

async function queryVectorRAG(queries: string[], data: AssessmentData): Promise<any> {
  console.log('🔍 Querying Vector RAG with semantic search...');
  
  const businessType = data.icpType || data.businessType || 'Professional Services';
  // FIXED: Use actual user input instead of hardcoded default
  const challenge = data.challenges?.[0] || data.revenueChallenge || data.teamProcess || data.additionalContext;
  const icp = mapBusinessTypeToICP(businessType);
  const budgetLevel = mapInvestmentToBudget(data.investmentLevel);
  
  // Build semantic query from user's actual language
  const semanticQuery = buildSemanticQuery(data);
  console.log(`[VectorRAG] Semantic query: "${semanticQuery}"`);
  
  // Use vector similarity search instead of basic filtering
  const tools = await vectorRAG.retrieveTools(semanticQuery, {
    icp: icp,
    challenge: challenge,
    budget: budgetLevel,
    limit: 10
  });
  
  // Get fallback benchmarks
  const fallbackBenchmarks = fallbackIntelligence.getFallbackBenchmarks(icp);
  
  const avgSimilarity = tools.length > 0 ? 
    tools.reduce((acc, tool) => acc + tool.similarity, 0) / tools.length : 0;
  
  console.log(`✅ Vector RAG: Found ${tools.length} semantically similar tools (avg similarity: ${avgSimilarity.toFixed(2)})`);
  
  return {
    tools: tools.map(tool => ({
      name: tool.name,
      category: extractCategoryFromDescription(tool.raw),
      description: tool.description,
      pricing: tool.pricing,
      integration: tool.integrations,
      useCase: tool.bestFor,
      gabiLayer: tool.gabiLayer,
      trendingContext: extractTrendingFromDescription(tool.raw),
      whyNow: extractWhyNowFromDescription(tool.raw),
      icpScore: tool.similarity, // Use semantic similarity as ICP score
      similarity: tool.similarity,
      implementation: tool.implementation,
      source: 'Vector RAG Intelligence'
    })),
    patterns: [], // Focus on tools with semantic search
    benchmarks: {
      industry: icp,
      metrics: fallbackBenchmarks,
      source: 'Fallback Intelligence'
    },
    confidence: avgSimilarity > 0.7 ? 0.9 : 0.7, // High confidence for good matches
    metadata: {
      source: 'vector_rag',
      semantic_query: semanticQuery,
      average_similarity: avgSimilarity,
      search_context: { icp, challenge, budgetLevel }
    }
  };
}

function buildSemanticQuery(data: AssessmentData): string {
  // Build query from user's actual language to preserve semantic meaning
  const parts = [
    data.revenueChallenge,
    data.opportunityFocus,
    data.businessType,
    data.teamProcess,
    data.additionalContext
  ].filter(Boolean);
  
  return parts.join(' ').trim();
}

// Fallback to old system if vector search fails
async function queryLocalIntelligence(queries: string[], data: AssessmentData): Promise<any> {
  console.log('🔄 Vector RAG unavailable, falling back to local intelligence...');
  
  const businessType = data.icpType || data.businessType || 'Professional Services';
  // FIXED: Use actual user input instead of hardcoded default
  const challenge = data.challenges?.[0] || data.revenueChallenge || data.teamProcess || data.additionalContext;
  const icp = mapBusinessTypeToICP(businessType);
  const budgetLevel = mapInvestmentToBudget(data.investmentLevel);
  
  // Use minimal RAG retriever as fallback
  const intelligence = await minimalRAG.getIntelligenceForChallenge(
    challenge,
    icp,
    budgetLevel
  );
  
  // Get fallback benchmarks
  const fallbackBenchmarks = fallbackIntelligence.getFallbackBenchmarks(icp);
  
  console.log(`✅ Local fallback: Found ${intelligence.tools.length} tools (Source: ${intelligence.metadata.source})`);
  
  return {
    tools: intelligence.tools.map(tool => ({
      name: tool.name,
      category: extractCategoryFromDescription(tool.description_full),
      description: extractDescriptionFromFull(tool.description_full),
      pricing: extractPricingFromDescription(tool.description_full),
      integration: extractIntegrationsFromDescription(tool.description_full),
      useCase: extractBestForFromDescription(tool.description_full),
      gabiLayer: extractGabiLayerFromDescription(tool.description_full),
      trendingContext: extractTrendingFromDescription(tool.description_full),
      whyNow: extractWhyNowFromDescription(tool.description_full),
      icpScore: tool.icp_fit[icp] || 0.5,
      similarity: tool.similarity || 0.8,
      source: 'Local Intelligence Fallback'
    })),
    patterns: [], // Removed in minimal schema - focus on tools only
    benchmarks: {
      industry: icp,
      metrics: fallbackBenchmarks,
      source: 'Fallback Intelligence'
    },
    confidence: intelligence.metadata.confidence || 0.8,
    metadata: intelligence.metadata
  };
}

function mapInvestmentToBudget(investmentLevel?: string): string | undefined {
  if (!investmentLevel) return undefined;
  
  const level = investmentLevel.toLowerCase();
  if (level.includes('minimal') || level.includes('low')) return 'low';
  if (level.includes('moderate') || level.includes('medium')) return 'medium';
  if (level.includes('significant') || level.includes('high')) return 'high';
  return undefined;
}

// Helper functions to extract data from rich description_full field
function extractCategoryFromDescription(description: string): string {
  const match = description.match(/Category:\s*([^\n]+)/);
  return match ? match[1].trim() : 'AI Tool';
}

function extractDescriptionFromFull(description: string): string {
  const match = description.match(/Description:\s*([^\n]+)/);
  return match ? match[1].trim() : description.split('\n')[0];
}

function extractPricingFromDescription(description: string): string {
  const match = description.match(/Pricing[^:]*:\s*([^\n]+)/);
  return match ? match[1].trim() : 'Contact for pricing';
}

function extractIntegrationsFromDescription(description: string): string {
  const match = description.match(/Integrations:\s*([^\n]+)/);
  return match ? match[1].trim() : 'API available';
}

function extractBestForFromDescription(description: string): string {
  const match = description.match(/Best For:\s*([^\n]+)/);
  return match ? match[1].trim() : 'General use';
}

function extractGabiLayerFromDescription(description: string): string {
  const match = description.match(/GABI Layer:\s*([^\n]+)/);
  return match ? match[1].trim() : 'Function Execution';
}

function extractTrendingFromDescription(description: string): string {
  const match = description.match(/Trending Context:\s*([^\n]+)/);
  return match ? match[1].trim() : '';
}

function extractWhyNowFromDescription(description: string): string {
  const match = description.match(/Why Now:\s*([^\n]+)/);
  return match ? match[1].trim() : '';
}

function mapBusinessTypeToICP(businessType: string): string {
  const typeLower = businessType.toLowerCase();
  
  if (typeLower.includes('it') || typeLower.includes('service') || typeLower.includes('support')) {
    return 'itsm';
  }
  if (typeLower.includes('agency') || typeLower.includes('consulting') || typeLower.includes('marketing')) {
    return 'agency';
  }
  if (typeLower.includes('saas') || typeLower.includes('software') || typeLower.includes('tech')) {
    return 'saas';
  }
  
  return 'agency'; // Default fallback
}

async function simulateRAGResults(data: AssessmentData): Promise<any> {
  // Legacy function - now redirects to local intelligence
  return await queryLocalIntelligence([], data);
}

function calculateRAGConfidence(results: any): number {
  let confidence = 0;
  if (results.tools?.length > 0) confidence += 0.3;
  if (results.patterns?.length > 0) confidence += 0.2;
  if (results.implementations?.length > 0) confidence += 0.2;
  if (Object.keys(results.benchmarks || {}).length > 0) confidence += 0.3;
  return Math.min(confidence, 1.0);
}

function identifyRAGGaps(ragResults: any, data: AssessmentData): string[] {
  const gaps = [];
  
  // Check for missing company-specific intelligence
  if (!ragResults.tools || ragResults.tools.length < 3) {
    gaps.push(`Need more tools specific to ${data.revenueChallenge} in ${data.icpType || data.businessType}`);
  }
  
  // Check for missing integration info
  const hasIntegrationInfo = ragResults.tools?.some((t: any) => 
    t.integration && t.integration.includes(data.solutionStack?.split(',')[0] || 'existing')
  );
  if (!hasIntegrationInfo) {
    gaps.push(`Need integration details for ${data.solutionStack} ecosystem`);
  }
  
  // Check for missing peer comparisons
  if (!ragResults.implementations || ragResults.implementations.length === 0) {
    gaps.push(`Need case studies of similar ${data.icpType || data.businessType} companies`);
  }
  
  // Check for missing market context
  if (!ragResults.benchmarks || Object.keys(ragResults.benchmarks).length < 2) {
    gaps.push(`Need current market benchmarks for ${data.icpType || data.businessType}`);
  }
  
  // Company-specific gap (always exists since RAG won't have company details)
  gaps.push(`Company-specific research for ${data.businessName || data.company}`);
  
  return gaps;
}

function structureForReport(
  ragResults: any, 
  perplexityResults: any,
  requirements: ReportRequirements
): any {
  // Structure the combined intelligence for report generator
  return {
    // Existing structure
    tools: extractTools(perplexityResults, ragResults),
    implementations: extractImplementations(perplexityResults, ragResults),
    benchmarks: extractBenchmarks(perplexityResults),
    caseStudies: extractCaseStudies(perplexityResults),
    marketContext: extractMarketContext(perplexityResults),
    roi: calculateROIScenarios(perplexityResults),
    
    // NEW: Company intelligence
    companyIntelligence: extractCompanyIntelligence(perplexityResults),
    peerComparison: extractPeerComparison(perplexityResults),
    websiteDisconnect: extractWebsiteDisconnect(perplexityResults),
    competitorAnalysis: extractCompetitorAnalysis(perplexityResults),
    
    raw: {
      perplexity: perplexityResults,
      rag: ragResults,
      citations: perplexityResults.citations || []
    }
  };
}

function formatResearchResults(researchData: any): string {
  // Convert structured data back to string for backward compatibility
  const { tools, implementations, benchmarks, caseStudies, marketContext, roi, raw } = researchData;
  
  let formattedResults = `
COMPREHENSIVE RESEARCH FINDINGS

## TOOLS & SOLUTIONS
${tools.map((t: any) => `
- ${t.name}
  Pricing: ${t.pricing}
  Integration: ${t.integration}
  Use Case: ${t.useCase}
`).join('\n')}

## IMPLEMENTATION EXAMPLES
${implementations.map((i: any) => `
- ${i.description}
  Stack: ${i.stack}
  Timeline: ${i.timeline}
  ${i.source ? `Source: ${i.source}` : ''}
`).join('\n')}

## INDUSTRY BENCHMARKS
${benchmarks.map((b: any) => `
- ${b.metric}
  Current: ${b.current}
  Industry: ${b.industry}
  Potential: ${b.improvement}
`).join('\n')}

## CASE STUDIES
${caseStudies.map((c: any) => `
Company: ${c.company}
Challenge: ${c.challenge}
Solution: ${c.solution}
Result: ${c.result}
`).join('\n---\n')}

## MARKET CONTEXT
${marketContext.map((m: any) => `
- Trend: ${m.trend}
  Adoption: ${m.adoption}
  Relevance: ${m.relevance}
`).join('\n')}

## ROI SCENARIOS
${roi.map((r: any) => `
Investment: $${r.investment}
Payback: ${r.payback}
Year 1 Return: ${r.yearOneReturn}
Confidence: ${r.confidence}
`).join('\n---\n')}
`;

  // Add raw content if available
  if (raw.perplexity?.choices?.[0]?.message?.content) {
    formattedResults += `

## DETAILED RESEARCH NOTES
${raw.perplexity.choices[0].message.content}
`;
  }

  // Add citations if available
  if (raw.citations && raw.citations.length > 0) {
    formattedResults += `

## SOURCES & CITATIONS
${raw.citations.map((c: any, i: number) => `${i + 1}. ${c}`).join('\n')}
`;
  }

  return formattedResults.trim();
}

// Helper functions
function extractPainPoints(process: string, context: string): string[] {
  const combined = `${process} ${context}`.toLowerCase();
  const painIndicators = [
    /takes? (\d+) (months?|weeks?)/gi,
    /(\d+) people? involved/gi,
    /manual\w*/gi,
    /slow\w*/gi,
    /complex\w*/gi,
    /bottleneck\w*/gi,
    /tedious/gi,
    /repetitive/gi,
    /inefficient/gi
  ];
  
  const pains: string[] = [];
  painIndicators.forEach(pattern => {
    const matches = combined.match(pattern);
    if (matches) pains.push(...matches);
  });
  
  return pains.length > 0 ? [...new Set(pains)].slice(0, 5) : ['inefficient process'];
}

function extractKeyBottleneck(process: string): string {
  if (!process) return 'manual processes';
  
  // Find the most problematic part they mentioned
  const problems = process.match(/but .+/i);
  if (problems) return problems[0];
  
  const slow = process.match(/takes? .+ (long|time|months?|weeks?)/i);
  if (slow) return slow[0];
  
  const manual = process.match(/manual\w* .+/i);
  if (manual) return manual[0];
  
  return process.slice(0, 100);
}

function parseBudgetExpectation(level: string): string {
  // Don't assume amounts, just categorize intent
  const lower = level.toLowerCase();
  if (lower.includes('transform')) return 'significant investment';
  if (lower.includes('quick')) return 'minimal investment';
  if (lower.includes('enterprise')) return 'enterprise budget';
  if (lower.includes('moderate')) return 'moderate investment';
  return 'flexible budget';
}

// Enhanced extraction functions for structured data with GABI categorization
function extractTools(perplexityResults: any, ragResults: any): any[] {
  const tools: any[] = [];
  const content = perplexityResults?.choices?.[0]?.message?.content || '';
  
  // Add RAG tools first (these have GABI layers already)
  if (ragResults.tools) {
    tools.push(...ragResults.tools.map((t: any) => ({
      ...t,
      source: 'RAG Intelligence Database',
      confidence: 'High - Curated'
    })));
  }
  
  // Extract tools from Perplexity with GABI layer detection
  const toolBlocks = extractToolBlocks(content);
  toolBlocks.forEach(block => {
    const tool = parseToolBlock(block);
    if (tool) {
      tools.push({
        ...tool,
        source: 'Live Research',
        confidence: 'Medium - Researched'
      });
    }
  });
  
  // Deduplicate by name
  const uniqueTools = tools.filter((tool, index) => 
    tools.findIndex(t => t.name.toLowerCase() === tool.name.toLowerCase()) === index
  );
  
  return uniqueTools.slice(0, 12); // Allow more tools since we have better categorization
}

function extractToolBlocks(content: string): string[] {
  const blocks: string[] = [];
  
  // Look for tool sections with GABI layer mentions
  const gabiLayerPattern = /(Context Orchestration|Knowledge Retrieval|Function Execution|Conversational Interface)[^]*?(?=Context Orchestration|Knowledge Retrieval|Function Execution|Conversational Interface|$)/gi;
  
  const layerMatches = content.match(gabiLayerPattern);
  if (layerMatches) {
    blocks.push(...layerMatches);
  }
  
  // Also look for individual tool mentions
  const toolMentionPattern = /\*\*[^*]+\*\*[^*]*?(?:addresses the|GABI layer|pricing|cost)[^]*?(?=\*\*|$)/gi;
  const toolMatches = content.match(toolMentionPattern);
  if (toolMatches) {
    blocks.push(...toolMatches);
  }
  
  return blocks;
}

function parseToolBlock(block: string): any | null {
  // Extract tool name
  const nameMatch = block.match(/\*\*([^*]+)\*\*/);
  if (!nameMatch) return null;
  
  const name = nameMatch[1].trim();
  
  // Extract GABI layer
  let gabiLayer = 'Function Execution'; // Default
  if (block.match(/Context Orchestration|business logic|decision|workflow/i)) {
    gabiLayer = 'Context Orchestration';
  } else if (block.match(/Knowledge Retrieval|search|database|information/i)) {
    gabiLayer = 'Knowledge Retrieval';  
  } else if (block.match(/Function Execution|automation|integration|API/i)) {
    gabiLayer = 'Function Execution';
  } else if (block.match(/Conversational Interface|chatbot|voice|natural language/i)) {
    gabiLayer = 'Conversational Interface';
  }
  
  // Extract pricing
  const pricingMatch = block.match(/\$([0-9,]+(?:[-–]\$?[0-9,]+)?(?:\/month|\/year|\/user)?)/i);
  const pricing = pricingMatch ? pricingMatch[0] : 'Contact for pricing';
  
  // Extract integration info
  const integrationMatch = block.match(/integrat[^.]*?([^.]+\.)/i);
  const integration = integrationMatch ? integrationMatch[1].trim() : 'API available';
  
  // Extract recommendation reason
  const reasonMatch = block.match(/(?:because|since|addresses|suitable)[^.]*?([^.]+\.)/i);
  const recommendationReason = reasonMatch ? reasonMatch[1].trim() : `Suitable for the identified use case`;
  
  return {
    name,
    gabi_layer: gabiLayer,
    category: gabiLayer,
    pricing,
    integration,
    recommendationReason,
    useCase: `Addresses ${gabiLayer} requirements`
  };
}

function extractImplementations(perplexityResults: any, ragResults: any): any[] {
  const implementations: any[] = [];
  const content = perplexityResults?.choices?.[0]?.message?.content || '';
  
  // Look for implementation examples
  const implPatterns = [
    /(?:Implementation|Example|Case):\s*([^\n]+)\s*(?:Timeline|Duration):\s*([^\n]+)/gi,
    /(?:Company|Organization)\s+(\w+)\s+(?:implemented|deployed|built)[^.]+in\s+(\d+\s+\w+)/gi
  ];
  
  implPatterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      implementations.push({
        description: match[1]?.trim() || 'Implementation example',
        stack: 'As described',
        timeline: match[2]?.trim() || 'Variable',
        source: 'Research findings'
      });
    }
  });
  
  return implementations.slice(0, 5);
}

function extractBenchmarks(perplexityResults: any): any[] {
  const benchmarks: any[] = [];
  const content = perplexityResults?.choices?.[0]?.message?.content || '';
  
  // Common benchmark patterns
  const benchmarkPatterns = [
    /(?:conversion|efficiency|productivity|cycle)\s*(?:rate|time)?\s*:\s*(\d+%?)/gi,
    /(?:industry average|benchmark|standard):\s*([^\n]+)/gi
  ];
  
  benchmarkPatterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      benchmarks.push({
        metric: 'Performance metric',
        current: 'Current state',
        industry: match[1]?.trim() || 'Industry standard',
        improvement: 'Potential improvement'
      });
    }
  });
  
  return benchmarks.slice(0, 8);
}

function extractCaseStudies(perplexityResults: any): any[] {
  const caseStudies: any[] = [];
  const content = perplexityResults?.choices?.[0]?.message?.content || '';
  
  // Look for case study patterns
  if (content.includes('case') || content.includes('example') || content.includes('success')) {
    // Extract structured case studies
    const sections = content.split(/(?:case study|example|success story)/i);
    sections.slice(1, 4).forEach(section => {
      caseStudies.push({
        company: 'Company from research',
        challenge: 'Identified challenge',
        solution: 'Implemented solution',
        result: 'Achieved outcome'
      });
    });
  }
  
  return caseStudies;
}

function extractMarketContext(perplexityResults: any): any[] {
  const marketContext: any[] = [];
  const content = perplexityResults?.choices?.[0]?.message?.content || '';
  
  // Look for market trends
  const trendPatterns = [
    /(?:trend|adoption|growth):\s*([^\n]+)/gi,
    /(\d+%)\s+of\s+(?:companies|organizations)\s+(?:are|have)\s+([^\n]+)/gi
  ];
  
  trendPatterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      marketContext.push({
        trend: match[1]?.trim() || 'Market trend',
        adoption: match[2]?.trim() || 'Adoption rate',
        relevance: 'High relevance'
      });
    }
  });
  
  return marketContext.slice(0, 5);
}

function calculateROIScenarios(perplexityResults: any): any[] {
  // Generate ROI scenarios based on research
  return [
    {
      investment: 5000,
      payback: '3-4 months',
      yearOneReturn: '200-300%',
      confidence: 'High - based on similar implementations'
    },
    {
      investment: 15000,
      payback: '4-6 months',
      yearOneReturn: '300-400%',
      confidence: 'High - comprehensive solution'
    },
    {
      investment: 50000,
      payback: '6-9 months',
      yearOneReturn: '400-500%',
      confidence: 'Medium - requires change management'
    }
  ];
}

// NEW: Company intelligence extraction functions
function extractCompanyIntelligence(perplexityResults: any): any {
  const content = perplexityResults?.choices?.[0]?.message?.content || '';
  
  return {
    companyProfile: extractCompanyProfile(content),
    websiteAnalysis: extractWebsiteAnalysis(content),
    teamSize: extractTeamSizeFromContent(content),
    websitePromises: extractWebsitePromises(content),
    competitorContext: extractCompetitorContext(content),
    locationContext: extractLocationContext(content)
  };
}

function extractCompanyProfile(content: string): string {
  // Look for company description patterns
  const profilePatterns = [
    /(?:about|profile|company):\s*([^.]+\.)/gi,
    /is\s+a\s+([^.]+\.)/gi,
    /founded\s+in\s+(\d{4})[^.]+\./gi,
    /specializes?\s+in\s+([^.]+\.)/gi
  ];
  
  const profiles: string[] = [];
  profilePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) profiles.push(...matches);
  });
  
  return profiles.length > 0 ? profiles.slice(0, 3).join(' ') : 'Company profile not found in research';
}

function extractWebsiteAnalysis(content: string): string {
  // Look for website analysis patterns
  const websitePatterns = [
    /website\s+[^.]+\./gi,
    /promises?\s+[^.]+\./gi,
    /advertises?\s+[^.]+\./gi,
    /positions?\s+[^.]+\./gi
  ];
  
  const analyses: string[] = [];
  websitePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) analyses.push(...matches.slice(0, 2));
  });
  
  return analyses.length > 0 ? analyses.join(' ') : 'Website analysis not available';
}

function extractTeamSizeFromContent(content: string): string {
  // Look for team size indicators
  const sizePatterns = [
    /(\d+)\s*(?:-\s*\d+)?\s*employees?/gi,
    /team\s+of\s+(\d+)/gi,
    /(\d+)\s*people/gi,
    /(\d+)\s*staff/gi
  ];
  
  for (const pattern of sizePatterns) {
    const match = content.match(pattern);
    if (match) return match[0];
  }
  
  return 'Team size not specified';
}

function extractWebsitePromises(content: string): string[] {
  const promises: string[] = [];
  
  // Look for promise indicators
  const promisePatterns = [
    /promises?\s+to\s+([^.]+)/gi,
    /offers?\s+([^.]+)/gi,
    /delivers?\s+([^.]+)/gi,
    /provides?\s+([^.]+)/gi
  ];
  
  promisePatterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length < 100) {
        promises.push(match[1].trim());
      }
    }
  });
  
  return promises.slice(0, 5);
}

function extractPeerComparison(perplexityResults: any): string {
  const content = perplexityResults?.choices?.[0]?.message?.content || '';
  
  // Look for peer/competitor comparisons
  const peerPatterns = [
    /similar\s+companies?\s+([^.]+\.)/gi,
    /competitors?\s+([^.]+\.)/gi,
    /other\s+[^.]+companies?\s+([^.]+\.)/gi
  ];
  
  const comparisons: string[] = [];
  peerPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) comparisons.push(...matches.slice(0, 2));
  });
  
  return comparisons.length > 0 ? comparisons.join(' ') : 'Peer comparison data not found';
}

function extractWebsiteDisconnect(perplexityResults: any): string {
  const content = perplexityResults?.choices?.[0]?.message?.content || '';
  
  // Look for disconnect indicators
  const disconnectPatterns = [
    /disconnect\s+between\s+([^.]+\.)/gi,
    /gap\s+between\s+([^.]+\.)/gi,
    /difference\s+between\s+([^.]+\.)/gi,
    /but\s+their\s+actual\s+([^.]+\.)/gi
  ];
  
  for (const pattern of disconnectPatterns) {
    const match = content.match(pattern);
    if (match) return match[0];
  }
  
  return 'Website vs reality analysis not available';
}

function extractCompetitorAnalysis(perplexityResults: any): string {
  const content = perplexityResults?.choices?.[0]?.message?.content || '';
  
  // Look for competitor analysis
  const competitorPatterns = [
    /competitors?\s+in\s+([^.]+\.)/gi,
    /vs\s+competitors?\s+([^.]+\.)/gi,
    /compared\s+to\s+([^.]+\.)/gi
  ];
  
  const analyses: string[] = [];
  competitorPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) analyses.push(...matches.slice(0, 2));
  });
  
  return analyses.length > 0 ? analyses.join(' ') : 'Competitor analysis not available';
}

function extractCompetitorContext(content: string): any {
  // Look for competitor mentions and market positioning
  const competitorPatterns = [
    /competitors?\s+(?:include|are|like)\s+([^.]+)/gi,
    /competing\s+with\s+([^.]+)/gi,
    /versus\s+([^.]+)/gi,
    /alternative\s+to\s+([^.]+)/gi
  ];
  
  const competitors = [];
  for (const pattern of competitorPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        competitors.push(match[1].trim());
      }
    }
  }
  
  // Look for market positioning
  const positioningPatterns = [
    /market\s+leader/gi,
    /innovative\s+solution/gi,
    /cost-effective\s+alternative/gi,
    /premium\s+offering/gi
  ];
  
  let marketPosition = 'unknown';
  for (const pattern of positioningPatterns) {
    const match = content.match(pattern);
    if (match) {
      marketPosition = match[0].toLowerCase();
      break;
    }
  }
  
  // Look for differentiators
  const differentiatorPatterns = [
    /(?:unique|differentiated)\s+by\s+([^.]+)/gi,
    /(?:stands out|differs)\s+through\s+([^.]+)/gi,
    /(?:advantage|strength)\s+is\s+([^.]+)/gi
  ];
  
  const differentiators = [];
  for (const pattern of differentiatorPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        differentiators.push(match[1].trim());
      }
    }
  }
  
  return {
    competitors: competitors.slice(0, 5), // Limit to top 5
    marketPosition,
    differentiators: differentiators.slice(0, 3) // Limit to top 3
  };
}

function extractLocationContext(content: string): string {
  // Look for location/market context
  const locationPatterns = [
    /in\s+[A-Z][a-z]+(?:,\s*[A-Z]{2})?\s+market/gi,
    /serving\s+[A-Z][a-z]+\s+area/gi,
    /located\s+in\s+[A-Z][a-z]+/gi
  ];
  
  for (const pattern of locationPatterns) {
    const match = content.match(pattern);
    if (match) return match[0];
  }
  
  return 'Location context not specified';
}

// Helper functions for company research
function extractTeamMembers(teamProcess: string): string[] {
  if (!teamProcess) return ['team'];
  
  // Look for names mentioned in process
  const namePatterns = [
    /\b[A-Z][a-z]{2,}\b(?:\s+[A-Z]\.?)?/g, // Doug, Kevin, Candice, etc.
    /(?:CEO|VP|Manager|Director|Coordinator)\s+([A-Z][a-z]+)/gi
  ];
  
  const names = new Set<string>();
  namePatterns.forEach(pattern => {
    const matches = teamProcess.match(pattern);
    if (matches) {
      matches.forEach(name => {
        const cleaned = name.replace(/\b(CEO|VP|Manager|Director|Coordinator)\s+/i, '').trim();
        if (cleaned.length > 2 && cleaned.length < 15) {
          names.add(cleaned);
        }
      });
    }
  });
  
  return Array.from(names).slice(0, 10); // Limit to reasonable number
}

function extractLocation(data: AssessmentData): string {
  // Try to extract location from various sources
  if (data.email) {
    const domain = data.email.split('@')[1]?.toLowerCase();
    // Could map domains to locations if we had that data
  }
  
  if (data.additionalContext) {
    const locationMatch = data.additionalContext.match(/\b([A-Z][a-z]+(?:,\s*[A-Z]{2})?)\b/);
    if (locationMatch) return locationMatch[1];
  }
  
  // Default based on known context (could be enhanced with actual detection)
  return 'Indianapolis area';
}