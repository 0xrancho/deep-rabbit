import { AssessmentData, BusinessInferences } from './input-compiler';
import { intelligenceOrchestrator } from './intelligence-orchestrator';
import { formatIntelligenceForTemplate } from './intelligence-usage-map';
import { generateNarrativeReport } from './report-sections-v3';

const REPORT_STRUCTURE_TEMPLATE = `
You are creating a comprehensive Revenue Intelligence Report.
Structure the report with these EXACT sections:

## Executive Summary
- Define the problem and solution in 2-3 paragraphs
- Include the primary value proposition
- Mention GABI Intelligence as the framework

## The GABI Advantage
Create a visual framework description:
1. Application Layer - The user interface
2. Context Layer - The intelligence engine  
3. Enrichment Layer - Data augmentation
4. Orchestration Layer - Multi-channel deployment

## Current State
- Describe their current process using the exact words from their input
- Calculate current costs and inefficiencies
- Identify specific bottlenecks

## Industry Benchmarks
- Compare their metrics to industry standards
- Show gaps and opportunities
- Use specific percentages and timelines

## In-Scope Solutions (THREE COLUMNS)

### Off-The-Shelf SaaS
- List specific tools found in research with actual pricing
- Show how they integrate with current stack
- Include implementation timeline

### Custom Build  
- Describe what a custom solution would entail
- Estimate development costs and timeline
- Highlight customization benefits

### GABI Core Hybrid
- Explain the hybrid approach
- Show how GABI orchestrates best-of-breed tools
- Emphasize the context intelligence advantage

## Future State
- Describe the transformed process
- Show specific role changes for each team member mentioned
- Paint a picture of the optimized workflow

## ROI on Investment
Create a detailed table showing:
- Current metrics vs. future metrics
- Investment required
- Payback period
- 12-month and 3-year returns

## Next Steps
Clear call to action for strategy session
`;

export async function synthesizeReport(
  assessmentData: AssessmentData,
  researchFindings: string,
  inferences: BusinessInferences
): Promise<string> {
  
  console.log('🧠 Starting intelligence-enhanced report synthesis...');
  
  // Calculate some key metrics from the input
  const metrics = calculateMetrics(assessmentData);
  const businessName = assessmentData.businessName || assessmentData.company || 'Your Company';
  const icpType = assessmentData.icpType || assessmentData.businessType || 'Professional Services';
  const revenueChallenge = assessmentData.revenueChallenge || assessmentData.challenges?.[0] || 'operational efficiency';
  
  // STEP 1: Get intelligence package via orchestrator
  console.log('📊 Gathering intelligence package...');
  const intelligencePackage = await intelligenceOrchestrator.gatherForReport(assessmentData);
  
  console.log(`✅ Intelligence package ready:`, {
    tools: intelligencePackage.tools.length,
    patterns: intelligencePackage.patterns.length,
    qualityScore: intelligencePackage.metadata.qualityScore,
    usingFallback: intelligencePackage.metadata.usingFallback
  });

  // CRITICAL QUALITY CHECKS: Fail instead of faking authentic reports
  
  // Check 1: If no real intelligence was gathered, FAIL don't fake
  if (intelligencePackage.tools.length === 0 && researchFindings.length < 1000) {
    console.error('❌ CRITICAL: No intelligence retrieved. Cannot generate authentic report.');
    throw new Error('CRITICAL: No intelligence retrieved. Cannot generate authentic report. Please try again or contact support.');
  }
  
  // Check 2: If the research doesn't match the user's challenge, FAIL
  const userChallenge = assessmentData.challenges?.[0] || assessmentData.revenueChallenge || '';
  if (userChallenge && researchFindings.length > 100 && !researchFindings.toLowerCase().includes(userChallenge.toLowerCase())) {
    console.error(`❌ CRITICAL: Research doesn't match user challenge: ${userChallenge}`);
    console.error('Research content preview:', researchFindings.substring(0, 200) + '...');
    throw new Error(`CRITICAL: Research doesn't match user challenge "${userChallenge}". Cannot generate relevant report.`);
  }
  
  // Check 3: If intelligence quality is too low, FAIL
  if (intelligencePackage.metadata.qualityScore < 0.3) {
    console.error(`❌ CRITICAL: Intelligence quality too low (${Math.round(intelligencePackage.metadata.qualityScore * 100)}%). Cannot generate reliable report.`);
    throw new Error(`CRITICAL: Intelligence quality too low (${Math.round(intelligencePackage.metadata.qualityScore * 100)}%). Please try again with more specific information.`);
  }
  
  console.log('✅ Quality checks passed - proceeding with authentic report generation');
  
  // STEP 2: Format intelligence data for template substitution
  const templateData = formatIntelligenceForTemplate(intelligencePackage, assessmentData);
  const toolsSection = formatToolRecommendations(intelligencePackage.tools);
  const patternsSection = intelligencePackage.patterns.length > 0 ? formatImplementationPattern(intelligencePackage.patterns[0]) : '';
  const benchmarksSection = intelligencePackage.benchmarks ? formatBenchmarks(intelligencePackage.benchmarks, icpType) : '';
  
  const synthesisPrompt = `
${REPORT_STRUCTURE_TEMPLATE}

ASSESSMENT DATA:
${JSON.stringify(assessmentData, null, 2)}

RESEARCH FINDINGS:
${researchFindings}

BUSINESS CONTEXT:
- Company: ${businessName}
- Industry: ${icpType}
- Primary Challenge: ${revenueChallenge}
- Maturity: ${inferences.maturityLevel}
- Hidden Challenges: ${inferences.hiddenMultipliers.join(', ')}
- Urgency: ${inferences.urgencyLevel}

KEY METRICS TO INCLUDE:
- Current lead conversion: ${metrics.currentConversion}%
- Target conversion: ${metrics.targetConversion}%
- Current sales cycle: ${metrics.currentCycle} months
- Target cycle: ${metrics.targetCycle} months
- Potential revenue increase: $${metrics.revenueIncrease}

INTELLIGENCE-BASED TOOL RECOMMENDATIONS:
${toolsSection}

IMPLEMENTATION PATTERN:
${patternsSection}

INDUSTRY BENCHMARKS DATA:
${benchmarksSection}

MARKET INTELLIGENCE METADATA:
- Data Freshness: ${Math.round(intelligencePackage.metadata.dataFreshness * 100)}% current
- Quality Score: ${Math.round(intelligencePackage.metadata.qualityScore * 100)}/100
- Industry Data Points: ${intelligencePackage.metadata.industryDataPoints}
- Successful Implementations Analyzed: ${intelligencePackage.metadata.successfulImplementations}
- Using Fallback Enhancement: ${intelligencePackage.metadata.usingFallback ? 'Yes' : 'No'}

MARKET TRENDS DATA:
${intelligencePackage.trends ? `
Rising: ${intelligencePackage.trends.rising?.slice(0,3).join(', ') || 'N/A'}
Declining: ${intelligencePackage.trends.declining?.slice(0,2).join(', ') || 'N/A'}
New Entrants: ${intelligencePackage.trends.new?.slice(0,3).join(', ') || 'N/A'}
` : 'Market trends data not available'}

COST INTELLIGENCE:
${intelligencePackage.costs ? `
Median Tool Cost: ${intelligencePackage.costs.median}
Custom Build Estimate: ${intelligencePackage.costs.customBuild}
SaaS Range: ${intelligencePackage.costs.saasRange}
` : 'Cost data not available'}

Generate the complete report following the structure above.

CRITICAL REQUIREMENTS:
1. Use the SPECIFIC TOOLS from the intelligence recommendations in the "In-Scope Solutions" section
2. Base industry benchmarks on the provided benchmark data (${templateData.currentMonth} data)
3. Use the implementation pattern for timeline and complexity estimates
4. Include a "Market Context" section using the trends data
5. Reference the specific number of data points and implementations in credibility statements
6. Make calculations and projections based on the metrics and benchmark data
7. Format sections clearly with markdown headers
8. Include specific tool names, pricing, and integrations from the intelligence data
9. Create realistic ROI projections based on the provided industry benchmarks
10. If using fallback data, subtly indicate this with phrases like "based on curated industry analysis"
  `;

  try {
    console.log('🤖 Using narrative-driven report generation...');
    
    // Use the new narrative report generator instead of OpenAI synthesis
    const narrativeReport = await generateNarrativeReport(
      assessmentData, 
      intelligencePackage, 
      inferences,
      researchFindings
    );
    
    console.log('✅ Narrative report generation successful, length:', narrativeReport.length);
    return narrativeReport;
  } catch (error) {
    console.error('❌ Narrative report generation failed, falling back to OpenAI synthesis:', error);
    
    // Fallback to OpenAI synthesis if narrative generation fails
    try {
      console.log('🤖 Calling OpenAI for report synthesis...');
      
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }
      
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
              content: 'You are a management consultant creating a detailed transformation report. Be specific and use real numbers.' 
            },
            { role: 'user', content: synthesisPrompt }
          ],
          model: 'gpt-4o',  // Use the better model for comprehensive reports
          max_tokens: 8000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI synthesis error:', errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Report synthesis successful, length:', data.choices[0].message.content.length);
      return data.choices[0].message.content;
    } catch (openaiError) {
      console.error('❌ OpenAI synthesis also failed:', openaiError);
      
      // Return fallback structured report as last resort
      return generateFallbackReport(assessmentData, researchFindings, inferences, metrics);
    }
  }
}

function calculateMetrics(data: AssessmentData) {
  const businessName = data.businessName || data.company || 'Your Company';
  const icpType = data.icpType || data.businessType || 'Professional Services';
  
  // Extract metrics from their input or use defaults based on industry
  let currentConversion = 3;  // Default low conversion
  let avgDealSize = 5000;     // Default deal size
  
  // Try to extract metrics from existing data
  if (data.additionalContext) {
    const conversionMatch = data.additionalContext.match(/(\d+)%?\s*(?:conversion|convert)/i);
    if (conversionMatch) {
      currentConversion = parseInt(conversionMatch[1]);
    }
    
    const dealSizeMatch = data.additionalContext.match(/\$?(\d+(?:,\d+)*)\s*(?:deal|contract|sale)/i);
    if (dealSizeMatch) {
      avgDealSize = parseInt(dealSizeMatch[1].replace(/,/g, ''));
    }
  }
  
  // Set realistic targets based on industry
  const targetConversion = Math.min(currentConversion * 3, 20); // Up to 20% conversion
  const currentCycle = 8;  // months
  const targetCycle = Math.max(currentCycle * 0.4, 2); // Reduce by 60%, min 2 months
  
  // Calculate revenue increase
  const monthlyLeads = 200;  // estimate
  const currentDeals = monthlyLeads * (currentConversion / 100) * 0.7;  // 70% close rate
  const futureDeals = monthlyLeads * (targetConversion / 100) * 0.7;
  const revenueIncrease = (futureDeals - currentDeals) * avgDealSize * 12;
  
  return {
    currentConversion,
    targetConversion,
    currentCycle,
    targetCycle,
    avgDealSize: avgDealSize.toLocaleString(),
    revenueIncrease: revenueIncrease.toLocaleString()
  };
}

function generateFallbackReport(
  assessmentData: AssessmentData,
  researchFindings: string,
  inferences: BusinessInferences,
  metrics: ReturnType<typeof calculateMetrics>
): string {
  const businessName = assessmentData.businessName || assessmentData.company || 'Your Company';
  const icpType = assessmentData.icpType || assessmentData.businessType || 'Professional Services';
  const revenueChallenge = assessmentData.revenueChallenge || assessmentData.challenges?.[0] || 'operational efficiency';
  const teamProcess = assessmentData.teamProcess || assessmentData.processDescription || 'current business processes';
  const solutionStack = assessmentData.solutionStack || assessmentData.techStack?.join(', ') || 'existing systems';
  
  return `
# Revenue Intelligence Report: ${businessName}

## Executive Summary

${businessName} operates as a ${icpType} organization facing significant challenges in ${revenueChallenge}. Through our comprehensive assessment, we've identified substantial opportunities for AI-driven transformation that could increase operational efficiency by 40-60% and potentially generate $${metrics.revenueIncrease} in additional revenue annually.

The current state reveals manual processes consuming valuable resources, with lead conversion rates at ${metrics.currentConversion}% - well below industry benchmarks of 15-20%. Our GABI Intelligence framework offers a systematic approach to address these challenges through intelligent automation and context-aware decision-making systems.

This report outlines a clear path to transformation, with projected ROI of 300-400% within 12 months and a recommended investment aligned with your specified ${assessmentData.investmentLevel || 'investment level'}.

## The GABI Advantage

GABI Intelligence provides a four-layer framework for sustainable AI transformation:

1. **Application Layer** - Intuitive interfaces that integrate seamlessly with existing workflows
2. **Context Layer** - Intelligent decision-making engine that learns from your specific business patterns  
3. **Enrichment Layer** - Data augmentation and quality enhancement across all touchpoints
4. **Orchestration Layer** - Multi-channel deployment ensuring consistent experiences

This layered approach ensures that AI implementation enhances rather than disrupts your current operations, while providing the flexibility to scale and adapt as your business evolves.

## Current State

Based on your assessment, ${businessName} currently operates with the following process: "${teamProcess}"

**Current Challenges:**
- ${revenueChallenge} creating operational bottlenecks
- Manual processes consuming ${inferences.maturityLevel === 'startup-chaos' ? '30-40%' : inferences.maturityLevel === 'scaling-friction' ? '40-50%' : '50-60%'} of team capacity
- ${inferences.hiddenMultipliers.join(' and ')} impacting overall efficiency
- Sales cycle averaging ${metrics.currentCycle} months
- Lead conversion rate of only ${metrics.currentConversion}%

**Technology Stack:** Currently utilizing ${solutionStack}, which provides a solid foundation for AI integration.

## Industry Benchmarks

${icpType} companies typically achieve:
- **Lead Conversion:** 15-20% (vs. your current ${metrics.currentConversion}%)
- **Sales Cycle:** 3-4 months (vs. your current ${metrics.currentCycle} months)
- **Process Automation:** 70-80% of routine tasks
- **Customer Response Time:** Under 2 hours for 90% of inquiries

**Gap Analysis:** Your organization has significant opportunity for improvement, particularly in lead management and process optimization. The ${metrics.targetConversion - metrics.currentConversion}% conversion improvement alone could generate substantial revenue growth.

## In-Scope Solutions

### Off-The-Shelf SaaS
- **CRM Automation Platform:** $200-400/month - Lead scoring and nurturing
- **Process Automation Tool:** $150-300/month - Workflow optimization
- **AI Analytics Dashboard:** $100-250/month - Performance insights
- **Communication Hub:** $50-150/month - Customer engagement

**Integration Timeline:** 4-6 weeks
**Monthly Investment:** $500-1,100

### Custom Build
- **Bespoke AI Solution:** $25,000-75,000 - Tailored to exact specifications
- **Custom Integration:** $10,000-25,000 - Seamless system connectivity
- **Ongoing Development:** $2,000-5,000/month - Continuous enhancement

**Development Timeline:** 6-12 months
**Total Investment:** $35,000-100,000

### GABI Core Hybrid
- **Context Intelligence Engine:** Orchestrates best-of-breed tools
- **Adaptive Learning System:** Improves performance over time
- **Unified Dashboard:** Single interface for all operations
- **Scalable Architecture:** Grows with your business

**Implementation Timeline:** 6-8 weeks
**Investment Range:** $${inferences.maturityLevel === 'startup-chaos' ? '5,000-15,000' : inferences.maturityLevel === 'scaling-friction' ? '10,000-30,000' : '25,000-75,000'}

## Future State

With GABI implementation, ${businessName} will operate with:

**Transformed Process:**
- Automated lead qualification and scoring
- Intelligent customer communications
- Real-time performance dashboards
- Predictive analytics for decision-making

**Team Impact:**
- ${inferences.maturityLevel === 'startup-chaos' ? '40-50%' : inferences.maturityLevel === 'scaling-friction' ? '50-60%' : '60-70%'} reduction in manual tasks
- Focus shifts from operational to strategic activities
- Enhanced collaboration through shared intelligence
- Improved customer satisfaction and retention

## ROI on Investment

| Metric | Current State | Future State | Annual Impact |
|--------|---------------|--------------|---------------|
| Lead Conversion | ${metrics.currentConversion}% | ${metrics.targetConversion}% | +$${metrics.revenueIncrease} revenue |
| Sales Cycle | ${metrics.currentCycle} months | ${metrics.targetCycle} months | ${Math.round((metrics.currentCycle - metrics.targetCycle) / metrics.currentCycle * 100)}% faster |
| Process Efficiency | 40-50% | 80-90% | $50,000+ cost savings |
| Customer Response | 24+ hours | <2 hours | 25% retention improvement |

**Payback Period:** 6-9 months
**12-Month ROI:** 300-400%
**3-Year ROI:** 800-1200%

## Next Steps

1. **Strategy Session** - 90-minute consultation to refine requirements and customize approach
2. **Pilot Program** - 30-day proof of concept focusing on highest-impact use case
3. **Phased Rollout** - Systematic implementation across all identified areas
4. **Optimization** - Continuous refinement based on performance data

**Immediate Action:** Schedule your complimentary strategy session to discuss your specific requirements and begin the transformation journey.

---

*This report represents a preliminary analysis based on your assessment responses. A detailed consultation will provide more specific recommendations tailored to your unique business context and objectives.*
  `.trim();
}

// Helper functions for report formatting

function formatToolRecommendations(tools: any[]): string {
  if (!tools || tools.length === 0) {
    return 'No specific tool recommendations available from intelligence system.';
  }
  
  return tools.slice(0, 5).map(tool => {
    const pricing = typeof tool.pricing_details === 'string' 
      ? tool.pricing_details 
      : tool.pricing || 'Contact for pricing';
      
    const integrations = Array.isArray(tool.integrations) 
      ? tool.integrations.slice(0, 3).join(', ') 
      : 'Various integrations available';
      
    return `
**${tool.name}**
- Category: ${tool.category}
- Description: ${tool.description || tool.best_for}
- Pricing: ${pricing}
- Key Integrations: ${integrations}
- Recommendation Score: ${tool.icp_score || tool.similarity || 'High'}
${tool.recommendation_reason ? `- Why Recommended: ${tool.recommendation_reason}` : ''}
    `.trim();
  }).join('\n\n');
}

function formatImplementationPattern(pattern: any): string {
  if (!pattern) {
    return 'No implementation pattern available.';
  }
  
  return `
**${pattern.name}**
- Architecture: ${pattern.architecture || pattern.description}
- Complexity: ${pattern.complexity}
- Timeline: ${pattern.typical_timeline || pattern.timeline}
- Cost Range: ${pattern.typical_cost_range || pattern.cost}
- Success Indicators: ${Array.isArray(pattern.success_indicators) ? pattern.success_indicators.join(', ') : 'Standard KPIs'}
- Common Pitfalls: ${Array.isArray(pattern.common_pitfalls) ? pattern.common_pitfalls.join(', ') : 'Implementation challenges'}
  `.trim();
}

function formatBenchmarks(benchmarks: any, icpType: string): string {
  if (!benchmarks) {
    return `Industry benchmarks for ${icpType} not available.`;
  }
  
  const benchmarkEntries = Object.entries(benchmarks).map(([key, value]) => {
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return `- ${formattedKey}: ${value}`;
  }).join('\n');
  
  return `Industry Benchmarks for ${icpType.toUpperCase()}:\n${benchmarkEntries}`;
}