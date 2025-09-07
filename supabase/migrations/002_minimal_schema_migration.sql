-- Minimal Schema Migration
-- Simplify from 25+ columns to 8 core columns for vector search

-- Step 1: Create new minimal tools table
CREATE TABLE tools_minimal (
  -- Identity
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  
  -- Core metadata (for filtering BEFORE vector search)
  status text DEFAULT 'active',
  last_validated timestamp DEFAULT now(),
  
  -- Structured filters (indexed for fast pre-filtering)
  icp_fit jsonb DEFAULT '{}',        -- {"itsm": 0.8, "agency": 0.6}
  challenge_fit jsonb DEFAULT '{}',   -- {"lead-qualification": 0.9}
  budget_range text[],                -- ['low', 'medium'] not exact prices
  
  -- Rich text for embedding generation (contains EVERYTHING)
  description_full text,              -- Name, description, pricing, integrations, GABI layers, examples
  
  -- The vector
  embedding vector(1536),
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes for the minimal schema
CREATE INDEX idx_tools_minimal_embedding ON tools_minimal 
USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_tools_minimal_icp ON tools_minimal USING gin(icp_fit);
CREATE INDEX idx_tools_minimal_challenge ON tools_minimal USING gin(challenge_fit);
CREATE INDEX idx_tools_minimal_status ON tools_minimal(status);
CREATE INDEX idx_tools_minimal_last_validated ON tools_minimal(last_validated);

-- Step 2: Migration function to convert existing tools to minimal format
CREATE OR REPLACE FUNCTION migrate_tools_to_minimal()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  tool_record RECORD;
  migrated_count INTEGER := 0;
  rich_description TEXT;
  budget_range_array TEXT[];
BEGIN
  -- Loop through existing tools
  FOR tool_record IN 
    SELECT * FROM tools WHERE status = 'active'
  LOOP
    -- Build rich description from all existing fields
    rich_description := format('
Tool: %s

Category: %s %s

Description: %s

Best For: %s

Pricing Model: %s
Pricing Details: %s

Use Cases: %s

Integrations: %s

Technical Stack: %s

Deployment Options: %s

GABI Layer: %s

Trending Context: %s

Why Now: %s

Implementation Effort: Typically %s weeks based on complexity

Health Score: %.1f/1.0 (Momentum: %s)

ICP Fit Scores:
- ITSM: %.1f
- Agency: %.1f  
- SaaS: %.1f

Status: %s since %s
    ',
      COALESCE(tool_record.name, ''),
      COALESCE(tool_record.category, ''),
      COALESCE(tool_record.subcategory, ''),
      COALESCE(tool_record.description, ''),
      COALESCE(tool_record.best_for, ''),
      COALESCE(tool_record.pricing_model, ''),
      COALESCE(tool_record.pricing_details::text, '{}'),
      COALESCE(array_to_string(tool_record.use_cases, ', '), ''),
      COALESCE(array_to_string(tool_record.integrations, ', '), ''),
      COALESCE(array_to_string(tool_record.tech_stack, ', '), ''),
      COALESCE(array_to_string(tool_record.deployment_options, ', '), ''),
      COALESCE((tool_record.icp_scores->>'gabi_layer')::text, 'Function Execution'),
      COALESCE((tool_record.icp_scores->>'trending_context')::text, ''),
      COALESCE((tool_record.icp_scores->>'why_now')::text, ''),
      CASE 
        WHEN tool_record.maturity_level = 'emerging' THEN '1-2'
        WHEN tool_record.maturity_level = 'growing' THEN '2-4'
        ELSE '4-8'
      END,
      COALESCE(tool_record.health_score, 1.0),
      COALESCE(tool_record.momentum, 'stable'),
      COALESCE((tool_record.icp_scores->>'itsm')::numeric, 0.5),
      COALESCE((tool_record.icp_scores->>'agency')::numeric, 0.5),
      COALESCE((tool_record.icp_scores->>'saas')::numeric, 0.5),
      COALESCE(tool_record.status, 'active'),
      COALESCE(tool_record.first_seen::text, tool_record.created_at::text)
    );
    
    -- Determine budget range based on pricing
    budget_range_array := '{}';
    IF tool_record.pricing_details IS NOT NULL THEN
      -- Simple heuristic based on pricing data
      IF tool_record.pricing_details::text ILIKE '%free%' OR 
         tool_record.pricing_details::text ILIKE '%0%' THEN
        budget_range_array := array_append(budget_range_array, 'free');
      END IF;
      
      IF tool_record.pricing_details::text ~ '\$([0-9]+)' THEN
        -- Extract first number found
        DECLARE
          price_match TEXT;
        BEGIN
          SELECT (regexp_matches(tool_record.pricing_details::text, '\$([0-9]+)', 'g'))[1] INTO price_match;
          IF price_match IS NOT NULL THEN
            IF price_match::integer < 100 THEN
              budget_range_array := array_append(budget_range_array, 'low');
            ELSIF price_match::integer < 1000 THEN
              budget_range_array := array_append(budget_range_array, 'medium');
            ELSE
              budget_range_array := array_append(budget_range_array, 'high');
            END IF;
          END IF;
        END;
      END IF;
    END IF;
    
    -- Default budget range if none detected
    IF array_length(budget_range_array, 1) IS NULL THEN
      budget_range_array := ARRAY['medium'];
    END IF;
    
    -- Insert into minimal table
    INSERT INTO tools_minimal (
      name,
      status,
      last_validated,
      icp_fit,
      challenge_fit,
      budget_range,
      description_full,
      embedding,
      created_at,
      updated_at
    ) VALUES (
      tool_record.name,
      tool_record.status,
      COALESCE(tool_record.last_validated, tool_record.updated_at, NOW()),
      tool_record.icp_scores,
      jsonb_build_object(
        'lead-qualification', COALESCE((tool_record.icp_scores->>'itsm')::numeric, 0.5),
        'proposal-generation', COALESCE((tool_record.icp_scores->>'agency')::numeric, 0.5),
        'workflow-automation', COALESCE((tool_record.icp_scores->>'saas')::numeric, 0.5)
      ),
      budget_range_array,
      rich_description,
      tool_record.embedding,
      COALESCE(tool_record.created_at, NOW()),
      COALESCE(tool_record.updated_at, NOW())
    );
    
    migrated_count := migrated_count + 1;
  END LOOP;
  
  RETURN migrated_count;
END;
$$;

-- Step 3: RPC function for vector similarity search (simplified)
CREATE OR REPLACE FUNCTION vector_search_minimal(
  query_embedding vector(1536),
  icp_filter text DEFAULT NULL,
  challenge_filter text DEFAULT NULL, 
  budget_filter text DEFAULT NULL,
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  description_full text,
  icp_fit jsonb,
  challenge_fit jsonb,
  budget_range text[],
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT 
    t.id,
    t.name,
    t.description_full,
    t.icp_fit,
    t.challenge_fit,
    t.budget_range,
    1 - (t.embedding <=> query_embedding) as similarity
  FROM tools_minimal t
  WHERE 
    t.status = 'active'
    AND (1 - (t.embedding <=> query_embedding) > match_threshold)
    AND (icp_filter IS NULL OR t.icp_fit ? icp_filter)
    AND (challenge_filter IS NULL OR t.challenge_fit ? challenge_filter) 
    AND (budget_filter IS NULL OR budget_filter = ANY(t.budget_range))
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Step 4: Function to generate rich descriptions with updated embeddings
CREATE OR REPLACE FUNCTION regenerate_embeddings_needed()
RETURNS TABLE (
  tool_name text,
  has_embedding boolean,
  description_length integer
)
LANGUAGE sql
AS $$
  SELECT 
    name,
    embedding IS NOT NULL as has_embedding,
    length(description_full) as description_length
  FROM tools_minimal
  ORDER BY has_embedding, description_length;
$$;

-- Migration summary
COMMENT ON TABLE tools_minimal IS 'Minimal schema with 8 core columns for vector search. Rich context in description_full field.';
COMMENT ON COLUMN tools_minimal.description_full IS 'Contains ALL tool information: pricing, integrations, GABI layers, examples - embedded as vector';
COMMENT ON COLUMN tools_minimal.icp_fit IS 'ICP scores: {"itsm": 0.8, "agency": 0.6, "saas": 0.9}';
COMMENT ON COLUMN tools_minimal.challenge_fit IS 'Challenge scores: {"lead-qualification": 0.9, "workflow-automation": 0.7}';
COMMENT ON COLUMN tools_minimal.budget_range IS 'Budget categories: ["free", "low", "medium", "high"] for pre-filtering';