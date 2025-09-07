// Data Processor - Validates and enhances raw assessment data for GPT-4o

import { 
  ValidatedAssessmentData, 
  DataValidationReport, 
  DataQuality,
  ValidationRules 
} from './types';
import { extractBudgetRange } from '@/lib/dataHelpers';

export class DataProcessor {
  
  private validationRules: ValidationRules = {
    requiredFields: [
      'company', 'email', 'businessType', 'opportunityFocus', 
      'revenueModel', 'revenueChallenge', 'investmentLevel'
    ],
    
    numericRanges: {
      conversionRate: { min: 0.001, max: 0.8 },
      avgDealSize: { min: 100, max: 1000000 },
      salesCycleMonths: { min: 0.25, max: 36 },
      monthlyDeals: { min: 1, max: 1000 },
      employeeCount: { min: 1, max: 100000 }
    },
    
    stringPatterns: {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      company: /^[a-zA-Z0-9\s\-&.,()]{2,100}$/
    },
    
    crossFieldValidations: [
      {
        fields: ['avgDealSize', 'monthlyDeals'],
        rule: ([dealSize, monthlyDeals]) => (dealSize * monthlyDeals) < 10000000, // $10M/month seems high
        message: 'Monthly revenue calculation seems unusually high'
      }
    ]
  };
  
  /**
   * Main validation and enhancement function
   * Converts raw assessment data into clean, validated structure for GPT-4o
   */
  validateAndEnhance(rawData: any): ValidatedAssessmentData {
    console.log('🔍 Processing and validating assessment data...');
    
    // Parse and extract structured data
    const parsed = this.parseAssessmentData(rawData);
    
    // Validate all data
    const validation = this.validateData(rawData, parsed);
    
    console.log(`✅ Data processed - Quality: ${validation.dataQuality}, Confidence: ${validation.confidence.toFixed(2)}`);
    
    return {
      // Core fields (cleaned)
      sessionId: rawData.sessionId || '',
      company: this.cleanString(rawData.company || ''),
      email: this.cleanString(rawData.email || ''),
      businessType: this.cleanString(rawData.businessType || rawData.icpType || ''),
      opportunityFocus: this.cleanString(rawData.opportunityFocus || ''),
      revenueModel: this.cleanString(rawData.revenueModel || ''),
      revenueChallenge: this.cleanString(rawData.revenueChallenge || ''),
      teamProcess: this.cleanString(rawData.teamProcess || ''),
      solutionStack: this.cleanString(rawData.solutionStack || ''),
      investmentLevel: this.cleanString(rawData.investmentLevel || ''),
      additionalContext: this.cleanString(rawData.additionalContext || ''),
      
      // Parsed fields
      parsed,
      
      // Validation results
      validation
    };
  }
  
  /**
   * Extract structured data from text fields
   */
  private parseAssessmentData(data: any) {
    const teamMembers = this.extractTeamMembers(data.teamProcess || '');
    const stackComponents = this.parseStack(data.solutionStack || '');
    const budgetRange = extractBudgetRange(data);
    const avgDealSize = this.extractDealSize(data.revenueModel || '');
    const monthlyDeals = this.extractMonthlyDeals(data.additionalContext || '');
    const salesCycleMonths = this.extractSalesCycle(data.additionalContext || '');
    const conversionRate = this.extractConversionRate(data.additionalContext || '');
    const employeeCount = this.extractEmployeeCount(data.additionalContext || data.teamProcess || '');
    const yearsFounded = this.extractYearsFounded(data.additionalContext || '');
    const location = this.extractLocation(data.additionalContext || '');
    
    return {
      teamMembers,
      stackComponents,
      budgetRange,
      avgDealSize,
      monthlyDeals,
      salesCycleMonths,
      conversionRate,
      employeeCount,
      yearsFounded,
      location
    };
  }
  
  /**
   * Extract team member names and roles from process description
   */
  extractTeamMembers(process: string): string[] {
    const names: string[] = [];
    
    // Extract capitalized names (likely proper nouns)
    const properNouns = process.match(/\b[A-Z][a-z]+\b/g) || [];
    names.push(...properNouns);
    
    // Extract common roles
    const roles = ['CEO', 'CTO', 'CFO', 'VP', 'Manager', 'Director', 'Head', 'Lead'];
    const roleMatches = process.match(new RegExp(`\\b(${roles.join('|')})\\b`, 'gi')) || [];
    names.push(...roleMatches);
    
    // Extract role patterns like "Sales Manager", "Marketing Director"
    const rolePatterns = process.match(/\b(?:Sales|Marketing|Business|Operations|Customer|Product)\s+(?:Manager|Director|Lead|Head|VP)\b/gi) || [];
    names.push(...rolePatterns);
    
    // Deduplicate and clean
    return [...new Set(names)]
      .filter(name => name.length > 1)
      .slice(0, 10); // Reasonable limit
  }
  
  /**
   * Parse technology stack into components
   */
  private parseStack(stack: string): string[] {
    if (!stack) return [];
    
    return stack.split(/[,;]/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 20); // Reasonable limit
  }
  
  /**
   * Parse budget/investment level into numeric range
   */
  parseBudget(level: string): { min: number; max: number } {
    const levelLower = level.toLowerCase();
    
    // Predefined ranges
    const ranges: Record<string, { min: number; max: number }> = {
      'minimal': { min: 0, max: 500 },
      'low': { min: 500, max: 2000 },
      'quick win': { min: 500, max: 5000 },
      'moderate': { min: 2000, max: 10000 },
      'significant': { min: 10000, max: 50000 },
      'transformation': { min: 25000, max: 100000 },
      'enterprise': { min: 50000, max: 500000 },
      'unlimited': { min: 100000, max: 1000000 }
    };
    
    // Check for predefined ranges
    for (const [key, range] of Object.entries(ranges)) {
      if (levelLower.includes(key)) return range;
    }
    
    // Try to extract specific numbers
    const numbers = level.match(/\$?([\d,]+)/g) || [];
    if (numbers.length > 0) {
      const values = numbers.map(n => parseInt(n.replace(/[$,]/g, '')));
      
      if (values.length === 1) {
        // Single value - assume it's max
        return { min: Math.floor(values[0] * 0.5), max: values[0] };
      } else {
        // Multiple values - use range
        return { 
          min: Math.min(...values), 
          max: Math.max(...values) 
        };
      }
    }
    
    return { min: 5000, max: 25000 }; // Default moderate range
  }
  
  /**
   * Extract average deal size from revenue model
   */
  extractDealSize(revenueModel: string): number {
    const patterns = [
      /\$?([\d,]+)\s*(?:per|\/)\s*(?:deal|client|customer|project)/gi,
      /deals?\s*(?:worth|of|at)\s*\$?([\d,]+)/gi,
      /\$?([\d,]+)\s*average/gi,
      /\$?([\d,]+)\s*typical/gi
    ];
    
    for (const pattern of patterns) {
      const matches = [...revenueModel.matchAll(pattern)];
      if (matches.length > 0) {
        const values = matches.map(m => parseInt(m[1].replace(/,/g, '')));
        return values.reduce((a, b) => a + b) / values.length;
      }
    }
    
    // Fallback: extract any monetary values
    const numbers = revenueModel.match(/\$?([\d,]+)/g) || [];
    if (numbers.length > 0) {
      const values = numbers.map(n => parseInt(n.replace(/[$,]/g, '')));
      const avgValue = values.reduce((a, b) => a + b) / values.length;
      
      // Reasonable deal size range
      if (avgValue >= 500 && avgValue <= 500000) {
        return avgValue;
      }
    }
    
    return 5000; // Conservative default
  }
  
  /**
   * Extract monthly deal count from context
   */
  extractMonthlyDeals(context: string): number {
    const patterns = [
      /(\d+)\s*deals?\s*(?:per|\/)\s*month/gi,
      /(\d+)\s*(?:demos?|meetings?|calls?)\s*(?:per|\/)\s*month/gi,
      /close\s*(\d+)\s*deals?\s*(?:per|\/)\s*month/gi,
      /(\d+)\s*new\s*(?:clients?|customers?)\s*(?:per|\/)\s*month/gi
    ];
    
    for (const pattern of patterns) {
      const match = context.match(pattern);
      if (match) {
        const value = parseInt(match[1]);
        if (value >= 1 && value <= 100) { // Reasonable range
          return value;
        }
      }
    }
    
    // Try weekly patterns and convert
    const weeklyPatterns = [
      /(\d+)\s*deals?\s*(?:per|\/)\s*week/gi,
      /(\d+)\s*(?:demos?|meetings?)\s*(?:per|\/)\s*week/gi
    ];
    
    for (const pattern of weeklyPatterns) {
      const match = context.match(pattern);
      if (match) {
        const weekly = parseInt(match[1]);
        const monthly = Math.round(weekly * 4.33); // Average weeks per month
        if (monthly >= 1 && monthly <= 400) {
          return monthly;
        }
      }
    }
    
    return 5; // Conservative default
  }
  
  /**
   * Extract sales cycle length in months
   */
  extractSalesCycle(context: string): number {
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(?:to\s*(\d+(?:\.\d+)?))?\s*months?\s*(?:sales\s*)?(?:cycle|to\s*close)/gi,
      /takes?\s*(\d+(?:\.\d+)?)\s*(?:to\s*(\d+(?:\.\d+)?))?\s*months?/gi,
      /(\d+(?:\.\d+)?)\s*months?\s*(?:sales\s*)?(?:process|cycle)/gi
    ];
    
    for (const pattern of patterns) {
      const match = context.match(pattern);
      if (match) {
        const value1 = parseFloat(match[1]);
        const value2 = match[2] ? parseFloat(match[2]) : null;
        
        if (value2) {
          // Range: take average
          const avg = (value1 + value2) / 2;
          if (avg >= 0.25 && avg <= 24) return avg;
        } else {
          // Single value
          if (value1 >= 0.25 && value1 <= 24) return value1;
        }
      }
    }
    
    // Try weeks and convert
    const weekPatterns = [
      /(\d+(?:\.\d+)?)\s*(?:to\s*(\d+(?:\.\d+)?))?\s*weeks?\s*(?:sales\s*)?(?:cycle|to\s*close)/gi
    ];
    
    for (const pattern of weekPatterns) {
      const match = context.match(pattern);
      if (match) {
        const weeks = parseFloat(match[1]);
        const months = weeks / 4.33;
        if (months >= 0.25 && months <= 12) return Math.round(months * 10) / 10;
      }
    }
    
    return 3; // Default 3 months
  }
  
  /**
   * Extract conversion/close rate
   */
  extractConversionRate(context: string): number {
    const patterns = [
      /(\d+(?:\.\d+)?)\s*%\s*(?:conversion|close|win)\s*rate/gi,
      /(?:conversion|close|win)\s*rate\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/gi,
      /convert\w*\s*(\d+(?:\.\d+)?)\s*%/gi,
      /win\s*(\d+(?:\.\d+)?)\s*%/gi,
      /close\s*(\d+(?:\.\d+)?)\s*%/gi
    ];
    
    for (const pattern of patterns) {
      const match = context.match(pattern);
      if (match) {
        const rate = parseFloat(match[1]);
        
        // Handle percentage vs decimal
        if (rate > 1) {
          // Percentage (e.g., 15%)
          return rate / 100;
        } else {
          // Already decimal (e.g., 0.15)
          return rate;
        }
      }
    }
    
    return 0.08; // Default 8% conversion rate
  }
  
  /**
   * Extract employee count
   */
  private extractEmployeeCount(text: string): number | undefined {
    const patterns = [
      /(\d+)\s*(?:employees?|people|staff|team\s*members?)/gi,
      /(?:team|company)\s*(?:of\s*)?(\d+)/gi,
      /(\d+)[\s-]*(?:person|people)\s*(?:team|company)/gi
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const count = parseInt(match[1]);
        if (count >= 1 && count <= 10000) return count;
      }
    }
    
    return undefined;
  }
  
  /**
   * Extract years founded / company age
   */
  private extractYearsFounded(text: string): number | undefined {
    const currentYear = new Date().getFullYear();
    
    const patterns = [
      /founded\s*(?:in\s*)?(\d{4})/gi,
      /established\s*(?:in\s*)?(\d{4})/gi,
      /started\s*(?:in\s*)?(\d{4})/gi,
      /(\d+)\s*years?\s*(?:old|in\s*business)/gi
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseInt(match[1]);
        
        if (value > 1900 && value <= currentYear) {
          // It's a year
          return currentYear - value;
        } else if (value >= 0 && value <= 100) {
          // It's years in business
          return value;
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * Extract location information
   */
  private extractLocation(text: string): string | undefined {
    const patterns = [
      /(?:based|located)\s*(?:in\s*)?([A-Z][a-zA-Z\s,]+?)(?:\.|,|$)/g,
      /([A-Z][a-zA-Z]+,\s*[A-Z]{2})/g, // City, State
      /([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z]+)/g // City, Country
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return undefined;
  }
  
  /**
   * Validate all parsed data and generate report
   */
  private validateData(rawData: any, parsed: any): DataValidationReport {
    const warnings: string[] = [];
    const suspiciousValues: any[] = [];
    const missingFields: string[] = [];
    let qualityScore = 1.0;
    
    // Check required fields
    for (const field of this.validationRules.requiredFields) {
      if (!rawData[field] || rawData[field].toString().trim().length === 0) {
        missingFields.push(field);
        qualityScore -= 0.1;
      }
    }
    
    // Validate numeric ranges
    for (const [field, range] of Object.entries(this.validationRules.numericRanges)) {
      const value = parsed[field];
      if (value !== undefined && (value < range.min || value > range.max)) {
        suspiciousValues.push({
          field,
          value,
          reason: `Value ${value} outside expected range ${range.min}-${range.max}`,
          severity: 'medium' as const,
          suggestion: `Expected range: ${range.min} to ${range.max}`
        });
        qualityScore -= 0.1;
      }
    }
    
    // String pattern validation
    for (const [field, pattern] of Object.entries(this.validationRules.stringPatterns)) {
      const value = rawData[field];
      if (value && !pattern.test(value)) {
        suspiciousValues.push({
          field,
          value,
          reason: `Does not match expected format`,
          severity: 'high' as const,
          suggestion: `Please check ${field} format`
        });
        qualityScore -= 0.15;
      }
    }
    
    // Cross-field validations
    for (const validation of this.validationRules.crossFieldValidations) {
      const values = validation.fields.map(field => parsed[field]);
      if (values.every(v => v !== undefined) && !validation.rule(values)) {
        warnings.push(validation.message);
        qualityScore -= 0.05;
      }
    }
    
    // Specific business logic validations
    if (parsed.conversionRate > 0.5) {
      suspiciousValues.push({
        field: 'conversionRate',
        value: parsed.conversionRate,
        reason: 'Conversion rate over 50% is unusually high',
        severity: 'medium' as const,
        suggestion: 'Typical B2B conversion rates are 2-15%'
      });
    }
    
    if (parsed.salesCycleMonths > 12) {
      warnings.push('Sales cycle over 12 months indicates complex/enterprise sales');
    }
    
    if (parsed.teamMembers.length === 0) {
      warnings.push('No team members identified - may impact personalization');
      qualityScore -= 0.05;
    }
    
    // Calculate final scores
    const dataQuality: DataQuality = 
      qualityScore >= 0.8 ? DataQuality.HIGH :
      qualityScore >= 0.6 ? DataQuality.MEDIUM :
      DataQuality.LOW;
    
    const confidence = Math.max(0.1, qualityScore);
    const dataCompleteness = 1 - (missingFields.length / this.validationRules.requiredFields.length);
    
    // Generate recommendations
    const recommendedActions: string[] = [];
    if (missingFields.length > 0) {
      recommendedActions.push(`Collect missing data: ${missingFields.join(', ')}`);
    }
    if (suspiciousValues.length > 0) {
      recommendedActions.push('Review flagged values for accuracy');
    }
    if (parsed.teamMembers.length === 0) {
      recommendedActions.push('Add team member information for better personalization');
    }
    
    return {
      dataCompleteness,
      missingFields,
      suspiciousValues,
      recommendedActions,
      confidence,
      qualityScore,
      requiresManualReview: qualityScore < 0.6 || suspiciousValues.some(v => v.severity === 'high'),
      hasRequiredFields: missingFields.length === 0,
      hasNumericData: parsed.avgDealSize > 0 && parsed.conversionRate > 0,
      dataQuality,
      warnings
    };
  }
  
  /**
   * Clean and standardize string inputs
   */
  private cleanString(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s@.,()-]/g, '') // Remove special chars except common ones
      .slice(0, 500); // Reasonable length limit
  }
  
  /**
   * Get validation summary for logging
   */
  getValidationSummary(validation: DataValidationReport): string {
    return `Quality: ${validation.dataQuality}, Completeness: ${(validation.dataCompleteness * 100).toFixed(0)}%, Confidence: ${(validation.confidence * 100).toFixed(0)}%`;
  }
}