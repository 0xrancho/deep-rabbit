// Vector RAG Retriever - True Semantic Search Implementation
// Uses vector similarity instead of basic SQL filtering

import { supabase } from '../supabase';
import OpenAI from 'openai';

// Environment variables with fallback (works in both browser and Node.js)
const openaiKey = typeof import.meta !== 'undefined' && import.meta.env ?
  import.meta.env.VITE_OPENAI_API_KEY : process.env.VITE_OPENAI_API_KEY;

export interface VectorSearchResult {
  id: string;
  name: string;
  description: string;
  pricing: string;
  integrations: string;
  gabiLayer: string;
  implementation: string;
  bestFor: string;
  similarity: number;
  raw: string;
}

export interface SearchContext {
  icp?: string;
  challenge?: string;
  budget?: string;
  limit?: number;
}

export class VectorRAGRetriever {
  private supabase;
  private openai;
  private isAvailable: boolean;
  
  constructor() {
    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined';
    
    // Use centralized Supabase client
    this.supabase = supabase;
    
    // NEVER initialize OpenAI in the browser - this would expose API keys
    // OpenAI calls should only happen server-side
    if (isBrowser) {
      console.log('🔒 VectorRAG: Running in browser - using fallback tools for security');
      this.openai = null;
      this.isAvailable = false;
    } else {
      // Only initialize OpenAI in Node.js environment (server-side)
      this.openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;
      this.isAvailable = !!(this.supabase && this.openai);
    }
    
    if (!this.isAvailable) {
      console.log('⚠️  VectorRAG: Using curated fallback tools (OpenAI disabled in browser for security)');
    } else {
      console.log('✅ VectorRAG: Initialized with semantic search capabilities (server-side only)');
    }
  }
  
  /**
   * Main retrieval function using vector similarity
   * 1. Converts query text to embedding
   * 2. Searches for similar embeddings in database  
   * 3. Applies filters after similarity matching
   */
  async retrieveTools(
    query: string,
    context: SearchContext = {}
  ): Promise<VectorSearchResult[]> {
    console.log('[VectorRAG] Starting semantic retrieval for:', query);
    
    if (!this.isAvailable) {
      console.log('[VectorRAG] Vector search unavailable, using fallback');
      return this.getFallbackTools(query, context);
    }
    
    try {
      // Step 1: Generate embedding for the search query
      const queryEmbedding = await this.generateEmbedding(query);
      if (!queryEmbedding) {
        return this.getFallbackTools(query, context);
      }
      
      // Step 2: Execute vector similarity search with RPC function
      const { data, error } = await this.supabase!.rpc('vector_search_minimal', {
        query_embedding: queryEmbedding,
        match_threshold: 0.6,  // Lower threshold for broader semantic matching
        match_count: context.limit || 10,
        icp_filter: context.icp || null,
        challenge_filter: context.challenge || null,
        budget_filter: context.budget || null
      });
      
      if (error) {
        console.error('[VectorRAG] Vector search failed:', error.message);
        return this.getFallbackTools(query, context);
      }
      
      console.log(`[VectorRAG] Found ${data?.length || 0} semantically similar tools`);
      
      if (!data || data.length === 0) {
        console.log('[VectorRAG] No vector matches found, using fallback');
        return this.getFallbackTools(query, context);
      }
      
      // Step 3: Parse rich descriptions from results
      return this.parseToolDescriptions(data);
      
    } catch (error) {
      console.error('[VectorRAG] Error in vector retrieval:', (error as Error).message);
      return this.getFallbackTools(query, context);
    }
  }
  
  /**
   * Generate embedding vector from text
   * This converts semantic meaning into 1536 numbers
   */
  private async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.openai) return null;
    
    try {
      console.log('[VectorRAG] Generating embedding for query...');
      
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      });
      
      console.log('✅ Embedding generated successfully');
      return response.data[0].embedding;
      
    } catch (error) {
      console.error('[VectorRAG] Embedding generation failed:', (error as Error).message);
      return null;
    }
  }
  
  /**
   * Parse structured data from rich text descriptions
   * Since all data is in description_full, we extract what we need
   */
  private parseToolDescriptions(tools: any[]): VectorSearchResult[] {
    return tools.map(tool => ({
      id: tool.id,
      name: tool.name,
      description: this.extractSection(tool.description_full, 'Description'),
      pricing: this.extractSection(tool.description_full, 'Pricing'),
      integrations: this.extractSection(tool.description_full, 'Integrations'),
      gabiLayer: this.extractSection(tool.description_full, 'GABI Layer'),
      implementation: this.extractImplementationTime(tool.description_full),
      bestFor: this.extractSection(tool.description_full, 'Best For'),
      similarity: tool.similarity || 0, // How similar to query (0-1)
      raw: tool.description_full // Keep original for reference
    }));
  }
  
  /**
   * Extract specific sections from rich text using multiple patterns
   */
  private extractSection(text: string, section: string): string {
    const patterns = [
      new RegExp(`${section}:?\\s*([^\\n]+)`, 'i'),
      new RegExp(`${section}[:\\s]+(.+?)(?=\\n[A-Z][a-z]+:|$)`, 'is'),
      new RegExp(`${section}[:\\-\\s]+([^\\n\\.]+)`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return 'Information not available';
  }
  
  /**
   * Extract implementation timeline from description
   */
  private extractImplementationTime(text: string): string {
    const timePatterns = [
      /Implementation.*?(\d+[\-\s]*(?:to|-)?\s*\d*\s*(?:days?|weeks?|months?))/i,
      /(\d+[\-\s]*(?:to|-)?\s*\d*\s*(?:days?|weeks?|months?)).*?implementation/i,
      /Timeline.*?(\d+[\-\s]*(?:to|-)?\s*\d*\s*(?:days?|weeks?|months?))/i
    ];
    
    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return '1-2 weeks';
  }
  
  /**
   * Fallback to curated tools when vector search unavailable
   */
  private getFallbackTools(query: string, context: SearchContext): VectorSearchResult[] {
    console.log('[VectorRAG] Using curated fallback tools for query:', query);
    
    // Import fallback intelligence for consistent data
    const fallbackTools = this.getCuratedFallbacks(query, context);
    
    return fallbackTools.map(tool => ({
      id: tool.slug || tool.name.toLowerCase().replace(/\s+/g, '-'),
      name: tool.name,
      description: tool.description,
      pricing: this.formatPricing(tool.pricing_details),
      integrations: tool.integrations?.slice(0, 3).join(', ') || 'API available',
      gabiLayer: tool.gabi_layer || 'Function Execution',
      implementation: tool.implementation_effort || '1-2 weeks',
      bestFor: tool.best_for,
      similarity: 0.8, // High confidence in curated fallbacks
      raw: this.buildFallbackDescription(tool)
    }));
  }
  
  /**
   * Get curated fallback tools based on query semantics
   */
  private getCuratedFallbacks(query: string, context: SearchContext): any[] {
    const queryLower = query.toLowerCase();
    
    // Semantic mapping - understand user intent
    if (queryLower.includes('lead') || queryLower.includes('qualification') || 
        queryLower.includes('scoring') || queryLower.includes('prospect')) {
      return this.getLeadQualificationTools();
    }
    
    if (queryLower.includes('proposal') || queryLower.includes('content') || 
        queryLower.includes('generation') || queryLower.includes('writing')) {
      return this.getContentGenerationTools();
    }
    
    if (queryLower.includes('workflow') || queryLower.includes('automation') || 
        queryLower.includes('process') || queryLower.includes('integration')) {
      return this.getWorkflowAutomationTools();
    }
    
    if (queryLower.includes('data') || queryLower.includes('storage') || 
        queryLower.includes('database') || queryLower.includes('backend')) {
      return this.getDataProcessingTools();
    }
    
    // Default: return most versatile tools
    return this.getVersatileTools();
  }
  
  private getLeadQualificationTools(): any[] {
    return [
      {
        name: 'GPT-4o-mini',
        slug: 'gpt-4o-mini',
        description: 'Cost-effective language model optimized for high-volume lead qualification and scoring',
        pricing_details: { input: 0.15, output: 0.60, unit: 'per million tokens' },
        integrations: ['OpenAI API', 'Zapier', 'Make', 'n8n'],
        gabi_layer: 'Conversational Interface',
        best_for: 'Automated lead qualification at scale with cost efficiency',
        implementation_effort: '1-2 weeks'
      },
      {
        name: 'Clay.com',
        slug: 'clay-com',
        description: 'AI-native lead enrichment and research platform with 50+ data sources',
        pricing_details: { free: true, starter: 149, pro: 800, unit: 'per month' },
        integrations: ['HubSpot', 'Salesforce', 'Apollo', 'Outreach'],
        gabi_layer: 'Context Orchestration',
        best_for: 'Comprehensive prospect research and lead enrichment',
        implementation_effort: '2-3 weeks'
      }
    ];
  }
  
  private getContentGenerationTools(): any[] {
    return [
      {
        name: 'GPT-4o',
        slug: 'gpt-4o',
        description: 'Premium language model for high-quality proposal and content generation',
        pricing_details: { input: 5, output: 15, unit: 'per million tokens' },
        integrations: ['OpenAI API', 'LangChain', 'Custom integrations'],
        gabi_layer: 'Conversational Interface',
        best_for: 'Professional proposals and complex content creation',
        implementation_effort: '1-3 weeks'
      },
      {
        name: 'Claude-3-Haiku',
        slug: 'claude-3-haiku',
        description: 'Fast, affordable AI model with strong reasoning for proposal generation',
        pricing_details: { input: 0.25, output: 1.25, unit: 'per million tokens' },
        integrations: ['Anthropic API', 'LangChain', 'Custom workflows'],
        gabi_layer: 'Conversational Interface',
        best_for: 'Complex proposals requiring nuanced understanding',
        implementation_effort: '1-2 weeks'
      }
    ];
  }
  
  private getWorkflowAutomationTools(): any[] {
    return [
      {
        name: 'n8n',
        slug: 'n8n',
        description: 'Open-source workflow automation platform with 400+ integrations and AI support',
        pricing_details: { free: 'self-hosted', cloud: 20, pro: 50, unit: 'per month' },
        integrations: ['400+ pre-built nodes', 'AI APIs', 'Custom webhooks'],
        gabi_layer: 'Function Execution',
        best_for: 'Custom automation workflows without vendor lock-in',
        implementation_effort: '2-4 weeks'
      },
      {
        name: 'Make.com',
        slug: 'make-com',
        description: 'Visual automation platform with advanced data transformation capabilities',
        pricing_details: { free: 1000, starter: 9, pro: 19, unit: 'operations/month' },
        integrations: ['1000+ apps', 'AI services', 'Advanced data manipulation'],
        gabi_layer: 'Function Execution',
        best_for: 'Complex automation scenarios with data transformation',
        implementation_effort: '1-3 weeks'
      }
    ];
  }
  
  private getDataProcessingTools(): any[] {
    return [
      {
        name: 'Supabase',
        slug: 'supabase',
        description: 'Open-source backend platform with PostgreSQL and vector search capabilities',
        pricing_details: { free: 0, pro: 25, team: 599, unit: 'per month' },
        integrations: ['PostgreSQL', 'REST API', 'Real-time subscriptions', 'Vector extensions'],
        gabi_layer: 'Knowledge Retrieval',
        best_for: 'Rapid backend development for AI applications with vector search',
        implementation_effort: '1-2 weeks'
      },
      {
        name: 'Pinecone',
        slug: 'pinecone',
        description: 'Managed vector database optimized for semantic search and RAG applications',
        pricing_details: { free: '1M vectors', starter: 70, pro: 280, unit: 'per month' },
        integrations: ['OpenAI', 'LangChain', 'LlamaIndex', 'Python/JS SDKs'],
        gabi_layer: 'Knowledge Retrieval',
        best_for: 'Production vector search and RAG systems',
        implementation_effort: '2-3 weeks'
      }
    ];
  }
  
  private getVersatileTools(): any[] {
    return [
      {
        name: 'Vercel',
        slug: 'vercel',
        description: 'Frontend cloud platform optimized for AI applications with streaming capabilities',
        pricing_details: { free: true, pro: 20, team: 40, unit: 'per month' },
        integrations: ['Next.js', 'AI SDK', 'OpenAI', 'Anthropic', 'GitHub'],
        gabi_layer: 'Function Execution',
        best_for: 'Deploying AI-powered web applications with streaming responses',
        implementation_effort: '1-2 weeks'
      }
    ];
  }
  
  private formatPricing(pricingDetails: any): string {
    if (!pricingDetails) return 'Contact for pricing';
    
    if (typeof pricingDetails === 'string') return pricingDetails;
    
    if (pricingDetails.free) {
      return `Free tier available, ${pricingDetails.pro || pricingDetails.starter || 'contact'} for paid plans`;
    }
    
    if (pricingDetails.input && pricingDetails.output) {
      return `$${pricingDetails.input}/$${pricingDetails.output} ${pricingDetails.unit || 'per usage'}`;
    }
    
    return JSON.stringify(pricingDetails);
  }
  
  private buildFallbackDescription(tool: any): string {
    return `
Tool: ${tool.name}

Description: ${tool.description}

Best For: ${tool.best_for}

Pricing: ${this.formatPricing(tool.pricing_details)}

Integrations: ${tool.integrations?.join(', ') || 'API available'}

GABI Layer: ${tool.gabi_layer}

Implementation: ${tool.implementation_effort}
    `.trim();
  }
  
  /**
   * Test vector search capability
   */
  async testVectorSearch(): Promise<boolean> {
    if (!this.isAvailable) return false;
    
    try {
      const testQuery = 'automation tools';
      const embedding = await this.generateEmbedding(testQuery);
      
      if (!embedding) return false;
      
      const { data, error } = await this.supabase!.rpc('vector_search_minimal', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 1
      });
      
      return !error && data !== null;
      
    } catch (error) {
      console.error('[VectorRAG] Test failed:', (error as Error).message);
      return false;
    }
  }
  
  /**
   * Get search statistics
   */
  getSearchCapabilities() {
    return {
      vectorSearchAvailable: this.isAvailable,
      fallbackAvailable: true,
      semanticUnderstanding: this.isAvailable,
      embeddingModel: 'text-embedding-ada-002',
      searchThreshold: 0.6,
      maxResults: 10
    };
  }
}

// Export singleton instance
export const vectorRAG = new VectorRAGRetriever();