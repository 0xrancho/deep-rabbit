#!/usr/bin/env tsx
// Test Vector Search Implementation
// Verifies semantic search is working properly

import { vectorRAG } from '../src/lib/assessment/vector-rag-retriever';

interface TestCase {
  name: string;
  query: string;
  expectedTools: string[];
  context?: any;
}

const TEST_CASES: TestCase[] = [
  {
    name: 'Lead Qualification Semantic Search',
    query: 'automate lead scoring and prospect evaluation',
    expectedTools: ['GPT-4o-mini', 'Claude-3-Haiku', 'Clay.com'],
    context: { icp: 'agency', challenge: 'lead-qualification' }
  },
  {
    name: 'Content Generation Semantic Search', 
    query: 'AI proposal writing and document generation',
    expectedTools: ['GPT-4o', 'Claude-3-Haiku'],
    context: { icp: 'agency', challenge: 'proposal-generation' }
  },
  {
    name: 'Workflow Automation Semantic Search',
    query: 'connect systems and automate business processes',
    expectedTools: ['n8n', 'Make.com', 'Zapier'],
    context: { icp: 'saas', challenge: 'workflow-automation' }
  },
  {
    name: 'Budget-Filtered Search',
    query: 'free automation tools',
    expectedTools: ['n8n', 'Supabase'],
    context: { budget: 'free', limit: 5 }
  },
  {
    name: 'Generic Business Automation',
    query: 'improve our sales process with AI and automation',
    expectedTools: [], // Should find various tools
    context: { icp: 'agency', limit: 8 }
  }
];

async function runVectorSearchTests() {
  console.log('🧪 Testing Vector Search Implementation');
  console.log('=====================================\n');
  
  // Check capabilities first
  const capabilities = vectorRAG.getSearchCapabilities();
  console.log('🔍 Search Capabilities:');
  console.log(`- Vector Search: ${capabilities.vectorSearchAvailable ? '✅' : '❌'}`);
  console.log(`- Fallback Available: ${capabilities.fallbackAvailable ? '✅' : '❌'}`);
  console.log(`- Semantic Understanding: ${capabilities.semanticUnderstanding ? '✅' : '❌'}`);
  console.log(`- Embedding Model: ${capabilities.embeddingModel}`);
  console.log(`- Search Threshold: ${capabilities.searchThreshold}`);
  console.log('');
  
  // Test vector search capability
  if (capabilities.vectorSearchAvailable) {
    console.log('🔬 Testing Vector Search Connection...');
    const connectionTest = await vectorRAG.testVectorSearch();
    console.log(`Vector Search Connection: ${connectionTest ? '✅ Working' : '❌ Failed'}\n`);
  }
  
  let passedTests = 0;
  let totalTests = TEST_CASES.length;
  
  // Run test cases
  for (const testCase of TEST_CASES) {
    console.log(`📋 Test: ${testCase.name}`);
    console.log(`Query: "${testCase.query}"`);
    
    try {
      const startTime = Date.now();
      const results = await vectorRAG.retrieveTools(testCase.query, testCase.context);
      const duration = Date.now() - startTime;
      
      console.log(`⏱️  Search completed in ${duration}ms`);
      console.log(`🔍 Found ${results.length} tools:`);
      
      results.forEach((tool, index) => {
        const similarity = tool.similarity ? ` (similarity: ${tool.similarity.toFixed(2)})` : '';
        console.log(`   ${index + 1}. ${tool.name}${similarity}`);
      });
      
      // Check if expected tools are found (for specific test cases)
      if (testCase.expectedTools.length > 0) {
        const foundTools = results.map(r => r.name);
        const expectedFound = testCase.expectedTools.filter(expected => 
          foundTools.some(found => found.toLowerCase().includes(expected.toLowerCase()))
        );
        
        const successRate = expectedFound.length / testCase.expectedTools.length;
        console.log(`✅ Expected tool coverage: ${expectedFound.length}/${testCase.expectedTools.length} (${(successRate * 100).toFixed(0)}%)`);
        
        if (successRate >= 0.5) { // At least 50% of expected tools found
          passedTests++;
          console.log(`✅ Test PASSED`);
        } else {
          console.log(`❌ Test FAILED - Missing tools: ${testCase.expectedTools.filter(e => !expectedFound.includes(e)).join(', ')}`);
        }
      } else {
        // Generic test - just check we got results
        if (results.length > 0) {
          passedTests++;
          console.log(`✅ Test PASSED - Found relevant results`);
        } else {
          console.log(`❌ Test FAILED - No results found`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Test FAILED with error: ${(error as Error).message}`);
    }
    
    console.log('');
  }
  
  // Summary
  console.log('📊 Test Results Summary:');
  console.log(`Tests passed: ${passedTests}/${totalTests} (${(passedTests/totalTests*100).toFixed(0)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Vector search is working correctly.');
  } else if (passedTests > 0) {
    console.log('⚠️  Some tests failed. Vector search is partially working.');
  } else {
    console.log('❌ All tests failed. Vector search needs investigation.');
  }
  
  return {
    passed: passedTests,
    total: totalTests,
    success: passedTests >= Math.ceil(totalTests * 0.7) // 70% pass rate
  };
}

async function main() {
  try {
    const results = await runVectorSearchTests();
    
    // Save test results
    const testReport = {
      test_completed_at: new Date().toISOString(),
      vector_search_available: vectorRAG.getSearchCapabilities().vectorSearchAvailable,
      tests_passed: results.passed,
      tests_total: results.total,
      success_rate: (results.passed / results.total * 100).toFixed(1) + '%',
      overall_success: results.success
    };
    
    const fs = await import('fs');
    fs.writeFileSync('./vector-search-test-report.json', JSON.stringify(testReport, null, 2));
    console.log('\n✅ Test report saved to vector-search-test-report.json');
    
    process.exit(results.success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Test suite failed:', (error as Error).message);
    process.exit(1);
  }
}

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { runVectorSearchTests };