// Simplified Research Engine - No RAG, No Pre-enrichment
// Passes 100% of user input to Perplexity with full context

import { AssessmentData } from './input-compiler';
import { buildSimplifiedResearchContext, buildSimplifiedPrompt } from './simplified-research-prompt';

export async function executeSimplifiedResearch(
  assessmentData: AssessmentData
): Promise<string> {
  console.log('🌐 Simplified Research Engine: Starting research with full user context');
  
  try {
    // Step 1: Build full context from user input (no enrichment)
    const context = buildSimplifiedResearchContext(assessmentData);
    console.log(`📋 Full context prepared for: ${context.company}`);
    console.log(`👥 Team: ${context.teamMembers.join(', ')} (${context.teamSize} people)`);
    console.log(`🎯 Challenge: ${context.challenges}`);
    console.log(`💰 Investment: ${context.investmentLevel}`);
    
    // Step 2: Build single comprehensive prompt
    const prompt = buildSimplifiedPrompt(context);
    console.log(`📝 Research prompt built, length: ${prompt.length} chars`);
    
    // Step 3: Execute Perplexity search with full context
    const perplexityResults = await executePerplexitySearch(prompt);
    
    // Step 4: Return raw results (no processing/enrichment)
    return formatRawResults(perplexityResults, context);
    
  } catch (error: any) {
    console.error('❌ Simplified research failed:', error);
    throw new Error(`Research failed: ${error.message}`);
  }
}

async function executePerplexitySearch(prompt: string): Promise<any> {
  console.log('🚀 Executing Perplexity search...');
  
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.error('❌ No Perplexity API key found!');
    throw new Error('Perplexity API key not configured');
  }
  
  const config = {
    model: 'sonar',
    messages: [
      {
        role: 'system',
        content: 'You are a comprehensive business research analyst specializing in AI transformation for B2B service providers. Research thoroughly and provide specific, actionable insights with real examples and concrete recommendations.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.2, // Lower temperature for more factual research
    max_tokens: 4000,
    return_citations: true,
    search_recency_filter: 'month',
    search_domain_filter: [],
    top_k: 15 // More diverse sources for comprehensive research
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
      throw new Error(`Perplexity API failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Perplexity search successful');
    console.log('📚 Citations received:', data.citations?.length || 0);
    
    return data;
    
  } catch (error) {
    console.error('❌ Perplexity search failed:', error);
    throw error;
  }
}

function formatRawResults(perplexityResults: any, context: any): string {
  const content = perplexityResults?.choices?.[0]?.message?.content || '';
  const citations = perplexityResults?.citations || [];
  
  // Format results with context metadata for transparency
  let formattedResults = `# Comprehensive Research Report for ${context.company}

## Research Context
- Company: ${context.company}
- Business Type: ${context.businessType} → ${context.opportunityFocus}
- Challenge: ${context.challenges}
- Team Size: ${context.teamSize} people (${context.teamMembers.join(', ')})
- Investment Level: ${context.investmentLevel}
- Tech Stack: ${context.techStack}

---

## Research Findings

${content}

---

## Sources & Citations
${citations.length > 0 ? 
  citations.map((citation: string, index: number) => `${index + 1}. ${citation}`).join('\n') :
  'No citations available'
}

---

## Research Metadata
- Generated: ${new Date().toISOString()}
- Model: Perplexity Sonar
- Context Length: ${JSON.stringify(context).length} chars
- Response Length: ${content.length} chars
- Citations: ${citations.length}
`;

  return formattedResults;
}

// GPT Enhancement Phase - EVAL, Format, and Add GABI positioning
export async function enhanceWithGPT(
  perplexityResults: string,
  context: any
): Promise<string> {
  console.log('🔄 GPT Enhancement: EVAL, Format, and GABI positioning...');
  
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ No OpenAI API key - returning raw Perplexity results');
    return perplexityResults;
  }
  
  const enhancementPrompt = `You are a report evaluator and GABI positioning specialist.

TASK:
1. EVALUATE if Perplexity research is complete
2. FORMAT properly as markdown
3. ADD GABI competitive advantage using the GABI Framework

PERPLEXITY RESEARCH TO EVALUATE:
${perplexityResults}

EVALUATION:
Check if all 7 sections are present and substantive. If any are missing or weak, mark as [NEEDS ENRICHMENT] and add brief content.

THEN ADD THIS EXACT GABI FRAMEWORK SECTION:

---

## 8. COMPETITIVE ADVANTAGE - The GABI Framework

**Market Differentiation Through GABI's AI Architecture:**

While competitors struggle with [extract specific struggles from research above], ${context.company} will leverage GABI's complete AI stack:

**The GABI Framework Layers:**

- **Conversational Interface**: Natural interaction for ${context.teamMembers.join(', ')} to [extract core function from research]
- **Context Orchestration**: Business logic that understands ${context.opportunityFocus} nuances
- **Knowledge Retrieval**: Instant access to ${context.businessType} best practices and patterns  
- **Function Execution**: Automated workflows connecting ${context.techStack} seamlessly

This comprehensive approach ensures:
- Adoption happens naturally (conversational, not another dashboard)
- Intelligence compounds over time (learns from every interaction)
- Workflows adapt to your process (not forcing you into theirs)
- Integration feels native (works with ${context.techStack}, not around it)

**Strategic Positioning:**
- Competitors using point solutions: Fragmented experience
- Competitors building custom: 6-month timeline, technical debt
- Your approach: GABI's comprehensive AI layer operational in 30 days

**Customer Impact:**
- Before: [Extract current state from research]
- After: [Extract enhanced state with GABI]
- Differentiator: "We've automated ${context.challenges} completely"

## 9. NEXT STEPS WITH JOEL

**Discovery Session Agenda:**
- Validate ${context.specificMetric || 'key metrics'} baseline and targets
- Map ${context.processDescription ? 'your process' : 'detailed workflows'} in detail
- Review ${context.techStack} integration points
- Define success metrics for ${context.teamMembers.length > 0 ? 'your team' : 'implementation'}

**Proof of Concept Scope:**
- Focus area: [Highest impact part from research]
- Success criteria: [Specific measurable outcome]
- Timeline: 30 days to working prototype

Contact Joel at joel@commitimpact.com to begin your transformation.

---

IMPORTANT: Return the COMPLETE Perplexity research first, then add the GABI sections above at the end.`;

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
            content: 'You are GABI\'s positioning specialist. Enhance research reports with GABI-specific competitive advantages and strategic positioning.'
          },
          {
            role: 'user',
            content: enhancementPrompt
          }
        ],
        model: 'gpt-4o',
        max_tokens: 6000,
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      console.warn('⚠️ GPT enhancement failed, returning original research');
      return perplexityResults;
    }
    
    const data = await response.json();
    const enhancedContent = data.choices[0].message.content;
    
    console.log('✅ GPT enhancement completed');
    return enhancedContent;
    
  } catch (error) {
    console.warn('⚠️ GPT enhancement failed:', error);
    return perplexityResults;
  }
}

// Main export function that replaces the complex research engine
export async function executeFullResearch(assessmentData: AssessmentData): Promise<string> {
  // Phase 1: Perplexity research with full context
  const perplexityResults = await executeSimplifiedResearch(assessmentData);
  
  // Phase 2: GPT enhancement for GABI positioning
  const context = buildSimplifiedResearchContext(assessmentData);
  const enhancedResults = await enhanceWithGPT(perplexityResults, context);
  
  return enhancedResults;
}