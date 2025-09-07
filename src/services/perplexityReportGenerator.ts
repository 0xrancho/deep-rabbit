// Perplexity-based Research Engine for GABI Assessment Reports
// Implementation of real search-based deep research with structured report synthesis

import { compileResearchTargets, inferBusinessContext, type AssessmentData, type BusinessInferences } from '@/lib/assessment/input-compiler';
import { executeResearch } from '@/lib/assessment/research-engine';
import { synthesizeReport } from '@/lib/assessment/report-synthesizer';
import { formatHTMLReport } from '@/lib/assessment/report-formatter';
import { saveReport, type ReportRecord } from '@/lib/supabase';

// Progress tracking interface
export interface PerplexityReportProgress {
  type: 'status' | 'complete' | 'error';
  message?: string;
  step?: string;
  progress?: number;
  reportHtml?: string;
  metrics?: {
    duration: number;
    researchLength: number;
    reportLength: number;
  };
}

// Report generation result
export interface PerplexityReportResult {
  success: boolean;
  reportHtml?: string;
  error?: string;
  metadata: {
    duration: number;
    researchLength: number;
    reportLength: number;
    confidence: number;
    phases: string[];
  };
}

// Main Perplexity Report Generation Engine
export class PerplexityReportGenerationEngine {
  private progressCallback?: (progress: PerplexityReportProgress) => void;
  private startTime: number = 0;

  constructor(progressCallback?: (progress: PerplexityReportProgress) => void) {
    this.progressCallback = progressCallback;
  }

  private sendProgress(progress: PerplexityReportProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  async generateReport(assessmentData: AssessmentData): Promise<PerplexityReportResult> {
    this.startTime = Date.now();
    const phasesCompleted: string[] = [];
    let researchLength = 0;
    let reportLength = 0;

    try {
      // Step 1: Analyze business context
      this.sendProgress({
        type: 'status',
        message: 'Analyzing your business context...',
        progress: 10
      });

      // SIMPLIFIED: Skip old context analysis - all context passed directly to research
      phasesCompleted.push('context_analysis');

      // Step 2: Execute SIMPLIFIED research with full context
      this.sendProgress({
        type: 'status',
        message: 'Researching with full context (no RAG interruptions)...',
        progress: 30
      });

      const researchFindings = await executeResearch(
        null, // No targets needed
        assessmentData,
        null // No inferences needed
      );
      researchLength = researchFindings.length;
      phasesCompleted.push('research_execution');

      // Step 3: SIMPLIFIED: Research already includes GPT enhancement - use as final report
      this.sendProgress({
        type: 'status',
        message: 'Formatting final report...',
        progress: 60
      });

      // SIMPLIFIED: Use research findings directly as they're already formatted by GPT
      const reportContent = researchFindings;
      phasesCompleted.push('report_synthesis');

      // Step 4: Format as HTML
      this.sendProgress({
        type: 'status',
        message: 'Formatting your personalized report...',
        progress: 80
      });

      const businessName = assessmentData.businessName || assessmentData.company || 'Your Company';
      const htmlReport = formatHTMLReport(reportContent, businessName);
      reportLength = htmlReport.length;
      phasesCompleted.push('html_formatting');

      // Step 5: Save to database (optional)
      try {
        const reportRecord: Omit<ReportRecord, 'id'> = {
          assessment_id: assessmentData.sessionId || '',
          report_data: {
            researchFindings,
            reportContent,
            researchTargets: {}, // Simplified - no targets
            businessInferences: {}, // Simplified - no inferences
            assessmentData
          },
          executive_summary: this.extractExecutiveSummary(reportContent),
          confidence_score: this.calculateConfidence(researchFindings, reportContent),
          generation_time_ms: Date.now() - this.startTime,
          tokens_used: Math.floor(reportContent.length / 4), // Estimate tokens
          model_version: 'perplexity-sonar-gpt4o',
          status: 'generated'
        };

        await saveReport(reportRecord);
        phasesCompleted.push('database_save');
      } catch (saveError) {
        console.warn('Could not save report to database:', saveError);
        // Continue without database save
      }

      const duration = (Date.now() - this.startTime) / 1000;

      // Log metrics
      console.log(`[PERPLEXITY REPORT] Generated in ${duration}s for ${businessName}`);
      console.log(`Research length: ${researchLength} chars, Report length: ${reportLength} chars`);

      // Send completion
      this.sendProgress({
        type: 'complete',
        reportHtml: htmlReport,
        metrics: {
          duration,
          researchLength,
          reportLength
        }
      });

      return {
        success: true,
        reportHtml,
        metadata: {
          duration,
          researchLength,
          reportLength,
          confidence: this.calculateConfidence(researchFindings, reportContent),
          phases: phasesCompleted
        }
      };

    } catch (error: any) {
      console.error('Perplexity report generation failed:', error);
      
      this.sendProgress({
        type: 'error',
        message: `Failed to generate report: ${error.message}`
      });

      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        metadata: {
          duration: (Date.now() - this.startTime) / 1000,
          researchLength,
          reportLength,
          confidence: 0,
          phases: phasesCompleted
        }
      };
    }
  }

  private extractExecutiveSummary(reportContent: string): string {
    // Extract executive summary from the report content
    const summaryMatch = reportContent.match(/## Executive Summary\n\n([\s\S]*?)(?=\n##|$)/);
    if (summaryMatch && summaryMatch[1]) {
      return summaryMatch[1].trim().substring(0, 500);
    }

    // Fallback to first few sentences
    const sentences = reportContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 3).join('. ').substring(0, 500);
  }

  private calculateConfidence(researchFindings: string, reportContent: string): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on research quality
    if (researchFindings.length > 1000) confidence += 0.1;
    if (researchFindings.includes('$') && researchFindings.match(/\d+/g)?.length > 5) confidence += 0.1;
    if (researchFindings.toLowerCase().includes('benchmark') || researchFindings.toLowerCase().includes('industry')) confidence += 0.1;

    // Increase confidence based on report structure
    if (reportContent.includes('## Executive Summary')) confidence += 0.05;
    if (reportContent.includes('## ROI on Investment')) confidence += 0.05;
    if (reportContent.includes('## Current State')) confidence += 0.05;
    if (reportContent.includes('## Future State')) confidence += 0.05;

    // Increase confidence based on specificity
    const dollarAmounts = reportContent.match(/\$[\d,]+/g)?.length || 0;
    if (dollarAmounts > 3) confidence += 0.1;

    const percentages = reportContent.match(/\d+%/g)?.length || 0;
    if (percentages > 3) confidence += 0.05;

    return Math.min(confidence, 0.95);
  }
}

// Factory function to create the Perplexity report generator
export const createPerplexityReportGenerator = (
  progressCallback?: (progress: PerplexityReportProgress) => void
): PerplexityReportGenerationEngine => {
  return new PerplexityReportGenerationEngine(progressCallback);
};

// Compatibility function to convert from existing data structure
export const convertAssessmentData = (data: any): AssessmentData => {
  return {
    sessionId: data.sessionId || '',
    fullName: data.fullName || data.full_name || '',
    company: data.company || '',
    businessName: data.businessName || data.company || '',
    email: data.email || '',
    subscribeUpdates: data.subscribeUpdates || false,
    businessType: data.businessType || data.business_type || '',
    icpType: data.icpType || data.businessType || data.business_type || '',
    opportunityFocus: data.opportunityFocus || data.opportunity_focus || '',
    revenueModel: data.revenueModel || data.revenue_model || '',
    challenges: Array.isArray(data.challenges) ? data.challenges : [data.challenges].filter(Boolean),
    revenueChallenge: data.revenueChallenge || (Array.isArray(data.challenges) ? data.challenges[0] : data.challenges) || '',
    metrics: data.metrics || {},
    metricsQuantified: data.metricsQuantified || data.metrics_quantified || {},
    teamDescription: data.teamDescription || data.team_description || '',
    processDescription: data.processDescription || data.process_description || '',
    teamProcess: data.teamProcess || data.processDescription || data.process_description || '',
    techStack: Array.isArray(data.techStack) ? data.techStack : (Array.isArray(data.tech_stack) ? data.tech_stack : []),
    solutionStack: data.solutionStack || (Array.isArray(data.techStack) ? data.techStack.join(', ') : (Array.isArray(data.tech_stack) ? data.tech_stack.join(', ') : '')),
    investmentLevel: data.investmentLevel || data.investment_level || '',
    additionalContext: data.additionalContext || data.additional_context || ''
  };
};

// Default export
export default {
  createPerplexityReportGenerator,
  convertAssessmentData
};