// Simplified Perplexity Research Prompt Template
// Passes 100% of user input with full context - no RAG, no pre-enrichment

import { AssessmentData } from './input-compiler';

export interface SimplifiedResearchContext {
  // All user inputs preserved exactly as provided
  company: string;
  emailDomain: string;
  fullName: string;
  sessionId: string;
  businessType: string;
  opportunityFocus: string;
  revenueModel: string;
  challenges: string;
  specificMetric: string;
  metricBaseline: string;
  metricFriction: string;
  teamDescription: string;
  processDescription: string;
  techStack: string;
  keyBottleneck: string;
  additionalContext: string;
  investmentLevel: string;
  teamMembers: string[];
  teamSize: number;
  painPoints: string[];
  location: string;
}

export function buildSimplifiedResearchContext(data: AssessmentData): SimplifiedResearchContext {
  // Use the ACTUAL fields from the assessment data
  const allData = data as any;
  
  // The real user input is in mainFriction and currentBaseline
  const actualProcess = allData.mainFriction || allData.processDescription || '';
  const actualBaseline = allData.currentBaseline || '';
  
  return {
    company: allData.company || allData.businessName || '',
    emailDomain: allData.email?.split('@')[1] || '',
    fullName: allData.fullName || '',
    sessionId: allData.sessionId || '',
    businessType: allData.businessType || '',
    opportunityFocus: allData.opportunityFocus || '',
    revenueModel: allData.revenueModel || '',
    challenges: Array.isArray(allData.challenges) ? allData.challenges.join(', ') : (allData.challenges || ''),
    specificMetric: allData.metricsQuantified?.metric || allData.specificMetric || '',
    metricBaseline: actualBaseline,
    metricFriction: actualProcess,
    teamDescription: allData.teamDescription || '',
    processDescription: actualProcess,
    techStack: Array.isArray(allData.techStack) ? allData.techStack.join(', ') : (allData.techStack || ''),
    keyBottleneck: actualProcess.substring(0, 200),
    additionalContext: allData.additionalContext || '',
    investmentLevel: allData.investmentLevel || '',
    teamMembers: [],
    teamSize: 0,
    painPoints: [],
    location: ''
  };
}

export function buildSimplifiedPrompt(context: SimplifiedResearchContext): string {
  return `## ROLE/PERSONALITY 
You are GABI's research engine, specializing in AI transformation for B2B technology service providers.
You understand revenue operations, product and IT strategy, and build versus buy technology spend dilemma deeply. You find specific, well-researched, ROI-driven solutions, and you communicate your recommendations to business owners and managers with budget authority.

## FULL CONTEXT (All user inputs)
Company: ${context.company}
Email Domain: ${context.emailDomain}
Full Name: ${context.fullName}
Session ID: ${context.sessionId}

Industry Classification:
- Business Type: ${context.businessType}
- Opportunity Focus: ${context.opportunityFocus}
- Revenue Model: ${context.revenueModel}

Revenue Challenge:
- Primary Challenge: ${context.challenges}
- Specific Metric: ${context.specificMetric}
- Current Baseline: ${context.metricBaseline}
- Metric Friction: ${context.metricFriction}

Team & Process Breakdown:
- Who's Involved: ${context.teamDescription}
- Process Steps: ${context.processDescription}
- Current Tech Stack: ${context.techStack}

Pain Points:
- Key Bottleneck: ${context.keyBottleneck}
- Additional Context: ${context.additionalContext}
- Investment Level: ${context.investmentLevel}

Extracted Intelligence:
- Team Members: ${context.teamMembers.join(', ')}
- Team Size: ${context.teamSize}
- Pain Indicators: ${context.painPoints.join(', ')}
- Location: ${context.location}

## RESEARCH DIRECTIVE

Create a comprehensive research report with these exact sections:

### 1. EXECUTIVE SUMMARY
One paragraph crystallizing:
- What ${context.company}'s core challenge is with ${context.specificMetric}
- Why ${context.businessType} → ${context.opportunityFocus} firms struggle with this
- The transformation opportunity available

### 2. PROBLEM SYNTHESIS
${context.company}'s ${context.challenges} challenge stems from ${context.processDescription}.

In ${context.businessType} → ${context.opportunityFocus} firms using ${context.revenueModel}, this creates:
- [Specific friction point 1] because of ${context.revenueModel} constraints
- [Specific friction point 2] due to ${context.opportunityFocus} requirements
- [Specific friction point 3] from ${context.techStack} limitations

Root cause: [Why this problem persists in the industry]

### 3. INDUSTRY BENCHMARKING
Research and provide:
- ${context.businessType} industry average for ${context.specificMetric}: [X]
- Top performers achieve: [Y]
- Your current position: ${context.metricBaseline} = [below/at/above average]
- Typical improvement with automation: [15-25%]
- AI-enabled transformation potential: [30-50%]

Sources: [Cite specific studies/reports]

### 4. CASE STUDY EVIDENCE
Find a real example:
- Company: [Similar size/type to ${context.company}]
- Challenge: [Same ${context.challenges} issue]
- Solution: [What they implemented]
- Results: [${context.specificMetric} improvement achieved]
- Timeline: [How long it took]
- Source: [Link/citation]

### 5. SOLUTION ARCHITECTURE

Given ${context.investmentLevel} budget and ${context.teamSize}-person team:

**Recommended Approach:**
Describe a [type of interface] where ${context.teamMembers.join(', ')} can [execute core function].

**Technical Stack:**
- Interface Layer: [Specific tool/framework recommendation]
- AI/LLM Engine: [Specific model/service for their needs]  
- Knowledge System: [Where/how to store ${context.opportunityFocus} data]
- Integration Layer: [How to connect to ${context.techStack}]
- Infrastructure: [Hosting/deployment recommendation]

**Build vs. Buy Analysis:**
- Pure SaaS option: [Specific tools, monthly cost, limitations]
- Custom build: [Tech stack, timeline, total cost]
- Hybrid approach: [Mix of SaaS + custom, cost, timeline]
- RECOMMENDATION: [Which option and why]

### 6. IMPLEMENTATION & ADOPTION

**30-Day Rollout:**
- Week 1: [Specific first step with {easiest process}]
- Week 2: [Expand to include X]
- Week 3: [Add team members Y and Z]
- Week 4: [Full deployment of core functionality]

**Adoption Strategy for ${context.teamSize} people:**
- Start with: [Champion user from ${context.teamMembers.join(', ')}]
- Quick win: [First measurable improvement]
- Full adoption trigger: [What proves it's working]

### 7. COMPETITIVE ADVANTAGE

**Market Differentiation Through AI Architecture:**

While competitors struggle with: [From research]
${context.company} will leverage a complete AI stack:

- **Conversational Interface**: Natural interaction for ${context.teamMembers.join(', ')} to {core function}
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
- Your approach: Comprehensive AI layer operational in 30 days

**Customer Impact:**
- Before: {Current client experience from research}
- After: {Enhanced experience with full-stack AI}
- Differentiator: "We've automated ${context.challenges} completely"

### 8. NEXT STEPS

**Week 1: Discovery & Architecture**
□ Validate research findings with your team
□ Map detailed workflow for ${context.specificMetric} improvement
□ Define success metrics and tracking

**Week 2: Proof of Concept**
□ Deploy conversational interface for {highest_impact_process}
□ Connect knowledge base with ${context.opportunityFocus} context
□ Test with {champion_user} from team

**Week 3-4: Scale & Optimize**
□ Expand to full ${context.teamSize} team
□ Add automated functions for ${context.techStack}
□ Measure ${context.specificMetric} improvement

**Success Criteria:**
- ${context.specificMetric} improves from ${context.metricBaseline} to {target}
- Team adoption exceeds 80% in first month
- Client feedback shows measurable satisfaction increase

### 9. NEXT STEPS WITH JOEL

**Discovery Session Agenda:**
□ Validate ${context.specificMetric} baseline and targets
□ Map ${context.processDescription} in detail
□ Review ${context.techStack} integration points
□ Define success metrics for ${context.teamMembers.join(', ')}

**Proof of Concept Scope:**
- Focus area: [Highest impact part of process]
- Success criteria: [Specific measurable outcome]
- Timeline: [X days to working prototype]

---

Focus research on ${context.businessType} → ${context.opportunityFocus} companies specifically.
Prioritize 2024-2025 data and real implementation examples.
Be specific about tools, costs, and timelines.`;
}

// Helper functions - minimal extraction only, no interpretation
function extractTeamMembersFromProcess(processText: string): string[] {
  if (!processText) return [];
  
  // Look for names mentioned in process (first names only)
  const nameMatches = processText.match(/\b[A-Z][a-z]{2,}\b/g) || [];
  
  // Filter for likely names (not common words)
  const commonWords = new Set(['What', 'When', 'Where', 'Then', 'Next', 'First', 'Last', 'After', 'Before', 'During', 'The', 'This', 'That', 'They', 'Team', 'Process', 'Step', 'Phase', 'Stage']);
  
  return nameMatches
    .filter(word => !commonWords.has(word))
    .filter((name, index, array) => array.indexOf(name) === index) // unique
    .slice(0, 8); // reasonable limit
}

function extractPainIndicatorsFromContext(additionalContext: string, processDescription: string): string[] {
  const combined = `${additionalContext} ${processDescription}`.toLowerCase();
  const indicators: string[] = [];
  
  // Look for explicit pain indicators
  if (combined.includes('manual')) indicators.push('manual processes');
  if (combined.includes('slow') || combined.includes('takes time')) indicators.push('slow processes');
  if (combined.includes('complex') || combined.includes('complicated')) indicators.push('process complexity');
  if (combined.includes('bottleneck') || combined.includes('stuck')) indicators.push('process bottlenecks');
  if (combined.includes('inefficient') || combined.includes('waste')) indicators.push('inefficiencies');
  if (combined.includes('repetitive') || combined.includes('repeat')) indicators.push('repetitive tasks');
  if (combined.includes('error') || combined.includes('mistake')) indicators.push('error-prone processes');
  
  // Look for time indicators
  const timeMatches = combined.match(/(\d+)\s*(hours?|days?|weeks?|months?)/g);
  if (timeMatches) indicators.push(`time-consuming (${timeMatches[0]})`);
  
  return indicators.slice(0, 5); // reasonable limit
}

function extractLocationFromContext(additionalContext: string, email: string): string {
  // Try to extract location from additional context first
  const locationMatch = additionalContext.match(/\b([A-Z][a-z]+(?:,\s*[A-Z]{2})?)\b/);
  if (locationMatch) return locationMatch[1];
  
  // Try email domain (basic heuristics)
  if (email) {
    const domain = email.split('@')[1]?.toLowerCase();
    // Could add domain-to-location mapping here if needed
  }
  
  return ''; // Let research determine location
}

function extractKeyBottleneck(processDescription: string): string {
  if (!processDescription) return '';
  
  // Look for explicit bottleneck indicators
  const bottleneckPatterns = [
    /but .+/i,
    /however .+/i,
    /takes? .+ (long|time|months?|weeks?)/i,
    /manual\w* .+/i,
    /slow\w* .+/i,
    /stuck .+/i,
    /bottleneck .+/i
  ];
  
  for (const pattern of bottleneckPatterns) {
    const match = processDescription.match(pattern);
    if (match) return match[0].trim();
  }
  
  return processDescription.slice(0, 100); // First part of description as fallback
}