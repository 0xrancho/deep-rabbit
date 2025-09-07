#!/usr/bin/env tsx
// Discover New Tools Script
// Scrapes configured sources for new AI/automation tools

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { TOOL_SOURCES, RELEVANCE_CRITERIA } from '../config/intelligence-sources';

// Environment setup
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const openaiKey = process.env.VITE_OPENAI_API_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

interface DiscoveredTool {
  name: string;
  url: string;
  description: string;
  source: string;
  raw_data?: any;
}

interface DiscoveryResult {
  success: boolean;
  new_tools_added: number;
  sources_checked: number;
  errors: string[];
  discovered_tools: DiscoveredTool[];
}

// Simple scraper for awesome lists (GitHub markdown)
async function scrapeAwesomeList(url: string): Promise<DiscoveredTool[]> {
  const tools: DiscoveredTool[] = [];
  
  try {
    console.log(`📥 Scraping awesome list: ${url}`);
    
    const response = await fetch(url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/') + '/main/README.md');
    const markdown = await response.text();
    
    // Extract tool links and descriptions
    const toolPattern = /\[([^\]]+)\]\(([^)]+)\)(?:\s*-\s*(.+?))?(?=\n|$)/g;
    let match;
    
    while ((match = toolPattern.exec(markdown)) !== null) {
      const [, name, toolUrl, description] = match;
      
      // Filter out obvious non-tools
      if (name && toolUrl && !toolUrl.includes('github.com/topics') && !toolUrl.includes('#')) {
        tools.push({
          name: name.trim(),
          url: toolUrl.trim(),
          description: (description || '').trim(),
          source: 'awesome-list'
        });
      }
    }
    
    console.log(`✅ Found ${tools.length} potential tools from awesome list`);
    return tools;
    
  } catch (error) {
    console.error(`❌ Failed to scrape awesome list ${url}:`, (error as Error).message);
    return [];
  }
}

// Simple ProductHunt RSS scraper
async function scrapeProductHunt(): Promise<DiscoveredTool[]> {
  const tools: DiscoveredTool[] = [];
  
  try {
    console.log('📥 Scraping ProductHunt RSS...');
    
    const response = await fetch('https://www.producthunt.com/feed');
    const rssText = await response.text();
    
    // Simple RSS parsing
    const itemPattern = /<item>.*?<title><!\[CDATA\[([^\]]+)\]\]><\/title>.*?<link>([^<]+)<\/link>.*?<description><!\[CDATA\[([^\]]+)\]\]><\/description>.*?<\/item>/gs;
    let match;
    
    while ((match = itemPattern.exec(rssText)) !== null) {
      const [, title, link, description] = match;
      
      // Filter by relevance keywords
      const content = (title + ' ' + description).toLowerCase();
      const hasRelevantKeywords = RELEVANCE_CRITERIA.required_keywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      );
      
      if (hasRelevantKeywords) {
        tools.push({
          name: title.trim(),
          url: link.trim(),
          description: description.replace(/<[^>]*>/g, '').trim(), // Strip HTML
          source: 'producthunt'
        });
      }
    }
    
    console.log(`✅ Found ${tools.length} relevant tools from ProductHunt`);
    return tools;
    
  } catch (error) {
    console.error('❌ Failed to scrape ProductHunt:', (error as Error).message);
    return [];
  }
}

// Enrich discovered tool with AI
async function enrichTool(tool: DiscoveredTool): Promise<{
  enriched: boolean;
  description_full?: string;
  icp_fit?: Record<string, number>;
  challenge_fit?: Record<string, number>;
  budget_range?: string[];
}> {
  if (!openai) {
    return { enriched: false };
  }
  
  try {
    const prompt = `
Analyze this tool and create a comprehensive description:

Name: ${tool.name}
URL: ${tool.url}
Basic description: ${tool.description}
Source: ${tool.source}

Create a rich description following this format:

Tool: [Name]

Category: [Category] [Subcategory]

Description: [What it does specifically]

Best For: [Ideal use case in one line]

Pricing: [Pricing model and details if findable]

Use Cases: [Comma-separated list from: lead-qualification, proposal-generation, workflow-automation, data-processing, enrichment, ai-integration]

Integrations: [What it integrates with]

GABI Layer: [One of: Context Orchestration, Knowledge Retrieval, Function Execution, Conversational Interface]

Trending Context: [Why it's notable now]

ICP Fit Scores (0-1):
- ITSM: [score]
- Agency: [score] 
- SaaS: [score]

Also provide:
- Budget range: [array of: free, low, medium, high]
- Challenge fit scores (0-1) for: lead-qualification, proposal-generation, workflow-automation

Respond with JSON containing: description_full, icp_fit, challenge_fit, budget_range
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1500
    });
    
    const content = response.choices[0].message.content;
    if (!content) return { enriched: false };
    
    try {
      const parsed = JSON.parse(content);
      return {
        enriched: true,
        ...parsed
      };
    } catch {
      // If JSON parsing fails, use the content as description_full
      return {
        enriched: true,
        description_full: content,
        icp_fit: { itsm: 0.5, agency: 0.5, saas: 0.5 },
        challenge_fit: { 'lead-qualification': 0.5, 'proposal-generation': 0.5, 'workflow-automation': 0.5 },
        budget_range: ['medium']
      };
    }
    
  } catch (error) {
    console.error(`Failed to enrich ${tool.name}:`, (error as Error).message);
    return { enriched: false };
  }
}

// Check if tool already exists
async function toolExists(name: string, url: string): Promise<boolean> {
  if (!supabase) return false;
  
  try {
    const { data, error } = await supabase
      .from('tools_minimal')
      .select('id')
      .or(`name.ilike.%${name}%,description_full.ilike.%${url}%`)
      .limit(1);
    
    if (error) return false;
    return (data?.length || 0) > 0;
    
  } catch {
    return false;
  }
}

// Add tool to database
async function addTool(tool: DiscoveredTool, enrichment: any): Promise<boolean> {
  if (!supabase || !openai) return false;
  
  try {
    // Generate embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: enrichment.description_full
    });
    
    const { error } = await supabase
      .from('tools_minimal')
      .insert({
        name: tool.name,
        status: 'active',
        last_validated: new Date().toISOString(),
        icp_fit: enrichment.icp_fit,
        challenge_fit: enrichment.challenge_fit,
        budget_range: enrichment.budget_range,
        description_full: enrichment.description_full,
        embedding: embeddingResponse.data[0].embedding
      });
    
    if (error) {
      console.error(`Failed to insert ${tool.name}:`, error.message);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error(`Error adding ${tool.name}:`, (error as Error).message);
    return false;
  }
}

async function discoverNewTools(): Promise<DiscoveryResult> {
  const result: DiscoveryResult = {
    success: false,
    new_tools_added: 0,
    sources_checked: 0,
    errors: [],
    discovered_tools: []
  };
  
  try {
    console.log('🔍 Starting tool discovery...');
    
    // Scrape immediate sources
    const allTools: DiscoveredTool[] = [];
    
    for (const source of TOOL_SOURCES.immediate) {
      result.sources_checked++;
      
      try {
        if (source.type === 'github' && source.url.includes('awesome')) {
          const tools = await scrapeAwesomeList(source.url);
          allTools.push(...tools);
        }
      } catch (error) {
        result.errors.push(`Failed to scrape ${source.url}: ${(error as Error).message}`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Add ProductHunt scraping
    try {
      const phTools = await scrapeProductHunt();
      allTools.push(...phTools);
      result.sources_checked++;
    } catch (error) {
      result.errors.push(`Failed to scrape ProductHunt: ${(error as Error).message}`);
    }
    
    console.log(`📊 Discovered ${allTools.length} potential tools from ${result.sources_checked} sources`);
    
    // Process and add new tools
    let processed = 0;
    for (const tool of allTools.slice(0, 20)) { // Limit to 20 tools per run
      try {
        // Check if already exists
        if (await toolExists(tool.name, tool.url)) {
          console.log(`⏭️  ${tool.name} already exists, skipping`);
          continue;
        }
        
        console.log(`🔄 Processing ${tool.name}...`);
        
        // Enrich with AI
        const enrichment = await enrichTool(tool);
        
        if (!enrichment.enriched) {
          console.log(`❌ Failed to enrich ${tool.name}, skipping`);
          continue;
        }
        
        // Add to database
        if (supabase && await addTool(tool, enrichment)) {
          result.new_tools_added++;
          result.discovered_tools.push(tool);
          console.log(`✅ Added ${tool.name}`);
        } else {
          result.discovered_tools.push(tool);
          console.log(`💾 Queued ${tool.name} (no database connection)`);
        }
        
        processed++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        result.errors.push(`Error processing ${tool.name}: ${(error as Error).message}`);
      }
    }
    
    result.success = result.errors.length === 0;
    return result;
    
  } catch (error) {
    result.errors.push(`Discovery failed: ${(error as Error).message}`);
    return result;
  }
}

async function saveDiscoveryReport(result: DiscoveryResult): Promise<void> {
  const report = {
    discovery_completed_at: new Date().toISOString(),
    success: result.success,
    new_tools_added: result.new_tools_added,
    sources_checked: result.sources_checked,
    total_discovered: result.discovered_tools.length,
    errors: result.errors,
    discovered_tools: result.discovered_tools,
    next_discovery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  const fs = await import('fs');
  fs.writeFileSync('./tool-discovery-report.json', JSON.stringify(report, null, 2));
  
  console.log('✅ Discovery report saved to tool-discovery-report.json');
}

async function main() {
  console.log('🔍 New Tools Discovery');
  console.log('======================\n');
  
  console.log('Environment check:');
  console.log('- Supabase:', supabase ? '✅' : '❌');
  console.log('- OpenAI:', openai ? '✅' : '❌');
  console.log('');
  
  const result = await discoverNewTools();
  
  await saveDiscoveryReport(result);
  
  console.log('\n📊 Discovery Summary:');
  console.log(`- Success: ${result.success ? '✅' : '❌'}`);
  console.log(`- Sources checked: ${result.sources_checked}`);
  console.log(`- Tools discovered: ${result.discovered_tools.length}`);
  console.log(`- Tools added to database: ${result.new_tools_added}`);
  console.log(`- Errors: ${result.errors.length}`);
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (result.discovered_tools.length > 0) {
    console.log('\n🆕 Discovered Tools:');
    result.discovered_tools.forEach(tool => 
      console.log(`   - ${tool.name} (${tool.source})`)
    );
  }
}

// Run the discovery
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as discoverNewTools };