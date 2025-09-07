#!/usr/bin/env tsx
// Migrate to Minimal Schema Script
// Migrates existing complex schema to minimal 8-column schema

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Environment check
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const openaiKey = process.env.VITE_OPENAI_API_KEY;

console.log('Migration Environment Check:');
console.log('- Supabase URL:', supabaseUrl ? 'present' : 'missing');
console.log('- Supabase Key:', supabaseKey ? 'present' : 'missing');
console.log('- OpenAI Key:', openaiKey ? 'present' : 'missing');

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

interface MigrationResult {
  success: boolean;
  migratedCount: number;
  regeneratedEmbeddings: number;
  errors: string[];
}

async function testConnection(): Promise<boolean> {
  if (!supabase) {
    console.log('❌ No Supabase client available');
    return false;
  }

  try {
    console.log('🔌 Testing Supabase connection...');
    const { data, error } = await supabase.from('tools').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log(`✅ Connected to Supabase. Found ${data?.length || 0} existing tools.`);
    return true;
  } catch (error) {
    console.log('❌ Connection error:', (error as Error).message);
    return false;
  }
}

async function runMigration(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migratedCount: 0,
    regeneratedEmbeddings: 0,
    errors: []
  };

  try {
    console.log('🚀 Starting schema migration...');
    
    // Step 1: Run the migration function
    console.log('📋 Step 1: Migrating existing tools to minimal schema...');
    const { data: migrationResult, error: migrationError } = await supabase!
      .rpc('migrate_tools_to_minimal');
    
    if (migrationError) {
      result.errors.push(`Migration failed: ${migrationError.message}`);
      return result;
    }
    
    result.migratedCount = migrationResult || 0;
    console.log(`✅ Migrated ${result.migratedCount} tools to minimal schema`);
    
    // Step 2: Check which tools need new embeddings
    console.log('📋 Step 2: Checking embedding status...');
    const { data: embeddingStatus, error: statusError } = await supabase!
      .rpc('regenerate_embeddings_needed');
    
    if (statusError) {
      result.errors.push(`Status check failed: ${statusError.message}`);
      return result;
    }
    
    console.log(`📊 Embedding Status:`);
    console.log(`- Tools with embeddings: ${embeddingStatus?.filter(t => t.has_embedding).length || 0}`);
    console.log(`- Tools needing embeddings: ${embeddingStatus?.filter(t => !t.has_embedding).length || 0}`);
    
    // Step 3: Regenerate embeddings for tools without them
    if (openai) {
      console.log('📋 Step 3: Regenerating missing embeddings...');
      const toolsNeedingEmbeddings = embeddingStatus?.filter(t => !t.has_embedding) || [];
      
      for (const tool of toolsNeedingEmbeddings) {
        try {
          // Get the tool's rich description
          const { data: toolData, error: toolError } = await supabase!
            .from('tools_minimal')
            .select('id, name, description_full')
            .eq('name', tool.tool_name)
            .single();
            
          if (toolError || !toolData) {
            result.errors.push(`Failed to fetch tool ${tool.tool_name}: ${toolError?.message}`);
            continue;
          }
          
          // Generate embedding
          const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: toolData.description_full
          });
          
          const embedding = embeddingResponse.data[0].embedding;
          
          // Update tool with embedding
          const { error: updateError } = await supabase!
            .from('tools_minimal')
            .update({ 
              embedding: embedding,
              updated_at: new Date().toISOString()
            })
            .eq('id', toolData.id);
            
          if (updateError) {
            result.errors.push(`Failed to update embedding for ${tool.tool_name}: ${updateError.message}`);
            continue;
          }
          
          result.regeneratedEmbeddings++;
          console.log(`✅ Generated embedding for ${tool.tool_name}`);
          
          // Rate limiting - wait between requests
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          result.errors.push(`Embedding generation failed for ${tool.tool_name}: ${(error as Error).message}`);
        }
      }
    } else {
      console.log('⚠️  No OpenAI client - skipping embedding regeneration');
      result.errors.push('OpenAI client unavailable - embeddings not regenerated');
    }
    
    // Step 4: Validation
    console.log('📋 Step 4: Validating migration...');
    const { data: finalCount, error: countError } = await supabase!
      .from('tools_minimal')
      .select('count', { count: 'exact', head: true });
      
    if (countError) {
      result.errors.push(`Validation failed: ${countError.message}`);
    } else {
      console.log(`✅ Migration complete: ${finalCount?.length || 0} tools in minimal schema`);
    }
    
    result.success = result.errors.length === 0;
    return result;
    
  } catch (error) {
    result.errors.push(`Migration failed: ${(error as Error).message}`);
    return result;
  }
}

async function saveLocalMigrationReport(result: MigrationResult) {
  console.log('💾 Saving migration report...');
  
  const report = {
    migration_completed_at: new Date().toISOString(),
    success: result.success,
    migrated_tools: result.migratedCount,
    regenerated_embeddings: result.regeneratedEmbeddings,
    errors: result.errors,
    schema_changes: [
      'Created tools_minimal table with 8 core columns',
      'Added rich description_full field for embedding',
      'Added icp_fit, challenge_fit, budget_range for pre-filtering',
      'Created simplified vector_search_minimal RPC function',
      'Migrated existing tools from complex schema'
    ],
    next_steps: [
      'Update RAG retriever to use tools_minimal table',
      'Update weekly intelligence script for tool validation',
      'Add new intelligence sources (awesome-ai-agents, TAIT)',
      'Test end-to-end with simplified pipeline'
    ]
  };
  
  // Save to file
  const fs = await import('fs');
  fs.writeFileSync('./migration-report.json', JSON.stringify(report, null, 2));
  
  console.log('✅ Migration report saved to migration-report.json');
  return report;
}

async function main() {
  console.log('🔄 Minimal Schema Migration');
  console.log('============================\n');
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('❌ Cannot connect to Supabase. Check environment variables.');
    console.log('   Migration report will be saved locally.');
    
    const localReport = await saveLocalMigrationReport({
      success: false,
      migratedCount: 0,
      regeneratedEmbeddings: 0,
      errors: ['No Supabase connection available']
    });
    
    return;
  }
  
  // Run migration
  const result = await runMigration();
  
  // Save report
  await saveLocalMigrationReport(result);
  
  // Summary
  console.log('\n🎉 Migration Summary:');
  console.log(`- Success: ${result.success ? '✅' : '❌'}`);
  console.log(`- Tools migrated: ${result.migratedCount}`);
  console.log(`- Embeddings regenerated: ${result.regeneratedEmbeddings}`);
  console.log(`- Errors: ${result.errors.length}`);
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (result.success) {
    console.log('\n✅ Next steps:');
    console.log('1. Update RAG retriever to use tools_minimal table');
    console.log('2. Update weekly intelligence script');  
    console.log('3. Test simplified vector search');
  }
}

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as migrateToMinimalSchema };