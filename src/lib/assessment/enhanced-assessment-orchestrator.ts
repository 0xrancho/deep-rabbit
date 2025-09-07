// Enhanced Assessment Orchestrator with Progressive Narrowing
// Implements the refined 7-tier assessment flow for surgical precision

import { ENHANCED_ICP_DEFINITIONS, type ICPDefinition, type OpportunityArea } from './enhanced-icp-definitions';
import { REVENUE_CHALLENGE_AREAS, OPPORTUNITY_AREA_TO_RELEVANT_CHALLENGES, type ChallengeArea, type MetricDefinition, type ProcessStep, type ProcessBreakdown } from './metric-definitions';

export interface AssessmentContext {
  // Tier 1: ICP Selection
  selectedICP?: ICPDefinition;
  
  // Tier 2: Opportunity Area
  selectedOpportunityArea?: OpportunityArea;
  
  // Tier 2.5: Revenue Strategy
  selectedRevenueModel?: string;
  customRevenueModel?: string;
  
  // Tier 3: Challenge Area
  selectedChallengeArea?: ChallengeArea;
  
  // Tier 3.5: Specific Metric
  selectedMetric?: MetricDefinition;
  
  // Tier 4: Metric Quantification
  currentBaseline?: string;
  mainFriction?: string;
  
  // Tier 5: Process Breakdown
  processSteps?: ProcessStep[];
  processBreakdownPoint?: string;
  
  // Tier 6: Process Validation
  processValidated?: boolean;
  processRefinements?: string;
  
  // Meta
  currentTier: number;
  progressPercentage: number;
}

export class EnhancedAssessmentOrchestrator {
  
  /**
   * Tier 1: Get available ICPs
   */
  getICPOptions(): ICPDefinition[] {
    return ENHANCED_ICP_DEFINITIONS;
  }
  
  /**
   * Tier 1: Select ICP and move to opportunity areas
   */
  selectICP(icpId: string, context: AssessmentContext): AssessmentContext {
    const selectedICP = ENHANCED_ICP_DEFINITIONS.find(icp => icp.id === icpId);
    
    if (!selectedICP) {
      throw new Error(`Invalid ICP selection: ${icpId}`);
    }
    
    return {
      ...context,
      selectedICP,
      currentTier: 2,
      progressPercentage: 15
    };
  }
  
  /**
   * Tier 2: Get opportunity areas for selected ICP
   */
  getOpportunityAreas(context: AssessmentContext): OpportunityArea[] {
    if (!context.selectedICP) {
      throw new Error('No ICP selected');
    }
    
    return context.selectedICP.opportunityAreas;
  }
  
  /**
   * Tier 2: Select opportunity area and show revenue model suggestions
   */
  selectOpportunityArea(opportunityAreaId: string, context: AssessmentContext): AssessmentContext {
    if (!context.selectedICP) {
      throw new Error('No ICP selected');
    }
    
    const selectedOpportunityArea = context.selectedICP.opportunityAreas.find(
      area => area.id === opportunityAreaId
    );
    
    if (!selectedOpportunityArea) {
      throw new Error(`Invalid opportunity area: ${opportunityAreaId}`);
    }
    
    return {
      ...context,
      selectedOpportunityArea,
      currentTier: 2.5,
      progressPercentage: 25
    };
  }
  
  /**
   * Tier 2.5: Get revenue model suggestions for selected opportunity area
   */
  getRevenueModelSuggestions(context: AssessmentContext): string[] {
    if (!context.selectedOpportunityArea) {
      throw new Error('No opportunity area selected');
    }
    
    return context.selectedOpportunityArea.revenueModelSuggestions;
  }
  
  /**
   * Tier 2.5: Select revenue model and move to challenge areas
   */
  selectRevenueModel(revenueModel: string, customModel?: string, context: AssessmentContext): AssessmentContext {
    return {
      ...context,
      selectedRevenueModel: revenueModel,
      customRevenueModel: customModel,
      currentTier: 3,
      progressPercentage: 35
    };
  }
  
  /**
   * Tier 3: Get relevant challenge areas for selected opportunity area
   */
  getRelevantChallengeAreas(context: AssessmentContext): ChallengeArea[] {
    if (!context.selectedOpportunityArea) {
      throw new Error('No opportunity area selected');
    }
    
    const relevantChallengeIds = OPPORTUNITY_AREA_TO_RELEVANT_CHALLENGES[context.selectedOpportunityArea.id] || [];
    
    return REVENUE_CHALLENGE_AREAS.filter(area => 
      relevantChallengeIds.includes(area.id)
    );
  }
  
  /**
   * Tier 3: Select challenge area and move to specific metrics
   */
  selectChallengeArea(challengeAreaId: string, context: AssessmentContext): AssessmentContext {
    const selectedChallengeArea = REVENUE_CHALLENGE_AREAS.find(area => area.id === challengeAreaId);
    
    if (!selectedChallengeArea) {
      throw new Error(`Invalid challenge area: ${challengeAreaId}`);
    }
    
    return {
      ...context,
      selectedChallengeArea,
      currentTier: 3.5,
      progressPercentage: 45
    };
  }
  
  /**
   * Tier 3.5: Get metrics for selected challenge area
   */
  getMetricsForChallengeArea(context: AssessmentContext): MetricDefinition[] {
    if (!context.selectedChallengeArea) {
      throw new Error('No challenge area selected');
    }
    
    return context.selectedChallengeArea.metrics;
  }
  
  /**
   * Tier 3.5: Select specific metric and move to quantification
   */
  selectMetric(metricId: string, context: AssessmentContext): AssessmentContext {
    if (!context.selectedChallengeArea) {
      throw new Error('No challenge area selected');
    }
    
    const selectedMetric = context.selectedChallengeArea.metrics.find(metric => metric.id === metricId);
    
    if (!selectedMetric) {
      throw new Error(`Invalid metric: ${metricId}`);
    }
    
    return {
      ...context,
      selectedMetric,
      currentTier: 4,
      progressPercentage: 55
    };
  }
  
  /**
   * Tier 4: Get quantification prompts for selected metric
   */
  getQuantificationPrompts(context: AssessmentContext): { baseline: string; friction: string } {
    if (!context.selectedMetric) {
      throw new Error('No metric selected');
    }
    
    return context.selectedMetric.quantificationPrompts;
  }
  
  /**
   * Tier 4: Submit quantification responses and move to process mapping
   */
  submitQuantification(baseline: string, friction: string, context: AssessmentContext): AssessmentContext {
    return {
      ...context,
      currentBaseline: baseline,
      mainFriction: friction,
      currentTier: 5,
      progressPercentage: 70
    };
  }
  
  /**
   * Tier 5: Add process step to breakdown
   */
  addProcessStep(step: ProcessStep, context: AssessmentContext): AssessmentContext {
    const existingSteps = context.processSteps || [];
    const newStep = { ...step, sequence: existingSteps.length + 1 };
    
    return {
      ...context,
      processSteps: [...existingSteps, newStep]
    };
  }
  
  /**
   * Tier 5: Submit complete process breakdown
   */
  submitProcessBreakdown(breakdownPoint: string, context: AssessmentContext): AssessmentContext {
    return {
      ...context,
      processBreakdownPoint: breakdownPoint,
      currentTier: 6,
      progressPercentage: 85
    };
  }
  
  /**
   * Tier 6: Generate process validation summary
   */
  generateProcessValidationSummary(context: AssessmentContext): string {
    if (!context.selectedMetric || !context.processSteps || !context.currentBaseline || !context.processBreakdownPoint) {
      throw new Error('Insufficient context for process validation');
    }
    
    const metric = context.selectedMetric;
    const steps = context.processSteps;
    const totalSteps = steps.length;
    const avgTimePerStep = this.calculateAverageStepTime(steps);
    
    return `
## CURRENT STATE ANALYSIS

**Challenge:** ${context.selectedChallengeArea?.label} - ${metric.label}
**Current Performance:** ${context.currentBaseline}

**Process Workflow:**
${steps.map(step => 
  `${step.sequence}. **${step.role}** ${step.action} using ${step.tools.join(', ')} → ${step.output}`
).join('\n')}

**Total Process Steps:** ${totalSteps}
**Average Time per Step:** ${avgTimePerStep}
**Primary Bottleneck:** ${context.processBreakdownPoint}
**Friction Source:** ${context.mainFriction}

**Is this analysis accurate?**
    `.trim();
  }
  
  /**
   * Tier 6: Validate process or request refinements
   */
  validateProcess(isAccurate: boolean, refinements?: string, context: AssessmentContext): AssessmentContext {
    return {
      ...context,
      processValidated: isAccurate,
      processRefinements: refinements,
      currentTier: isAccurate ? 7 : 6,
      progressPercentage: isAccurate ? 100 : 90
    };
  }
  
  /**
   * Generate final assessment summary for solution research
   */
  generateAssessmentSummary(context: AssessmentContext): string {
    if (!this.isAssessmentComplete(context)) {
      throw new Error('Assessment not complete');
    }
    
    return `
# GABI Revenue Intelligence Assessment Summary

## Business Context
- **Company Type:** ${context.selectedICP?.label}
- **Opportunity Area:** ${context.selectedOpportunityArea?.label}
- **Revenue Model:** ${context.selectedRevenueModel}${context.customRevenueModel ? ` (${context.customRevenueModel})` : ''}

## Specific Challenge
- **Challenge Area:** ${context.selectedChallengeArea?.label}
- **Target Metric:** ${context.selectedMetric?.label}
- **Current Baseline:** ${context.currentBaseline}
- **Primary Friction:** ${context.mainFriction}

## Process Analysis
${context.processSteps?.map(step => 
  `**Step ${step.sequence}:** ${step.role} → ${step.action} → ${step.output}`
).join('\n')}

**Breakdown Point:** ${context.processBreakdownPoint}
**Validation Status:** ${context.processValidated ? 'Confirmed' : 'Needs Refinement'}
${context.processRefinements ? `**Refinements:** ${context.processRefinements}` : ''}

## Research Focus Areas
1. **Solution Type:** AI automation for ${context.selectedMetric?.label}
2. **Industry Focus:** ${context.selectedOpportunityArea?.label} optimization
3. **Integration Requirements:** ${this.extractToolsFromProcess(context.processSteps || [])}
4. **Success Metrics:** Improve ${context.selectedMetric?.label} from ${context.currentBaseline}
    `.trim();
  }
  
  /**
   * Check if assessment is complete and ready for solution research
   */
  isAssessmentComplete(context: AssessmentContext): boolean {
    return !!(
      context.selectedICP &&
      context.selectedOpportunityArea &&
      context.selectedRevenueModel &&
      context.selectedChallengeArea &&
      context.selectedMetric &&
      context.currentBaseline &&
      context.mainFriction &&
      context.processSteps &&
      context.processSteps.length > 0 &&
      context.processBreakdownPoint &&
      context.processValidated
    );
  }
  
  /**
   * Generate research query for intelligence system
   */
  generateResearchQuery(context: AssessmentContext): string {
    if (!this.isAssessmentComplete(context)) {
      throw new Error('Assessment not complete - cannot generate research query');
    }
    
    return `${context.selectedOpportunityArea!.label} companies improving ${context.selectedMetric!.label} from ${context.currentBaseline} using AI automation. Focus on ${context.mainFriction} solutions and integration with ${this.extractToolsFromProcess(context.processSteps || [])}. Target ${context.selectedRevenueModel} revenue model optimization.`;
  }
  
  // Private helper methods
  
  private calculateAverageStepTime(steps: ProcessStep[]): string {
    const timeSteps = steps.filter(step => step.timeInvested);
    
    if (timeSteps.length === 0) {
      return 'Not specified';
    }
    
    // Simple heuristic - could be made more sophisticated
    return 'Varies by step';
  }
  
  private extractToolsFromProcess(steps: ProcessStep[]): string {
    const allTools = steps.flatMap(step => step.tools);
    const uniqueTools = [...new Set(allTools)];
    
    return uniqueTools.slice(0, 5).join(', ') + (uniqueTools.length > 5 ? ', and others' : '');
  }
}

// Export singleton instance
export const enhancedAssessmentOrchestrator = new EnhancedAssessmentOrchestrator();