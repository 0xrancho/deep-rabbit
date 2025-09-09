// GABI AI Report Generation Engine
// Multi-phase report generation with confidence checking and fallbacks

import { evaluateConfidence, generateReport, type GeneratedReport } from './openai';
import { buildConfidencePrompt, buildReportPrompt } from '@/prompts';
import type { AssessmentRecord, ReportRecord } from '@/lib/supabase';
import { saveReport, loadReport } from '@/lib/supabase';

// Report generation status types
export type ReportGenerationStatus = 
  | 'initializing'
  | 'evaluating_confidence'  
  | 'researching_benchmarks'
  | 'generating_analysis'
  | 'generating_recommendations'
  | 'creating_roadmap'
  | 'calculating_roi'
  | 'assembling_report'
  | 'completed'
  | 'failed'
  | 'needs_more_info';

// Progress tracking interface
export interface ReportGenerationProgress {
  status: ReportGenerationStatus;
  progress: number; // 0-100
  message: string;
  phase_start_time?: number;
  estimated_remaining_ms?: number;
}

// Report generation result
export interface ReportGenerationResult {
  success: boolean;
  report?: ReportRecord;
  error?: string;
  needs_follow_up?: {
    questions: string[];
    gaps: string[];
  };
  generation_metadata: {
    total_time_ms: number;
    confidence_score: number;
    tokens_used: number;
    phases_completed: string[];
  };
}

// Report data types matching UI expectations
export interface ProcessedReportData {
  // Executive Summary
  readiness_score: 'High' | 'Medium' | 'Low';
  potential_savings: string;
  implementation_timeline: string;
  summary_text: string;

  // Current State  
  business_focus: string;
  primary_opportunity: string;
  key_challenges: string[];
  current_tech: string[];

  // Opportunities
  transformation_opportunities: Array<{
    title: string;
    description: string;
    impact_level: 'High' | 'Medium' | 'Low';
  }>;

  // Roadmap
  implementation_phases: Array<{
    phase: string;
    duration: string;
    objectives: string[];
    deliverables: string[];
  }>;

  // CTA customization
  cta_customization: {
    primary_message: string;
    consultation_focus: string;
    gabi_pitch: string;
  };
}

// Phase timing estimates (in milliseconds)
const PHASE_TIMINGS = {
  'evaluating_confidence': 3000,
  'researching_benchmarks': 2000,
  'generating_analysis': 8000,
  'generating_recommendations': 8000,
  'creating_roadmap': 5000,
  'calculating_roi': 4000,
  'assembling_report': 3000
};

class ReportGenerationEngine {
  private progressCallback?: (progress: ReportGenerationProgress) => void;
  private startTime: number = 0;
  private currentPhase: ReportGenerationStatus = 'initializing';

  constructor(progressCallback?: (progress: ReportGenerationProgress) => void) {
    this.progressCallback = progressCallback;
  }

  private updateProgress(
    status: ReportGenerationStatus,
    progress: number,
    message: string
  ) {
    this.currentPhase = status;
    const phase_start_time = Date.now();
    const estimated_remaining_ms = this.estimateRemainingTime(progress);

    const progressUpdate: ReportGenerationProgress = {
      status,
      progress,
      message,
      phase_start_time,
      estimated_remaining_ms
    };

    console.log(`Report Generation: ${status} (${progress}%) - ${message}`);
    
    if (this.progressCallback) {
      this.progressCallback(progressUpdate);
    }
  }

  private estimateRemainingTime(currentProgress: number): number {
    if (currentProgress >= 100) return 0;
    
    const elapsed = Date.now() - this.startTime;
    const estimated_total = elapsed / (currentProgress / 100);
    return Math.max(0, estimated_total - elapsed);
  }

  // Phase 1: Confidence Evaluation
  private async evaluateAssessmentConfidence(
    assessmentData: AssessmentRecord
  ): Promise<{ score: number; gaps: string[]; questions: string[] }> {
    this.updateProgress(
      'evaluating_confidence',
      10,
      'Evaluating assessment completeness...'
    );

    try {
      const result = await evaluateConfidence(assessmentData);
      
      return {
        score: result.score,
        gaps: result.gaps || [],
        questions: result.follow_up_questions || []
      };
    } catch (error) {
      console.error('Confidence evaluation failed:', error);
      
      // Fallback to rule-based confidence
      const score = this.calculateFallbackConfidence(assessmentData);
      return {
        score,
        gaps: score < 0.7 ? ['More detailed information needed'] : [],
        questions: []
      };
    }
  }

  // Fallback confidence calculation
  private calculateFallbackConfidence(data: AssessmentRecord): number {
    let score = 0;
    const checks = [
      { field: data.business_type, weight: 0.1 },
      { field: data.opportunity_focus, weight: 0.1 },
      { field: data.revenue_model, weight: 0.15 },
      { field: data.challenges?.length, weight: 0.15 },
      { field: data.team_description, weight: 0.15 },
      { field: data.process_description, weight: 0.25 },
      { field: data.tech_stack?.length, weight: 0.1 }
    ];

    checks.forEach(check => {
      if (check.field) {
        if (typeof check.field === 'string' && check.field.length > 10) {
          score += check.weight;
        } else if (typeof check.field === 'number' && check.field > 0) {
          score += check.weight;
        }
      }
    });

    return Math.min(score, 1);
  }

  // Phase 2: Industry Benchmarks (Mock for now)
  private async gatherBenchmarks(
    businessType: string,
    challenges: string[]
  ): Promise<any> {
    this.updateProgress(
      'researching_benchmarks',
      25,
      'Analyzing industry benchmarks...'
    );

    // Simulate research delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return mock benchmarks - in production, this could query a database
    return {
      industry: businessType,
      typical_roi: '250-400%',
      implementation_time: '3-6 months',
      success_factors: ['Clear process definition', 'Team buy-in', 'Iterative approach']
    };
  }

  // Phase 3: Generate Full Report
  private async generateFullReport(
    assessmentData: AssessmentRecord,
    benchmarks: any
  ): Promise<GeneratedReport> {
    this.updateProgress(
      'generating_analysis',
      40,
      'Generating AI analysis...'
    );

    try {
      const report = await generateReport(assessmentData);
      
      this.updateProgress(
        'generating_recommendations',
        65,
        'Creating recommendations...'
      );

      // Add benchmark data to report
      if (report.sections) {
        report.sections = {
          ...report.sections,
          benchmarks: {
            title: 'Industry Context',
            content: `Based on ${benchmarks.industry} industry analysis, typical ROI is ${benchmarks.typical_roi} with ${benchmarks.implementation_time} implementation timeline.`
          }
        };
      }

      return report;
    } catch (error) {
      console.error('Report generation failed:', error);
      throw new Error(`AI report generation failed: ${error.message}`);
    }
  }

  // Phase 4: Process report data for UI
  private processReportForUI(
    report: GeneratedReport,
    assessmentData: AssessmentRecord
  ): ProcessedReportData {
    this.updateProgress(
      'assembling_report',
      85,
      'Finalizing report format...'
    );

    // Extract key metrics for UI display
    const confidence = report.confidence_score || 0.8;
    const readiness_score = confidence > 0.8 ? 'High' : confidence > 0.6 ? 'Medium' : 'Low';

    // Parse ROI projections
    const roiSection = report.sections?.roi_projections?.content || '';
    const savingsMatch = roiSection.match(/\$[\d,]+/);
    const potential_savings = savingsMatch ? savingsMatch[0] + '+' : '$50,000+';

    // Extract implementation timeline
    const roadmapSection = report.sections?.roadmap?.content || '';
    const timelineMatch = roadmapSection.match(/(\d+)-(\d+)\s+months?/);
    const implementation_timeline = timelineMatch ? `${timelineMatch[1]}-${timelineMatch[2]} months` : '6 months';

    // Process opportunities
    const opportunities = report.sections?.opportunities?.specific_applications || [];
    const transformation_opportunities = opportunities.slice(0, 4).map((app: any) => ({
      title: app.name || 'AI Opportunity',
      description: app.description || 'Process improvement through AI',
      impact_level: app.impact === 'High' || app.effort === 'Low' ? 'High' : 'Medium'
    }));

    // Process roadmap phases
    const phases = report.sections?.roadmap?.phases || [];
    const implementation_phases = phases.slice(0, 3).map((phase: any, index: number) => ({
      phase: phase.name || `Phase ${index + 1}`,
      duration: phase.duration || `${2 + index * 2}-${4 + index * 2} weeks`,
      objectives: phase.objectives || ['Define requirements', 'Implement solution', 'Measure results'],
      deliverables: phase.deliverables || ['Documentation', 'Implementation', 'Training']
    }));

    // Customize CTAs based on investment level and business type
    const cta_customization = this.customizeCTAs(assessmentData);

    return {
      readiness_score,
      potential_savings,
      implementation_timeline,
      summary_text: report.sections?.executive_summary?.content || 'AI transformation analysis completed.',
      
      business_focus: assessmentData.business_type || 'Service Business',
      primary_opportunity: assessmentData.opportunity_focus || 'Process Optimization',
      key_challenges: assessmentData.challenges || [],
      current_tech: assessmentData.tech_stack || [],
      
      transformation_opportunities: transformation_opportunities.length > 0 
        ? transformation_opportunities 
        : this.getDefaultOpportunities(assessmentData.business_type),
      
      implementation_phases: implementation_phases.length > 0
        ? implementation_phases
        : this.getDefaultPhases(assessmentData.investment_level),
      
      cta_customization
    };
  }

  // Default opportunities if AI generation fails
  private getDefaultOpportunities(businessType?: string): ProcessedReportData['transformation_opportunities'] {
    const defaults = {
      'IT Service Management (ITSM)': [
        { title: 'Automated Ticket Routing', description: 'AI-powered ticket classification and routing', impact_level: 'High' as const },
        { title: 'Predictive Maintenance', description: 'Predict system issues before they occur', impact_level: 'Medium' as const },
        { title: 'Self-Service Portal', description: 'AI chatbot for common user queries', impact_level: 'Medium' as const },
        { title: 'Performance Analytics', description: 'Automated reporting and insights', impact_level: 'Medium' as const }
      ],
      'Custom Development': [
        { title: 'Code Generation', description: 'AI-assisted code writing and review', impact_level: 'High' as const },
        { title: 'Automated Testing', description: 'AI-powered test generation and execution', impact_level: 'High' as const },
        { title: 'Project Estimation', description: 'ML-based project scoping and timeline prediction', impact_level: 'Medium' as const },
        { title: 'Documentation Generation', description: 'Automated code and API documentation', impact_level: 'Medium' as const }
      ],
      'default': [
        { title: 'Process Automation', description: 'Automate repetitive manual tasks', impact_level: 'High' as const },
        { title: 'Intelligent Analytics', description: 'AI-powered insights and reporting', impact_level: 'Medium' as const },
        { title: 'Customer Experience', description: 'Enhanced client interactions through AI', impact_level: 'Medium' as const },
        { title: 'Predictive Modeling', description: 'Forecast outcomes and optimize resources', impact_level: 'Medium' as const }
      ]
    };

    return defaults[businessType as keyof typeof defaults] || defaults.default;
  }

  // Default implementation phases
  private getDefaultPhases(investmentLevel?: string): ProcessedReportData['implementation_phases'] {
    const phases = {
      'Quick Win': [
        { phase: 'Discovery', duration: '1-2 weeks', objectives: ['Process analysis', 'Tool selection'], deliverables: ['Assessment report', 'Implementation plan'] },
        { phase: 'Implementation', duration: '2-3 weeks', objectives: ['Setup and configuration', 'Initial testing'], deliverables: ['Deployed solution', 'User training'] },
        { phase: 'Optimization', duration: '1 week', objectives: ['Performance tuning', 'User feedback'], deliverables: ['Optimized system', 'Success metrics'] }
      ],
      'Transformation': [
        { phase: 'Planning', duration: '2-3 weeks', objectives: ['Detailed analysis', 'Architecture design'], deliverables: ['Technical specifications', 'Project plan'] },
        { phase: 'Development', duration: '8-12 weeks', objectives: ['System development', 'Integration testing'], deliverables: ['Core platform', 'Integration layers'] },
        { phase: 'Deployment', duration: '4-6 weeks', objectives: ['Production deployment', 'User training'], deliverables: ['Live system', 'Trained team'] }
      ],
      'Enterprise': [
        { phase: 'Strategy', duration: '4-6 weeks', objectives: ['Enterprise assessment', 'Strategic planning'], deliverables: ['AI strategy', 'Governance framework'] },
        { phase: 'Platform Build', duration: '12-16 weeks', objectives: ['Platform development', 'System integration'], deliverables: ['AI platform', 'Enterprise integration'] },
        { phase: 'Organization Change', duration: '8-12 weeks', objectives: ['Change management', 'Scaling'], deliverables: ['Transformed organization', 'Success measurement'] }
      ]
    };

    return phases[investmentLevel as keyof typeof phases] || phases['Transformation'];
  }

  // Customize CTAs based on assessment data
  private customizeCTAs(assessmentData: AssessmentRecord): ProcessedReportData['cta_customization'] {
    const company = assessmentData.company || 'your organization';
    const businessType = assessmentData.business_type || 'business';
    const opportunity = assessmentData.opportunity_focus || 'operations';
    const investmentLevel = assessmentData.investment_level || 'transformation';

    return {
      primary_message: `Ready to transform ${company}? Let's discuss your ${opportunity} optimization strategy.`,
      consultation_focus: `We'll dive deep into your ${businessType} processes and create a detailed ${investmentLevel.toLowerCase()} roadmap.`,
      gabi_pitch: `Deploy GABI for ${company} to run assessments like this for your own clients and prospects.`
    };
  }

  // Main report generation method
  async generateAssessmentReport(
    assessmentData: AssessmentRecord
  ): Promise<ReportGenerationResult> {
    this.startTime = Date.now();
    const phases_completed: string[] = [];

    try {
      // Phase 1: Confidence Evaluation
      const confidence = await this.evaluateAssessmentConfidence(assessmentData);
      phases_completed.push('confidence_evaluation');

      // Check if we need more information
      if (confidence.score < 0.7) {
        return {
          success: false,
          needs_follow_up: {
            questions: confidence.questions,
            gaps: confidence.gaps
          },
          generation_metadata: {
            total_time_ms: Date.now() - this.startTime,
            confidence_score: confidence.score,
            tokens_used: 0,
            phases_completed
          }
        };
      }

      // Phase 2: Gather Benchmarks
      const benchmarks = await this.gatherBenchmarks(
        assessmentData.business_type || '',
        assessmentData.challenges || []
      );
      phases_completed.push('benchmark_research');

      // Phase 3: Generate Report
      const generatedReport = await this.generateFullReport(assessmentData, benchmarks);
      phases_completed.push('report_generation');

      // Phase 4: Process for UI
      const processedData = this.processReportForUI(generatedReport, assessmentData);
      phases_completed.push('report_processing');

      // Phase 5: Save to Database
      this.updateProgress('assembling_report', 95, 'Saving report...');
      
      const reportRecord: Omit<ReportRecord, 'id'> = {
        assessment_id: assessmentData.id || '',
        report_data: {
          ...generatedReport,
          processed_data: processedData
        },
        confidence_score: confidence.score,
        generation_time_ms: Date.now() - this.startTime,
        tokens_used: generatedReport.generation_metadata?.tokens_used || 0,
        model_version: generatedReport.generation_metadata?.model_version || 'gpt-4o',
        status: 'generated'
      };

      const savedReport = await saveReport(reportRecord);
      phases_completed.push('report_saved');

      this.updateProgress('completed', 100, 'Report generation completed successfully!');

      return {
        success: true,
        report: savedReport,
        generation_metadata: {
          total_time_ms: Date.now() - this.startTime,
          confidence_score: confidence.score,
          tokens_used: generatedReport.generation_metadata?.tokens_used || 0,
          phases_completed
        }
      };

    } catch (error: any) {
      console.error('Report generation failed:', error);
      
      this.updateProgress('failed', 0, `Generation failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        generation_metadata: {
          total_time_ms: Date.now() - this.startTime,
          confidence_score: 0,
          tokens_used: 0,
          phases_completed
        }
      };
    }
  }
}

// Factory function to create report generator
export const createReportGenerator = (
  progressCallback?: (progress: ReportGenerationProgress) => void
): ReportGenerationEngine => {
  return new ReportGenerationEngine(progressCallback);
};

// Utility function to load existing report
export const loadExistingReport = async (
  assessmentId: string
): Promise<ProcessedReportData | null> => {
  try {
    const report = await loadReport(assessmentId);
    if (!report?.report_data) return null;

    // Extract processed data if available
    return report.report_data.processed_data || null;
  } catch (error) {
    console.error('Failed to load existing report:', error);
    return null;
  }
};

export default {
  createReportGenerator,
  loadExistingReport
};