// Metric Calculator - Pre-calculates all ROI and performance metrics for GPT-4o

import { ValidatedAssessmentData, PreCalculatedMetrics, ICPType } from './types';

export class MetricCalculator {
  
  // Industry benchmarks by ICP type
  private benchmarks = {
    [ICPType.ITSM]: {
      conversionRate: 0.09,
      salesCycleMonths: 4,
      avgDealSize: 15000,
      automationLevel: 0.3,
      efficiency: 0.6
    },
    [ICPType.AGENCY]: {
      conversionRate: 0.12,
      salesCycleMonths: 2.5,
      avgDealSize: 8000,
      automationLevel: 0.4,
      efficiency: 0.7
    },
    [ICPType.SAAS]: {
      conversionRate: 0.15,
      salesCycleMonths: 2,
      avgDealSize: 12000,
      automationLevel: 0.5,
      efficiency: 0.8
    },
    [ICPType.ENTERPRISE]: {
      conversionRate: 0.06,
      salesCycleMonths: 6,
      avgDealSize: 50000,
      automationLevel: 0.2,
      efficiency: 0.5
    }
  };
  
  // Cost assumptions (monthly)
  private costAssumptions = {
    avgSalaryMonthly: 8000, // $96k annual
    benefitsMultiplier: 1.3,
    overheadMultiplier: 1.5,
    toolCostPerStack: 150,
    opportunityDiscountRate: 0.15 // 15% annual
  };
  
  /**
   * Calculate all metrics for GPT-4o consumption
   */
  calculateAll(data: ValidatedAssessmentData, tools: any[] = []): PreCalculatedMetrics {
    console.log('🧮 Calculating comprehensive metrics...');
    
    const current = this.calculateCurrent(data);
    const target = this.calculateTarget(data, current);
    const improvement = this.calculateImprovement(current, target);
    const roi = this.calculateROI(data, current, target, improvement, tools);
    const benchmarks = this.getBenchmarks(data);
    
    console.log(`✅ Metrics calculated - Current Revenue: $${current.monthlyRevenue.toLocaleString()}/mo, ROI: ${(roi.yearOneROI * 100).toFixed(0)}%`);
    
    return { current, target, improvement, roi, benchmarks };
  }
  
  /**
   * Calculate current state metrics
   */
  private calculateCurrent(data: ValidatedAssessmentData) {
    const { parsed } = data;
    
    // Revenue calculations
    const monthlyRevenue = parsed.monthlyDeals * parsed.avgDealSize;
    const annualRevenue = monthlyRevenue * 12;
    
    // Cost calculations
    const teamSize = Math.max(1, parsed.teamMembers.length || this.estimateTeamSize(data.businessType));
    const baseTeamCost = teamSize * this.costAssumptions.avgSalaryMonthly;
    const teamCostMonthly = baseTeamCost * this.costAssumptions.benefitsMultiplier * this.costAssumptions.overheadMultiplier;
    
    // Tool costs
    const stackCount = Math.max(1, parsed.stackComponents.length);
    const toolCostMonthly = stackCount * this.costAssumptions.toolCostPerStack;
    
    // Opportunity cost (revenue delayed due to long sales cycle)
    const benchmarkCycle = this.getBenchmarkCycle(data.businessType);
    const cycleDelay = Math.max(0, parsed.salesCycleMonths - benchmarkCycle);
    const opportunityCostMonthly = monthlyRevenue * cycleDelay * (this.costAssumptions.opportunityDiscountRate / 12);
    
    const totalCostMonthly = teamCostMonthly + toolCostMonthly + opportunityCostMonthly;
    
    // Performance metrics
    const revenuePerEmployee = monthlyRevenue / teamSize;
    const customerAcquisitionCost = totalCostMonthly / parsed.monthlyDeals;
    
    return {
      monthlyRevenue,
      annualRevenue,
      conversionRate: parsed.conversionRate,
      salesCycleMonths: parsed.salesCycleMonths,
      teamCostMonthly,
      toolCostMonthly,
      opportunityCostMonthly,
      totalCostMonthly,
      revenuePerEmployee,
      customerAcquisitionCost
    };
  }
  
  /**
   * Calculate target state with improvements
   */
  private calculateTarget(data: ValidatedAssessmentData, current: any) {
    const icp = this.getICPType(data.businessType);
    const benchmark = this.benchmarks[icp] || this.benchmarks[ICPType.AGENCY];
    
    // Target improvements (conservative estimates)
    const targetConversionRate = Math.min(
      benchmark.conversionRate,
      current.conversionRate * 2.5 // Max 2.5x improvement
    );
    
    const targetSalesCycle = Math.max(
      benchmark.salesCycleMonths,
      current.salesCycleMonths * 0.6 // Min 40% reduction
    );
    
    const targetMonthlyRevenue = (current.monthlyRevenue / current.conversionRate) * targetConversionRate;
    const targetAnnualRevenue = targetMonthlyRevenue * 12;
    
    const efficiencyGain = benchmark.efficiency;
    const automationLevel = benchmark.automationLevel;
    
    return {
      conversionRate: targetConversionRate,
      salesCycleMonths: targetSalesCycle,
      monthlyRevenue: targetMonthlyRevenue,
      annualRevenue: targetAnnualRevenue,
      efficiencyGain,
      automationLevel
    };
  }
  
  /**
   * Calculate improvement metrics
   */
  private calculateImprovement(current: any, target: any) {
    const conversionLift = target.conversionRate - current.conversionRate;
    const conversionLiftPercent = (conversionLift / current.conversionRate) * 100;
    
    const revenueLift = target.monthlyRevenue - current.monthlyRevenue;
    const revenueLiftPercent = (revenueLift / current.monthlyRevenue) * 100;
    
    const timeSavingsMonths = current.salesCycleMonths - target.salesCycleMonths;
    const timeSavingsPercent = (timeSavingsMonths / current.salesCycleMonths) * 100;
    
    // Convert time savings to hours (assuming 40 hrs/week active selling)
    const timeSavingsHours = timeSavingsMonths * 4.33 * 40; // weeks * hours
    
    // Cost reduction from efficiency gains
    const costReduction = current.totalCostMonthly * target.efficiencyGain * target.automationLevel;
    const costReductionPercent = (costReduction / current.totalCostMonthly) * 100;
    
    // Productivity gain
    const productivityGain = target.efficiencyGain;
    
    return {
      conversionLift,
      conversionLiftPercent,
      revenueLift,
      revenueLiftPercent,
      timeSavingsHours,
      timeSavingsPercent,
      costReduction,
      costReductionPercent,
      productivityGain
    };
  }
  
  /**
   * Calculate ROI metrics
   */
  private calculateROI(
    data: ValidatedAssessmentData, 
    current: any, 
    target: any, 
    improvement: any,
    tools: any[]
  ) {
    // Investment calculation
    const setupCost = this.estimateSetupCost(data.parsed.budgetRange, tools);
    const monthlyToolCost = this.estimateMonthlyToolCost(tools);
    const trainingCost = this.estimateTrainingCost(data.parsed.teamMembers.length);
    
    const totalInvestment = setupCost + trainingCost + (monthlyToolCost * 12);
    
    // Return calculation
    const monthlyReturn = improvement.revenueLift + (improvement.costReduction);
    const annualReturn = monthlyReturn * 12;
    
    // Payback calculation
    const paybackMonths = totalInvestment / monthlyReturn;
    const breakEvenMonth = Math.ceil(paybackMonths);
    
    // ROI calculations
    const yearOneROI = ((annualReturn - totalInvestment) / totalInvestment);
    const threeYearReturn = (monthlyReturn * 36) - totalInvestment;
    const threeYearROI = threeYearReturn / totalInvestment;
    
    // IRR calculation (simplified)
    const irr = this.calculateIRR(totalInvestment, monthlyReturn, 36);
    
    // Confidence based on data quality
    const confidence = data.validation.confidence * 0.9; // Slightly conservative
    
    return {
      totalInvestment,
      monthlyReturn: monthlyReturn * confidence,
      annualReturn: annualReturn * confidence,
      paybackMonths: Math.ceil(paybackMonths / confidence),
      yearOneROI: yearOneROI * confidence,
      threeYearROI: threeYearROI * confidence,
      confidence,
      breakEvenMonth,
      irr: irr * confidence
    };
  }
  
  /**
   * Get industry benchmarks for comparison
   */
  private getBenchmarks(data: ValidatedAssessmentData) {
    const icp = this.getICPType(data.businessType);
    const benchmark = this.benchmarks[icp] || this.benchmarks[ICPType.AGENCY];
    
    const performanceGap = {
      conversion: (benchmark.conversionRate - data.parsed.conversionRate) / benchmark.conversionRate,
      cycle: (data.parsed.salesCycleMonths - benchmark.salesCycleMonths) / benchmark.salesCycleMonths,
      efficiency: 1 - benchmark.efficiency // Gap to close
    };
    
    return {
      industryConversionRate: benchmark.conversionRate,
      industrySalesCycle: benchmark.salesCycleMonths,
      industryDealSize: benchmark.avgDealSize,
      performanceGap
    };
  }
  
  /**
   * Helper methods
   */
  private getICPType(businessType: string): ICPType {
    const typeLower = businessType.toLowerCase();
    
    if (typeLower.includes('it') || typeLower.includes('service') || typeLower.includes('support')) {
      return ICPType.ITSM;
    }
    if (typeLower.includes('agency') || typeLower.includes('consulting') || typeLower.includes('marketing')) {
      return ICPType.AGENCY;
    }
    if (typeLower.includes('saas') || typeLower.includes('software') || typeLower.includes('tech')) {
      return ICPType.SAAS;
    }
    if (typeLower.includes('enterprise') || typeLower.includes('corporation')) {
      return ICPType.ENTERPRISE;
    }
    
    return ICPType.AGENCY; // Default
  }
  
  private getBenchmarkCycle(businessType: string): number {
    const icp = this.getICPType(businessType);
    return this.benchmarks[icp].salesCycleMonths;
  }
  
  private estimateTeamSize(businessType: string): number {
    const icp = this.getICPType(businessType);
    
    const teamSizes = {
      [ICPType.ITSM]: 5,
      [ICPType.AGENCY]: 3,
      [ICPType.SAAS]: 4,
      [ICPType.ENTERPRISE]: 8
    };
    
    return teamSizes[icp] || 3;
  }
  
  private estimateSetupCost(budgetRange: { min: number; max: number }, tools: any[]): number {
    // Base setup cost
    const baseSetup = 8000;
    
    // Complexity multiplier based on tools
    const complexityMultiplier = 1 + (tools.length * 0.2);
    
    // Budget-adjusted setup cost
    const avgBudget = (budgetRange.min + budgetRange.max) / 2;
    const budgetMultiplier = Math.max(0.5, Math.min(2, avgBudget / 25000)); // $25k baseline
    
    return baseSetup * complexityMultiplier * budgetMultiplier;
  }
  
  private estimateMonthlyToolCost(tools: any[]): number {
    // Estimate based on tool categories and typical pricing
    let totalCost = 0;
    
    for (const tool of tools) {
      // Parse pricing if available
      if (tool.pricing) {
        const priceMatch = tool.pricing.match(/\$?(\d+(?:,\d+)*)/);
        if (priceMatch) {
          const price = parseInt(priceMatch[1].replace(/,/g, ''));
          
          // Determine if it's monthly, annual, or per-usage
          if (tool.pricing.includes('month')) {
            totalCost += price;
          } else if (tool.pricing.includes('year')) {
            totalCost += price / 12;
          } else {
            // Usage-based - estimate monthly usage
            totalCost += Math.min(price * 100, 500); // Cap at $500/month per tool
          }
        } else {
          // No price found - use category default
          totalCost += this.getDefaultToolCost(tool.category || tool.gabiLayer);
        }
      } else {
        // No pricing info - use category default
        totalCost += this.getDefaultToolCost(tool.category || tool.gabiLayer);
      }
    }
    
    return Math.max(200, totalCost); // Minimum $200/month
  }
  
  private getDefaultToolCost(category: string): number {
    const categoryLower = category?.toLowerCase() || '';
    
    if (categoryLower.includes('ai') || categoryLower.includes('conversational')) {
      return 300; // AI tools tend to be more expensive
    }
    if (categoryLower.includes('crm') || categoryLower.includes('context')) {
      return 200;
    }
    if (categoryLower.includes('automation') || categoryLower.includes('function')) {
      return 150;
    }
    if (categoryLower.includes('data') || categoryLower.includes('knowledge')) {
      return 100;
    }
    
    return 150; // Default
  }
  
  private estimateTrainingCost(teamSize: number): number {
    // $500 per person for training
    return Math.max(1, teamSize) * 500;
  }
  
  /**
   * Simplified IRR calculation
   * Assumes equal monthly returns over the period
   */
  private calculateIRR(initialInvestment: number, monthlyReturn: number, months: number): number {
    if (monthlyReturn <= 0) return -1;
    
    // Simplified IRR approximation
    const totalReturn = monthlyReturn * months;
    const totalROI = (totalReturn - initialInvestment) / initialInvestment;
    const annualizedROI = Math.pow(1 + totalROI, 12 / months) - 1;
    
    return Math.min(2.0, Math.max(-0.5, annualizedROI)); // Cap between -50% and 200%
  }
  
  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  
  /**
   * Format percentage for display
   */
  formatPercentage(decimal: number): string {
    return (decimal * 100).toFixed(1) + '%';
  }
  
  /**
   * Get calculation summary for logging
   */
  getCalculationSummary(metrics: PreCalculatedMetrics): string {
    return `Revenue: ${this.formatCurrency(metrics.current.monthlyRevenue)}/mo → ${this.formatCurrency(metrics.target.monthlyRevenue)}/mo (+${this.formatPercentage(metrics.improvement.revenueLiftPercent / 100)}), ROI: ${this.formatPercentage(metrics.roi.yearOneROI)}, Payback: ${metrics.roi.paybackMonths}mo`;
  }
}