#!/usr/bin/env tsx
// Tool Validation and Refresh Script
// Validates existing tools and refreshes stale data weekly

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Environment setup
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const openaiKey = process.env.VITE_OPENAI_API_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

interface ValidationResult {
  success: boolean;
  validatedCount: number;
  deprecatedCount: number;
  refreshedCount: number;
  errors: string[];
}

interface ToolValidation {
  id: string;
  name: string;
  description_full: string;
  last_validated: string;
  status: string;
  website_url?: string;
}

// Extract URL from description_full field
function extractURL(description: string): string | null {
  // Look for website/URL patterns in description
  const urlPatterns = [
    /Website:\s*([^\s\n]+)/i,
    /URL:\s*([^\s\n]+)/i,
    /https?:\/\/[^\s\n)]+/g,
    /(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(?:\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})*\.(?:[a-zA-Z]{2,})/g
  ];
  
  for (const pattern of urlPatterns) {
    const match = description.match(pattern);
    if (match) {
      let url = Array.isArray(match) ? match[0] : match[1] || match[0];
      
      // Clean up URL
      url = url.replace(/[.,;!?)\]]+$/, ''); // Remove trailing punctuation
      
      // Add protocol if missing
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }
      
      return url;
    }
  }
  
  return null;
}

// Check if URL is accessible
async function checkURL(url: string, timeout: number = 5000): Promise<{accessible: boolean, status?: number, error?: string}> {
  if (!url) {
    return { accessible: false, error: 'No URL provided' };
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'RAG-Intelligence-Bot/1.0 (+https://github.com/your-repo)'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Consider 2xx, 3xx as accessible (redirects are fine)
    const accessible = response.status >= 200 && response.status < 400;
    
    return {
      accessible,
      status: response.status
    };
    
  } catch (error: any) {
    return {
      accessible: false,
      error: error.name === 'AbortError' ? 'Timeout' : error.message
    };
  }
}

// Mark tool as deprecated
async function markDeprecated(toolId: string, reason: string): Promise<boolean> {
  if (!supabase) return false;
  
  try {
    const { error } = await supabase
      .from('tools_minimal')
      .update({ 
        status: 'deprecated',
        last_validated: new Date().toISOString()
      })
      .eq('id', toolId);
      
    if (error) {
      console.error(`Failed to mark tool ${toolId} as deprecated:`, error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error marking tool ${toolId} as deprecated:`, (error as Error).message);
    return false;
  }
}

// Refresh tool pricing and information
async function refreshPricing(tool: ToolValidation): Promise<{updated: boolean, newDescription?: string}> {
  if (!openai) {
    return { updated: false };
  }
  
  const url = extractURL(tool.description_full);
  if (!url) {
    return { updated: false };
  }
  
  try {
    // Use LLM to research and update pricing
    const prompt = `
Research and update pricing information for this tool:

Tool Name: ${tool.name}
Current Description: ${tool.description_full}
Website: ${url}

Please provide an updated description_full with current pricing information. 
Keep the same format but update any pricing details you can verify.
If you cannot verify current pricing, keep the existing information.

Return the full updated description or "NO_UPDATE" if no changes needed.
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 1500
    });
    
    const updatedDescription = response.choices[0].message.content?.trim();
    
    if (!updatedDescription || updatedDescription === 'NO_UPDATE' || updatedDescription === tool.description_full) {
      return { updated: false };
    }
    
    return { updated: true, newDescription: updatedDescription };
    
  } catch (error) {
    console.error(`Failed to refresh pricing for ${tool.name}:`, (error as Error).message);
    return { updated: false };
  }
}

// Update tool with new description and embedding
async function updateTool(toolId: string, newDescription: string): Promise<boolean> {
  if (!supabase || !openai) return false;
  
  try {
    // Generate new embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: newDescription
    });
    
    const embedding = embeddingResponse.data[0].embedding;
    
    // Update tool
    const { error } = await supabase
      .from('tools_minimal')
      .update({
        description_full: newDescription,
        embedding: embedding,
        last_validated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', toolId);
    
    if (error) {
      console.error(`Failed to update tool ${toolId}:`, error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating tool ${toolId}:`, (error as Error).message);
    return false;
  }
}

async function validateAndRefresh(): Promise<ValidationResult> {
  const result: ValidationResult = {
    success: false,
    validatedCount: 0,
    deprecatedCount: 0,
    refreshedCount: 0,
    errors: []
  };
  
  if (!supabase) {
    result.errors.push('No Supabase connection available');
    return result;
  }
  
  try {
    // Get tools that need validation (older than 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    console.log('🔍 Finding tools needing validation...');
    
    const { data: tools, error: fetchError } = await supabase
      .from('tools_minimal')
      .select('id, name, description_full, last_validated, status')
      .eq('status', 'active')
      .lt('last_validated', oneWeekAgo.toISOString());
    
    if (fetchError) {
      result.errors.push(`Failed to fetch tools: ${fetchError.message}`);
      return result;
    }
    
    if (!tools || tools.length === 0) {
      console.log('✅ All tools are up to date');
      result.success = true;
      return result;
    }
    
    console.log(`📋 Found ${tools.length} tools needing validation`);
    
    for (const tool of tools) {
      try {
        console.log(`🔄 Validating ${tool.name}...`);
        
        // Extract and check URL
        const url = extractURL(tool.description_full);
        
        if (url) {
          const urlCheck = await checkURL(url);
          
          if (!urlCheck.accessible) {
            console.log(`❌ ${tool.name} is not accessible: ${urlCheck.error || 'HTTP ' + urlCheck.status}`);
            
            if (await markDeprecated(tool.id, `Website inaccessible: ${urlCheck.error || 'HTTP ' + urlCheck.status}`)) {
              result.deprecatedCount++;
            }
            continue;
          } else {
            console.log(`✅ ${tool.name} is accessible (HTTP ${urlCheck.status})`);
          }
        }
        
        // Try to refresh pricing information
        const refreshResult = await refreshPricing(tool);
        
        if (refreshResult.updated && refreshResult.newDescription) {
          console.log(`🔄 Refreshing information for ${tool.name}...`);
          
          if (await updateTool(tool.id, refreshResult.newDescription)) {
            result.refreshedCount++;
            console.log(`✅ Refreshed ${tool.name}`);
          }
        } else {
          // Just update validation timestamp
          const { error } = await supabase
            .from('tools_minimal')
            .update({ last_validated: new Date().toISOString() })
            .eq('id', tool.id);
            
          if (error) {
            result.errors.push(`Failed to update validation timestamp for ${tool.name}: ${error.message}`);
          }
        }
        
        result.validatedCount++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        result.errors.push(`Error validating ${tool.name}: ${(error as Error).message}`);
      }
    }
    
    result.success = result.errors.length === 0;
    return result;
    
  } catch (error) {
    result.errors.push(`Validation failed: ${(error as Error).message}`);
    return result;
  }
}

async function saveValidationReport(result: ValidationResult): Promise<void> {
  const report = {
    validation_completed_at: new Date().toISOString(),
    success: result.success,
    tools_validated: result.validatedCount,
    tools_deprecated: result.deprecatedCount,
    tools_refreshed: result.refreshedCount,
    errors: result.errors,
    summary: {
      total_checks: result.validatedCount,
      health_rate: result.validatedCount > 0 ? 
        ((result.validatedCount - result.deprecatedCount) / result.validatedCount * 100).toFixed(1) + '%' 
        : '100%',
      refresh_rate: result.validatedCount > 0 ?
        (result.refreshedCount / result.validatedCount * 100).toFixed(1) + '%'
        : '0%'
    },
    next_validation: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  const fs = await import('fs');
  fs.writeFileSync('./tool-validation-report.json', JSON.stringify(report, null, 2));
  
  console.log('✅ Validation report saved to tool-validation-report.json');
}

async function main() {
  console.log('🔍 Tool Validation and Refresh');
  console.log('===============================\n');
  
  console.log('Environment check:');
  console.log('- Supabase:', supabase ? '✅' : '❌');
  console.log('- OpenAI:', openai ? '✅' : '❌');
  console.log('');
  
  if (!supabase) {
    console.log('❌ Cannot validate without Supabase connection');
    await saveValidationReport({
      success: false,
      validatedCount: 0,
      deprecatedCount: 0,
      refreshedCount: 0,
      errors: ['No Supabase connection']
    });
    return;
  }
  
  const result = await validateAndRefresh();
  
  await saveValidationReport(result);
  
  console.log('\n📊 Validation Summary:');
  console.log(`- Success: ${result.success ? '✅' : '❌'}`);
  console.log(`- Tools validated: ${result.validatedCount}`);
  console.log(`- Tools deprecated: ${result.deprecatedCount}`);
  console.log(`- Tools refreshed: ${result.refreshedCount}`);
  console.log(`- Errors: ${result.errors.length}`);
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (result.success) {
    const healthRate = result.validatedCount > 0 ? 
      ((result.validatedCount - result.deprecatedCount) / result.validatedCount * 100) : 100;
    console.log(`\n💚 Database health: ${healthRate.toFixed(1)}%`);
  }
}

// Run the validator
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as validateTools };