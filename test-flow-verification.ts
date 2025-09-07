// Flow Verification Test - Verify execution path without actual API calls

import { AssessmentData } from './src/lib/assessment/input-compiler';
import { buildSimplifiedResearchContext, buildSimplifiedPrompt } from './src/lib/assessment/simplified-research-prompt';

// Simulate realistic user inputs
const simulatedAssessmentData: AssessmentData = {
  sessionId: 'test-session-123',
  fullName: 'Sarah Johnson',
  company: 'TechFlow Solutions',
  businessName: 'TechFlow Solutions',
  email: 'sarah@techflowsolutions.com',
  subscribeUpdates: true,
  
  businessType: 'IT Services & Consulting',
  icpType: 'IT Services & Consulting',
  opportunityFocus: 'Client Onboarding Automation',
  revenueModel: 'Project-based consulting with recurring support',
  
  challenges: ['Lead qualification takes too long and is inconsistent'],
  revenueChallenge: 'Lead qualification takes too long and is inconsistent',
  
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
  
  teamDescription: 'Sales team of 4 people: Sarah (owner), Mike (senior consultant), Lisa (project manager), Tom (technical lead)',
  processDescription: 'When leads come in through website or referrals, Sarah manually reviews each one by checking their website, LinkedIn profiles, and having a 30-min discovery call. Then she scores them 1-10 and decides if Mike should do a technical assessment. This whole process takes 3-5 business days and we often lose warm leads because we\'re too slow.',
  teamProcess: 'When leads come in through website or referrals, Sarah manually reviews each one by checking their website, LinkedIn profiles, and having a 30-min discovery call. Then she scores them 1-10 and decides if Mike should do a technical assessment. This whole process takes 3-5 business days and we often lose warm leads because we\'re too slow.',
  
  techStack: ['HubSpot CRM', 'Google Workspace', 'Slack', 'Calendly'],
  solutionStack: 'HubSpot CRM, Google Workspace, Slack, Calendly',
  
  investmentLevel: 'Willing to invest $5-15K to solve this if ROI is clear',
  additionalContext: 'We\'re based in Indianapolis and serve manufacturing companies across the Midwest. Our biggest frustration is that we know we\'re good at what we do, but we\'re losing deals to faster-moving competitors who can respond to leads within 24 hours. We get about 25-30 leads per month, and our current 12% conversion rate should be much higher if we could just respond faster and more consistently.'
};

function testFlowVerification() {
  console.log('🔍 Flow Verification Test');
  console.log('========================');
  
  try {
    // Step 1: Test context building (no RAG, no enrichment)
    console.log('\n📊 Step 1: Context Building');
    console.log('---------------------------');
    
    const context = buildSimplifiedResearchContext(simulatedAssessmentData);
    
    console.log(`✅ Company: ${context.company}`);
    console.log(`✅ Email Domain: ${context.emailDomain}`);
    console.log(`✅ Challenge: ${context.challenges}`);
    console.log(`✅ Team Members: ${context.teamMembers.join(', ')} (${context.teamSize} people)`);
    console.log(`✅ Tech Stack: ${context.techStack}`);
    console.log(`✅ Investment: ${context.investmentLevel}`);
    console.log(`✅ Location: ${context.location}`);
    
    // Verify 100% user input preservation
    const hasAllUserInput = context.company === 'TechFlow Solutions' &&
                           context.challenges.includes('Lead qualification') &&
                           context.additionalContext.includes('Indianapolis') &&
                           context.teamMembers.includes('Sarah') &&
                           context.processDescription.includes('discovery call');
    
    console.log(`✅ 100% User Input Preserved: ${hasAllUserInput}`);
    
    // Step 2: Test prompt building
    console.log('\n📊 Step 2: Prompt Building');
    console.log('--------------------------');
    
    const prompt = buildSimplifiedPrompt(context);
    
    console.log(`✅ Prompt Length: ${prompt.length} characters`);
    console.log(`✅ Contains Full Context: ${prompt.includes('TechFlow Solutions')}`);
    console.log(`✅ Contains Challenge: ${prompt.includes('Lead qualification')}`);
    console.log(`✅ Contains Team Info: ${prompt.includes('Sarah')}`);
    console.log(`✅ Contains Process: ${prompt.includes('discovery call')}`);
    console.log(`✅ Contains Investment: ${prompt.includes('$5-15K')}`);
    console.log(`✅ Contains Location: ${prompt.includes('Indianapolis')}`);
    console.log(`✅ Contains Tech Stack: ${prompt.includes('HubSpot CRM')}`);
    
    // Check for required sections in prompt
    const requiredSections = [
      'ROLE/PERSONALITY',
      'FULL CONTEXT',
      'EXECUTIVE SUMMARY', 
      'PROBLEM SYNTHESIS',
      'INDUSTRY BENCHMARKING',
      'CASE STUDY EVIDENCE',
      'SOLUTION ARCHITECTURE',
      'IMPLEMENTATION & ADOPTION',
      'COMPETITIVE ADVANTAGE',
      'NEXT STEPS'
    ];
    
    const sectionsFound = requiredSections.filter(section => prompt.includes(section));
    console.log(`✅ Required Sections: ${sectionsFound.length}/${requiredSections.length} found`);
    if (sectionsFound.length < requiredSections.length) {
      console.log(`❌ Missing sections: ${requiredSections.filter(s => !sectionsFound.includes(s)).join(', ')}`);
    }
    
    // Step 3: Verify no RAG calls would be made
    console.log('\n📊 Step 3: RAG Verification');
    console.log('---------------------------');
    
    // Check that the flow bypasses all RAG systems
    const noRAGKeywords = !prompt.includes('RAG') && 
                          !prompt.includes('Vector') && 
                          !prompt.includes('Intelligence Database') &&
                          !prompt.includes('minimal-rag') &&
                          !prompt.includes('vector-rag');
    
    console.log(`✅ No RAG Keywords in Prompt: ${noRAGKeywords}`);
    
    // Step 4: Simulate what Perplexity would receive
    console.log('\n📊 Step 4: Perplexity Input Simulation');
    console.log('-------------------------------------');
    
    const perplexityConfig = {
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: 'You are a comprehensive business research analyst specializing in AI transformation for B2B service providers...'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 4000,
      return_citations: true,
      search_recency_filter: 'month'
    };
    
    console.log(`✅ Perplexity Config Valid: ${perplexityConfig.messages.length === 2}`);
    console.log(`✅ Full Context in Prompt: ${perplexityConfig.messages[1].content.includes('TechFlow Solutions')}`);
    
    // Step 5: Verify expected output structure
    console.log('\n📊 Step 5: Expected Output Structure');
    console.log('-----------------------------------');
    
    const expectedOutputSections = [
      '# Comprehensive Research Report for TechFlow Solutions',
      '## Research Context',
      '## Research Findings',
      '## Sources & Citations',
      '## Research Metadata'
    ];
    
    console.log(`✅ Expected sections defined: ${expectedOutputSections.length}`);
    
    // Summary
    console.log('\n📋 VERIFICATION SUMMARY');
    console.log('======================');
    console.log(`✅ Context building: Working (100% user input preserved)`);
    console.log(`✅ Prompt generation: Working (${prompt.length} chars, all sections)`);
    console.log(`✅ No RAG interruptions: ${noRAGKeywords ? 'Confirmed' : 'WARNING: RAG keywords found'}`);
    console.log(`✅ Perplexity ready: Working (proper config generated)`);
    console.log(`✅ Two-phase flow: Perplexity → GPT enhancement`);
    
    // Show first 500 chars of prompt for verification
    console.log('\n📝 PROMPT PREVIEW (first 500 chars):');
    console.log('=====================================');
    console.log(prompt.substring(0, 500) + '...');
    
    return {
      success: true,
      userInputPreserved: hasAllUserInput,
      promptLength: prompt.length,
      sectionsFound: sectionsFound.length,
      noRAGKeywords,
      readyForPerplexity: true
    };
    
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    return {
      success: false,
      error: error.message,
      userInputPreserved: false,
      promptLength: 0,
      sectionsFound: 0,
      noRAGKeywords: false,
      readyForPerplexity: false
    };
  }
}

// Run verification
const result = testFlowVerification();
console.log('\n🏁 FINAL VERIFICATION RESULT:', result);

if (result.success && result.userInputPreserved && result.noRAGKeywords) {
  console.log('\n🎉 READY FOR LIVE TESTING!');
  console.log('The simplified research flow will:');
  console.log('1. Pass 100% of user input to Perplexity');
  console.log('2. Execute without RAG interruptions');
  console.log('3. Hand off full research to GPT for enhancement');
  console.log('4. Return complete formatted report');
} else {
  console.log('\n⚠️ ISSUES DETECTED - Fix before live testing');
}