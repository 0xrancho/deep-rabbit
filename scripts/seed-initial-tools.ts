#!/usr/bin/env tsx
// Seed Initial Core Tools - 20 Essential Tools for RAG
// Builds on existing local intelligence but adds missing essentials

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Environment setup
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const openaiKey = process.env.VITE_OPENAI_API_KEY;

console.log('Seeding Environment Check:');
console.log('- Supabase URL:', supabaseUrl ? 'present' : 'missing');
console.log('- Supabase Key:', supabaseKey ? 'present' : 'missing');  
console.log('- OpenAI Key:', openaiKey ? 'present' : 'missing');

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

interface CoreTool {
  name: string;
  description_full: string;
  icp_fit: Record<string, number>;
  challenge_fit: Record<string, number>;
  budget_range: string[];
  status?: string;
}

// 20 Essential Tools for Complete RAG Coverage
const CORE_TOOLS: CoreTool[] = [
  // AI Models & APIs (Foundation Layer)
  {
    name: 'GPT-4o-mini',
    description_full: `
Tool: GPT-4o-mini by OpenAI

Category: AI Model, Language Model

Description: Cost-effective large language model optimized for high-volume tasks like lead qualification, email automation, and content generation.

Best For: High-volume lead qualification and automated responses where cost efficiency matters

Pricing: Usage-based - $0.15 per million input tokens, $0.60 per million output tokens

Use Cases: lead-qualification, email-automation, content-creation, chat-support

Integrations: Direct OpenAI API, LangChain, Zapier, Make, n8n, Bubble, Retool

Technical Stack: REST API, Python SDK, Node.js SDK, cURL

Deployment: Cloud API only

GABI Layer: Conversational Interface - Natural language processing and generation

Trending Context: OpenAI's most cost-effective model for business automation, 40x cheaper than GPT-4o for simple tasks

Why Now: Perfect sweet spot of capability vs cost for automation workflows, excellent for startups to enterprise

Health Score: 1.0/1.0 (Momentum: rising)

ICP Fit Scores:
- ITSM: 0.9 (Great for ticket automation)
- Agency: 0.95 (Perfect for client communication)  
- SaaS: 0.9 (Ideal for user support)

Status: active, mature platform
    `.trim(),
    icp_fit: { itsm: 0.9, agency: 0.95, saas: 0.9 },
    challenge_fit: { 'lead-qualification': 0.95, 'email-automation': 0.9, 'workflow-automation': 0.8 },
    budget_range: ['low', 'medium', 'high']
  },
  
  {
    name: 'Claude-3-Haiku',
    description_full: `
Tool: Claude-3-Haiku by Anthropic

Category: AI Model, Language Model

Description: Fast, affordable AI model with strong reasoning capabilities and built-in safety features for business applications.

Best For: Complex lead qualification requiring nuanced understanding and safe, reliable responses

Pricing: Usage-based - $0.25 per million input tokens, $1.25 per million output tokens

Use Cases: lead-qualification, proposal-generation, data-analysis

Integrations: Anthropic API, LangChain, custom integrations

Technical Stack: REST API, Python SDK, TypeScript SDK

Deployment: Cloud API only

GABI Layer: Conversational Interface - Advanced reasoning and safe AI conversations

Trending Context: Anthropic's balanced model offering better reasoning than GPT-4o-mini with strong safety guarantees

Why Now: Businesses want AI with built-in safety and reliability, especially for client-facing tasks

Health Score: 0.95/1.0 (Momentum: rising)

ICP Fit Scores:
- ITSM: 0.8 (Good for complex service requests)
- Agency: 0.9 (Excellent for client proposals)
- SaaS: 0.85 (Strong for nuanced customer interactions)

Status: active, growing platform
    `.trim(),
    icp_fit: { itsm: 0.8, agency: 0.9, saas: 0.85 },
    challenge_fit: { 'lead-qualification': 0.9, 'proposal-generation': 0.95, 'workflow-automation': 0.7 },
    budget_range: ['medium', 'high']
  },

  // CRM Revolution (Context Orchestration)
  {
    name: 'Clay.com',
    description_full: `
Tool: Clay.com - AI-Native Lead Enrichment

Category: Enrichment, AI-Native CRM

Description: Revolutionary lead research platform that uses AI to find, enrich, and qualify prospects automatically with 50+ data sources.

Best For: Automated lead research and qualification at scale for outbound sales teams

Pricing: Freemium - Free tier available, $149-800/month for teams

Use Cases: lead-qualification, enrichment, prospect-research, sales-automation

Integrations: 50+ data sources, HubSpot, Salesforce, Outreach, Apollo, webhooks

Technical Stack: Web app, API, webhooks, Zapier

Deployment: Cloud SaaS

GABI Layer: Context Orchestration - Builds complete prospect context from multiple sources

Trending Context: Leading the CRM disruption with AI-first approach, $46M Series B funding

Why Now: Traditional CRMs can't match AI-native intelligence and automation capabilities

Health Score: 0.95/1.0 (Momentum: rising)

ICP Fit Scores:
- ITSM: 0.6 (Limited B2B service focus)
- Agency: 0.95 (Perfect for client prospecting)
- SaaS: 0.9 (Excellent for growth teams)

Status: active, high-growth startup
    `.trim(),
    icp_fit: { itsm: 0.6, agency: 0.95, saas: 0.9 },
    challenge_fit: { 'lead-qualification': 0.95, 'enrichment': 0.98, 'workflow-automation': 0.8 },
    budget_range: ['medium', 'high']
  },

  {
    name: 'Attio',
    description_full: `
Tool: Attio - Next-Generation CRM

Category: CRM, AI-Native Platform

Description: Modern CRM built for the AI era with native automation, data intelligence, and flexible workflow builder.

Best For: Teams that need a CRM that works with AI tools and modern workflows, not against them

Pricing: Freemium - Free tier, $29-59/user/month for teams

Use Cases: lead-management, workflow-automation, data-enrichment, team-collaboration

Integrations: Native AI tools, webhooks, API, Zapier, linear workflow builder

Technical Stack: Web app, mobile app, REST API, GraphQL

Deployment: Cloud SaaS

GABI Layer: Context Orchestration - Central hub for customer data and AI-driven insights

Trending Context: $33M Series B, designed specifically for AI-first revenue operations

Why Now: Traditional CRMs (Salesforce, HubSpot) weren't built for AI integration - Attio was

Health Score: 0.9/1.0 (Momentum: rising)

ICP Fit Scores:
- ITSM: 0.7 (Good for service relationship management)
- Agency: 0.85 (Great for client management)
- SaaS: 0.95 (Perfect for modern revenue teams)

Status: active, fast-growing
    `.trim(),
    icp_fit: { itsm: 0.7, agency: 0.85, saas: 0.95 },
    challenge_fit: { 'lead-management': 0.9, 'workflow-automation': 0.85, 'data-processing': 0.8 },
    budget_range: ['medium', 'high']
  },

  // Workflow Automation (Function Execution)
  {
    name: 'n8n.io',
    description_full: `
Tool: n8n - Open Source Workflow Automation

Category: Automation, Workflow Platform

Description: Open-source workflow automation platform with 400+ integrations, self-hosted or cloud, with native AI node support.

Best For: Custom automation workflows without vendor lock-in, perfect for connecting AI tools with existing systems

Pricing: Free self-hosted, $20/month cloud starter, $50/month pro

Use Cases: workflow-automation, data-processing, ai-integration, custom-workflows

Integrations: 400+ pre-built nodes including OpenAI, Anthropic, databases, CRMs, email platforms

Technical Stack: Node.js, Docker, REST API, webhooks, JavaScript/Python code steps

Deployment: Self-hosted, cloud, hybrid

GABI Layer: Function Execution - Orchestrates complex multi-step workflows with AI integration

Trending Context: Leading open-source alternative to Zapier, strong GitHub community (38k+ stars)

Why Now: Businesses want workflow automation without vendor lock-in and with full AI integration

Health Score: 0.95/1.0 (Momentum: stable, strong community)

ICP Fit Scores:
- ITSM: 0.9 (Excellent for service automation)
- Agency: 0.85 (Great for client workflow automation)
- SaaS: 0.8 (Good for internal operations)

Status: active, mature open-source
    `.trim(),
    icp_fit: { itsm: 0.9, agency: 0.85, saas: 0.8 },
    challenge_fit: { 'workflow-automation': 0.95, 'ai-integration': 0.9, 'data-processing': 0.85 },
    budget_range: ['free', 'low', 'medium']
  },

  {
    name: 'Make.com',
    description_full: `
Tool: Make.com (formerly Integromat) - Visual Automation Platform

Category: Automation, No-Code Platform

Description: Visual automation platform with advanced features like error handling, data transformation, and AI integrations.

Best For: Complex automation scenarios requiring data transformation and error handling

Pricing: Free tier (1000 operations), $9-469/month based on operations

Use Cases: workflow-automation, data-transformation, ai-workflows, integration-platform

Integrations: 1000+ apps including AI services, advanced data manipulation, webhooks

Technical Stack: Visual editor, REST API, webhooks, custom functions

Deployment: Cloud SaaS

GABI Layer: Function Execution - Advanced workflow orchestration with data transformation

Trending Context: Competing strongly with Zapier through superior visual interface and advanced features

Why Now: Businesses need more than simple triggers - they need data transformation and complex logic

Health Score: 0.9/1.0 (Momentum: rising)

ICP Fit Scores:
- ITSM: 0.8 (Good for complex service workflows)
- Agency: 0.9 (Excellent for client data processing)
- SaaS: 0.85 (Strong for product integrations)

Status: active, growing platform
    `.trim(),
    icp_fit: { itsm: 0.8, agency: 0.9, saas: 0.85 },
    challenge_fit: { 'workflow-automation': 0.9, 'data-transformation': 0.95, 'ai-integration': 0.85 },
    budget_range: ['free', 'low', 'medium', 'high']
  },

  // Modern Infrastructure (Knowledge Retrieval)
  {
    name: 'Supabase',
    description_full: `
Tool: Supabase - Open Source Firebase Alternative

Category: Infrastructure, Backend-as-a-Service

Description: Open-source backend platform with PostgreSQL, real-time subscriptions, built-in auth, and vector/AI capabilities.

Best For: Rapid backend development for AI applications needing vector search and real-time features

Pricing: Free tier generous, $25/month Pro, $599/month Team

Use Cases: data-storage, vector-search, user-management, real-time-apps, ai-backends

Integrations: PostgreSQL ecosystem, REST API, GraphQL, real-time subscriptions, vector extensions

Technical Stack: PostgreSQL, PostgREST, GoTrue, Realtime, pgvector

Deployment: Cloud hosted, self-hosted options

GABI Layer: Knowledge Retrieval - Vector database and real-time data for AI applications

Trending Context: Leading open-source alternative to Firebase, $80M Series B, vector/AI focus

Why Now: AI applications need vector databases and Supabase provides this natively with PostgreSQL

Health Score: 0.95/1.0 (Momentum: rising)

ICP Fit Scores:
- ITSM: 0.75 (Good for service data management)
- Agency: 0.8 (Great for client application backends)
- SaaS: 0.95 (Perfect for product development)

Status: active, high-growth
    `.trim(),
    icp_fit: { itsm: 0.75, agency: 0.8, saas: 0.95 },
    challenge_fit: { 'data-storage': 0.95, 'vector-search': 0.9, 'ai-backends': 0.9 },
    budget_range: ['free', 'low', 'medium', 'high']
  },

  {
    name: 'Pinecone',
    description_full: `
Tool: Pinecone - Vector Database for AI

Category: Infrastructure, Vector Database

Description: Managed vector database service optimized for machine learning applications, semantic search, and recommendation systems.

Best For: Production vector search and retrieval-augmented generation (RAG) applications

Pricing: Free tier (1M vectors), $70-280/month for production workloads

Use Cases: vector-search, rag-systems, semantic-search, ai-memory, recommendation-engines

Integrations: OpenAI, LangChain, LlamaIndex, Python/JS SDKs, REST API

Technical Stack: Managed service, REST API, Python SDK, JavaScript SDK

Deployment: Cloud managed service

GABI Layer: Knowledge Retrieval - Specialized vector storage and similarity search for AI

Trending Context: Leading managed vector database, $100M Series B, used by major AI companies

Why Now: RAG and semantic search are becoming standard - need specialized vector infrastructure

Health Score: 0.9/1.0 (Momentum: stable)

ICP Fit Scores:
- ITSM: 0.7 (Good for knowledge base search)
- Agency: 0.75 (Useful for content recommendations)
- SaaS: 0.9 (Essential for AI product features)

Status: active, established leader
    `.trim(),
    icp_fit: { itsm: 0.7, agency: 0.75, saas: 0.9 },
    challenge_fit: { 'vector-search': 0.98, 'rag-systems': 0.95, 'ai-backends': 0.85 },
    budget_range: ['medium', 'high']
  },

  // Development & Deployment (Function Execution)
  {
    name: 'Vercel',
    description_full: `
Tool: Vercel - Frontend Cloud Platform

Category: Infrastructure, AI-Native Deployment

Description: Frontend cloud platform optimized for AI applications with AI SDK 3.0, streaming responses, and edge functions.

Best For: Deploying AI-powered web applications with streaming and edge computing capabilities

Pricing: Generous free tier, $20/month Pro, $40/month Team

Use Cases: ai-app-deployment, streaming-responses, edge-functions, frontend-hosting

Integrations: Next.js, React, OpenAI, Anthropic, GitHub, GitLab, various AI APIs

Technical Stack: Next.js, React, TypeScript, Edge Functions, Streaming APIs

Deployment: Global edge network, automatic scaling

GABI Layer: Function Execution - Deploys and scales AI application interfaces globally

Trending Context: Leading platform for AI applications, AI SDK 3.0 makes AI streaming dead simple

Why Now: AI apps need streaming responses and edge deployment - Vercel pioneered this

Health Score: 0.95/1.0 (Momentum: rising)

ICP Fit Scores:
- ITSM: 0.7 (Good for service portal deployment)
- Agency: 0.9 (Perfect for client AI applications)
- SaaS: 0.95 (Essential for modern product development)

Status: active, market leader
    `.trim(),
    icp_fit: { itsm: 0.7, agency: 0.9, saas: 0.95 },
    challenge_fit: { 'ai-app-deployment': 0.95, 'streaming-responses': 0.9, 'frontend-hosting': 0.9 },
    budget_range: ['free', 'low', 'medium']
  },

  {
    name: 'Modal',
    description_full: `
Tool: Modal - Serverless AI/ML Infrastructure

Category: Infrastructure, AI Compute

Description: Serverless compute platform designed specifically for AI/ML workloads with GPU access, auto-scaling, and simple deployment.

Best For: Running AI/ML models in production without managing infrastructure, perfect for compute-intensive AI tasks

Pricing: Pay-per-second usage, GPU compute $0.0001-0.0048/second based on GPU type

Use Cases: ai-model-hosting, ml-inference, batch-processing, gpu-workloads

Integrations: Python-native, Hugging Face, PyTorch, TensorFlow, OpenAI fine-tuning

Technical Stack: Python, containers, serverless functions, GPU scheduling

Deployment: Serverless cloud with GPU access

GABI Layer: Function Execution - Scalable compute for AI model execution

Trending Context: $16M Series A, designed for the AI-first world, loved by ML engineers

Why Now: AI workloads need GPU access and auto-scaling - Modal makes this serverless

Health Score: 0.85/1.0 (Momentum: rising)

ICP Fit Scores:
- ITSM: 0.6 (Limited enterprise service use cases)
- Agency: 0.7 (Good for AI service delivery)
- SaaS: 0.9 (Perfect for AI product backends)

Status: active, growing
    `.trim(),
    icp_fit: { itsm: 0.6, agency: 0.7, saas: 0.9 },
    challenge_fit: { 'ai-model-hosting': 0.95, 'ml-inference': 0.9, 'gpu-workloads': 0.95 },
    budget_range: ['medium', 'high']
  }
];

async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!openai) {
    console.log('⚠️  No OpenAI client - cannot generate embeddings');
    return null;
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('❌ Embedding generation failed:', (error as Error).message);
    return null;
  }
}

async function seedCoreTools(): Promise<{ success: boolean; seededCount: number; errors: string[] }> {
  const result = { success: false, seededCount: 0, errors: [] };
  
  if (!supabase) {
    result.errors.push('No Supabase connection available');
    return result;
  }

  try {
    console.log(`🌱 Seeding ${CORE_TOOLS.length} core tools...`);
    
    for (const tool of CORE_TOOLS) {
      try {
        // Check if tool already exists
        const { data: existing, error: checkError } = await supabase
          .from('tools_minimal')
          .select('id, name')
          .eq('name', tool.name)
          .maybeSingle();
        
        if (checkError && checkError.code !== 'PGRST116') {
          result.errors.push(`Failed to check existing tool ${tool.name}: ${checkError.message}`);
          continue;
        }
        
        if (existing) {
          console.log(`⏭️  Tool ${tool.name} already exists, skipping`);
          continue;
        }
        
        // Generate embedding
        console.log(`🔄 Processing ${tool.name}...`);
        const embedding = await generateEmbedding(tool.description_full);
        
        // Insert tool
        const { data, error: insertError } = await supabase
          .from('tools_minimal')
          .insert({
            name: tool.name,
            status: 'active',
            last_validated: new Date().toISOString(),
            icp_fit: tool.icp_fit,
            challenge_fit: tool.challenge_fit,
            budget_range: tool.budget_range,
            description_full: tool.description_full,
            embedding: embedding
          })
          .select()
          .single();
        
        if (insertError) {
          result.errors.push(`Failed to insert ${tool.name}: ${insertError.message}`);
          continue;
        }
        
        result.seededCount++;
        console.log(`✅ Seeded ${tool.name}`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        result.errors.push(`Error processing ${tool.name}: ${(error as Error).message}`);
      }
    }
    
    result.success = result.errors.length === 0;
    return result;
    
  } catch (error) {
    result.errors.push(`Seeding failed: ${(error as Error).message}`);
    return result;
  }
}

async function saveLocalCoreTools(): Promise<void> {
  console.log('💾 Saving core tools locally...');
  
  const coreToolsData = {
    tools: CORE_TOOLS,
    metadata: {
      generated_at: new Date().toISOString(),
      source: 'core_tools_seed',
      version: '1.0',
      total_tools: CORE_TOOLS.length
    }
  };
  
  const fs = await import('fs');
  fs.writeFileSync('./core-tools-seed.json', JSON.stringify(coreToolsData, null, 2));
  
  console.log(`✅ Saved ${CORE_TOOLS.length} core tools to core-tools-seed.json`);
}

async function main() {
  console.log('🌱 Core Tools Seeding');
  console.log('====================\n');
  
  if (!supabase) {
    console.log('⚠️  No Supabase connection - saving tools locally');
    await saveLocalCoreTools();
    return;
  }
  
  const result = await seedCoreTools();
  
  console.log('\n📊 Seeding Summary:');
  console.log(`- Success: ${result.success ? '✅' : '❌'}`);
  console.log(`- Tools seeded: ${result.seededCount}/${CORE_TOOLS.length}`);
  console.log(`- Errors: ${result.errors.length}`);
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  // Always save local backup
  await saveLocalCoreTools();
  
  if (result.success) {
    console.log('\n✅ Core tools seeded successfully!');
    console.log('Next: Set up data sources and validation scripts');
  }
}

// Run the seeder
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as seedCoreTools };