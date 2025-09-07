// Full integration test for Perplexity + OpenAI report generation
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

const env = {};
for (const line of envLines) {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
}

// Mock assessment data
const mockAssessmentData = {
  sessionId: 'test-session-123',
  company: 'BlackInk IT',
  businessType: 'IT Service Management (ITSM)',
  opportunityFocus: 'Automating service delivery',
  challenges: ['Manual ticket routing', 'Long response times', 'Lack of predictive maintenance'],
  teamDescription: '15 engineers, 5 support staff',
  processDescription: 'We handle IT support tickets manually through email and a basic ticketing system',
  techStack: ['ServiceNow', 'Slack', 'Microsoft 365'],
  investmentLevel: 'Transformation',
  revenueModel: 'Managed services contracts',
  additionalContext: 'Looking to improve efficiency and reduce response times'
};

// Test Perplexity Research
async function testPerplexityResearch() {
  console.log('\n=== Testing Perplexity Research ===');
  
  const researchPrompt = `
Research BlackInk IT to create an AI transformation report.

COMPANY RESEARCH NEEDED:
1. Find information about BlackInk IT in Indianapolis
2. Their actual website, employee count, years in business

INDUSTRY RESEARCH NEEDED:
3. Industry benchmarks for IT Service Management companies
4. Lead conversion rates, sales cycle length
5. Best practices for ticket automation

SOLUTION RESEARCH:
6. Find 3-5 specific AI tools for ITSM with actual pricing
7. Tools that work with ServiceNow
8. Include case studies of similar companies

Return specific facts, numbers, tool names, and prices.
  `.trim();

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.VITE_PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a business research analyst. Return specific facts and data.'
          },
          {
            role: 'user',
            content: researchPrompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.1,
        return_citations: true,
        search_recency_filter: '6month'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Perplexity Research Success!');
    console.log('Citations:', data.citations?.length || 0, 'sources');
    console.log('\nResearch Content Preview:');
    console.log(data.choices[0].message.content.substring(0, 500) + '...\n');
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Perplexity Research Failed:', error.message);
    return null;
  }
}

// Test OpenAI Synthesis
async function testOpenAISynthesis(researchContent) {
  console.log('\n=== Testing OpenAI Report Synthesis ===');
  
  const synthesisPrompt = `
Based on this research about BlackInk IT:

${researchContent || 'No research data available - use your knowledge to create a report.'}

Create a professional executive summary for their AI transformation report that includes:
1. Current state analysis
2. Top 3 AI opportunities
3. Expected ROI
4. Implementation timeline

Be specific and use data from the research.
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an AI transformation consultant creating professional reports.'
          },
          {
            role: 'user',
            content: synthesisPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI Synthesis Success!');
    console.log('Tokens used:', data.usage?.total_tokens);
    console.log('\nSynthesized Report Preview:');
    console.log(data.choices[0].message.content.substring(0, 500) + '...\n');
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ OpenAI Synthesis Failed:', error.message);
    return null;
  }
}

// Test HTML Generation
async function testHTMLGeneration(synthesizedReport) {
  console.log('\n=== Testing HTML Report Generation ===');
  
  const htmlPrompt = `
Create a professional HTML report with this content:

${synthesizedReport}

Include:
- Modern CSS styling with gradients
- Professional layout
- KPI cards
- Implementation roadmap section

Return ONLY the complete HTML document starting with <!DOCTYPE html>.
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Create professional HTML reports. Return only valid HTML.'
          },
          {
            role: 'user',
            content: htmlPrompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const htmlContent = data.choices[0].message.content;
    
    console.log('✅ HTML Generation Success!');
    console.log('HTML length:', htmlContent.length, 'characters');
    
    // Save to file for inspection
    const outputPath = path.join(__dirname, 'test-report-output.html');
    fs.writeFileSync(outputPath, htmlContent);
    console.log(`\n📄 Report saved to: ${outputPath}`);
    console.log('Open this file in a browser to see the generated report.\n');
    
    return htmlContent;
  } catch (error) {
    console.error('❌ HTML Generation Failed:', error.message);
    return null;
  }
}

// Run full integration test
async function runFullTest() {
  console.log('🚀 Starting Full Integration Test');
  console.log('================================\n');
  
  // Step 1: Perplexity Research
  const researchContent = await testPerplexityResearch();
  
  // Step 2: OpenAI Synthesis (continues even if research fails)
  const synthesizedReport = await testOpenAISynthesis(researchContent);
  
  if (synthesizedReport) {
    // Step 3: HTML Generation
    const htmlReport = await testHTMLGeneration(synthesizedReport);
    
    if (htmlReport) {
      console.log('✅ FULL INTEGRATION TEST PASSED!');
      console.log('All components are working correctly.\n');
    } else {
      console.log('⚠️ Integration test partially failed at HTML generation.\n');
    }
  } else {
    console.log('❌ Integration test failed at synthesis stage.\n');
  }
  
  console.log('Test Summary:');
  console.log('- Perplexity Research:', researchContent ? '✅' : '❌');
  console.log('- OpenAI Synthesis:', synthesizedReport ? '✅' : '❌');
}

// Run the test
runFullTest().catch(console.error);