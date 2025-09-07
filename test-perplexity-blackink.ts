// Test the new Perplexity-based report generation with BlackInk IT data
import { createPerplexityReportGenerator, convertAssessmentData } from './src/services/perplexityReportGenerator';

const testData = {
  sessionId: 'test-blackink-' + Date.now(),
  fullName: "Doug Test",
  company: "BlackInk IT",
  email: "doug.test@blackinkit.com",
  subscribeUpdates: true,
  businessType: "IT Service Management (ITSM)",
  opportunityFocus: "Compliance/Security Management",
  revenueModel: "Monthly managed services contracts $3-15K, 3-year terms, plus project work $150-200/hour",
  challenges: ["Lead Nurturing", "Demand Generation"],
  teamDescription: "Doug CEO and Kevin VP Sales nurture leads through events and calls, Candice documents requirements, Brian designs solutions, Andrew builds demos, Caroline coordinates schedules",
  processDescription: "Doug CEO and Kevin VP Sales nurture leads through events and calls, Candice documents requirements, Brian designs solutions, Andrew builds demos, Caroline coordinates schedules, Doug creates proposals",
  techStack: ["ConnectWise PSA", "IT Glue", "Microsoft 365", "Excel", "Word/SharePoint"],
  investmentLevel: "Transformation ($15-50K)",
  additionalContext: "3% lead conversion rate, 7-10 month sales cycle, only 6 demos per month"
};

async function testPerplexityReportGeneration() {
  console.log('🚀 Testing Perplexity Report Generation with BlackInk IT data...\n');
  
  // Convert data to the expected format
  const assessmentData = convertAssessmentData(testData);
  console.log('📊 Assessment Data Converted:');
  console.log('- Company:', assessmentData.businessName);
  console.log('- ICP Type:', assessmentData.icpType);
  console.log('- Revenue Challenge:', assessmentData.revenueChallenge);
  console.log('- Solution Stack:', assessmentData.solutionStack);
  console.log('- Investment Level:', assessmentData.investmentLevel);
  console.log('');

  // Create report generator with progress tracking
  const generator = createPerplexityReportGenerator((progress) => {
    switch (progress.type) {
      case 'status':
        console.log(`⏳ ${progress.message} (${progress.progress}%)`);
        break;
      case 'complete':
        console.log('✅ Report generation completed!');
        if (progress.metrics) {
          console.log(`📈 Metrics: ${progress.metrics.duration}s, ${progress.metrics.researchLength} chars research, ${progress.metrics.reportLength} chars report`);
        }
        break;
      case 'error':
        console.log(`❌ Error: ${progress.message}`);
        break;
    }
  });

  try {
    const startTime = Date.now();
    const result = await generator.generateReport(assessmentData);
    const totalTime = (Date.now() - startTime) / 1000;

    if (result.success) {
      console.log(`\n🎉 SUCCESS! Report generated in ${totalTime}s`);
      console.log('📋 Metadata:');
      console.log(`- Duration: ${result.metadata.duration}s`);
      console.log(`- Research Length: ${result.metadata.researchLength} chars`);
      console.log(`- Report Length: ${result.metadata.reportLength} chars`);
      console.log(`- Confidence: ${(result.metadata.confidence * 100).toFixed(1)}%`);
      console.log(`- Phases: ${result.metadata.phases.join(', ')}`);
      
      // Save HTML report to file for inspection
      if (result.reportHtml) {
        const fs = require('fs');
        const filename = `blackink-report-${Date.now()}.html`;
        fs.writeFileSync(filename, result.reportHtml);
        console.log(`\n📄 Report saved to: ${filename}`);
        
        // Show first 500 chars of the report
        const preview = result.reportHtml.replace(/<[^>]*>/g, '').substring(0, 500);
        console.log('\n📖 Report Preview:');
        console.log(preview + '...');
      }
    } else {
      console.log(`\n❌ FAILED: ${result.error}`);
      console.log('📋 Metadata:');
      console.log(`- Duration: ${result.metadata.duration}s`);
      console.log(`- Phases: ${result.metadata.phases.join(', ')}`);
    }

  } catch (error) {
    console.error('\n💥 Test failed with error:', error);
  }
}

// Run the test
if (require.main === module) {
  testPerplexityReportGeneration().catch(console.error);
}

export { testPerplexityReportGeneration };