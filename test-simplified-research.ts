// Test Simplified Research Flow
// Simulates complete user assessment and verifies clean execution

import { AssessmentData } from './src/lib/assessment/input-compiler';
import { executeFullResearch } from './src/lib/assessment/simplified-research-engine';
import { createPerplexityReportGenerator } from './src/services/perplexityReportGenerator';

// Simulate realistic user inputs
const simulatedAssessmentData: AssessmentData = {
  sessionId: 'test-session-123',
  fullName: 'Sarah Johnson',
  company: 'TechFlow Solutions',
  businessName: 'TechFlow Solutions',
  email: 'sarah@techflowsolutions.com',
  subscribeUpdates: true,
  
  // Business classification
  businessType: 'IT Services & Consulting',
  icpType: 'IT Services & Consulting',
  opportunityFocus: 'Client Onboarding Automation',
  revenueModel: 'Project-based consulting with recurring support',
  
  // Revenue challenge
  challenges: ['Lead qualification takes too long and is inconsistent'],
  revenueChallenge: 'Lead qualification takes too long and is inconsistent',
  
  // Metrics
  metrics: {
    metric: 'Lead conversion rate',
    baseline: '12%',
    friction: 'Manual qualification process taking 3-5 days per lead'
  },
  metricsQuantified: {
    metric: 'Lead conversion rate', 
    baseline: '12%',
    friction: 'Manual qualification process taking 3-5 days per lead'
  },
  
  // Team and process
  teamDescription: 'Sales team of 4 people: Sarah (owner), Mike (senior consultant), Lisa (project manager), Tom (technical lead)',
  processDescription: 'When leads come in through website or referrals, Sarah manually reviews each one by checking their website, LinkedIn profiles, and having a 30-min discovery call. Then she scores them 1-10 and decides if Mike should do a technical assessment. This whole process takes 3-5 business days and we often lose warm leads because we\'re too slow.',
  teamProcess: 'When leads come in through website or referrals, Sarah manually reviews each one by checking their website, LinkedIn profiles, and having a 30-min discovery call. Then she scores them 1-10 and decides if Mike should do a technical assessment. This whole process takes 3-5 business days and we often lose warm leads because we\'re too slow.',
  
  // Tech stack
  techStack: ['HubSpot CRM', 'Google Workspace', 'Slack', 'Calendly'],
  solutionStack: 'HubSpot CRM, Google Workspace, Slack, Calendly',
  
  // Investment and context
  investmentLevel: 'Willing to invest $5-15K to solve this if ROI is clear',
  additionalContext: 'We\'re based in Indianapolis and serve manufacturing companies across the Midwest. Our biggest frustration is that we know we\'re good at what we do, but we\'re losing deals to faster-moving competitors who can respond to leads within 24 hours. We get about 25-30 leads per month, and our current 12% conversion rate should be much higher if we could just respond faster and more consistently.'
};

async function testSimplifiedResearch() {
  console.log('🧪 Testing Simplified Research Flow');
  console.log('=================================');
  
  try {
    // Test 1: Direct simplified research engine
    console.log('\n📊 Test 1: Direct Simplified Research Engine');
    console.log('--------------------------------------------');
    
    const startTime = Date.now();
    const researchResults = await executeFullResearch(simulatedAssessmentData);
    const duration = (Date.now() - startTime) / 1000;
    
    console.log(`✅ Research completed in ${duration}s`);
    console.log(`📄 Result length: ${researchResults.length} characters`);
    console.log(`🔍 Contains full context: ${researchResults.includes('TechFlow Solutions')}`);
    console.log(`🎯 Contains challenge: ${researchResults.includes('Lead qualification')}`);
    console.log(`👥 Contains team info: ${researchResults.includes('Sarah')}`);
    console.log(`💡 Contains GABI positioning: ${researchResults.includes('Competitive Advantage')}`);
    
    // Test 2: Full report generator
    console.log('\n📊 Test 2: Full Report Generator');
    console.log('--------------------------------');
    
    const reportGenerator = createPerplexityReportGenerator((progress) => {
      console.log(`📈 Progress: ${progress.message} (${progress.progress}%)`);
    });
    
    const reportStartTime = Date.now();
    const reportResult = await reportGenerator.generateReport(simulatedAssessmentData);
    const reportDuration = (Date.now() - reportStartTime) / 1000;
    
    console.log(`✅ Report generated in ${reportDuration}s`);
    console.log(`🎯 Success: ${reportResult.success}`);
    console.log(`📊 Phases: ${reportResult.metadata.phases.join(', ')}`);
    console.log(`📄 HTML length: ${reportResult.reportHtml?.length || 0} characters`);
    
    if (reportResult.reportHtml) {
      console.log(`🔍 HTML contains company: ${reportResult.reportHtml.includes('TechFlow Solutions')}`);
      console.log(`🔍 HTML contains challenge: ${reportResult.reportHtml.includes('Lead qualification')}`);
    }
    
    // Test 3: Verify no RAG calls were made
    console.log('\n📊 Test 3: Verify Clean Execution');
    console.log('----------------------------------');
    
    // Look for console logs that would indicate RAG calls
    const cleanExecution = !researchResults.includes('RAG') && 
                          !researchResults.includes('Vector') && 
                          !researchResults.includes('Intelligence Database');
    
    console.log(`✅ Clean execution (no RAG): ${cleanExecution}`);
    console.log(`🎯 Full context preserved: ${researchResults.includes(simulatedAssessmentData.additionalContext || '')}`);
    
    // Summary
    console.log('\n📋 TEST SUMMARY');
    console.log('===============');
    console.log(`✅ Simplified research: Working`);
    console.log(`✅ Full report generation: ${reportResult.success ? 'Working' : 'Failed'}`);
    console.log(`✅ No RAG interruptions: ${cleanExecution}`);
    console.log(`✅ GPT enhancement: ${researchResults.includes('Competitive Advantage') ? 'Working' : 'Failed'}`);
    console.log(`⏱️ Total time: ${reportDuration}s`);
    
    return {
      success: reportResult.success,
      cleanExecution,
      duration: reportDuration,
      researchLength: researchResults.length,
      htmlLength: reportResult.reportHtml?.length || 0
    };
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    
    return {
      success: false,
      error: error.message,
      cleanExecution: false,
      duration: 0,
      researchLength: 0,
      htmlLength: 0
    };
  }
}

// Run the test
if (import.meta.main) {
  testSimplifiedResearch().then(result => {
    console.log('\n🏁 Final Result:', result);
    process.exit(result.success ? 0 : 1);
  });
}

export { testSimplifiedResearch, simulatedAssessmentData };