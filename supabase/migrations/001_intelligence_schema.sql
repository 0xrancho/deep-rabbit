-- Intelligence System Database Schema
-- Phase 1: Core tables for RAG-optimized intelligence

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Core tool registry with vector embeddings
CREATE TABLE tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL, -- normalized name for lookups
  category text NOT NULL,
  subcategory text,
  
  -- Core metadata
  description text,
  website text,
  documentation text,
  pricing_model text, -- 'free', 'freemium', 'paid', 'usage-based'
  pricing_details jsonb, -- {tiers: [], base_price: 0, per_unit: ''}
  
  -- Technical details
  api_available boolean DEFAULT false,
  github_repo text,
  tech_stack text[], -- ['python', 'langchain', 'openai']
  deployment_options text[], -- ['cloud', 'self-hosted', 'hybrid']
  integrations text[], -- ['salesforce', 'hubspot', 'zapier']
  
  -- Intelligence metadata
  first_seen timestamp DEFAULT now(),
  last_validated timestamp DEFAULT now(),
  last_updated timestamp DEFAULT now(),
  status text DEFAULT 'active', -- 'active', 'declining', 'deprecated', 'dead'
  health_score float DEFAULT 1.0,
  momentum text DEFAULT 'stable', -- 'rising', 'stable', 'declining'
  maturity_level text DEFAULT 'emerging', -- 'emerging', 'growing', 'mature', 'legacy'
  
  -- ICP relevance scoring
  icp_scores jsonb DEFAULT '{}', -- {itsm: 0.8, agency: 0.6, saas: 0.9}
  use_cases text[], -- ['lead-qualification', 'proposal-generation']
  best_for text, -- One-liner on ideal use case
  
  -- Vector embedding for semantic search
  embedding vector(1536), -- OpenAI ada-002 embeddings
  content_hash text, -- To detect when re-embedding needed
  
  -- Metrics
  github_stars integer,
  weekly_growth float,
  mention_count integer DEFAULT 0,
  implementation_count integer DEFAULT 0,
  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Implementation patterns with examples
CREATE TABLE patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL, -- 'stack', 'architecture', 'workflow'
  
  -- Pattern details
  description text,
  problem_solved text,
  typical_stack text[],
  example_tools uuid[], -- Foreign keys to tools table
  
  -- Implementation details
  complexity text, -- 'simple', 'moderate', 'complex'
  typical_timeline text, -- '1 week', '2-4 weeks', '2-3 months'
  typical_cost_range text, -- '$50-200/month'
  
  -- Code/architecture examples
  architecture_diagram text, -- Mermaid or URL
  code_snippets jsonb, -- {language: code}
  github_examples text[], -- URLs to real implementations
  
  -- Intelligence
  icp_relevance jsonb, -- {itsm: 0.9, agency: 0.5}
  success_indicators text[],
  common_pitfalls text[],
  
  -- Tracking
  times_implemented integer DEFAULT 0,
  success_rate float,
  last_seen timestamp DEFAULT now(),
  
  -- Vector embedding
  embedding vector(1536),
  
  created_at timestamp DEFAULT now()
);

-- Weekly intelligence snapshots
CREATE TABLE intelligence_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of date NOT NULL,
  update_type text NOT NULL, -- 'weekly', 'monthly'
  
  -- What changed
  new_tools uuid[],
  deprecated_tools uuid[],
  updated_tools uuid[],
  
  -- Trends and signals
  rising_tools jsonb, -- [{tool_id, growth_rate, reason}]
  declining_tools jsonb,
  emerging_patterns text[],
  
  -- Category insights
  category_trends jsonb, -- {category: {growth, top_tools, insights}}
  
  -- ICP-specific insights
  icp_recommendations jsonb, -- {itsm: {tools: [], patterns: [], insights: []}}
  
  -- Raw intelligence for reference
  raw_sources jsonb, -- All the sources we pulled from
  
  created_at timestamp DEFAULT now()
);

-- Use case mappings for smart retrieval
CREATE TABLE use_case_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  use_case text NOT NULL, -- 'lead-qualification'
  tool_id uuid REFERENCES tools(id),
  
  relevance_score float DEFAULT 0.5,
  implementation_notes text,
  typical_results text, -- '2x conversion rate'
  
  -- Evidence
  case_studies jsonb, -- [{company, results, source}]
  github_implementations text[],
  
  created_at timestamp DEFAULT now()
);

-- Indexes for fast retrieval
CREATE INDEX idx_tools_category ON tools(category);
CREATE INDEX idx_tools_status ON tools(status);
CREATE INDEX idx_tools_embedding ON tools USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_patterns_embedding ON patterns USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_tools_icp ON tools USING gin(icp_scores);
CREATE INDEX idx_tools_use_cases ON tools USING gin(use_cases);
CREATE INDEX idx_tools_integrations ON tools USING gin(integrations);
CREATE INDEX idx_tools_tech_stack ON tools USING gin(tech_stack);

ALTER TABLE tools ADD COLUMN search_text tsvector;

-- Skip the generated column for now
-- We can add full text search later if needed

-- RPC function for vector similarity search
CREATE OR REPLACE FUNCTION vector_search(
  query_embedding vector(1536),
  table_name text,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  description text,
  icp_scores jsonb,
  pricing_details jsonb,
  integrations text[],
  similarity float
)
LANGUAGE sql
AS $$
  SELECT 
    t.id,
    t.name,
    t.category,
    t.description,
    t.icp_scores,
    t.pricing_details,
    t.integrations,
    1 - (t.embedding <=> query_embedding) as similarity
  FROM tools t
  WHERE t.status = 'active'
    AND 1 - (t.embedding <=> query_embedding) > match_threshold
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- RPC function for pattern search
CREATE OR REPLACE FUNCTION pattern_search(
  query_embedding vector(1536),
  icp text DEFAULT NULL,
  complexity text DEFAULT NULL,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  description text,
  complexity text,
  typical_timeline text,
  typical_cost_range text,
  icp_relevance jsonb,
  github_examples text[],
  similarity float
)
LANGUAGE sql
AS $$
  SELECT 
    p.id,
    p.name,
    p.category,
    p.description,
    p.complexity,
    p.typical_timeline,
    p.typical_cost_range,
    p.icp_relevance,
    p.github_examples,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM patterns p
  WHERE 1 - (p.embedding <=> query_embedding) > match_threshold
    AND (complexity IS NULL OR p.complexity = complexity)
    AND (icp IS NULL OR (p.icp_relevance->>icp)::float > 0.5)
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Insert some initial seed data for testing
INSERT INTO tools (name, slug, category, subcategory, description, pricing_model, pricing_details, use_cases, icp_scores, integrations, status, best_for) VALUES 
('OpenAI GPT-4o', 'openai-gpt4o', 'ai-model', 'language-model', 'Advanced language model for complex reasoning and content generation', 'usage-based', '{"input": 0.005, "output": 0.015, "unit": "per 1K tokens"}', ARRAY['lead-qualification', 'proposal-generation', 'content-creation'], '{"itsm": 0.8, "agency": 0.9, "saas": 0.9}', ARRAY['api', 'langchain', 'openai-sdk'], 'active', 'High-quality content generation and complex reasoning'),

('Anthropic Claude', 'anthropic-claude', 'ai-model', 'language-model', 'Conversational AI model with strong reasoning and safety features', 'usage-based', '{"input": 0.003, "output": 0.015, "unit": "per 1K tokens"}', ARRAY['lead-qualification', 'proposal-generation'], '{"itsm": 0.7, "agency": 0.8, "saas": 0.8}', ARRAY['api', 'anthropic-sdk'], 'active', 'Safe and reliable AI conversations'),

('n8n', 'n8n', 'automation', 'workflow', 'Open-source workflow automation tool with AI integrations', 'freemium', '{"free": "self-hosted", "cloud": 20, "unit": "per month"}', ARRAY['workflow-automation', 'data-processing'], '{"itsm": 0.9, "agency": 0.8, "saas": 0.7}', ARRAY['webhooks', 'api', 'databases', 'ai-models'], 'active', 'Custom workflow automation without vendor lock-in'),

('Zapier', 'zapier', 'automation', 'workflow', 'Popular automation platform connecting apps and services', 'freemium', '{"free": 5, "starter": 19.99, "professional": 49, "unit": "per month"}', ARRAY['workflow-automation', 'lead-management'], '{"itsm": 0.6, "agency": 0.9, "saas": 0.8}', ARRAY['5000+apps'], 'active', 'Quick app integrations for non-technical users'),

('Supabase', 'supabase', 'infrastructure', 'database', 'Open-source Firebase alternative with PostgreSQL and real-time features', 'freemium', '{"free": 0, "pro": 25, "team": 599, "unit": "per month"}', ARRAY['data-storage', 'user-management'], '{"itsm": 0.7, "agency": 0.8, "saas": 0.9}', ARRAY['postgresql', 'rest-api', 'realtime'], 'active', 'Rapid backend development with PostgreSQL'),

('LangChain', 'langchain', 'framework', 'ai-framework', 'Framework for developing applications with language models', 'free', '{"free": 0}', ARRAY['ai-development', 'rag-systems'], '{"itsm": 0.6, "agency": 0.7, "saas": 0.8}', ARRAY['openai', 'anthropic', 'huggingface'], 'active', 'Building complex AI applications with LLMs');

-- Insert some initial patterns
INSERT INTO patterns (name, category, description, problem_solved, typical_stack, complexity, typical_timeline, typical_cost_range, icp_relevance, success_indicators, common_pitfalls) VALUES 
('Simple AI Qualification Bot', 'workflow', 'Webhook-triggered qualification using AI', 'Manual lead qualification consuming sales team time', ARRAY['Vercel', 'OpenAI API', 'Supabase'], 'simple', '1 week', '$50-200/month', '{"itsm": 0.8, "agency": 0.9, "saas": 0.7}', ARRAY['2-3x faster qualification', '80%+ accuracy maintained', 'Sales team focuses on qualified leads'], ARRAY['Over-filtering good leads', 'Prompt engineering takes iterations', 'Need backup for API failures']),

('Multi-Model AI Router', 'architecture', 'Route requests to optimal AI model based on task', 'Single model limitations and cost optimization', ARRAY['Node.js', 'BullMQ', 'LiteLLM', 'PostgreSQL'], 'moderate', '2-4 weeks', '$200-1000/month', '{"itsm": 0.7, "agency": 0.8, "saas": 0.9}', ARRAY['30-50% cost savings', 'Better task-specific results', 'Fault tolerance'], ARRAY['Complexity of routing logic', 'Model consistency', 'Monitoring multiple providers']),

('Full Revenue Intelligence Platform', 'platform', 'Complete AI-powered revenue operations system', 'Fragmented tools and manual processes across revenue teams', ARRAY['Kafka', 'Databricks', 'Multiple AI APIs', 'Kubernetes'], 'complex', '2-3 months', '$2000+/month', '{"itsm": 0.6, "agency": 0.7, "saas": 0.9}', ARRAY['60%+ process automation', '10x data processing speed', 'Unified revenue intelligence'], ARRAY['Over-engineering early stages', 'Team training requirements', 'Integration complexity']);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patterns_updated_at BEFORE UPDATE ON patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
