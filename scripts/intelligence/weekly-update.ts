// Weekly Intelligence Update Script
// Scans RSS feeds, GitHub trending, and API changelogs for new tools

import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import { Octokit } from '@octokit/rest';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const github = new Octokit({ auth: process.env.GITHUB_TOKEN });
const parser = new Parser();

interface ToolFinding {
  source: string;
  sourceUrl?: string;
  name: string;
  description?: string;
  url?: string;
  category?: string;
  pricing?: any;
  isRelevant: boolean;
}

export async function runWeeklyUpdate() {
  console.log(`[WEEKLY UPDATE] Starting - ${new Date().toISOString()}`);
  
  const updates = {
    newTools: [],
    updatedTools: [],
    errors: []
  };
  
  try {
    // 1. Scan RSS feeds for new tools
    console.log('[1/6] Scanning RSS feeds...');
    const rssFindings = await scanRSSFeeds();
    console.log(`Found ${rssFindings.length} potential tools from RSS`);
    
    // 2. Check GitHub trending
    console.log('[2/6] Checking GitHub trending...');
    const githubFindings = await scanGitHubTrending();
    console.log(`Found ${githubFindings.length} potential tools from GitHub`);
    
    // 3. Process and deduplicate findings
    console.log('[3/6] Processing findings...');
    const processed = await processFindings([...rssFindings, ...githubFindings]);
    console.log(`Processed ${processed.length} unique findings`);
    
    // 4. Categorize and score new tools
    console.log('[4/6] Categorizing new tools...');
    for (const tool of processed) {
      try {
        const categorized = await categorizeTool(tool);
        if (!categorized) continue;
        
        const embedded = await generateEmbedding(categorized);
        const scored = await scoreForICPs(categorized);
        
        // Check if tool already exists
        const { data: existing } = await supabase
          .from('tools')
          .select('id')
          .eq('slug', generateSlug(categorized.name))
          .single();
        
        if (!existing) {
          // Insert new tool
          const { data, error } = await supabase
            .from('tools')
            .insert({
              name: categorized.name,
              slug: generateSlug(categorized.name),
              category: categorized.category,
              subcategory: categorized.subcategory,
              description: categorized.description,
              website: categorized.url,
              pricing_model: categorized.pricing_model,
              pricing_details: categorized.pricing_details,
              use_cases: categorized.use_cases,
              best_for: categorized.best_for,
              deployment_options: categorized.deployment_options,
              integrations: categorized.integrations,
              embedding: embedded,
              icp_scores: scored.icp_scores,
              first_seen: new Date().toISOString(),
              status: 'active'
            })
            .select()
            .single();
          
          if (!error && data) {
            updates.newTools.push(data);
            console.log(`✅ Added new tool: ${data.name}`);
          } else {
            console.error(`❌ Failed to add ${categorized.name}:`, error);
            updates.errors.push({ tool: categorized.name, error: error?.message });
          }
        }
      } catch (error) {
        console.error(`Error processing tool ${tool.name}:`, error);
        updates.errors.push({ tool: tool.name, error: error.message });
      }
    }
    
    // 5. Update existing tools metrics
    console.log('[5/6] Updating existing tools...');
    await updateExistingToolsMetrics();
    
    // 6. Store weekly snapshot
    console.log('[6/6] Storing weekly snapshot...');
    await storeWeeklySnapshot({
      week_of: getWeekStart(),
      update_type: 'weekly',
      new_tools: updates.newTools.map(t => t.id),
      updated_tools: updates.updatedTools,
      raw_sources: {
        rss_count: rssFindings.length,
        github_count: githubFindings.length,
        processed_count: processed.length,
        errors: updates.errors
      }
    });
    
    console.log(`[WEEKLY UPDATE] Complete - Added ${updates.newTools.length} new tools`);
    console.log(`New tools: ${updates.newTools.map(t => t.name).join(', ')}`);
    
    if (updates.errors.length > 0) {
      console.log(`Errors: ${updates.errors.length}`);
    }
    
    return {
      success: true,
      newToolsCount: updates.newTools.length,
      errors: updates.errors
    };
    
  } catch (error) {
    console.error('[WEEKLY UPDATE] Failed:', error);
    return {
      success: false,
      error: error.message,
      newToolsCount: 0,
      errors: [...updates.errors, { general: error.message }]
    };
  }
}

async function scanRSSFeeds(): Promise<ToolFinding[]> {
  const feeds = [
    { 
      url: 'https://www.producthunt.com/feed', 
      filter: /ai|automation|sales|crm|workflow|llm|gpt/i,
      source: 'ProductHunt'
    },
    { 
      url: 'https://news.ycombinator.com/rss', 
      filter: /Show HN.*(?:ai|llm|gpt|claude|automation|sales|workflow)/i,
      source: 'HackerNews'
    }
  ];
  
  const findings: ToolFinding[] = [];
  
  for (const feed of feeds) {
    try {
      console.log(`Scanning ${feed.source}...`);
      const parsed = await parser.parseURL(feed.url);
      const recentItems = parsed.items.filter(item => {
        const itemDate = new Date(item.pubDate || item.isoDate || 0);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return itemDate > weekAgo;
      });
      
      const filtered = recentItems.filter(item => 
        feed.filter.test((item.title || '') + ' ' + (item.content || ''))
      );
      
      console.log(`${feed.source}: ${filtered.length} relevant items from ${recentItems.length} recent`);
      
      for (const item of filtered) {
        const extracted = await extractToolInfo(item, feed.source);
        if (extracted && extracted.isRelevant) {
          findings.push({
            ...extracted,
            source: feed.source,
            sourceUrl: item.link
          });
        }
      }
    } catch (error) {
      console.error(`Failed to parse ${feed.source}:`, error);
    }
  }
  
  return findings;
}

async function scanGitHubTrending(): Promise<ToolFinding[]> {
  const queries = [
    'sales automation language:python stars:>10 created:>2024-01-01',
    'ai workflow language:typescript stars:>5 pushed:>2024-10-01',
    'llm application stars:>10 created:>2024-06-01',
    'crm integration ai stars:>5',
    'lead qualification automation stars:>5'
  ];
  
  const findings: ToolFinding[] = [];
  
  for (const query of queries) {
    try {
      console.log(`GitHub query: ${query}`);
      const { data } = await github.search.repos({
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: 5 // Limit to avoid rate limits
      });
      
      for (const repo of data.items) {
        // Basic check if it's actually a tool/product
        const isTool = await checkIfTool(repo);
        
        if (isTool) {
          findings.push({
            source: 'GitHub',
            sourceUrl: repo.html_url,
            name: repo.name,
            description: repo.description || '',
            url: repo.homepage || repo.html_url,
            isRelevant: true
          });
        }
      }
    } catch (error) {
      console.error(`GitHub search failed for "${query}":`, error);
    }
  }
  
  return findings;
}

async function checkIfTool(repo: any): Promise<boolean> {
  // Simple heuristics to determine if repo is actually a tool
  const name = repo.name.toLowerCase();
  const desc = (repo.description || '').toLowerCase();
  
  // Skip obvious non-tools
  if (name.includes('tutorial') || name.includes('example') || 
      name.includes('learning') || desc.includes('tutorial')) {
    return false;
  }
  
  // Positive signals
  const toolSignals = [
    'api', 'tool', 'platform', 'service', 'app', 'bot',
    'automation', 'workflow', 'crm', 'sales', 'ai'
  ];
  
  return toolSignals.some(signal => 
    name.includes(signal) || desc.includes(signal)
  ) && repo.stargazers_count > 5;
}

async function extractToolInfo(item: any, source: string): Promise<ToolFinding | null> {
  const prompt = `
Extract tool information from this ${source} post:

Title: ${item.title}
Content: ${(item.content || item.contentSnippet || '').slice(0, 1000)}
Link: ${item.link}

Determine if this is about a software tool/service relevant for B2B sales, marketing, or revenue operations.

If relevant, extract:
- name: Tool/product name
- description: What it does (keep concise)
- category: One of [ai-model, automation, analytics, enrichment, workflow, crm, infrastructure, framework, other]
- url: Product website if mentioned
- isRelevant: true if relevant for B2B revenue operations

Return as JSON or null if not relevant.
  `;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 500
      })
    });
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Handle both JSON and "null" responses
    if (content.trim().toLowerCase() === 'null') {
      return null;
    }
    
    const extracted = JSON.parse(content);
    return extracted?.isRelevant ? extracted : null;
  } catch (error) {
    console.error(`Failed to extract info for ${item.title}:`, error);
    return null;
  }
}

async function processFindings(findings: ToolFinding[]): Promise<ToolFinding[]> {
  // Deduplicate by name (case insensitive)
  const seen = new Set();
  const unique = findings.filter(finding => {
    const key = finding.name.toLowerCase().trim();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
  
  return unique.filter(f => f.isRelevant);
}

async function categorizeTool(tool: ToolFinding) {
  const prompt = `
Categorize this tool for B2B revenue operations:

Name: ${tool.name}
Description: ${tool.description}
URL: ${tool.url}
Source: ${tool.source}

Determine:
- category: Primary category [ai-model, automation, analytics, enrichment, workflow, crm, infrastructure, framework, other]
- subcategory: Specific type within category
- use_cases: Array from [lead-generation, lead-qualification, enrichment, proposal-generation, meeting-intelligence, analytics, workflow-automation, data-processing, content-creation, user-management, ai-development, rag-systems]
- best_for: One-line description of ideal use case
- deployment_options: [cloud, self-hosted, api-only]
- integrations: Known integrations (be conservative)
- pricing_model: [free, freemium, paid, usage-based]
- pricing_details: Basic pricing if mentioned

Return as JSON with these exact fields.
  `;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 800
      })
    });
    
    const data = await response.json();
    const categorized = JSON.parse(data.choices[0].message.content);
    
    return {
      ...tool,
      ...categorized
    };
  } catch (error) {
    console.error(`Failed to categorize ${tool.name}:`, error);
    return null;
  }
}

async function generateEmbedding(tool: any): Promise<number[]> {
  // Create rich text for embedding
  const text = `
    ${tool.name}
    ${tool.category} ${tool.subcategory || ''}
    ${tool.description || ''}
    ${tool.best_for || ''}
    ${tool.use_cases?.join(' ') || ''}
    ${tool.integrations?.join(' ') || ''}
  `.trim();
  
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text
    })
  });
  
  const data = await response.json();
  return data.data[0].embedding;
}

async function scoreForICPs(tool: any) {
  const icps = ['itsm', 'agency', 'saas'];
  const scores = {};
  
  // Simple rule-based scoring for now
  for (const icp of icps) {
    scores[icp] = calculateICPScore(tool, icp);
  }
  
  return { icp_scores: scores };
}

function calculateICPScore(tool: any, icp: string): number {
  let score = 0.5; // Base score
  
  const category = tool.category?.toLowerCase() || '';
  const useCases = tool.use_cases || [];
  const description = (tool.description || '').toLowerCase();
  
  // ICP-specific scoring rules
  switch (icp) {
    case 'itsm':
      if (category.includes('automation') || category.includes('workflow')) score += 0.2;
      if (useCases.includes('workflow-automation')) score += 0.2;
      if (description.includes('ticket') || description.includes('service')) score += 0.1;
      break;
      
    case 'agency':
      if (useCases.includes('proposal-generation') || useCases.includes('content-creation')) score += 0.3;
      if (category.includes('ai-model')) score += 0.2;
      if (useCases.includes('lead-qualification')) score += 0.2;
      break;
      
    case 'saas':
      if (category.includes('analytics') || category.includes('infrastructure')) score += 0.2;
      if (useCases.includes('user-management') || useCases.includes('data-processing')) score += 0.2;
      if (description.includes('api') || description.includes('integration')) score += 0.1;
      break;
  }
  
  return Math.min(1.0, score);
}

async function updateExistingToolsMetrics() {
  // For now, just update last_validated timestamp
  // In a full implementation, we'd check GitHub stars, website status, etc.
  
  const { data: activeTools } = await supabase
    .from('tools')
    .select('id, name')
    .eq('status', 'active')
    .limit(10); // Limit to avoid rate limits
  
  if (activeTools) {
    for (const tool of activeTools) {
      await supabase
        .from('tools')
        .update({ last_validated: new Date().toISOString() })
        .eq('id', tool.id);
    }
  }
}

async function storeWeeklySnapshot(snapshot: any) {
  const { error } = await supabase
    .from('intelligence_updates')
    .insert(snapshot);
  
  if (error) {
    console.error('Failed to store weekly snapshot:', error);
  }
}

function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek; // Sunday = 0
  const weekStart = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
  return weekStart.toISOString().split('T')[0];
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// CLI support
if (require.main === module) {
  runWeeklyUpdate()
    .then(result => {
      console.log('Update result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}