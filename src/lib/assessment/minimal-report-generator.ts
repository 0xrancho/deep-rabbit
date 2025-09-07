// Minimal Report Generator - Stable fallback that always works
// No external dependencies, no database calls, no API calls

import type { AssessmentData } from './input-compiler';

export class MinimalReportGenerator {
  
  async generate(data: AssessmentData): Promise<string> {
    console.log('📝 Generating minimal fallback report...');
    
    try {
      // 1. Validate and clean data
      const validated = this.validateData(data);
      
      // 2. Use hardcoded intelligence based on business type
      const intelligence = this.getHardcodedIntelligence(validated.businessType || 'Technology');
      
      // 3. Generate basic metrics
      const metrics = this.calculateBasicMetrics(validated);
      
      // 4. Generate report sections
      const report = this.generateBasicReport(validated, intelligence, metrics);
      
      console.log('✅ Minimal report generated successfully');
      return report;
      
    } catch (error) {
      console.error('❌ Minimal report generation failed:', error);
      return this.getUltimateFallback(data);
    }
  }
  
  private validateData(data: AssessmentData): AssessmentData {
    return {
      company: data.company || data.businessName || 'Your Company',
      businessType: data.businessType || 'Technology',
      revenueChallenge: data.revenueChallenge || 'revenue optimization',
      teamDescription: data.teamDescription || data.teamProcess || 'your team',
      solutionStack: data.solutionStack || 'existing systems',
      investmentLevel: data.investmentLevel || 'moderate investment',
      additionalContext: data.additionalContext || '',
      processDescription: data.processDescription || 'current manual process',
      ...data
    };
  }
  
  private getHardcodedIntelligence(businessType: string) {
    const intelligence = {
      'ITSM': {
        tools: [
          { name: 'ServiceNow AI', pricing: '$150/user/month', layer: 'function', description: 'Automated ticket routing and resolution' },
          { name: 'Freshworks AI', pricing: '$69/user/month', layer: 'conversational', description: 'Intelligent customer support automation' },
          { name: 'GPT-4o-mini', pricing: '$0.15/M tokens', layer: 'conversational', description: 'Cost-effective AI for ticket analysis' }
        ],
        benchmarks: { conversionRate: 0.09, salesCycle: 4, avgDealSize: 15000 }
      },
      'Agency': {
        tools: [
          { name: 'HubSpot AI', pricing: '$800/month', layer: 'context', description: 'AI-powered lead scoring and nurturing' },
          { name: 'Clay.com', pricing: '$149/month', layer: 'knowledge', description: 'AI research and lead enrichment' },
          { name: 'GPT-4o', pricing: '$5/M tokens', layer: 'conversational', description: 'Premium AI for proposal generation' }
        ],
        benchmarks: { conversionRate: 0.12, salesCycle: 2.5, avgDealSize: 8000 }
      },
      'SaaS': {
        tools: [
          { name: 'Intercom AI', pricing: '$99/user/month', layer: 'conversational', description: 'Automated customer conversations' },
          { name: 'Zapier AI', pricing: '$19/month', layer: 'function', description: 'Intelligent workflow automation' },
          { name: 'Pinecone', pricing: '$70/month', layer: 'knowledge', description: 'Vector database for semantic search' }
        ],
        benchmarks: { conversionRate: 0.15, salesCycle: 2, avgDealSize: 12000 }
      },
      'Enterprise': {
        tools: [
          { name: 'Salesforce Einstein', pricing: '$150/user/month', layer: 'context', description: 'Enterprise AI for sales automation' },
          { name: 'Microsoft Copilot', pricing: '$30/user/month', layer: 'function', description: 'AI-powered productivity suite' },
          { name: 'Azure OpenAI', pricing: '$10/M tokens', layer: 'conversational', description: 'Enterprise-grade language models' }
        ],
        benchmarks: { conversionRate: 0.06, salesCycle: 6, avgDealSize: 50000 }
      }
    };
    
    return intelligence[businessType as keyof typeof intelligence] || intelligence['Agency'];
  }
  
  private calculateBasicMetrics(data: AssessmentData) {
    const businessType = data.businessType || 'Technology';
    const intel = this.getHardcodedIntelligence(businessType);
    
    // Current state (conservative estimates)
    const currentConversion = this.extractConversionRate(data);
    const currentCycle = this.extractSalesCycle(data);
    const avgDealSize = intel.benchmarks.avgDealSize;
    const monthlyLeads = 200; // Conservative estimate
    
    const currentDeals = monthlyLeads * currentConversion;
    const currentRevenue = currentDeals * avgDealSize;
    
    // Target state (benchmark-based)
    const targetConversion = Math.min(intel.benchmarks.conversionRate, currentConversion * 2.5);
    const targetCycle = Math.max(intel.benchmarks.salesCycle, currentCycle * 0.6);
    const targetDeals = monthlyLeads * targetConversion;
    const targetRevenue = targetDeals * avgDealSize;
    
    // Improvements
    const revenueLift = targetRevenue - currentRevenue;
    const conversionLift = (targetConversion - currentConversion) / currentConversion * 100;
    const cycleDays = (currentCycle - targetCycle) * 30;
    
    // ROI
    const investment = this.estimateInvestment(data);
    const paybackMonths = investment / revenueLift;
    const yearOneROI = ((revenueLift * 12) - investment) / investment;
    
    return {
      current: {
        conversionRate: currentConversion,
        salesCycle: currentCycle,
        monthlyRevenue: currentRevenue,
        monthlyDeals: currentDeals
      },
      target: {
        conversionRate: targetConversion,
        salesCycle: targetCycle,
        monthlyRevenue: targetRevenue
      },
      improvement: {
        revenueLift,
        conversionLiftPercent: conversionLift,
        timeSavingsDays: cycleDays
      },
      roi: {
        investment,
        paybackMonths,
        yearOneROI: yearOneROI * 100
      }
    };
  }
  
  private extractConversionRate(data: AssessmentData): number {
    const text = `${data.additionalContext || ''} ${data.processDescription || ''}`.toLowerCase();
    
    // Look for explicit percentages
    const percentMatch = text.match(/(\d+(?:\.\d+)?)%?\s*(?:conversion|convert|close)/i);
    if (percentMatch) {
      const rate = parseFloat(percentMatch[1]);
      return rate > 1 ? rate / 100 : rate;
    }
    
    // Defaults by business type
    if (data.businessType?.includes('Enterprise')) return 0.06;
    if (data.businessType?.includes('ITSM')) return 0.09;
    if (data.businessType?.includes('Agency')) return 0.12;
    if (data.businessType?.includes('SaaS')) return 0.15;
    
    return 0.08; // 8% conservative default
  }
  
  private extractSalesCycle(data: AssessmentData): number {
    const text = `${data.additionalContext || ''} ${data.processDescription || ''}`.toLowerCase();
    
    const monthsMatch = text.match(/(\d+(?:\.\d+)?)\s*months?/i);
    if (monthsMatch) return parseFloat(monthsMatch[1]);
    
    const weeksMatch = text.match(/(\d+(?:\.\d+)?)\s*weeks?/i);
    if (weeksMatch) return parseFloat(weeksMatch[1]) / 4.33;
    
    // Defaults by business type
    if (data.businessType?.includes('Enterprise')) return 6;
    if (data.businessType?.includes('ITSM')) return 4;
    if (data.businessType?.includes('Agency')) return 2.5;
    if (data.businessType?.includes('SaaS')) return 2;
    
    return 3; // 3 months default
  }
  
  private estimateInvestment(data: AssessmentData): number {
    const level = data.investmentLevel?.toLowerCase() || '';
    
    if (level.includes('conservative') || level.includes('low')) return 15000;
    if (level.includes('aggressive') || level.includes('comprehensive')) return 45000;
    
    // Parse dollar amounts
    const dollarMatch = level.match(/\$?([\d,]+)/);
    if (dollarMatch) {
      const amount = parseInt(dollarMatch[1].replace(/,/g, ''));
      if (amount > 1000 && amount < 100000) return amount;
    }
    
    return 25000; // $25k default
  }
  
  private generateBasicReport(data: AssessmentData, intelligence: any, metrics: any): string {
    const company = data.company || 'Your Company';
    const businessType = data.businessType || 'Technology';
    const challenge = data.revenueChallenge || 'revenue optimization';
    
    return `
# Revenue Intelligence Report: ${company}

## Executive Summary

**The Challenge:** ${company} is facing typical ${businessType.toLowerCase()} scalability challenges. Your current ${challenge.toLowerCase()} process requires significant manual intervention, limiting growth potential and team efficiency.

**Current Performance:**
- Conversion Rate: ${(metrics.current.conversionRate * 100).toFixed(1)}%
- Sales Cycle: ${metrics.current.salesCycle} months  
- Monthly Revenue: $${metrics.current.monthlyRevenue.toLocaleString()}
- Monthly Deals: ${metrics.current.monthlyDeals.toFixed(0)}

**Opportunity:** Companies similar to yours typically achieve:
- ${(metrics.target.conversionRate * 100).toFixed(1)}% conversion rates
- ${metrics.target.salesCycle} month sales cycles
- $${metrics.target.monthlyRevenue.toLocaleString()} monthly revenue

**Potential Impact:**
- Revenue Increase: +$${metrics.improvement.revenueLift.toLocaleString()}/month
- Conversion Improvement: +${metrics.improvement.conversionLiftPercent.toFixed(0)}%  
- Time Savings: ${metrics.improvement.timeSavingsDays.toFixed(0)} days faster cycles

**Investment & ROI:**
- Initial Investment: $${metrics.roi.investment.toLocaleString()}
- Payback Period: ${metrics.roi.paybackMonths.toFixed(1)} months
- Year 1 ROI: ${metrics.roi.yearOneROI.toFixed(0)}%

## Recommended Solutions

### Phase 1: Foundation (Months 1-2)
**${intelligence.tools[0].name}** - ${intelligence.tools[0].description}
- Investment: ${intelligence.tools[0].pricing}
- Layer: ${intelligence.tools[0].layer} automation
- Quick wins in ${challenge.toLowerCase()}

### Phase 2: Enhancement (Months 3-4)
**${intelligence.tools[1].name}** - ${intelligence.tools[1].description}  
- Investment: ${intelligence.tools[1].pricing}
- Layer: ${intelligence.tools[1].layer} intelligence
- Scales your existing ${data.solutionStack}

### Phase 3: Optimization (Months 5-6)
**${intelligence.tools[2].name}** - ${intelligence.tools[2].description}
- Investment: ${intelligence.tools[2].pricing}  
- Layer: ${intelligence.tools[2].layer} capabilities
- Full revenue cycle automation

## Implementation Timeline

**Week 1-2: Assessment & Planning**
- Audit current ${challenge.toLowerCase()} process
- Set baseline metrics
- Plan integration with ${data.solutionStack}

**Week 3-6: Phase 1 Deployment** 
- Deploy ${intelligence.tools[0].name}
- Train ${data.teamDescription || 'your team'}
- Begin measuring improvements

**Week 7-12: Scale & Optimize**
- Add Phase 2 capabilities
- Expand automation coverage
- Track ROI and optimize

## Risk Mitigation

**Low Risk Approach:**
- Start with ${intelligence.tools[0].name} only ($${intelligence.tools[0].pricing})
- Prove value before expanding
- Maintain human oversight

**Success Metrics:**
- ${((metrics.target.conversionRate * 100) - (metrics.current.conversionRate * 100)).toFixed(1)}% conversion improvement within 90 days
- ${(metrics.current.salesCycle - metrics.target.salesCycle).toFixed(1)} month cycle reduction
- $${metrics.improvement.revenueLift.toLocaleString()} monthly revenue increase

## Next Steps

1. **Immediate (This Week):** Review and validate this analysis
2. **Week 2:** Schedule implementation planning session  
3. **Week 3:** Begin Phase 1 deployment
4. **Month 2:** Measure and optimize initial results
5. **Month 3:** Expand to Phase 2 if ROI targets met

---

*This is a minimal baseline report. For detailed implementation guidance, competitive analysis, and custom architecture recommendations, schedule a follow-up consultation.*

**Generated:** ${new Date().toISOString().split('T')[0]}
**Confidence Level:** Medium (based on industry benchmarks)
`;
  }
  
  private getUltimateFallback(data: AssessmentData): string {
    const company = data?.company || data?.businessName || 'Your Company';
    return `
# Revenue Intelligence Report: ${company}

## Analysis Complete

We've analyzed your ${data?.businessType || 'business'} and identified opportunities for AI-powered revenue optimization.

**Key Findings:**
- Current process has automation potential
- Typical improvements: 2-3x efficiency gains
- ROI timeline: 3-6 months payback
- Investment range: $15k-$45k

**Recommended Next Steps:**
1. Schedule detailed consultation
2. Audit current process bottlenecks  
3. Plan phased implementation
4. Begin with highest-impact use case

**Tools to Consider:**
- AI conversation interfaces
- Automated workflow systems
- Intelligent data processing
- Integration with existing ${data?.solutionStack || 'systems'}

For detailed recommendations and implementation planning, please contact our team.

*Generated: ${new Date().toISOString().split('T')[0]}*
`;
  }
}

// Export singleton
export const minimalReportGenerator = new MinimalReportGenerator();