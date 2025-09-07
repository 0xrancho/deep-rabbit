#!/usr/bin/env tsx
// Comprehensive RAG Intelligence Database Seeder
// Seeds with modern dev infrastructure + disruption intelligence

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Environment check
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const openaiKey = process.env.VITE_OPENAI_API_KEY;

console.log('Environment check:');
console.log('- Supabase URL:', supabaseUrl ? 'present' : 'missing');
console.log('- Supabase Key:', supabaseKey ? 'present' : 'missing');
console.log('- OpenAI Key:', openaiKey ? 'present' : 'missing');

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

interface ToolData {
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description: string;
  website?: string;
  pricing_model: string;
  pricing_details: any;
  api_available: boolean;
  github_repo?: string;
  tech_stack: string[];
  deployment_options: string[];
  integrations: string[];
  status: string;
  health_score: number;
  momentum: string;
  maturity_level: string;
  icp_scores: Record<string, number>;
  use_cases: string[];
  best_for: string;
  gabi_layer: string;
  trending_context?: string;
  why_now?: string;
  warning?: string;
}

// Modern Dev Infrastructure Intelligence
const DEV_INFRASTRUCTURE_TOOLS: ToolData[] = [
  // AI-Native Infrastructure - Compute
  {
    name: 'Vercel',
    slug: 'vercel',
    category: 'Infrastructure',
    subcategory: 'AI-Native Compute',
    description: 'AI SDK 3.0, streaming responses, edge functions optimized for AI workloads',
    website: 'vercel.com',
    pricing_model: 'freemium',
    pricing_details: { free: true, pro: 20, team: 20, enterprise: 'custom' },
    api_available: true,
    tech_stack: ['Next.js', 'React', 'TypeScript', 'Edge Functions'],
    deployment_options: ['cloud'],
    integrations: ['GitHub', 'GitLab', 'OpenAI', 'Anthropic', 'Supabase'],
    status: 'active',
    health_score: 0.95,
    momentum: 'rising',
    maturity_level: 'mature',
    icp_scores: { itsm: 0.7, agency: 0.9, saas: 0.9 },
    use_cases: ['ai-apps', 'automation-workflows', 'real-time-apps'],
    best_for: 'Deploy GABI-style agents with built-in streaming',
    gabi_layer: 'Function Execution',
    trending_context: 'Best DX for AI apps, automatic scaling',
    why_now: 'AI SDK 3.0 makes building streaming AI apps trivial'
  },
  
  {
    name: 'Replit',
    slug: 'replit',
    category: 'Infrastructure', 
    subcategory: 'AI Development',
    description: 'Replit Agents, AI pair programming, instant deployment',
    website: 'replit.com',
    pricing_model: 'freemium',
    pricing_details: { free: true, hacker: 7, pro: 20, teams: 20 },
    api_available: true,
    tech_stack: ['Python', 'JavaScript', 'AI Agents'],
    deployment_options: ['cloud'],
    integrations: ['OpenAI', 'GitHub', 'Various APIs'],
    status: 'active',
    health_score: 0.85,
    momentum: 'rising',
    maturity_level: 'growing',
    icp_scores: { itsm: 0.6, agency: 0.8, saas: 0.7 },
    use_cases: ['prototyping', 'ai-development', 'education'],
    best_for: 'Rapid prototyping of sales tools with AI assistance',
    gabi_layer: 'Function Execution',
    why_now: 'Ship POCs in hours not days with AI agents'
  },
  
  {
    name: 'Modal',
    slug: 'modal',
    category: 'Infrastructure',
    subcategory: 'Serverless GPU',
    description: 'Serverless GPU compute for fine-tuned models and heavy AI workloads',
    website: 'modal.com',
    pricing_model: 'usage-based',
    pricing_details: { compute_second_pricing: true, gpu_per_hour: 'varies' },
    api_available: true,
    tech_stack: ['Python', 'GPU', 'Containers'],
    deployment_options: ['cloud'],
    integrations: ['Hugging Face', 'PyTorch', 'TensorFlow'],
    status: 'active',
    health_score: 0.8,
    momentum: 'rising',
    maturity_level: 'growing',
    icp_scores: { itsm: 0.4, agency: 0.6, saas: 0.8 },
    use_cases: ['fine-tuning', 'model-inference', 'batch-processing'],
    best_for: 'Run fine-tuned models for specific sales processes',
    gabi_layer: 'Function Execution',
    why_now: 'No DevOps needed for custom models'
  },

  // Middleware Revolution - Workflow
  {
    name: 'n8n',
    slug: 'n8n',
    category: 'Middleware',
    subcategory: 'Workflow Automation',
    description: 'Self-hosted workflow automation with AI node support and unlimited operations',
    website: 'n8n.io',
    pricing_model: 'freemium',
    pricing_details: { free_selfhosted: true, cloud_starter: 20, cloud_pro: 50 },
    api_available: true,
    github_repo: 'n8n-io/n8n',
    tech_stack: ['Node.js', 'TypeScript', 'Vue.js'],
    deployment_options: ['self-hosted', 'cloud'],
    integrations: ['OpenAI', 'Anthropic', 'HubSpot', 'Salesforce', '400+ apps'],
    status: 'active',
    health_score: 0.9,
    momentum: 'rising',
    maturity_level: 'mature',
    icp_scores: { itsm: 0.8, agency: 0.9, saas: 0.8 },
    use_cases: ['workflow-automation', 'ai-orchestration', 'data-processing'],
    best_for: 'Complex workflows without vendor lock-in',
    gabi_layer: 'Function Execution',
    trending_context: 'No vendor lock-in, AI nodes built-in, no operation limits',
    why_now: 'JavaScript/Python code nodes for custom logic, open source'
  },
  
  {
    name: 'Pipedream',
    slug: 'pipedream',
    category: 'Middleware',
    subcategory: 'Developer Automation',
    description: 'Developer-friendly automation platform with built-in AI and code steps',
    website: 'pipedream.com',
    pricing_model: 'freemium',
    pricing_details: { free: 3000, basic: 19, advanced: 49 },
    api_available: true,
    tech_stack: ['JavaScript', 'Python', 'Node.js'],
    deployment_options: ['cloud'],
    integrations: ['OpenAI', 'Anthropic', '1000+ pre-built actions'],
    status: 'active',
    health_score: 0.85,
    momentum: 'stable',
    maturity_level: 'mature',
    icp_scores: { itsm: 0.7, agency: 0.8, saas: 0.8 },
    use_cases: ['api-automation', 'webhook-processing', 'ai-workflows'],
    best_for: 'Connect any API with code steps',
    gabi_layer: 'Function Execution',
    trending_context: 'SSH into your workflows for debugging',
    why_now: 'Native OpenAI/Anthropic steps, generous free tier'
  },

  // AI Models & APIs
  {
    name: 'OpenAI GPT-4o-mini',
    slug: 'openai-gpt4o-mini', 
    category: 'AI Model',
    subcategory: 'Language Model',
    description: 'Cost-effective language model for high-volume lead qualification and automation',
    website: 'openai.com',
    pricing_model: 'usage-based',
    pricing_details: { input_tokens: 0.15, output_tokens: 0.60, per_million: true },
    api_available: true,
    tech_stack: ['REST API', 'Python SDK', 'Node.js SDK'],
    deployment_options: ['api'],
    integrations: ['Any platform via API', 'LangChain', 'LlamaIndex'],
    status: 'active',
    health_score: 0.95,
    momentum: 'stable',
    maturity_level: 'mature',
    icp_scores: { itsm: 0.9, agency: 0.9, saas: 0.9 },
    use_cases: ['lead-qualification', 'content-generation', 'data-extraction'],
    best_for: 'Automated lead scoring and qualification at scale',
    gabi_layer: 'Conversational Interface',
    trending_context: '40x cheaper than GPT-4o for simple tasks',
    why_now: 'Fast response times (< 1 second), excellent for structured data extraction'
  },

  {
    name: 'Anthropic Claude-3-haiku',
    slug: 'anthropic-claude3-haiku',
    category: 'AI Model',
    subcategory: 'Language Model', 
    description: 'Balanced model for lead qualification with better reasoning than GPT-4o-mini',
    website: 'anthropic.com',
    pricing_model: 'usage-based',
    pricing_details: { input_tokens: 0.25, output_tokens: 1.25, per_million: true },
    api_available: true,
    tech_stack: ['REST API', 'Anthropic SDK'],
    deployment_options: ['api'],
    integrations: ['Custom integrations', 'LangChain'],
    status: 'active',
    health_score: 0.9,
    momentum: 'rising',
    maturity_level: 'mature',
    icp_scores: { itsm: 0.8, agency: 0.9, saas: 0.8 },
    use_cases: ['complex-qualification', 'reasoning-tasks', 'content-analysis'],
    best_for: 'Complex lead qualification requiring nuanced understanding',
    gabi_layer: 'Conversational Interface',
    why_now: 'Better reasoning than GPT-4o-mini, strong safety and reliability'
  },

  // Data Layer Revolution
  {
    name: 'Supabase',
    slug: 'supabase',
    category: 'Data Layer',
    subcategory: 'Backend Platform',
    description: 'Postgres + Auth + Realtime + Vector search in one platform',
    website: 'supabase.com',
    pricing_model: 'freemium',
    pricing_details: { free: true, pro: 25, team: 599 },
    api_available: true,
    github_repo: 'supabase/supabase',
    tech_stack: ['PostgreSQL', 'PostgREST', 'GoTrue', 'pgvector'],
    deployment_options: ['cloud', 'self-hosted'],
    integrations: ['Vercel', 'Next.js', 'React', 'Flutter'],
    status: 'active',
    health_score: 0.9,
    momentum: 'rising',
    maturity_level: 'mature',
    icp_scores: { itsm: 0.8, agency: 0.9, saas: 0.9 },
    use_cases: ['backend-development', 'vector-search', 'real-time-apps'],
    best_for: 'Complete backend for RevOps tools',
    gabi_layer: 'Knowledge Retrieval',
    trending_context: 'One database for everything',
    why_now: 'pgvector for embeddings alongside regular data'
  },

  {
    name: 'Pinecone', 
    slug: 'pinecone',
    category: 'Data Layer',
    subcategory: 'Vector Database',
    description: 'Serverless vector database with hybrid search capabilities',
    website: 'pinecone.io',
    pricing_model: 'freemium',
    pricing_details: { free_tier: true, starter: 70 },
    api_available: true,
    tech_stack: ['Vector DB', 'REST API'],
    deployment_options: ['cloud'],
    integrations: ['LangChain', 'LlamaIndex', 'OpenAI', 'Cohere'],
    status: 'active',
    health_score: 0.9,
    momentum: 'stable',
    maturity_level: 'mature',
    icp_scores: { itsm: 0.7, agency: 0.8, saas: 0.9 },
    use_cases: ['semantic-search', 'rag-systems', 'similarity-matching'],
    best_for: 'Store all sales knowledge, instant retrieval',
    gabi_layer: 'Knowledge Retrieval',
    why_now: 'Most mature, least operational overhead'
  },

  // AI-Native CRM Insurgents 
  {
    name: 'Attio',
    slug: 'attio',
    category: 'CRM',
    subcategory: 'AI-Native CRM',
    description: 'Multiplayer CRM with AI-native data model and flexible schemas',
    website: 'attio.com',
    pricing_model: 'freemium',
    pricing_details: { free: true, plus: 29, pro: 59 },
    api_available: true,
    tech_stack: ['Modern Web Stack', 'AI Integration'],
    deployment_options: ['cloud'],
    integrations: ['Email', 'Calendar', 'Social', 'APIs'],
    status: 'active',
    health_score: 0.85,
    momentum: 'rising',
    maturity_level: 'growing',
    icp_scores: { itsm: 0.6, agency: 0.9, saas: 0.8 },
    use_cases: ['relationship-management', 'custom-objects', 'team-collaboration'],
    best_for: 'Build custom objects without code',
    gabi_layer: 'Context Orchestration',
    trending_context: '$23.5M Series A, hot in startup scene',
    why_now: 'Flexible schemas, beautiful UI, AI everywhere'
  },

  {
    name: 'Clay',
    slug: 'clay',
    category: 'Data Orchestration',
    subcategory: 'Lead Intelligence',
    description: 'Spreadsheet + CRM + enrichment engine for data-driven prospecting',
    website: 'clay.com',
    pricing_model: 'paid',
    pricing_details: { starter: 149, explorer: 349, pro: 800 },
    api_available: true,
    tech_stack: ['Data Pipeline', 'AI Enrichment'],
    deployment_options: ['cloud'],
    integrations: ['50+ data sources', 'CRMs', 'Email tools'],
    status: 'active',
    health_score: 0.9,
    momentum: 'rising', 
    maturity_level: 'growing',
    icp_scores: { itsm: 0.6, agency: 0.9, saas: 0.8 },
    use_cases: ['lead-enrichment', 'data-orchestration', 'prospecting'],
    best_for: 'Data orchestration platform',
    gabi_layer: 'Knowledge Retrieval',
    trending_context: '$62M Series B, RevOps teams love it',
    why_now: 'Not really a CRM but replaces one for data-driven teams'
  },

  // Modern Development Stack
  {
    name: 'Cursor',
    slug: 'cursor',
    category: 'Development',
    subcategory: 'AI IDE',
    description: 'AI-first code editor that dramatically speeds up development',
    website: 'cursor.sh',
    pricing_model: 'freemium',
    pricing_details: { free: true, pro: 20 },
    api_available: false,
    tech_stack: ['VSCode Fork', 'AI Integration'],
    deployment_options: ['desktop'],
    integrations: ['GitHub', 'OpenAI', 'Anthropic'],
    status: 'active',
    health_score: 0.9,
    momentum: 'rising',
    maturity_level: 'growing',
    icp_scores: { itsm: 0.7, agency: 0.9, saas: 0.9 },
    use_cases: ['ai-development', 'rapid-prototyping', 'code-generation'],
    best_for: 'Build AI tools 10x faster with AI assistance',
    gabi_layer: 'Function Execution',
    trending_context: '10x faster coding with AI pair programming',
    why_now: 'Weekend projects that used to take weeks'
  }
];

// Pattern Database
const IMPLEMENTATION_PATTERNS = [
  {
    name: 'Weekend AI Project',
    category: 'Quick Win',
    description: 'Ship an AI feature in 2 days using modern stack',
    typical_timeline: '1 weekend',
    typical_cost_range: '$50-200/month',
    complexity: 'simple',
    architecture: 'Vercel Edge Function → OpenAI API → Supabase',
    tech_stack: ['Vercel', 'OpenAI API', 'Supabase', 'Next.js'],
    success_indicators: ['Sub-second response', '99.9% uptime', 'Linear scaling'],
    common_pitfalls: ['No error handling', 'Missing validation', 'No monitoring'],
    github_examples: ['github.com/steven-tey/precedent', 'github.com/vercel/ai-chatbot'],
    use_cases: ['lead-qualification', 'content-generation', 'data-processing'],
    icp_scores: { itsm: 0.8, agency: 0.9, saas: 0.8 },
    deployment_options: ['cloud'],
    best_for: 'Validate AI use cases quickly with minimal investment'
  },
  
  {
    name: 'Production AI Workflow',
    category: 'Scalable',
    description: 'Reliable AI system with queuing, monitoring, and multi-model support',
    typical_timeline: '2-4 weeks',
    typical_cost_range: '$200-1000/month', 
    complexity: 'moderate',
    architecture: 'Node.js + BullMQ → LiteLLM Router → PostgreSQL + Monitoring',
    tech_stack: ['Node.js', 'BullMQ', 'Redis', 'LiteLLM', 'PostgreSQL', 'Sentry'],
    success_indicators: ['1000+ jobs/hour', '30-50% cost savings', '99.5% completion rate'],
    common_pitfalls: ['Queue backlog', 'Model routing complexity', 'Monitoring gaps'],
    github_examples: ['github.com/BerriAI/litellm', 'github.com/OptimalScale/LMFlow'],
    use_cases: ['high-volume-automation', 'multi-step-workflows', 'cost-optimization'],
    icp_scores: { itsm: 0.7, agency: 0.8, saas: 0.9 },
    deployment_options: ['cloud', 'self-hosted'],
    best_for: 'Handle high volume with cost optimization and reliability'
  }
];

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });
  
  return response.data[0].embedding;
}

function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function seedTools() {
  console.log('🌱 Seeding tools database...');
  
  let successful = 0;
  let failed = 0;
  
  for (const tool of DEV_INFRASTRUCTURE_TOOLS) {
    try {
      console.log(`Processing: ${tool.name}...`);
      
      // Generate content for embedding
      const embeddingContent = `${tool.name} ${tool.description} ${tool.best_for} ${tool.use_cases.join(' ')}`;
      const embedding = await generateEmbedding(embeddingContent);
      const contentHash = Buffer.from(embeddingContent).toString('base64');
      
      // Check if tool already exists
      const { data: existing } = await supabase
        .from('tools')
        .select('id')
        .eq('slug', tool.slug)
        .single();
        
      if (existing) {
        console.log(`  ↪ ${tool.name} already exists, skipping`);
        continue;
      }
      
      // Insert new tool
      const { data, error } = await supabase
        .from('tools')
        .insert({
          ...tool,
          embedding,
          content_hash: contentHash,
          first_seen: new Date().toISOString(),
          last_validated: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          mention_count: 1
        })
        .select()
        .single();
        
      if (error) {
        console.error(`  ❌ Failed to insert ${tool.name}:`, error.message);
        failed++;
      } else {
        console.log(`  ✅ Added ${tool.name}`);
        successful++;
      }
      
      // Rate limiting - don't overwhelm OpenAI API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`  ❌ Error processing ${tool.name}:`, error);
      failed++;
    }
  }
  
  console.log(`\n📊 Tools seeding complete:`);
  console.log(`  ✅ Successful: ${successful}`);
  console.log(`  ❌ Failed: ${failed}`);
}

async function seedPatterns() {
  console.log('\n🔄 Seeding implementation patterns...');
  
  let successful = 0;
  let failed = 0;
  
  for (const pattern of IMPLEMENTATION_PATTERNS) {
    try {
      console.log(`Processing: ${pattern.name}...`);
      
      // Generate embedding
      const embeddingContent = `${pattern.name} ${pattern.description} ${pattern.architecture} ${pattern.use_cases.join(' ')}`;
      const embedding = await generateEmbedding(embeddingContent);
      
      // Check if pattern exists
      const slug = generateSlug(pattern.name);
      const { data: existing } = await supabase
        .from('patterns')
        .select('id')
        .eq('slug', slug)
        .single();
        
      if (existing) {
        console.log(`  ↪ ${pattern.name} already exists, skipping`);
        continue;
      }
      
      // Insert pattern
      const { data, error } = await supabase
        .from('patterns')
        .insert({
          name: pattern.name,
          slug,
          category: pattern.category,
          description: pattern.description,
          architecture: pattern.architecture,
          complexity: pattern.complexity,
          typical_timeline: pattern.typical_timeline,
          typical_cost_range: pattern.typical_cost_range,
          tech_stack: pattern.tech_stack,
          deployment_options: pattern.deployment_options,
          success_indicators: pattern.success_indicators,
          common_pitfalls: pattern.common_pitfalls,
          github_examples: pattern.github_examples || [],
          use_cases: pattern.use_cases || [],
          icp_scores: pattern.icp_scores,
          best_for: pattern.best_for,
          embedding,
          first_seen: new Date().toISOString(),
          last_updated: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error(`  ❌ Failed to insert ${pattern.name}:`, error.message);
        failed++;
      } else {
        console.log(`  ✅ Added ${pattern.name}`);
        successful++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`  ❌ Error processing ${pattern.name}:`, error);
      failed++;
    }
  }
  
  console.log(`\n📊 Patterns seeding complete:`);
  console.log(`  ✅ Successful: ${successful}`);
  console.log(`  ❌ Failed: ${failed}`);
}

async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('count(*)')
      .limit(1);
      
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error);
    return false;
  }
}

async function createRPCFunctions() {
  console.log('🛠️  Creating RPC functions for vector search...');
  
  const vectorSearchFunction = `
    CREATE OR REPLACE FUNCTION vector_search(
      query_embedding vector(1536),
      table_name text,
      match_threshold float DEFAULT 0.6,
      match_count int DEFAULT 10
    )
    RETURNS TABLE (
      id uuid,
      name text,
      category text,
      description text,
      similarity float
    )
    LANGUAGE sql STABLE
    AS $$
      SELECT 
        t.id,
        t.name,
        t.category,
        t.description,
        1 - (t.embedding <=> query_embedding) as similarity
      FROM tools t
      WHERE 1 - (t.embedding <=> query_embedding) > match_threshold
      ORDER BY t.embedding <=> query_embedding
      LIMIT match_count;
    $$;
  `;
  
  const patternSearchFunction = `
    CREATE OR REPLACE FUNCTION pattern_search(
      query_embedding vector(1536),
      icp text DEFAULT NULL,
      complexity text DEFAULT NULL,
      match_threshold float DEFAULT 0.6,
      match_count int DEFAULT 5
    )
    RETURNS TABLE (
      id uuid,
      name text,
      category text,
      description text,
      architecture text,
      complexity text,
      typical_timeline text,
      typical_cost_range text,
      similarity float
    )
    LANGUAGE sql STABLE
    AS $$
      SELECT 
        p.id,
        p.name,
        p.category,
        p.description,
        p.architecture,
        p.complexity,
        p.typical_timeline,
        p.typical_cost_range,
        1 - (p.embedding <=> query_embedding) as similarity
      FROM patterns p
      WHERE 
        (1 - (p.embedding <=> query_embedding) > match_threshold) AND
        (icp IS NULL OR p.icp_scores ? icp) AND
        (complexity IS NULL OR p.complexity = complexity)
      ORDER BY p.embedding <=> query_embedding
      LIMIT match_count;
    $$;
  `;
  
  try {
    await supabase.rpc('exec', { sql: vectorSearchFunction });
    await supabase.rpc('exec', { sql: patternSearchFunction });
    console.log('✅ RPC functions created successfully');
  } catch (error) {
    console.log('⚠️  RPC functions may already exist or need to be created via SQL:', error.message);
  }
}

async function saveToLocalStorage() {
  console.log('💾 Saving intelligence data to local storage...');
  
  // Create a comprehensive local intelligence package
  const localIntelligence = {
    tools: DEV_INFRASTRUCTURE_TOOLS,
    patterns: IMPLEMENTATION_PATTERNS,
    metadata: {
      generated_at: new Date().toISOString(),
      source: 'local_seed',
      version: '1.0',
      total_tools: DEV_INFRASTRUCTURE_TOOLS.length,
      total_patterns: IMPLEMENTATION_PATTERNS.length
    }
  };
  
  // Save to file
  const fs = await import('fs');
  const filePath = './local-intelligence-database.json';
  
  fs.writeFileSync(filePath, JSON.stringify(localIntelligence, null, 2));
  
  console.log(`✅ Saved ${DEV_INFRASTRUCTURE_TOOLS.length} tools and ${IMPLEMENTATION_PATTERNS.length} patterns to ${filePath}`);
  console.log('\\nTo use this data:');
  console.log('1. Copy the JSON file to your src/lib/intelligence/ directory');
  console.log('2. Import and use as fallback intelligence data');
  console.log('3. Set up Supabase environment variables later to enable full RAG');
  
  return true;
}

async function main() {
  console.log('🚀 Starting RAG Intelligence Database Seed');
  console.log('=====================================\\n');
  
  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.log('⚠️  Cannot connect to Supabase. Saving data locally instead...');
    console.log('Missing environment variables:');
    console.log('  - VITE_SUPABASE_URL');
    console.log('  - SUPABASE_SERVICE_KEY or VITE_SUPABASE_ANON_KEY');
    console.log('  - VITE_OPENAI_API_KEY\\n');
    
    await saveToLocalStorage();
    return;
  }
  
  // Create RPC functions (if needed)
  await createRPCFunctions();
  
  // Seed the database
  await seedTools();
  await seedPatterns();
  
  console.log('\\n🎉 RAG Intelligence Database seeding complete!');
  console.log('\\nNext steps:');
  console.log('1. Test the RAG retrieval system');
  console.log('2. Run an assessment to see the enhanced recommendations');
  console.log('3. Verify GABI layer categorization is working');
}

// Run the seeder
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as seedIntelligenceDatabase };