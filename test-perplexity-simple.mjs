// Simple Perplexity test to isolate the issue
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n');

let apiKey = '';
for (const line of envLines) {
  if (line.startsWith('VITE_PERPLEXITY_API_KEY=')) {
    apiKey = line.split('=')[1].trim();
    break;
  }
}

console.log('API Key found:', !!apiKey);
console.log('API Key starts with:', apiKey.substring(0, 10));

async function testPerplexity() {
  try {
    console.log('Making request to Perplexity API...');
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: 'What are the latest AI automation tools for IT service companies? Give me 2 specific tools with pricing.'
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
        return_citations: true
      })
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Success! Response received');
    console.log('Citations:', data.citations?.length || 0);
    console.log('Content preview:', data.choices[0].message.content.substring(0, 200));
    
  } catch (error) {
    console.error('Fetch error:', error.message);
    console.error('Error type:', error.constructor.name);
    
    if (error.cause) {
      console.error('Underlying cause:', error.cause);
    }
  }
}

testPerplexity();