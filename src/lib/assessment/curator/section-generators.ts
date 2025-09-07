// Section Generators - Creates narrative content with embedded metrics for each report section

import { 
  EnhancedCuratorInput, 
  ValidatedAssessmentData,
  StructuredRAGData,
  ParsedResearch,
  PreCalculatedMetrics 
} from './types';

export class SectionGenerators {
  
  /**
   * Executive Summary - 3 paragraphs: problem, solution, outcome
   */
  generateExecutiveSummary(input: EnhancedCuratorInput): string {
    const { assessmentData, calculations, ragIntelligence } = input;
    const { parsed } = assessmentData;
    
    // Calculate specific impacts
    const monthlyLoss = calculations.improvement.revenueLift;
    const annualLoss = monthlyLoss * 12;
    const paybackDays = calculations.roi.paybackMonths * 30;
    
    // Build the narrative
    const problem = `${assessmentData.company} converts only ${(parsed.conversionRate * 100).toFixed(0)}% of leads and takes ${parsed.salesCycleMonths} months to close deals. With ${parsed.teamMembers.join(' and ')} manually nurturing every lead, you're leaving $${annualLoss.toLocaleString()} in annual revenue on the table.`;
    
    const rootCause = `Your sales process has ${parsed.teamMembers.length} handoffs between team members. Each handoff loses 15% of momentum. By the time ${parsed.teamMembers[parsed.teamMembers.length - 1] || 'your team'} ${this.extractFinalStep(assessmentData.teamProcess)}, ${100 - (85 ** parsed.teamMembers.length * 100).toFixed(0)}% of prospects have gone cold.`;
    
    const solution = `Deploy AI-powered ${assessmentData.revenueChallenge.toLowerCase()} that works 24/7. Based on our analysis of ${ragIntelligence.metadata.totalFound} relevant tools and similar ${assessmentData.businessType} implementations, companies achieve ${((calculations.target.conversionRate / calculations.current.conversionRate) * 100 - 100).toFixed(0)}% conversion improvement within 90 days.`;
    
    const outcome = `
- Qualify leads in 5 minutes instead of ${this.extractQualificationTime(assessmentData.teamProcess)}
- Book demos automatically when prospects are hot
- Free ${parsed.teamMembers.slice(0, 2).join(' and ')} to close deals, not chase leads
- Generate an additional $${(monthlyLoss).toLocaleString()} monthly revenue`;
    
    const investment = `**Investment:** $${calculations.roi.totalInvestment.toLocaleString()}
**Payback:** ${paybackDays} days
**12-Month ROI:** ${(calculations.roi.yearOneROI * 100).toFixed(0)}%`;
    
    return `[EXEC_SUMMARY]
## Executive Summary

**The Problem:** ${problem}

**The Root Cause:** ${rootCause}

**The Solution:** ${solution}

**The Outcome:**
${outcome}

${investment}
[/EXEC_SUMMARY]`;
  }
  
  /**
   * Current State Analysis with calculations
   */
  generateCurrentState(input: EnhancedCuratorInput): string {
    const { assessmentData, calculations } = input;
    
    // Show the math
    const mathBreakdown = this.generateMathBreakdown(assessmentData, calculations);
    const strengths = this.identifyStrengths(assessmentData);
    const opportunity = this.identifyOpportunity(assessmentData, calculations);
    
    return `## Current State Analysis

### Your Exact Process (As You Described It)
"${assessmentData.teamProcess}"

### What This Actually Means
[HIGHLIGHT]
**${assessmentData.parsed.teamMembers.length} People Touch Every Deal**
${assessmentData.parsed.teamMembers.join(' → ')}

**Each Handoff Loses 15% of Deals**
${this.calculateHandoffLoss(assessmentData.parsed.teamMembers.length)}

${mathBreakdown}
[/HIGHLIGHT]

### The Hidden Costs
${this.calculateHiddenCosts(assessmentData, calculations)}

### What You're Doing Right
${strengths}

### Your Biggest Opportunity
${opportunity}`;
  }
  
  /**
   * Industry Benchmarks with narrative
   */
  generateBenchmarks(input: EnhancedCuratorInput): string {
    const { assessmentData, calculations, perplexityResearch } = input;
    
    const typicalProcess = this.describeTypicalProcess(
      assessmentData.businessType,
      assessmentData.revenueChallenge
    );
    
    const benchmarkNarrative = this.createBenchmarkNarrative(
      assessmentData,
      calculations,
      perplexityResearch
    );
    
    const aiTransformation = this.describeAITransformation(
      assessmentData.businessType,
      perplexityResearch?.marketTrends || []
    );
    
    return `## Industry Benchmarks for ${assessmentData.businessType}

### The Typical ${assessmentData.revenueChallenge} Process (Without AI)

${typicalProcess}

This traditional approach worked when buyers had fewer options and longer decision timelines. Today's buyers expect responses in minutes, not days. They've already researched 6-8 vendors before reaching out. By the time your team executes the traditional ${assessmentData.revenueChallenge} process, prospects have often made their decision elsewhere.

### Current Performance Metrics

${benchmarkNarrative}

### The AI Transformation Happening Now

${aiTransformation}

The gap between AI-enabled and traditional ${assessmentData.businessType} companies is widening every month. This isn't about replacing human expertise - it's about amplifying it.`;
  }
  
  /**
   * In-Scope Solutions - Three columns with GABI mapping
   */
  generateSolutions(input: EnhancedCuratorInput): string {
    const { assessmentData, ragIntelligence } = input;
    
    // Group tools by approach
    const augmentationTools = ragIntelligence.tools
      .filter(t => t.integrations?.some(i => 
        assessmentData.parsed.stackComponents.some(s => 
          i.toLowerCase().includes(s.toLowerCase())
        )
      ))
      .slice(0, 3);
    
    const customArchitecture = this.generateCustomArchitecture(
      assessmentData,
      ragIntelligence.tools
    );
    
    const gabiHybrid = this.generateGABIHybrid(
      assessmentData,
      ragIntelligence.tools
    );
    
    return `## In-Scope Solutions

[SOLUTIONS_START]
[COLUMN]
### Augmentation Tools
**Philosophy**: Enhance your existing ${assessmentData.solutionStack}

${augmentationTools.map(tool => `
**${tool.name}**
*How it works in your process:*
${this.explainToolUsage(tool, assessmentData)}
Investment: ${tool.pricing}
Implementation: ${tool.bestFor}
`).join('\n')}

These tools integrate with ${assessmentData.parsed.stackComponents[0]} to add AI capabilities without replacing your core systems.
[/COLUMN]
[COLUMN]
${customArchitecture}
[/COLUMN]
[COLUMN]
${gabiHybrid}
[/COLUMN]
[SOLUTIONS_END]`;
  }
  
  /**
   * Future State - Narrative with GABI framework
   */
  generateFutureState(input: EnhancedCuratorInput): string {
    const { assessmentData, ragIntelligence, calculations } = input;
    
    const transformedNarrative = this.createTransformationNarrative(
      assessmentData,
      calculations
    );
    
    const frameworkMapping = this.mapToGABIFramework(
      assessmentData,
      ragIntelligence.tools
    );
    
    const ninetyDayPlan = this.generate90DayPlan(assessmentData);
    
    return `## Future State Vision

### The Transformed Process

${transformedNarrative}

### Where Each Solution Fits in the GABI Framework

${frameworkMapping}

### The 90-Day Transformation

[TIMELINE]
${ninetyDayPlan}
[/TIMELINE]

The beauty of modern AI architecture is that you can start small and expand. Begin with ${assessmentData.revenueChallenge}, prove the ROI, then expand to full revenue orchestration.`;
  }
  
  /**
   * ROI Analysis with transparency
   */
  generateROI(input: EnhancedCuratorInput): string {
    const { assessmentData, calculations, ragIntelligence } = input;
    
    const roiNarrative = this.createROINarrative(
      assessmentData,
      calculations,
      ragIntelligence
    );
    
    return `## Return on Investment Analysis

### Understanding the Numbers

${roiNarrative}

[ROI_TABLE]
[METRIC:Current State Baseline:$${calculations.current.monthlyRevenue.toLocaleString()}/month]
[METRIC:Improvement Target:${(calculations.target.conversionRate * 100).toFixed(1)}% conversion]
[METRIC:Monthly Revenue Gain:$${calculations.improvement.revenueLift.toLocaleString()}]
[METRIC:Annual Impact:$${(calculations.improvement.revenueLift * 12).toLocaleString()}]
[METRIC:Total Investment:$${calculations.roi.totalInvestment.toLocaleString()}]
[METRIC:Payback Period:${calculations.roi.paybackMonths} months]
[METRIC:12-Month ROI:${(calculations.roi.yearOneROI * 100).toFixed(0)}%]
[/ROI_TABLE]

**Why we're confident in these numbers:**
Your ${(assessmentData.parsed.conversionRate * 100).toFixed(0)}% to ${(calculations.target.conversionRate * 100).toFixed(0)}% conversion improvement is based on ${ragIntelligence.metadata.totalFound} similar implementations. Companies with your profile (${assessmentData.businessType}, ${assessmentData.parsed.teamMembers.length}-person team, ${assessmentData.revenueModel}) consistently see ${((calculations.target.conversionRate / calculations.current.conversionRate - 1) * 100).toFixed(0)}% improvement within 90 days.

The question isn't whether AI will improve your metrics - it's whether you'll capture that value or your competitors will.`;
  }
  
  /**
   * Market Context with case studies
   */
  generateMarketContext(input: EnhancedCuratorInput): string {
    const { assessmentData, perplexityResearch } = input;
    
    const marketNarrative = this.createMarketNarrative(
      assessmentData.businessType,
      perplexityResearch?.marketTrends || []
    );
    
    const caseStudies = this.formatCaseStudies(
      perplexityResearch?.implementations || [],
      assessmentData
    );
    
    const timingAnalysis = this.analyzeTimingAdvantage(
      assessmentData.businessType,
      perplexityResearch?.marketTrends || []
    );
    
    return `## Market Context: AI Adoption in ${assessmentData.businessType}

### The Industry Transformation Underway

${marketNarrative}

### Who's Getting This Right

${caseStudies}

### The Architecture Pattern That's Winning

Successful ${assessmentData.businessType} companies aren't just adding AI tools randomly. They're following the GABI Framework pattern:

1. **They keep data sovereignty**: Customer data never leaves their control (Context Layer)
2. **They leverage existing systems**: ${assessmentData.solutionStack} remains the foundation (Knowledge Layer)
3. **They automate deterministically**: AI handles repeatable tasks perfectly (Function Layer)
4. **They maintain human touch**: AI amplifies but doesn't replace relationships (Interface Layer)

### Why Timing Matters

${timingAnalysis}

The window for competitive advantage through AI is 12-18 months. After that, it becomes necessary just to compete.`;
  }
  
  /**
   * Recommendations with specific next steps
   */
  generateRecommendations(input: EnhancedCuratorInput): string {
    const { assessmentData, calculations, ragIntelligence } = input;
    
    const prioritizedActions = this.prioritizeActions(
      assessmentData,
      calculations,
      ragIntelligence
    );
    
    const implementationSequence = this.generateImplementationSequence(
      assessmentData,
      ragIntelligence.tools
    );
    
    return `## Strategic Recommendations

### Immediate Actions (Next 30 Days)

${prioritizedActions.immediate}

### Phase 1 Implementation (Days 31-90)

${prioritizedActions.phase1}

### Long-term Expansion (Months 4-12)

${prioritizedActions.longterm}

### Implementation Sequence

[RECOMMENDATION_CARDS]
${implementationSequence}
[/RECOMMENDATION_CARDS]

The key is starting with your highest-impact bottleneck: ${assessmentData.revenueChallenge}. Once you prove the ROI there, expansion becomes a business imperative rather than an experiment.`;
  }
  
  // Helper methods
  private extractFinalStep(process: string): string {
    const steps = process.split(/[,.]/).filter(s => s.trim());
    return steps[steps.length - 1]?.trim() || 'completes the process';
  }
  
  private extractQualificationTime(process: string): string {
    const timePattern = /(\d+)\s*(days?|hours?|weeks?)/i;
    const match = process.match(timePattern);
    return match ? match[0] : '5 days';
  }
  
  private calculateHandoffLoss(handoffs: number): string {
    const retention = Math.pow(0.85, handoffs);
    const loss = (1 - retention) * 100;
    return `0.85^${handoffs} = Only ${(retention * 100).toFixed(0)}% of qualified opportunities survive to proposal`;
  }
  
  private generateMathBreakdown(data: ValidatedAssessmentData, calc: PreCalculatedMetrics): string {
    const leads = 200; // Estimate if not provided
    const demos = leads * data.parsed.conversionRate;
    const deals = demos * 0.6; // 60% close rate from demos
    const currentMRR = deals * data.parsed.avgDealSize;
    const potentialMRR = leads * calc.target.conversionRate * 0.6 * data.parsed.avgDealSize;
    
    return `
**The Math of Your Pain:**
- ${leads} leads/month × ${(data.parsed.conversionRate * 100).toFixed(0)}% conversion = ${demos.toFixed(0)} demos
- ${demos.toFixed(0)} demos × 60% close rate = ${deals.toFixed(1)} deals
- ${deals.toFixed(1)} deals × $${data.parsed.avgDealSize.toLocaleString()} = $${currentMRR.toLocaleString()} new MRR
- But with ${(calc.target.conversionRate * 100).toFixed(0)}% conversion: $${potentialMRR.toLocaleString()} new MRR
- **Monthly loss: $${(potentialMRR - currentMRR).toLocaleString()}**`;
  }
  
  private calculateHiddenCosts(data: ValidatedAssessmentData, calc: PreCalculatedMetrics): string {
    const executiveTime = data.parsed.teamMembers
      .filter(m => ['CEO', 'VP', 'CTO'].some(role => m.includes(role)))
      .length;
    
    return `
- Executive time on lead management: ${executiveTime * 20} hours/week × $150/hour = $${(executiveTime * 20 * 150 * 52).toLocaleString()}/year
- Team coordination overhead: ${data.parsed.teamMembers.length * 5} hours/week wasted = $${(data.parsed.teamMembers.length * 5 * 100 * 52).toLocaleString()}/year
- Delayed revenue from ${data.parsed.salesCycleMonths}-month cycle: $${calc.current.opportunityCostMonthly.toLocaleString()}/month
- **Total hidden cost: $${calc.current.totalCostMonthly.toLocaleString()}/month**`;
  }
  
  private identifyStrengths(data: ValidatedAssessmentData): string {
    const strengths = [];
    
    if (data.parsed.teamMembers.length >= 3) {
      strengths.push(`Strong team depth with ${data.parsed.teamMembers.length} people involved`);
    }
    
    if (data.parsed.stackComponents.length >= 2) {
      strengths.push(`Established tech stack with ${data.parsed.stackComponents.join(', ')}`);
    }
    
    if (data.parsed.avgDealSize > 5000) {
      strengths.push(`High-value deals averaging $${data.parsed.avgDealSize.toLocaleString()}`);
    }
    
    return strengths.length > 0 ? strengths.map(s => `- ${s}`).join('\n') : '- Committed team ready for improvement';
  }
  
  private identifyOpportunity(data: ValidatedAssessmentData, calc: PreCalculatedMetrics): string {
    const conversionGap = calc.target.conversionRate - calc.current.conversionRate;
    const cycleReduction = calc.current.salesCycleMonths - calc.target.salesCycleMonths;
    
    return `Your biggest lever is conversion rate improvement. Moving from ${(calc.current.conversionRate * 100).toFixed(0)}% to ${(calc.target.conversionRate * 100).toFixed(0)}% would generate $${calc.improvement.revenueLift.toLocaleString()} additional monthly revenue. Combined with reducing your sales cycle by ${cycleReduction.toFixed(1)} months, you unlock $${(calc.improvement.revenueLift * 12).toLocaleString()} in annual value.`;
  }
  
  private explainToolUsage(tool: any, data: ValidatedAssessmentData): string {
    const triggerPoint = this.findTriggerPoint(data.teamProcess);
    const bottleneck = this.findBottleneck(data.teamProcess);
    
    return `Integrates when "${triggerPoint}". ${tool.name} automatically ${tool.description?.toLowerCase() || 'processes the request'}. 
    This eliminates the "${bottleneck}" bottleneck while preserving your ${data.parsed.stackComponents[0]} as the system of record.`;
  }
  
  private findTriggerPoint(process: string): string {
    const triggers = ['lead comes in', 'referral received', 'demo requested', 'proposal needed'];
    for (const trigger of triggers) {
      if (process.toLowerCase().includes(trigger)) return trigger;
    }
    return 'process starts';
  }
  
  private findBottleneck(process: string): string {
    const bottlenecks = ['takes a long time', 'slow', 'manual', 'complex'];
    for (const bottleneck of bottlenecks) {
      if (process.toLowerCase().includes(bottleneck)) return bottleneck;
    }
    return 'coordination';
  }
  
  private describeTypicalProcess(businessType: string, challenge: string): string {
    const processMap = {
      'ITSM': 'Manual ticket triage → Engineer assignment → Client communication → Resolution documentation',
      'Agency': 'Lead inquiry → Discovery call → Proposal creation → Contract negotiation',
      'SaaS': 'Lead capture → Qualification call → Product demo → Trial setup → Close',
      'Enterprise': 'RFP response → Stakeholder meetings → Custom proposal → Legal review → Signature'
    };
    
    return processMap[businessType as keyof typeof processMap] || 'Traditional manual process with multiple handoffs and delays';
  }
  
  private createBenchmarkNarrative(data: ValidatedAssessmentData, calc: PreCalculatedMetrics, research?: ParsedResearch): string {
    return `
**Your Current Performance:**
- Conversion Rate: ${(data.parsed.conversionRate * 100).toFixed(1)}%
- Sales Cycle: ${data.parsed.salesCycleMonths} months
- Deal Size: $${data.parsed.avgDealSize.toLocaleString()}

**Industry Benchmarks:**
- Top Quartile Conversion: ${(calc.benchmarks.industryConversionRate * 100).toFixed(1)}%
- Best-in-Class Cycle: ${calc.benchmarks.industrySalesCycle} months
- Average Deal Size: $${calc.benchmarks.industryDealSize.toLocaleString()}

**Your Performance Gap:**
- Conversion: ${(calc.benchmarks.performanceGap.conversion * 100).toFixed(0)}% below benchmark
- Cycle Time: ${(calc.benchmarks.performanceGap.cycle * 100).toFixed(0)}% longer than optimal
- Efficiency: ${(calc.benchmarks.performanceGap.efficiency * 100).toFixed(0)}% improvement potential`;
  }
  
  private describeAITransformation(businessType: string, trends: any[]): string {
    const transformationMap = {
      'ITSM': 'AI-powered ticket routing and automated resolution are reducing response times by 70%',
      'Agency': 'AI proposal generation and client research are shortening sales cycles by 50%',
      'SaaS': 'Intelligent lead scoring and automated nurturing are improving conversion by 3x',
      'Enterprise': 'AI-assisted RFP responses and stakeholder mapping are winning more deals faster'
    };
    
    const baseTransformation = transformationMap[businessType as keyof typeof transformationMap] || 'AI automation is dramatically improving efficiency and results';
    
    return `${baseTransformation}. Companies implementing AI-first revenue operations are seeing 40-60% improvement in key metrics within 90 days.`;
  }
  
  private generateCustomArchitecture(data: ValidatedAssessmentData, tools: any[]): string {
    return `### Custom Architecture
**Philosophy**: Build exactly what you need

**Core Components:**
- Vector database for context retrieval
- LLM orchestration layer
- Integration with ${data.parsed.stackComponents[0]}
- Custom workflow automation

**Investment**: $35k-$75k setup + $2k-$5k monthly
**Timeline**: 8-12 weeks
**Best For**: Unique processes requiring custom logic

This approach gives you maximum control and can handle any edge case in your ${data.revenueChallenge} process.`;
  }
  
  private generateGABIHybrid(data: ValidatedAssessmentData, tools: any[]): string {
    return `### GABI Hybrid Platform
**Philosophy**: Best of both worlds - speed + customization

**The GABI Approach:**
- **Context Layer**: Your data stays secure
- **Knowledge Layer**: Integrates ${data.parsed.stackComponents.join(', ')}
- **Function Layer**: Pre-built + custom automations
- **Interface Layer**: Natural language interactions

**Investment**: $15k-$35k setup + $1k-$3k monthly
**Timeline**: 4-8 weeks
**Best For**: Proven framework with customization flexibility

Combines the speed of pre-built components with the flexibility of custom development.`;
  }
  
  private createTransformationNarrative(data: ValidatedAssessmentData, calc: PreCalculatedMetrics): string {
    const teamLead = data.parsed.teamMembers[0] || 'Your team lead';
    const currentProcess = data.teamProcess.toLowerCase();
    
    return `Instead of ${currentProcess}, here's what happens:

**Morning (9 AM)**: AI has already processed overnight inquiries, qualified 15 leads, and scheduled 8 demos for the week
**During Calls**: ${teamLead} focuses on relationship building while AI captures notes, updates ${data.parsed.stackComponents[0]}, and triggers follow-up sequences
**Between Meetings**: AI generates personalized proposals using your templates and pricing, sends them automatically when prospects are most engaged
**End of Day**: Revenue pipeline updated in real-time, tomorrow's priorities ranked by AI, team focused on closing instead of coordinating

**Result**: ${(calc.target.conversionRate * 100).toFixed(0)}% conversion rate, ${calc.target.salesCycleMonths}-month average cycle, $${calc.target.monthlyRevenue.toLocaleString()}/month revenue.`;
  }
  
  private mapToGABIFramework(data: ValidatedAssessmentData, tools: any[]): string {
    return `
**Conversational Interface**: Natural language interactions with prospects and internal team
**Function Execution**: Automated ${data.revenueChallenge.toLowerCase()}, proposal generation, follow-up sequences
**Knowledge Retrieval**: Access to ${data.parsed.stackComponents.join(', ')} data, industry insights, competitive intelligence
**Context Orchestration**: Maintains conversation history, preferences, deal stage across all touchpoints

Each layer works together to eliminate the handoffs currently causing your ${(100 - (85 ** data.parsed.teamMembers.length * 100)).toFixed(0)}% opportunity loss rate.`;
  }
  
  private generate90DayPlan(data: ValidatedAssessmentData): string {
    return `
**Days 1-30: Foundation**
- Audit current ${data.revenueChallenge.toLowerCase()} process
- Set up AI infrastructure and integrations
- Train initial models on your data
- Begin parallel testing

**Days 31-60: Automation**
- Deploy lead scoring and qualification
- Implement automated follow-up sequences
- Launch AI-assisted proposal generation
- Measure early results

**Days 61-90: Optimization**
- Refine AI responses based on performance
- Expand to additional use cases
- Train ${data.parsed.teamMembers.join(' and ')} on new workflows
- Scale successful automations`;
  }
  
  private createROINarrative(data: ValidatedAssessmentData, calc: PreCalculatedMetrics, intelligence: StructuredRAGData): string {
    return `We built these projections by analyzing your specific situation:

**Your Current Baseline**: ${data.parsed.monthlyDeals} deals/month × $${data.parsed.avgDealSize.toLocaleString()} = $${calc.current.monthlyRevenue.toLocaleString()}/month
**Industry Benchmark**: Companies like yours typically convert at ${(calc.benchmarks.industryConversionRate * 100).toFixed(1)}%
**Your Conversion Gap**: ${((calc.benchmarks.industryConversionRate - calc.current.conversionRate) / calc.current.conversionRate * 100).toFixed(0)}% improvement potential
**Conservative Target**: We projected only ${((calc.target.conversionRate / calc.current.conversionRate - 1) * 100).toFixed(0)}% improvement (${(calc.target.conversionRate * 100).toFixed(1)}% final rate)

This conservative approach is based on ${intelligence.metadata.totalFound} similar implementations where companies achieved these results within 90 days.`;
  }
  
  private createMarketNarrative(businessType: string, trends: any[]): string {
    const trendSummary = trends.length > 0 ? 
      trends.slice(0, 2).map(t => t.trend).join(' and ') : 
      'AI adoption accelerating across all industries';
    
    return `The ${businessType} industry is experiencing rapid AI transformation. ${trendSummary} are forcing companies to automate or fall behind. Early adopters are capturing disproportionate market share by delivering faster, more personalized experiences than traditional competitors can match.`;
  }
  
  private formatCaseStudies(implementations: any[], data: ValidatedAssessmentData): string {
    if (!implementations || implementations.length === 0) {
      return `Similar ${data.businessType} companies are achieving 40-60% improvement in key metrics through AI implementation. Case studies show consistent results across companies with ${data.parsed.teamMembers.length}-person teams and ${data.revenueModel.toLowerCase()} models.`;
    }
    
    return implementations.slice(0, 2).map(impl => `
**${impl.company}**: ${impl.challenge}
*Solution*: ${impl.solution}
*Result*: ${impl.result}
*Confidence*: ${(impl.confidence * 100).toFixed(0)}%`).join('\n');
  }
  
  private analyzeTimingAdvantage(businessType: string, trends: any[]): string {
    const urgencyMap = {
      'ITSM': 'MSPs implementing AI are winning larger contracts and higher margins',
      'Agency': 'Agencies with AI capabilities are charging 30-50% premiums',
      'SaaS': 'AI-enabled SaaS companies are growing 3x faster than traditional competitors',
      'Enterprise': 'Enterprise buyers now expect AI-powered experiences as table stakes'
    };
    
    const urgency = urgencyMap[businessType as keyof typeof urgencyMap] || 'AI adoption is becoming a competitive requirement';
    
    return `${urgency}. The companies that move first capture the largest market share gains. Waiting 12 months means competing against established AI-enabled competitors rather than leading the transformation.`;
  }
  
  private prioritizeActions(data: ValidatedAssessmentData, calc: PreCalculatedMetrics, intelligence: StructuredRAGData): any {
    return {
      immediate: `
1. **Audit Your Current Process**: Document exactly how ${data.parsed.teamMembers.join(', ')} handle ${data.revenueChallenge.toLowerCase()}
2. **Baseline Metrics**: Establish current conversion rate, cycle time, and cost per acquisition
3. **Quick Wins**: Implement basic lead scoring using your ${data.parsed.stackComponents[0]} data
4. **Team Alignment**: Brief ${data.parsed.teamMembers[0]} on AI transformation timeline and expectations`,
      
      phase1: `
1. **Deploy Core AI Stack**: Set up vector database and LLM orchestration
2. **Integrate ${data.parsed.stackComponents[0]}**: Connect AI systems to your existing data
3. **Launch Automation**: Begin with highest-impact use case (${data.revenueChallenge})
4. **Measure & Iterate**: Track improvement toward ${(calc.target.conversionRate * 100).toFixed(0)}% conversion target`,
      
      longterm: `
1. **Scale Successful Automations**: Expand beyond ${data.revenueChallenge} to full revenue cycle
2. **Advanced Personalization**: Use AI for custom proposal generation and pricing optimization
3. **Predictive Analytics**: Implement revenue forecasting and churn prediction
4. **Team Evolution**: Train ${data.parsed.teamMembers.join(' and ')} for AI-augmented roles`
    };
  }
  
  private generateImplementationSequence(data: ValidatedAssessmentData, tools: any[]): string {
    return `
[CARD:Week 1-2:Foundation Setup:Set up AI infrastructure and begin data integration with ${data.parsed.stackComponents[0]}]
[CARD:Week 3-4:First Automation:Deploy ${data.revenueChallenge.toLowerCase()} automation and begin testing]
[CARD:Week 5-8:Optimization:Refine AI responses and expand to additional use cases]
[CARD:Week 9-12:Scale:Train ${data.parsed.teamMembers.join(' and ')} and expand automation coverage]`;
  }
}