// Test suite for Section Generators

import { SectionGenerators } from '../section-generators';
import { EnhancedCuratorInput, DataQuality, ICPType } from '../types';

describe('SectionGenerators', () => {
  const generator = new SectionGenerators();
  
  const mockInput: EnhancedCuratorInput = {
    assessmentData: {
      sessionId: 'test-123',
      company: 'TestCo',
      email: 'test@testco.com',
      businessType: 'SaaS Technology',
      opportunityFocus: 'Lead qualification automation',
      revenueModel: 'Subscription recurring revenue',
      revenueChallenge: 'Lead Qualification',
      teamProcess: 'Doug CEO and Kevin VP nurture leads manually. Takes 8 months to close deals.',
      solutionStack: 'HubSpot CRM, Salesforce',
      investmentLevel: '$20k-$50k budget',
      additionalContext: 'B2B SaaS, 50 employees, 3 years in business',
      parsed: {
        teamMembers: ['Doug', 'Kevin', 'Candice'],
        stackComponents: ['HubSpot', 'Salesforce'],
        budgetRange: { min: 20000, max: 50000 },
        avgDealSize: 9000,
        monthlyDeals: 3,
        salesCycleMonths: 8,
        conversionRate: 0.03,
        employeeCount: 50,
        yearsFounded: 3,
        location: 'San Francisco'
      },
      validation: {
        hasRequiredFields: true,
        hasNumericData: true,
        dataQuality: DataQuality.HIGH,
        warnings: [],
        confidence: 1.0,
        missingCriticalData: []
      }
    },
    ragIntelligence: {
      tools: [
        {
          id: 'test-tool-1',
          name: 'GPT-4o-mini',
          description: 'Cost-effective AI model for lead qualification',
          pricing: '$0.15/$0.60 per million tokens',
          integrations: ['HubSpot', 'Salesforce', 'OpenAI API'],
          gabiLayer: 'conversational',
          similarity: 0.85,
          bestFor: 'Automated lead qualification at scale',
          implementation: '1-2 weeks',
          category: 'AI Model',
          icpScore: 0.9
        }
      ],
      metadata: {
        queryUsed: 'lead qualification automation',
        totalFound: 10,
        avgSimilarity: 0.75,
        timestamp: new Date().toISOString(),
        searchType: 'vector',
        confidence: 0.8
      }
    },
    perplexityResearch: {
      companyProfile: {
        website: 'testco.com',
        employeeCount: '50',
        yearsFounded: '3',
        location: 'San Francisco',
        industry: 'SaaS'
      },
      implementations: [
        {
          company: 'Similar SaaS Co',
          challenge: 'Low lead conversion rates',
          solution: 'AI-powered lead scoring and qualification',
          result: '150% improvement in conversion rates within 90 days',
          confidence: 0.85
        }
      ],
      marketTrends: [
        {
          trend: 'AI adoption in SaaS sales processes',
          relevance: 'Highly relevant for lead qualification',
          timeline: '2024-2025',
          impact: 'high'
        }
      ],
      citations: [],
      metadata: {
        searchQuery: 'SaaS lead qualification AI automation',
        totalSources: 5,
        avgConfidence: 0.8,
        researchDate: new Date().toISOString()
      }
    },
    calculations: {
      current: {
        monthlyRevenue: 27000,
        annualRevenue: 324000,
        conversionRate: 0.03,
        salesCycleMonths: 8,
        teamCostMonthly: 45000,
        toolCostMonthly: 800,
        opportunityCostMonthly: 5400,
        totalCostMonthly: 51200,
        revenuePerEmployee: 6480,
        customerAcquisitionCost: 17067
      },
      target: {
        conversionRate: 0.09,
        salesCycleMonths: 4,
        monthlyRevenue: 81000,
        annualRevenue: 972000,
        efficiencyGain: 0.8,
        automationLevel: 0.5
      },
      improvement: {
        conversionLift: 0.06,
        conversionLiftPercent: 200,
        revenueLift: 54000,
        revenueLiftPercent: 200,
        timeSavingsHours: 693.6,
        timeSavingsPercent: 50,
        costReduction: 20480,
        costReductionPercent: 40,
        productivityGain: 0.8
      },
      roi: {
        totalInvestment: 18000,
        monthlyReturn: 74480,
        annualReturn: 893760,
        paybackMonths: 0.24,
        yearOneROI: 48.65,
        threeYearROI: 147.3,
        confidence: 1.0,
        breakEvenMonth: 1,
        irr: 4.2
      },
      benchmarks: {
        industryConversionRate: 0.09,
        industrySalesCycle: 4,
        industryDealSize: 9000,
        performanceGap: {
          conversion: -0.67,
          cycle: 1.0,
          efficiency: 0.2
        }
      }
    },
    validation: {
      dataCompleteness: 0.95,
      missingFields: [],
      suspiciousValues: [],
      recommendedActions: [],
      confidence: 1.0,
      qualityScore: 0.95,
      requiresManualReview: false
    },
    htmlMapping: {
      executiveSummary: 'exec-summary',
      gabiAdvantage: 'features-grid',
      currentState: 'section',
      benchmarks: 'section',
      solutions: 'solution-columns',
      futureState: 'timeline',
      roi: 'roi-table',
      marketContext: 'value-prop',
      recommendations: 'recommendation-cards',
      implementation: 'timeline-steps'
    },
    metadata: {
      processingTime: 1200,
      dataCompleteness: 0.95,
      overallConfidence: 0.9,
      recommendedApproach: 'balanced',
      warningFlags: []
    }
  };
  
  describe('generateExecutiveSummary', () => {
    test('generates executive summary with correct company data', () => {
      const result = generator.generateExecutiveSummary(mockInput);
      
      expect(result).toContain('TestCo converts only 3% of leads');
      expect(result).toContain('8 months to close deals');
      expect(result).toContain('Doug and Kevin');
      expect(result).toContain('[EXEC_SUMMARY]');
      expect(result).toContain('[/EXEC_SUMMARY]');
    });
    
    test('calculates revenue impact correctly', () => {
      const result = generator.generateExecutiveSummary(mockInput);
      
      expect(result).toContain('$648,000 in annual revenue'); // 54000 * 12
      expect(result).toContain('Investment:** $18,000');
      expect(result).toContain('4865%'); // ROI percentage
    });
    
    test('includes team member progression', () => {
      const result = generator.generateExecutiveSummary(mockInput);
      
      expect(result).toContain('3 handoffs between team members');
      expect(result).toContain('Free Doug and Kevin to close deals');
    });
  });
  
  describe('generateCurrentState', () => {
    test('quotes the exact team process', () => {
      const result = generator.generateCurrentState(mockInput);
      
      expect(result).toContain('"Doug CEO and Kevin VP nurture leads manually. Takes 8 months to close deals."');
      expect(result).toContain('3 People Touch Every Deal');
      expect(result).toContain('Doug → Kevin → Candice');
    });
    
    test('includes math breakdown with correct calculations', () => {
      const result = generator.generateCurrentState(mockInput);
      
      expect(result).toContain('200 leads/month × 3% conversion');
      expect(result).toContain('Monthly loss:');
      expect(result).toContain('[HIGHLIGHT]');
      expect(result).toContain('[/HIGHLIGHT]');
    });
    
    test('identifies hidden costs', () => {
      const result = generator.generateCurrentState(mockInput);
      
      expect(result).toContain('Executive time on lead management');
      expect(result).toContain('Team coordination overhead');
      expect(result).toContain('Total hidden cost');
    });
  });
  
  describe('generateSolutions', () => {
    test('structures solutions in columns', () => {
      const result = generator.generateSolutions(mockInput);
      
      expect(result).toContain('[SOLUTIONS_START]');
      expect(result).toContain('[COLUMN]');
      expect(result).toContain('[/COLUMN]');
      expect(result).toContain('[SOLUTIONS_END]');
    });
    
    test('includes augmentation tools from RAG data', () => {
      const result = generator.generateSolutions(mockInput);
      
      expect(result).toContain('Augmentation Tools');
      expect(result).toContain('GPT-4o-mini');
      expect(result).toContain('$0.15/$0.60 per million tokens');
    });
    
    test('maps tools to existing stack', () => {
      const result = generator.generateSolutions(mockInput);
      
      expect(result).toContain('HubSpot');
      expect(result).toContain('integrate with');
    });
  });
  
  describe('generateROI', () => {
    test('includes ROI table with metrics', () => {
      const result = generator.generateROI(mockInput);
      
      expect(result).toContain('[ROI_TABLE]');
      expect(result).toContain('[METRIC:Current State Baseline:$27,000/month]');
      expect(result).toContain('[METRIC:Monthly Revenue Gain:$54,000]');
      expect(result).toContain('[METRIC:12-Month ROI:4865%]');
      expect(result).toContain('[/ROI_TABLE]');
    });
    
    test('explains confidence in numbers', () => {
      const result = generator.generateROI(mockInput);
      
      expect(result).toContain('Why we\'re confident in these numbers');
      expect(result).toContain('3% to 9% conversion improvement');
      expect(result).toContain('10 similar implementations');
    });
  });
  
  describe('generateFutureState', () => {
    test('includes timeline formatting', () => {
      const result = generator.generateFutureState(mockInput);
      
      expect(result).toContain('[TIMELINE]');
      expect(result).toContain('[/TIMELINE]');
      expect(result).toContain('Days 1-30: Foundation');
      expect(result).toContain('Days 31-60: Automation');
      expect(result).toContain('Days 61-90: Optimization');
    });
    
    test('maps to GABI framework', () => {
      const result = generator.generateFutureState(mockInput);
      
      expect(result).toContain('GABI Framework');
      expect(result).toContain('Conversational Interface');
      expect(result).toContain('Function Execution');
      expect(result).toContain('Knowledge Retrieval');
      expect(result).toContain('Context Orchestration');
    });
  });
  
  describe('generateRecommendations', () => {
    test('includes recommendation cards formatting', () => {
      const result = generator.generateRecommendations(mockInput);
      
      expect(result).toContain('[RECOMMENDATION_CARDS]');
      expect(result).toContain('[/RECOMMENDATION_CARDS]');
      expect(result).toContain('[CARD:Week');
    });
    
    test('prioritizes actions by timeline', () => {
      const result = generator.generateRecommendations(mockInput);
      
      expect(result).toContain('Immediate Actions (Next 30 Days)');
      expect(result).toContain('Phase 1 Implementation (Days 31-90)');
      expect(result).toContain('Long-term Expansion (Months 4-12)');
    });
  });
  
  describe('generateBenchmarks', () => {
    test('includes industry-specific content', () => {
      const result = generator.generateBenchmarks(mockInput);
      
      expect(result).toContain('Industry Benchmarks for SaaS Technology');
      expect(result).toContain('Lead Qualification Process');
      expect(result).toContain('AI Transformation Happening Now');
    });
  });
  
  describe('generateMarketContext', () => {
    test('includes market analysis and case studies', () => {
      const result = generator.generateMarketContext(mockInput);
      
      expect(result).toContain('Market Context: AI Adoption in SaaS Technology');
      expect(result).toContain('Who\'s Getting This Right');
      expect(result).toContain('Similar SaaS Co');
      expect(result).toContain('150% improvement in conversion rates');
    });
    
    test('explains GABI framework pattern', () => {
      const result = generator.generateMarketContext(mockInput);
      
      expect(result).toContain('GABI Framework pattern');
      expect(result).toContain('data sovereignty');
      expect(result).toContain('existing systems');
      expect(result).toContain('human touch');
    });
  });
  
  describe('edge cases and error handling', () => {
    test('handles missing perplexity research gracefully', () => {
      const inputWithoutResearch = { 
        ...mockInput, 
        perplexityResearch: {
          ...mockInput.perplexityResearch,
          implementations: [],
          marketTrends: []
        }
      };
      
      const result = generator.generateMarketContext(inputWithoutResearch);
      
      expect(result).toContain('Similar SaaS Technology companies');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
    
    test('handles empty tools array', () => {
      const inputWithoutTools = { 
        ...mockInput, 
        ragIntelligence: {
          ...mockInput.ragIntelligence,
          tools: []
        }
      };
      
      const result = generator.generateSolutions(inputWithoutTools);
      
      expect(result).toContain('Augmentation Tools');
      expect(result).toBeDefined();
    });
    
    test('handles minimal team members', () => {
      const inputMinimalTeam = {
        ...mockInput,
        assessmentData: {
          ...mockInput.assessmentData,
          parsed: {
            ...mockInput.assessmentData.parsed,
            teamMembers: ['Solo']
          }
        }
      };
      
      const result = generator.generateCurrentState(inputMinimalTeam);
      
      expect(result).toContain('1 People Touch Every Deal');
      expect(result).toBeDefined();
    });
  });
});