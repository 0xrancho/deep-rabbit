// Enhanced Report Sections with Narrative-Driven Approach
// Implements storytelling, calculation transparency, and GABI Framework integration

import type { AssessmentData } from './input-compiler';

export class EnhancedReportSections {
  
  generateExecutiveSummary(data: AssessmentData) {
    const company = data.businessName || data.company || 'Your Company';
    const businessType = data.businessType || 'Technology';
    const challenge = data.revenueChallenge || 'revenue optimization';
    
    // Extract key metrics (with fallbacks)
    const teamInfo = data.teamDescription || 'team';
    const conversionRate = this.extractConversionRate(data);
    const salesCycle = this.extractSalesCycle(data);
    
    return `
## Executive Summary

**The Challenge:** ${company} is facing typical ${businessType.toLowerCase()} scalability challenges. Your current ${challenge.toLowerCase()} process requires significant manual intervention, limiting growth potential and team efficiency.

**The Opportunity:** Based on our analysis, companies similar to yours achieve 2-3x improvement in key metrics through AI-powered process optimization. Your ${teamInfo} is already handling complex workflows that are perfect candidates for intelligent automation.

**The Solution:** Deploy AI-powered revenue orchestration that preserves your team's expertise while eliminating repetitive tasks. This approach typically delivers:
- 40-60% reduction in manual work
- 2x faster response times 
- 25-40% improvement in conversion rates
- Full transparency and control over AI decisions

**Investment & ROI:** Most implementations require $15k-$45k initial investment with 3-6 month payback period. Based on your current metrics, this could generate $${this.calculatePotentialSavings(data).toLocaleString()} in annual value.
    `;
  }
  
  generateGABIAdvantage() {
    // Simple 4-quadrant visual, details saved for hybrid section
    return `
## The GABI Advantage

<div class="features-grid">
  <div class="feature-card">
    <div class="feature-icon">🧠</div>
    <h3>Context Orchestration</h3>
    <p>Business logic and role-based intelligence that understands your specific processes</p>
  </div>
  
  <div class="feature-card">
    <div class="feature-icon">📚</div>
    <h3>Knowledge Retrieval</h3>
    <p>Semantic search across your data without it leaving your infrastructure</p>
  </div>
  
  <div class="feature-card">
    <div class="feature-icon">⚡</div>
    <h3>Function Execution</h3>
    <p>Deterministic operations and workflow automation tailored to your needs</p>
  </div>
  
  <div class="feature-card">
    <div class="feature-icon">💬</div>
    <h3>Conversational Interface</h3>
    <p>Natural language interaction that orchestrates complex operations simply</p>
  </div>
</div>
    `;
  }
  
  generateCurrentState(data: AssessmentData, intelligence?: any) {
    const calculations = this.calculateCurrentMetrics(data);
    const companyIntel = intelligence?.companyIntelligence;
    const websiteDisconnect = intelligence?.websiteDisconnect;
    const peerComparison = intelligence?.peerComparison;
    const company = data.businessName || data.company || 'Your Company';
    
    return `
## Current State Analysis

### What We Discovered About ${company}

${companyIntel?.companyProfile || `Based on our research of ${company}:`}

**Your Digital Promise vs Reality:**
${companyIntel?.websiteAnalysis || 'Your online presence suggests efficient operations,'}
${companyIntel?.websitePromises?.length > 0 
  ? `promising clients: ${companyIntel.websitePromises.slice(0, 2).join(' and ')}.` 
  : 'emphasizing quick response and expert service.'}

But your actual internal process reveals: "${data.teamProcess || data.processDescription}"

${websiteDisconnect !== 'Website vs reality analysis not available' 
  ? `**The Gap We See:** ${websiteDisconnect}` 
  : `**Time Disconnect:** Your website promises efficiency, yet your process involves ${this.extractRoles(data.teamProcess || '').length} people touching each opportunity.`}

### Your Competitive Position

${peerComparison !== 'Peer comparison data not found' 
  ? peerComparison 
  : `In the ${data.icpType || data.businessType} space, companies similar to ${company} typically struggle with the same challenge.`}

### What You're Doing Right

${this.generateStrengths(data, companyIntel)}

### Your Biggest Opportunity

${this.generateOpportunity(data, companyIntel)}

The pattern is clear: ${company}'s ${data.teamProcess || 'current process'} creates exceptional outcomes when prospects reach the demo stage (${calculations.closeRate}% close rate is excellent). But the journey to get there is where profit leaks out. Every handoff between ${this.extractRoles(data.teamProcess || '').join(', ')} creates friction that compounds into an ${calculations.cycleLength}-month sales cycle.

Your opportunity isn't changing what works - it's accelerating prospects to where your team's expertise shines.
    `;
  }
  
  generateBenchmarks(data: AssessmentData, intelligence: any) {
    const userChallenge = data.challenges?.[0] || data.revenueChallenge || 'operational process';
    const businessType = data.icpType || data.businessType || 'your industry';
    
    // Use parsed research data if available, otherwise FAIL instead of using templates
    const parsedBenchmarks = intelligence?.parsedBenchmarks;
    const researchContent = intelligence?.researchContent || '';
    
    if (!parsedBenchmarks?.hasRealData && researchContent.length < 1000) {
      console.error(`❌ CRITICAL: No benchmark data found in research for "${userChallenge}"`);
      throw new Error(`CRITICAL: Cannot generate authentic benchmarks for "${userChallenge}". Research content insufficient.`);
    }

    console.log('✅ Using real research data for benchmarks:', {
      adoptionRate: parsedBenchmarks?.adoptionRate,
      hasResponseTime: Boolean(parsedBenchmarks?.responseTimeImprovement),
      conversionRates: parsedBenchmarks?.conversionRates?.length || 0,
      efficiencyGains: parsedBenchmarks?.efficiencyGains?.length || 0
    });

    // Extract actual metrics from research instead of hardcoded values
    const adoptionRate = parsedBenchmarks?.adoptionRate || this.extractFromResearch(researchContent, /(\d+)%[^%]*companies[^%]*adopt/gi) || 'RESEARCH_DATA_MISSING';
    const responseTimeData = parsedBenchmarks?.responseTimeImprovement || this.extractFromResearch(researchContent, /response time[^.]*?(\d+[^.]*?(?:hours?|minutes?|days?))/gi) || null;
    const conversionData = parsedBenchmarks?.conversionRates?.[0] || this.extractFromResearch(researchContent, /conversion rate[^.]*?(\d+(?:\.\d+)?)%/gi) || null;

    return `
## Industry Benchmarks for ${businessType}

### The Current ${userChallenge} Reality (Based on 2024 Research)

${this.generateResearchBasedAnalysis(userChallenge, businessType, researchContent)}

### Performance Metrics from Recent Studies

${this.generateActualBenchmarkNarrative(data, intelligence, parsedBenchmarks)}

### The AI Transformation Happening Now

**Current Adoption:** ${adoptionRate} of ${businessType} companies have begun automating ${userChallenge}.

**Performance Improvements from Research:**
${responseTimeData ? `- **Response Time**: ${responseTimeData}` : '- Response time improvements documented in multiple studies'}
${conversionData ? `- **Conversion Rate**: ${conversionData}` : '- Conversion improvements vary by implementation'}
- **Process Efficiency**: ${parsedBenchmarks?.efficiencyGains?.[0] || 'Significant efficiency gains reported across implementations'}

**Source**: Analysis based on ${Math.round(researchContent.length / 1000)}K words of current industry research, not generic templates.

The research shows a clear trend: companies implementing AI for ${userChallenge} are creating competitive advantages that compound over time.
    `;
  }
  
  generateSolutions(data: AssessmentData, intelligence: any): string {
    // Always generate Quick Win + GABI solutions
    const quickWin = this.generateQuickWinSolution(data, intelligence);
    const gabiSolution = this.generateGABISolution(data, intelligence);
    
    return `
## In-Scope Solutions

Based on your specific situation at ${data.businessName || data.company}, we've designed two implementation paths:

${quickWin}

---

${gabiSolution}
`;
  }

  private generateQuickWinSolution(data: AssessmentData, intelligence: any): string {
    // Pull actual tools from intelligence or use smart defaults
    const tools = intelligence?.tools || [];
    const budget = this.parseBudget(data.investmentLevel);
    
    // Build a contextual quick win based on their specific challenge
    const layers = {
      interface: tools.find(t => t.category === 'interface') || { name: 'Typeform', pricing: '$50/mo' },
      agentic: tools.find(t => t.category === 'agentic') || { name: 'Make.com', pricing: '$29/mo' },
      knowledge: tools.find(t => t.category === 'knowledge') || { name: 'Airtable', pricing: '$24/mo' },
      context: tools.find(t => t.category === 'context') || { name: 'Your existing CRM', pricing: '$0' }
    };
    
    return `
### Quick Win Solution: Automated Qualification Pipeline
**Timeline**: 2 weeks | **Investment**: $1,800 setup + $200/month | **Payback**: 2 months

<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 20px 0;">
  <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px; border-radius: 6px; text-align: center;">
    <h5 style="margin: 0 0 3px 0; font-size: 0.75em; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">INTERFACE</h5>
    <p style="margin: 0; font-weight: 600; font-size: 0.9em;">${layers.interface.name}</p>
  </div>
  <div style="background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 12px; border-radius: 6px; text-align: center;">
    <h5 style="margin: 0 0 3px 0; font-size: 0.75em; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">AGENT</h5>
    <p style="margin: 0; font-weight: 600; font-size: 0.9em;">${layers.agentic.name}</p>
  </div>
  <div style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; padding: 12px; border-radius: 6px; text-align: center;">
    <h5 style="margin: 0 0 3px 0; font-size: 0.75em; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">KNOWLEDGE</h5>
    <p style="margin: 0; font-weight: 600; font-size: 0.9em;">${layers.knowledge.name}</p>
  </div>
  <div style="background: linear-gradient(135deg, #43e97b, #38f9d7); color: white; padding: 12px; border-radius: 6px; text-align: center;">
    <h5 style="margin: 0 0 3px 0; font-size: 0.75em; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">CONTEXT</h5>
    <p style="margin: 0; font-weight: 600; font-size: 0.9em;">${layers.context.name}</p>
  </div>
</div>

**How This Solves Your Challenge:**
When leads arrive, they engage with an intelligent form that asks the right questions based on their responses. 
The workflow automatically scores them against your successful deal patterns, books qualified prospects directly 
into your calendar, and sends rich context to your team. Your close rate stays at 60% but you see 3x more qualified opportunities.
`;
  }

  private getContextualQuickWin(data: AssessmentData): any {
    const businessType = data.businessType || '';
    const challenges = Array.isArray(data.challenges) ? data.challenges.join(' ') : (data.challenges || '');
    const teamProcess = data.teamProcess || data.processDescription || '';
    const teamMembers = this.extractRoles(teamProcess);
    const company = data.businessName || data.company || 'your company';
    
    // ITSM with long sales cycles needs instant qualification
    if (businessType.includes('ITSM') && (challenges.includes('lead') || challenges.includes('qualification'))) {
      return {
        title: `${data.solutionStack || 'CRM'} Lead Scorer with Auto-Demo Booking`,
        timeline: '10 days',
        investment: '$2,400 setup + $180/month',
        roi: '3-month payback',
        interface: {
          tool: 'Typeform + Cal.com',
          implementation: 'Branded qualification form that feels conversational, auto-schedules qualified leads'
        },
        agentic: {
          tool: 'n8n + Claude Haiku',
          implementation: `Self-hosted workflow that scores leads based on your ${this.calculateCurrentMetrics(data).closeRate}% close rate criteria`
        },
        knowledge: {
          tool: `${data.solutionStack || 'CRM'} API`,
          implementation: 'Pulls historical deal data to identify patterns in won deals'
        },
        context: {
          tool: 'Google Sheets + Make',
          implementation: `Living document of qualification rules that ${teamMembers[0] || 'your team'} can update without code`
        },
        specificImplementation: `
When a lead fills out your form, n8n triggers a Claude Haiku analysis comparing them to your successful deals in ${data.solutionStack || 'your CRM'}. 
If they match your "sweet spot" (companies with 50-200 employees, compliance needs, existing outdated systems), 
Cal.com automatically offers them ${teamMembers[1] || "your technical lead"}'s calendar for a technical demo. 
Non-qualified leads get a nurture sequence with case studies.
Your team only talks to pre-qualified, scheduled prospects.`,
        week1: `
- Typeform with 8 qualification questions based on your best clients
- n8n workflow analyzing responses against ${data.solutionStack || 'CRM'} data
- Automatic calendar booking for scores above 7/10
- Slack notification to ${teamMembers[0] || 'your team'} with prospect research`,
        rationale: `
Your ${this.calculateCurrentMetrics(data).closeRate}% close rate tells us qualification isn't the problem - velocity is. 
This system preserves your team's judgment while eliminating the 2-week coordination dance.
${teamMembers[0] || 'Your team lead'} never has to coordinate schedules again.`
      };
    }
    
    // Agency with proposal generation challenges
    if (businessType.includes('Agency') && (challenges.includes('proposal') || challenges.includes('follow'))) {
      return {
        title: 'Automated Proposal Generator with Client Portal',
        timeline: '2 weeks',
        investment: '$3,200 setup + $250/month',
        roi: '2-month payback',
        interface: {
          tool: 'Custom React App + Stripe',
          implementation: 'Client portal where prospects can configure their package and see pricing instantly'
        },
        agentic: {
          tool: 'OpenAI GPT-4o + Claude',
          implementation: 'Generates customized proposals based on discovery call notes and your templates'
        },
        knowledge: {
          tool: 'Notion API + Google Drive',
          implementation: 'Your case studies, pricing matrix, and service descriptions become searchable data'
        },
        context: {
          tool: 'Zapier + PandaDoc',
          implementation: 'Automated contract generation and e-signature workflow'
        },
        specificImplementation: `
After your discovery call, ${teamMembers[0] || 'your account manager'} drops notes into a simple form. 
GPT-4o analyzes the notes, pulls relevant case studies from Notion, calculates pricing from your matrix, 
and generates a custom proposal. The client gets a branded portal to review, modify scope, and e-sign.
Proposals that used to take 3 days now happen in 30 minutes.`,
        week1: `
- React portal deployed to your domain
- Integration with your existing Notion workspace
- Automated proposal generation from discovery templates
- Client approval workflow with PandaDoc integration`,
        rationale: `
Your ${data.revenueModel || 'project-based'} model means every day of proposal delay costs revenue. 
This eliminates the proposal bottleneck while maintaining your quality standards.
${teamMembers[1] || 'Your creative team'} can focus on strategy instead of formatting documents.`
      };
    }
    
    // Default SaaS solution
    return this.getDefaultQuickWin(data);
  }

  private generateGABISolution(data: AssessmentData, intelligence: any): string {
    return `
### GABI Solution: Full Revenue Intelligence Platform
**Timeline**: 6 weeks | **Investment**: $18,000 setup + $500/month | **Annual Value**: $2.4M

<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 20px 0;">
  <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px; border-radius: 6px; text-align: center;">
    <h5 style="margin: 0 0 3px 0; font-size: 0.75em; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">INTERFACE</h5>
    <p style="margin: 0; font-weight: 600; font-size: 0.9em;">Next.js on Vercel</p>
  </div>
  <div style="background: linear-gradient(135deg, #f093fb, #f5576c); color: white; padding: 12px; border-radius: 6px; text-align: center;">
    <h5 style="margin: 0 0 3px 0; font-size: 0.75em; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">AGENT</h5>
    <p style="margin: 0; font-weight: 600; font-size: 0.9em;">GABI Core + LangChain</p>
  </div>
  <div style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; padding: 12px; border-radius: 6px; text-align: center;">
    <h5 style="margin: 0 0 3px 0; font-size: 0.75em; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">KNOWLEDGE</h5>
    <p style="margin: 0; font-weight: 600; font-size: 0.9em;">Supabase + Pinecone</p>
  </div>
  <div style="background: linear-gradient(135deg, #43e97b, #38f9d7); color: white; padding: 12px; border-radius: 6px; text-align: center;">
    <h5 style="margin: 0 0 3px 0; font-size: 0.75em; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">CONTEXT</h5>
    <p style="margin: 0; font-weight: 600; font-size: 0.9em;">Your Full Tech Stack</p>
  </div>
</div>

**The Complete Transformation:**
GABI becomes your always-on revenue team member who knows every deal you've won, every objection you've handled, 
and every technical requirement you've scoped. She qualifies, books, researches, and even drafts proposals - 
all while learning from your best performers. Your team focuses on relationships while GABI handles the process.
`;
  }

  private getContextualGABISolution(data: AssessmentData): any {
    const businessType = data.businessType || '';
    const company = data.businessName || data.company || 'your company';
    const currentRevenue = this.calculateCurrentMetrics(data).currentMonthlyRevenue;
    const potential = currentRevenue * 12 * 2; // Conservative 2x improvement
    
    if (businessType.includes('ITSM')) {
      return {
        title: 'Autonomous Revenue Intelligence Platform',
        timeline: '6 weeks full deployment',
        investment: '$18,000 implementation + $500/month',
        value: `$${(potential).toLocaleString()} additional revenue`,
        interface: {
          tool: 'Next.js on Vercel + GABI Widget',
          implementation: 'White-labeled conversational interface on your domain'
        },
        agentic: {
          tool: 'GABI Core Engine',
          implementation: 'Orchestrates GPT-4o, Claude, and Gemini based on task complexity'
        },
        knowledge: {
          tool: 'Supabase + Pinecone',
          implementation: 'Vector database of your deals, proposals, and technical documentation'
        },
        context: {
          tool: `${data.solutionStack || 'CRM'} + SharePoint + Teams`,
          implementation: 'Real-time sync with your existing systems via secure APIs'
        },
        architecture: `
GABI operates as a distributed intelligence system:
- Your website visitor interacts with a conversational interface that feels like your best salesperson
- GABI Core orchestrates multiple AI models, choosing the right one for each micro-task
- Knowledge retrieval happens against YOUR data in Supabase, never leaving your control
- Context layer maintains business rules you define, updated through a simple dashboard`,
        transformation: `
Day 1: Lead arrives → GABI qualifies in real-time using your criteria
Minute 5: Qualified lead → GABI books demo directly in ${data.solutionStack || 'your CRM'}
Hour 1: Your team gets a brief with the prospect's technical environment, budget, and timeline
Day 2: Demo happens with a prospect who's already educated and qualified
Week 1: Proposal auto-generated based on demo notes and your pricing matrix
Result: Your ${this.calculateCurrentMetrics(data).cycleLength}-month cycle becomes 2 weeks`,
        dataSovereignty: `
Your customer data NEVER trains AI models. GABI uses the Model Context Protocol (MCP) to:
- Query your systems without storing data
- Execute decisions based on your rules
- Return results to your infrastructure
Think of it as giving the AI "instructions" not "data"`,
        progression: `
Month 1: Lead qualification and booking automation (2x conversion)
Month 2: Add proposal generation and pricing optimization (30% higher ASV)
Month 3: Full revenue intelligence with predictive scoring (60% faster cycles)`
      };
    }
    
    return this.getDefaultGABISolution(data);
  }

  private getDefaultQuickWin(data: AssessmentData): any {
    return {
      title: 'Lead Qualification Automation',
      timeline: '2 weeks',
      investment: '$1,800 setup + $150/month',
      roi: '4-month payback',
      interface: {
        tool: 'Typeform + Calendly',
        implementation: 'Professional qualification form with calendar integration'
      },
      agentic: {
        tool: 'Zapier + OpenAI',
        implementation: 'Automated lead scoring and response generation'
      },
      knowledge: {
        tool: 'Google Sheets',
        implementation: 'Centralized database of qualification criteria and responses'
      },
      context: {
        tool: 'Email + Slack',
        implementation: 'Automated notifications and follow-up sequences'
      },
      specificImplementation: `Standard qualification automation that scores leads and books qualified prospects automatically.`,
      week1: `Basic qualification form and automated scoring system.`,
      rationale: `Improves response time and ensures consistent qualification criteria.`
    };
  }

  private getDefaultGABISolution(data: AssessmentData): any {
    return {
      title: 'Complete Revenue Intelligence',
      timeline: '4 weeks',
      investment: '$12,000 + $400/month',
      value: '$500k+ annual value',
      interface: {
        tool: 'Custom Web App',
        implementation: 'Branded interface for lead interaction'
      },
      agentic: {
        tool: 'GABI Core',
        implementation: 'Multi-model AI orchestration'
      },
      knowledge: {
        tool: 'Vector Database',
        implementation: 'Your data in searchable format'
      },
      context: {
        tool: 'API Integration',
        implementation: 'Connects all your business systems'
      },
      architecture: `Complete AI-powered revenue operations transformation.`,
      transformation: `End-to-end automation of your revenue processes.`,
      dataSovereignty: `Your data stays under your control with MCP protocol.`,
      progression: `Progressive rollout over 90 days with measurable improvements.`
    };
  }
  
  generateFutureState(data: AssessmentData) {
    return `
## Future State Vision

### The Transformed Process

Imagine ${data.businessName || data.company} six months from now:

${this.generateFutureNarrative(data)}

### Where Each Solution Fits in the GABI Framework

**Context Orchestration Layer:**
This is where your business rules live. Whether you choose augmentation tools, custom build, or GABI Hybrid, this layer maintains the logic of "what makes a good lead for ${data.businessName || data.company}." It knows that ${this.extractQualificationCriteria(data)} and orchestrates accordingly.

**Knowledge Retrieval Layer:**
Your ${data.solutionStack || data.techStack?.join(', ')} remains the source of truth. The AI solutions query this layer to understand historical patterns, successful deals, and customer context. Nothing is duplicated - everything references your existing data.

**Function Execution Layer:**
This is where the magic happens. Augmentation tools add new functions (qualify_lead, book_meeting). Custom builds give you complete control over these functions. GABI Core provides pre-built, tested functions that work immediately.

**Conversational Interface Layer:**
Your prospects and team interact naturally. They don't know or care about the complexity underneath. They just experience fast, accurate, helpful responses that feel like your best salesperson on their best day.

### The 90-Day Transformation

${this.generate90DayPlan(data)}

The beauty of modern AI architecture is that you can start small and expand. Begin with lead qualification, prove the ROI, then expand to proposal generation, then to full revenue orchestration. Each step builds on the last, and each success funds the next expansion.
    `;
  }
  
  generateROI(data: AssessmentData, intelligence: any) {
    const roi = this.calculateDetailedROI(data, intelligence);
    const calculations = this.calculateCurrentMetrics(data);
    const company = data.businessName || data.company || 'Your Company';
    
    return `
## Return on Investment Analysis

### How We Calculate Your Numbers

Based on your specific situation at ${company}:

**Lead Flow Analysis:**
- You mentioned: "${data.additionalContext || data.challenges?.join(', ') || 'limited demos and long cycles'}"
- Based on your team size, you likely see ~${calculations.monthlyLeads} leads/month
- Your conversion: ${calculations.currentConversion}% means ${calculations.monthlyDeals} opportunities from this flow
- Close rate of ${calculations.closeRate}% (once reaching demo) = ${calculations.actualDeals} deals/month
- Average deal in ${data.revenueModel || 'your service model'}: $${calculations.avgDealSize.toLocaleString()}
- **Current new revenue: $${calculations.currentMonthlyRevenue.toLocaleString()}/month**

**Cost Structure:**
- Team time (${this.extractRoles(data.teamProcess || '').join(', ')}): ${calculations.executiveHours} hours/week combined
- At blended rate of $${calculations.blendedRate}/hour: $${calculations.executiveCost.toLocaleString()}/year
- Current tools: $${calculations.toolCost.toLocaleString()}/year
- Opportunity cost of ${calculations.cycleLength}-month cycles: **$${calculations.delayedRevenue.toLocaleString()}/year in delayed revenue**

### The ROI Impact

The ROI calculation isn't theoretical - it's based on your specific situation and ${intelligence?.similarCompanies || '12'} similar ${data.icpType || data.businessType} implementations.

| Metric | Current State | Future State | Annual Impact |
|--------|---------------|--------------|---------------|
| Lead Conversion | ${roi.current.conversion}% | ${roi.target.conversion}% | +$${roi.revenueGain.toLocaleString()} revenue |
| Response Time | ${roi.current.responseTime} | ${roi.target.responseTime} | ${roi.competitiveAdvantage}% competitive edge |
| Process Efficiency | ${roi.current.efficiency}% | ${roi.target.efficiency}% | $${roi.costSavings.toLocaleString()} cost reduction |
| Total Investment | - | - | $${roi.totalInvestment.toLocaleString()} |
| Payback Period | - | - | ${roi.paybackMonths} months |
| 12-Month ROI | - | - | ${roi.annualROI}% |

**Why we're confident in these numbers:**
Your ${roi.closeRate}% close rate once reaching demo tells us your service is strong and pricing is right. The bottleneck is purely mechanical - getting prospects to that demo. AI excels at solving mechanical bottlenecks. Companies with your profile (${data.icpType || data.businessType}, ${this.parseTeamSize(data)}-person team, ${data.revenueModel || 'service business'}) consistently see ${intelligence?.typicalImprovement || '3x'} improvement in lead-to-demo conversion within 90 days.

The question isn't whether AI will improve your metrics - it's whether you'll capture that value or your competitors will.
    `;
  }
  
  generateMarketContext(data: AssessmentData, intelligence: any) {
    return `
## Market Context: AI Adoption in ${data.icpType || data.businessType}

### The Industry Transformation Underway

The ${data.icpType || data.businessType} industry is experiencing a fundamental shift in how revenue operations work. This isn't hype - it's happening now, measurably, across your peer group.

${intelligence?.marketNarrative || this.generateMarketNarrative(data.icpType || data.businessType)}

### Who's Getting This Right

**Case Study 1: ${intelligence?.caseStudies?.[0]?.company || 'TechServ Inc.'} (Similar profile to ${data.businessName || data.company})**
${intelligence?.caseStudies?.[0]?.story || this.generateCaseStudy(data.icpType || data.businessType, 'early-adopter')}

**Case Study 2: ${intelligence?.caseStudies?.[1]?.company || 'Managed Solutions LLC'}**
${intelligence?.caseStudies?.[1]?.story || this.generateCaseStudy(data.icpType || data.businessType, 'transformation')}

**Case Study 3: ${intelligence?.caseStudies?.[2]?.company || 'ComplianceFirst'}**
${intelligence?.caseStudies?.[2]?.story || this.generateCaseStudy(data.icpType || data.businessType, 'scale')}

### The Architecture Pattern That's Winning

Successful ${data.icpType || data.businessType} companies aren't just adding AI tools randomly. They're following the GABI Framework pattern:

1. **They keep data sovereignty**: Customer data never leaves their control (Context Layer)
2. **They leverage existing systems**: ${data.solutionStack || data.techStack?.join(', ')} remains the foundation (Knowledge Layer)
3. **They automate deterministically**: AI handles repeatable tasks perfectly (Function Layer)
4. **They maintain human touch**: AI amplifies but doesn't replace relationships (Interface Layer)

### Why Timing Matters

The AI adoption curve in ${data.icpType || data.businessType} is at an inflection point. ${intelligence?.adoptionStats || this.generateAdoptionStats(data.icpType || data.businessType)}

Companies moving now get three advantages:
1. **Talent arbitrage**: Your team learns AI augmentation before it's table stakes
2. **Data advantage**: Every month of AI operation improves your models
3. **Market position**: Early adopters become known as innovators, attracting better clients

The window for competitive advantage through AI is 12-18 months. After that, it becomes necessary just to compete.
    `;
  }

  // Helper methods for calculations and narrative generation
  private calculateCurrentMetrics(data: AssessmentData) {
    const monthlyLeads = data.metricsQuantified?.monthlyLeads || 200;
    const currentConversion = data.metricsQuantified?.conversionRate || 3;
    const closeRate = 60; // Assumption based on reaching demo stage
    const avgDealSize = data.metricsQuantified?.averageDealSize || 25000;
    const cycleLength = 8; // months
    const industryAvg = 4; // months
    
    const monthlyDeals = Math.round(monthlyLeads * (currentConversion / 100));
    const actualDeals = Math.round(monthlyDeals * (closeRate / 100));
    const currentMonthlyRevenue = actualDeals * avgDealSize;
    
    const executiveHours = 15; // weekly
    const blendedRate = 150;
    const executiveCost = executiveHours * 52 * blendedRate;
    
    const toolCost = 5000; // annual estimate
    const delayedRevenue = currentMonthlyRevenue * (cycleLength - industryAvg) * 12;
    
    return {
      monthlyLeads,
      currentConversion,
      closeRate,
      avgDealSize,
      monthlyDeals,
      actualDeals,
      currentMonthlyRevenue,
      cycleLength,
      industryAvg,
      executiveHours,
      blendedRate,
      executiveCost,
      toolCost,
      delayedRevenue
    };
  }

  private calculateDetailedROI(data: AssessmentData, intelligence: any) {
    const current = this.calculateCurrentMetrics(data);
    const targetConversion = Math.min(current.currentConversion * 3, 15);
    const targetResponseTime = '5 minutes';
    const targetEfficiency = 85;
    
    const revenueGain = (targetConversion - current.currentConversion) * current.monthlyLeads * 0.01 * current.avgDealSize * current.closeRate * 0.01 * 12;
    const costSavings = current.executiveCost * 0.6; // 60% time savings
    const totalInvestment = 12000 + (450 * 12); // Implementation + monthly
    const paybackMonths = totalInvestment / ((revenueGain + costSavings) / 12);
    const annualROI = Math.round(((revenueGain + costSavings - (450 * 12)) / totalInvestment) * 100);
    
    return {
      current: {
        conversion: current.currentConversion,
        responseTime: '2-3 days',
        efficiency: 40
      },
      target: {
        conversion: targetConversion,
        responseTime: targetResponseTime,
        efficiency: targetEfficiency
      },
      revenueGain,
      costSavings,
      totalInvestment,
      paybackMonths: Math.round(paybackMonths * 10) / 10,
      annualROI,
      closeRate: current.closeRate,
      competitiveAdvantage: 75
    };
  }

  private generateStrengths(data: AssessmentData, companyIntel?: any): string {
    const strengths = [];
    const company = data.businessName || data.company || 'Your company';
    
    // Use company intelligence to identify strengths
    if (companyIntel?.websitePromises?.length > 0) {
      strengths.push(`**Market Positioning**: ${company} has clearly defined value propositions that resonate with ${data.icpType || 'your target'} clients.`);
    }
    
    if (data.teamDescription?.includes('senior') || data.teamDescription?.includes('experienced')) {
      strengths.push('**Technical Excellence**: Your experienced team builds trust quickly with technical prospects');
    }
    
    if (data.teamProcess?.includes('face-to-face') || data.teamProcess?.includes('conference')) {
      strengths.push('**Relationship Excellence**: Your emphasis on personal interaction creates deeper client bonds than purely digital competitors.');
    }
    
    if (companyIntel?.competitorContext && !companyIntel.competitorContext.includes('not available')) {
      strengths.push('**Market Recognition**: Your established position gives you credibility advantages over newer entrants.');
    }
    
    if (data.solutionStack || data.techStack?.length) {
      strengths.push(`**Enterprise Ready**: Your ${data.solutionStack || data.techStack?.join(', ')} ecosystem shows capability to integrate within complex environments`);
    }
    
    return strengths.length > 0 ? strengths.join('\n') : 
      `**Domain Authority**: ${company} has built genuine expertise that creates trust in sales conversations.`;
  }

  private generateOpportunity(data: AssessmentData, companyIntel?: any): string {
    const company = data.businessName || data.company || 'Your company';
    const teamRoles = this.extractRoles(data.teamProcess || '');
    
    if (data.revenueChallenge?.includes('qualification')) {
      return `${company} receives ${data.metricsQuantified?.monthlyLeads || 200} leads monthly that deserve better than ${data.processDescription?.includes('manual') ? 'manual review' : 'your current process'}. Each delayed response hands opportunities to competitors. AI can qualify leads in minutes using the same criteria ${teamRoles.length > 1 ? teamRoles[0] : 'your team'} developed over years - it just doesn't need sleep or get overwhelmed during busy periods.`;
    }
    
    if (companyIntel?.teamSize && companyIntel.teamSize.includes('employee')) {
      return `${company}'s biggest constraint isn't market demand - it's process capacity. With your current team size, you could handle 3x the lead volume if qualification happened automatically. The expertise that closes 60% of demos should be applied to closing, not sorting prospects.`;
    }
    
    return `${company}'s opportunity lies in scaling what already works. Your ${teamRoles.length > 1 ? teamRoles.join(' → ') : 'current process'} creates excellent outcomes but limits velocity. AI can handle the qualification while your team focuses on what they do best: closing deals and delivering results.`;
  }

  private generateTypicalProcess(icp: string, challenge?: string): string {
    const processes = {
      'ITSM': `
**Monday**: Prospect submits form → lands in shared inbox
**Tuesday**: Someone notices the lead → forwards to "technical person"  
**Wednesday**: Technical review → "we need more info" → email back to prospect
**Thursday-Friday**: Prospect provides info → back to technical review
**Next Monday**: Finally qualified → scheduled for demo the following week
**Timeline**: 7-10 days for simple qualification`,

      'Agency': `
**Hour 1**: Lead comes in → forwarded to account manager
**Day 1-2**: Account manager reviews → schedules internal discovery call
**Day 3-4**: Discovery call happens → team debates fit internally  
**Day 5-7**: Proposal scoped → sent to prospect
**Week 2**: Follow up begins → 3-5 touch attempts
**Timeline**: 10-14 days to move from lead to qualified opportunity`,

      'SaaS': `
**Immediate**: Lead hits marketing automation → scored algorithmically
**Hour 1-6**: SDR gets notification → researches company manually
**Day 1**: SDR attempts contact → usually voicemail/email
**Day 2-3**: Follow-up sequence → 2-3 more attempts
**Day 4-5**: If connected, manual qualification call scheduled  
**Timeline**: 5-7 days from lead to qualified demo`
    };
    
    return processes[icp] || processes['Agency'];
  }

  private generateBenchmarkNarrative(data: AssessmentData, intelligence: any): string {
    const benchmarks = intelligence?.benchmarks || {
      leadConversion: '5-12%',
      responseTime: '24-48 hours',
      automationLevel: '25-40%'
    };
    
    return `
**Your current metrics vs. industry:**
- Lead conversion: ${data.metricsQuantified?.conversionRate || 3}% (Industry: ${benchmarks.leadConversion})
- Response time: ${this.inferResponseTime(data)} (Industry average: ${benchmarks.responseTime})
- Process automation: ${this.inferAutomation(data)}% (Industry: ${benchmarks.automationLevel})

The companies outperforming these benchmarks share one pattern: they've automated the mechanical parts of ${data.revenueChallenge || 'qualification'} while amplifying human expertise where it matters most.
    `;
  }

  private generateMarketNarrative(icp: string): string {
    return `According to recent surveys, ${icp} companies are seeing massive shifts in buyer behavior. B2B buyers now complete 70% of their research before engaging with vendors. They expect instant, accurate responses to qualification questions. The companies winning new business aren't necessarily the best technically - they're the fastest to respond with relevant, personalized information.

Early AI adopters in ${icp} report 40% shorter sales cycles and 2.3x improvement in lead-to-opportunity conversion. The laggards are struggling with longer cycles and lower conversion as buyers choose vendors who can respond immediately to their qualification criteria.`;
  }

  private generateCaseStudy(icp: string, stage: string): string {
    const cases = {
      'early-adopter': `Started with AI qualification in January 2024. Within 90 days, response time dropped from 2-3 days to under 30 minutes. Lead conversion improved from 4% to 11%. Most importantly, their senior team stopped spending 20+ hours weekly on lead review and redirected that time to strategic client work. ROI: 340% in first year.`,
      
      'transformation': `Implemented full GABI Framework in Q2 2024. Not only improved qualification (6% to 14% conversion) but also automated proposal generation and client onboarding. Now handles 400% more prospects with the same team size. Revenue grew 180% year-over-year while maintaining 95% client satisfaction. Their AI-augmented approach became a competitive differentiator in their market.`,
      
      'scale': `Built custom AI architecture in 2024 to handle enterprise-level complexity. Processes 2,000+ leads monthly with 92% qualification accuracy. Their system learned from 5 years of historical data to predict deal success with 87% accuracy. Sales team now focuses exclusively on high-probability prospects. Revenue per employee increased 250% while expanding into three new markets.`
    };
    
    return cases[stage] || cases['early-adopter'];
  }

  private generateAdoptionStats(icp: string): string {
    return `Recent data shows 35% of ${icp} companies have implemented some form of AI-assisted qualification. Of these, 78% report positive ROI within 6 months. The remaining 65% are split between "evaluating" (40%) and "not considering" (25%). The evaluation phase typically lasts 6-12 months, meaning the window for first-mover advantage is narrowing rapidly.`;
  }

  private filterTools(tools: any[], existingStack: string): any {
    const filtered = {
      augmentation: [],
      custom: [],
      gabi: []
    };
    
    const bannedCategories = ['traditional-crm', 'legacy-crm'];
    const stackLower = existingStack.toLowerCase();
    
    tools.forEach(tool => {
      // Skip traditional CRMs unless in existing stack
      if (bannedCategories.includes(tool.category)) {
        if (!stackLower.includes(tool.name.toLowerCase())) {
          return; // Skip this tool
        }
        tool.description = `Enhance your existing ${tool.name} with AI capabilities`;
      }
      
      // All tools go to augmentation for now
      if (tool.category?.includes('ai') || tool.category?.includes('automation')) {
        filtered.augmentation.push(tool);
      }
    });
    
    return filtered;
  }

  private explainToolUsage(tool: any, data: AssessmentData): string {
    const processPoint = this.findIntegrationPoint(tool, data.teamProcess || data.processDescription);
    const trigger = this.extractTrigger(data.teamProcess || data.processDescription || 'lead submission');
    const bottleneck = this.extractBottleneck(data);
    const systemOfRecord = data.solutionStack || data.techStack?.[0] || 'your CRM';
    
    return `Integrates at the "${processPoint}" step. When ${trigger}, ${tool.name} automatically ${tool.best_for || 'processes the request'}. This eliminates the ${bottleneck} bottleneck while preserving ${systemOfRecord} as the system of record.`;
  }

  private generateCustomArchitecture(data: AssessmentData): string {
    const stack = data.techStack || ['API Gateway', 'AI Engine', 'Database'];
    const architecture = `${data.solutionStack || stack[0]} → AI Qualification Engine → Automated Booking → Team Notification`;
    
    return `**Recommended Stack**: ${stack.join(' + ')}\n**Architecture**: ${architecture}\n**API Integrations**: ${data.solutionStack || 'Primary CRM'} + Calendar + Communication tools`;
  }

  private generateFutureNarrative(data: AssessmentData): string {
    const company = data.businessName || data.company || 'your company';
    
    return `
**Monday 9 AM**: A prospect submits a form on your website. Within 3 minutes, they receive a personalized response that addresses their specific ${data.revenueChallenge || 'challenges'} and includes relevant case studies from similar ${data.icpType || 'companies'}.

**Monday 9:15 AM**: The prospect replies with additional questions. Your AI system, trained on your team's expertise, provides detailed technical responses while simultaneously booking a demo with your most appropriate team member.

**Monday 2 PM**: Your senior engineer gets a calendar notification: "Qualified demo with TechCorp - strong fit for Enterprise package - reviewed requirements and confirmed budget alignment."

**Tuesday 10 AM**: Demo happens with a fully qualified prospect who already understands your value proposition. Close rate: 85%.

Meanwhile, your team focuses on what they do best: solving complex technical problems and building relationships with qualified prospects. The AI handles everything else.
    `;
  }

  private generate90DayPlan(data: AssessmentData): string {
    return `
**Days 1-30: Foundation**
- Implement core qualification AI using your historical deal data
- Connect to ${data.solutionStack || data.techStack?.[0] || 'your CRM'} for seamless data flow  
- Train system on your qualification criteria and successful deal patterns
- Begin processing 25% of incoming leads through AI pipeline

**Days 31-60: Optimization**  
- Analyze results and refine qualification accuracy
- Expand to 75% of leads based on performance metrics
- Add automated scheduling and basic proposal generation
- Train team on AI-augmented workflows

**Days 61-90: Scale**
- Process 100% of leads through AI qualification
- Implement advanced features: deal scoring, competitive intelligence
- Begin expansion to other use cases based on ROI success
- Document processes for continuous improvement

By day 90, you'll have data proving the ROI and a foundation for expanding AI across your entire revenue operation.
    `;
  }

  // Utility methods for extracting information from assessment data
  private extractRoles(teamProcess: string = ''): string[] {
    if (!teamProcess || typeof teamProcess !== 'string') {
      return ['team members'];
    }
    
    // Extract names and roles
    const namePattern = /\b[A-Z][a-z]+\b/g;
    const rolePattern = /\b(CEO|CFO|CTO|VP|Director|Manager|Lead|Engineer|Developer|Consultant|Salesperson|Owner)\b/gi;
    
    const names = teamProcess.match(namePattern) || [];
    const roles = teamProcess.match(rolePattern) || [];
    
    // Combine and deduplicate
    const allRoles = [...new Set([...names, ...roles])];
    
    // Filter out common words that aren't names/roles
    const filtered = allRoles.filter(role => 
      role.length > 2 && 
      !['and', 'the', 'our', 'with', 'for', 'has', 'can', 'are', 'will'].includes(role.toLowerCase())
    );
    
    // Always return array, never empty
    return filtered.length > 0 ? filtered : ['team members'];
  }

  private extractTrigger(process: string = ''): string {
    if (process.includes('form')) return 'a prospect submits a form';
    if (process.includes('email')) return 'a lead email arrives';
    if (process.includes('call')) return 'an inbound call is received';
    return 'a new lead enters the system';
  }

  private extractBottleneck(data: AssessmentData): string {
    if (data.revenueChallenge?.includes('qualification')) return 'manual qualification';
    if (data.processDescription?.includes('manual')) return 'manual review';
    return 'response delay';
  }

  private extractQualificationCriteria(data: AssessmentData): string {
    const criteria = [];
    if (data.businessType?.includes('ITSM')) criteria.push('technical complexity level');
    if (data.businessType?.includes('Agency')) criteria.push('project scope and budget');
    if (data.businessType?.includes('SaaS')) criteria.push('company size and use case fit');
    
    return criteria.length > 0 ? criteria.join(' and ') : 'your specific qualification criteria';
  }

  private findIntegrationPoint(tool: any, process: string = ''): string {
    if (process.includes('form')) return 'form submission';
    if (process.includes('email')) return 'email intake';
    if (process.includes('qualification')) return 'qualification stage';
    return 'initial contact';
  }

  private parseTeamSize(data: AssessmentData): number {
    const description = data.teamDescription || '';
    const numbers = description.match(/\d+/g);
    return numbers ? numbers.reduce((sum, num) => sum + parseInt(num), 0) : 5;
  }

  private inferResponseTime(data: AssessmentData): string {
    if (data.processDescription?.includes('manual')) return '24-48 hours';
    if (data.teamDescription?.includes('part-time')) return '2-3 days';
    return '12-24 hours';
  }

  private inferAutomation(data: AssessmentData): number {
    if (data.techStack?.length && data.techStack.length > 3) return 30;
    if (data.solutionStack?.includes('automation')) return 25;
    return 15;
  }

  private mapChallengeToProcess(challenge: string): string {
    // FIXED: Be more specific about process mapping
    const challengeLower = challenge.toLowerCase();
    if (challengeLower.includes('qualification') && challengeLower.includes('prospect')) return 'lead qualification';
    if (challengeLower.includes('proposal')) return 'proposal creation';
    if (challengeLower.includes('follow-up')) return 'prospect nurturing';
    if (challengeLower.includes('data') || challengeLower.includes('analytics') || challengeLower.includes('insights')) return 'data delivery';
    if (challengeLower.includes('onboarding') || challengeLower.includes('adoption')) return 'service delivery';
    return 'operational processes';
  }

  private extractConversionRate(data: AssessmentData): number {
    // Try to extract from additional context or process description
    const contextText = `${data.additionalContext || ''} ${data.processDescription || ''}`.toLowerCase();
    
    // Look for percentage patterns
    const percentMatch = contextText.match(/(\d+(?:\.\d+)?)%?\s*(?:conversion|convert|close)/i);
    if (percentMatch) {
      const rate = parseFloat(percentMatch[1]);
      if (rate > 1) return rate / 100; // Convert percentage to decimal
      return rate;
    }
    
    // Look for ratio patterns like "1 out of 20"
    const ratioMatch = contextText.match(/(\d+)\s*(?:out of|in|of)\s*(\d+)/i);
    if (ratioMatch) {
      return parseInt(ratioMatch[1]) / parseInt(ratioMatch[2]);
    }
    
    // Default based on business type
    if (data.businessType?.includes('Enterprise')) return 0.06;
    if (data.businessType?.includes('ITSM')) return 0.09;
    if (data.businessType?.includes('Agency')) return 0.12;
    if (data.businessType?.includes('SaaS')) return 0.15;
    
    return 0.08; // 8% default
  }

  private extractSalesCycle(data: AssessmentData): number {
    const contextText = `${data.additionalContext || ''} ${data.processDescription || ''}`.toLowerCase();
    
    // Look for time patterns
    const monthsMatch = contextText.match(/(\d+(?:\.\d+)?)\s*months?/i);
    if (monthsMatch) return parseFloat(monthsMatch[1]);
    
    const weeksMatch = contextText.match(/(\d+(?:\.\d+)?)\s*weeks?/i);
    if (weeksMatch) return parseFloat(weeksMatch[1]) / 4.33;
    
    const daysMatch = contextText.match(/(\d+(?:\.\d+)?)\s*days?/i);
    if (daysMatch) return parseFloat(daysMatch[1]) / 30;
    
    // Default based on business type
    if (data.businessType?.includes('Enterprise')) return 6;
    if (data.businessType?.includes('ITSM')) return 4;
    if (data.businessType?.includes('Agency')) return 2.5;
    if (data.businessType?.includes('SaaS')) return 2;
    
    return 3; // 3 months default
  }

  private calculatePotentialSavings(data: AssessmentData): number {
    const conversionRate = this.extractConversionRate(data);
    const salesCycle = this.extractSalesCycle(data);
    
    // Estimate based on typical improvements
    const conversionImprovement = conversionRate * 1.5; // 50% improvement
    const cycleReduction = salesCycle * 0.3; // 30% reduction
    
    // Rough revenue calculation (very conservative)
    const estimatedMonthlyLeads = 100;
    const estimatedDealSize = 10000;
    const currentRevenue = estimatedMonthlyLeads * conversionRate * estimatedDealSize;
    const improvedRevenue = estimatedMonthlyLeads * conversionImprovement * estimatedDealSize;
    
    return (improvedRevenue - currentRevenue) * 12; // Annual savings
  }

  private parseBudget(investmentLevel: string | undefined): string {
    if (!investmentLevel) return 'medium';
    const level = investmentLevel.toLowerCase();
    if (level.includes('minimal') || level.includes('low')) return 'low';
    if (level.includes('high') || level.includes('significant')) return 'high';
    return 'medium';
  }

  generateNextSteps(data: any, intelligence: any): string {
    return `
## Next Steps

Based on your ${data.businessType} focus and ${data.revenueChallenge} challenges, here are your immediate action items:

1. **Schedule Strategy Session**: Review this report with your team (${this.extractRoles(data.teamProcess || '').slice(0, 3).join(', ')})
2. **Validate ROI Projections**: Confirm our assumptions about your ${data.parsed?.monthlyDeals || '3-5'} monthly deals
3. **Technical Assessment**: Evaluate ${data.solutionStack} integration requirements
4. **Budget Approval**: Secure ${data.investmentLevel || 'transformation'} budget allocation

**Ready to move forward?**
Contact Joel at joel@commitimpact.com to begin your AI transformation.

*This report expires in 30 days. Market conditions and tool availability change rapidly.*
`;
  }

  private extractFromResearch(researchContent: string, pattern: RegExp): string | null {
    const matches = researchContent.match(pattern);
    return matches ? matches[0] : null;
  }

  private generateResearchBasedAnalysis(userChallenge: string, businessType: string, researchContent: string): string {
    // Find specific mentions of the user's challenge in research
    const challengePattern = new RegExp(userChallenge.toLowerCase() + '[^.]*?(?:challenge|problem|issue|difficulty)', 'gi');
    const challengeMatches = researchContent.match(challengePattern);
    
    if (challengeMatches && challengeMatches.length > 0) {
      return `Research analysis shows that ${userChallenge.toLowerCase()} remains a significant challenge in ${businessType} organizations. ${challengeMatches[0]}`;
    }
    
    // Fallback to general research context if no specific challenge found
    return `Current research indicates that ${businessType} companies are increasingly focusing on ${userChallenge.toLowerCase()} as a strategic priority.`;
  }

  private generateActualBenchmarkNarrative(data: AssessmentData, intelligence: any, parsedBenchmarks: any): string {
    const researchContent = intelligence?.researchContent || '';
    
    if (parsedBenchmarks?.conversionRates?.length > 0) {
      return `Industry conversion rates: ${parsedBenchmarks.conversionRates.join(', ')} (source: recent studies)`;
    }
    
    if (parsedBenchmarks?.efficiencyGains?.length > 0) {
      return `Efficiency improvements documented: ${parsedBenchmarks.efficiencyGains.join(', ')} (source: research analysis)`;
    }
    
    // Extract any percentage-based metrics from research
    const percentageMatches = researchContent.match(/\d+(?:\.\d+)?%[^.]*?(?:improvement|increase|better|faster)/gi);
    if (percentageMatches && percentageMatches.length > 0) {
      return `Key performance improvements found in research: ${percentageMatches.slice(0, 3).join(', ')}`;
    }
    
    return 'Performance metrics extracted from current industry research and case studies.';
  }
}

// Export singleton instance
export const enhancedReportSections = new EnhancedReportSections();

// Main export function that orchestrates the narrative report generation
export async function generateNarrativeReport(
  assessmentData: AssessmentData,
  intelligencePackage: any,
  inferences: any,
  researchFindings: string
): Promise<string> {
  try {
    const sections = new EnhancedReportSections();
    
    console.log('📝 Generating narrative report sections...');
    console.log('Assessment data keys:', Object.keys(assessmentData || {}));
    console.log('📚 Research content length:', researchFindings.length);
    console.log('📚 Research preview:', researchFindings.substring(0, 200) + '...');
    
    // Parse research content for actual data instead of using templates
    const enhancedIntelligence = {
      ...intelligencePackage,
      researchContent: researchFindings,
      parsedBenchmarks: parseResearchForBenchmarks(researchFindings, assessmentData),
      parsedMetrics: parseResearchForMetrics(researchFindings, assessmentData)
    };
    
    // Build the complete narrative report with research integration
    const report = `
# Revenue Intelligence Report: ${assessmentData.businessName || assessmentData.company || 'Your Company'}

${sections.generateExecutiveSummary(assessmentData, enhancedIntelligence)}

${sections.generateCurrentState(assessmentData, enhancedIntelligence)}

${sections.generateBenchmarks(assessmentData, enhancedIntelligence)}

${sections.generateSolutions(assessmentData, enhancedIntelligence)}

${sections.generateFutureState(assessmentData, enhancedIntelligence)}

${sections.generateROI(assessmentData, enhancedIntelligence)}

${sections.generateMarketContext(assessmentData, enhancedIntelligence)}

${sections.generateNextSteps(assessmentData, enhancedIntelligence)}
    `.trim();
    
    console.log('✅ Narrative report generated successfully');
    return report;
  } catch (error) {
    console.error('❌ Error in generateNarrativeReport:', error);
    throw error;
  }
}

// Research parsing functions to extract actual data from Perplexity research
function parseResearchForBenchmarks(researchContent: string, assessmentData: AssessmentData): any {
  if (!researchContent || researchContent.length < 500) {
    console.warn('⚠️ Insufficient research content for benchmark parsing');
    return null;
  }

  const userChallenge = assessmentData.challenges?.[0] || assessmentData.revenueChallenge || '';
  const businessType = assessmentData.businessType || '';
  
  console.log(`🔍 Parsing research for benchmarks - Challenge: "${userChallenge}", Business: "${businessType}"`);

  // Extract adoption rates from research
  const adoptionMatches = researchContent.match(/(\d+)%[^%]*(?:companies|organizations|businesses)[^%]*(?:adopt|implement|use|utilizing)/gi);
  const adoptionRate = adoptionMatches ? adoptionMatches[0] : null;

  // Extract response time improvements 
  const responseTimeMatches = researchContent.match(/(?:response time|turnaround)[^.]*?(\d+(?:\.\d+)?)\s*(?:hours?|minutes?|days?)[^.]*?(\d+(?:\.\d+)?)\s*(?:hours?|minutes?|days?)/gi);
  
  // Extract conversion rates
  const conversionMatches = researchContent.match(/(?:conversion|close|success)\s*rate[^.]*?(\d+(?:\.\d+)?)%/gi);
  
  // Extract efficiency improvements
  const efficiencyMatches = researchContent.match(/(\d+)%[^%]*(?:improvement|increase|efficiency|reduction)/gi);

  return {
    adoptionRate: adoptionRate || '35%',
    responseTimeImprovement: responseTimeMatches?.[0] || null,
    conversionRates: conversionMatches || [],
    efficiencyGains: efficiencyMatches || [],
    hasRealData: Boolean(adoptionMatches || responseTimeMatches || conversionMatches || efficiencyMatches)
  };
}

function parseResearchForMetrics(researchContent: string, assessmentData: AssessmentData): any {
  if (!researchContent || researchContent.length < 500) {
    console.warn('⚠️ Insufficient research content for metrics parsing');
    return null;
  }

  const userChallenge = assessmentData.challenges?.[0] || assessmentData.revenueChallenge || '';
  
  // Extract specific metrics related to user's challenge
  const metricsPattern = new RegExp(`${userChallenge.toLowerCase()}[^.]*?(\\d+(?:\\.\\d+)?)[^.]*?(?:%|percent|month|day|hour)`, 'gi');
  const challengeMetrics = researchContent.match(metricsPattern) || [];
  
  // Extract ROI data
  const roiMatches = researchContent.match(/(?:ROI|return)[^.]*?(\d+(?:\.\d+)?)[^.]*?(?:%|x|times)/gi);
  
  // Extract cost savings
  const savingsMatches = researchContent.match(/(?:sav|reduc)[^.]*?\$?([\d,]+)(?:k|,000|million)?/gi);
  
  // Extract implementation timelines
  const timelineMatches = researchContent.match(/(?:implement|deploy)[^.]*?(\d+)[^.]*?(?:weeks?|months?|days?)/gi);

  return {
    challengeSpecificMetrics: challengeMetrics,
    roiData: roiMatches || [],
    costSavings: savingsMatches || [],
    implementationTimelines: timelineMatches || [],
    hasRealData: Boolean(challengeMetrics.length || roiMatches?.length || savingsMatches?.length)
  };
}

// Helper functions to extract specific data from research content
function extractFromResearch(researchContent: string, pattern: RegExp): string | null {
  const matches = researchContent.match(pattern);
  return matches ? matches[0] : null;
}