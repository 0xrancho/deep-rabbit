-- Enhanced Vector Search RPC Function
-- Proper semantic search with post-filtering for ICP/challenge/budget

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS vector_search_minimal(vector(1536), float, int, text, text, text);

-- Create enhanced vector search function
CREATE OR REPLACE FUNCTION vector_search_minimal(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 10,
  icp_filter text DEFAULT NULL,
  challenge_filter text DEFAULT NULL,
  budget_filter text DEFAULT NULL
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
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.description_full,
    t.icp_fit,
    t.challenge_fit,
    t.budget_range,
    GREATEST(0, 1 - (t.embedding <=> query_embedding)) as similarity
  FROM tools_minimal t
  WHERE 
    -- Must be active
    t.status = 'active'
    
    -- Must meet similarity threshold
    AND (1 - (t.embedding <=> query_embedding)) > match_threshold
    
    -- Optional ICP filter (check if ICP exists and has good score)
    AND (
      icp_filter IS NULL 
      OR (t.icp_fit ? icp_filter AND (t.icp_fit->>icp_filter)::float >= 0.5)
    )
    
    -- Optional challenge filter
    AND (
      challenge_filter IS NULL 
      OR (t.challenge_fit ? challenge_filter AND (t.challenge_fit->>challenge_filter)::float >= 0.5)
    )
    
    -- Optional budget filter
    AND (
      budget_filter IS NULL 
      OR budget_filter = ANY(t.budget_range)
    )
    
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create a test function to validate vector search setup
CREATE OR REPLACE FUNCTION test_vector_search()
RETURNS TABLE (
  test_name text,
  result boolean,
  details text
)
LANGUAGE plpgsql
AS $$
DECLARE
  tool_count int;
  embedding_count int;
  test_embedding vector(1536);
BEGIN
  -- Test 1: Check if tools_minimal table exists
  SELECT COUNT(*) INTO tool_count FROM tools_minimal WHERE status = 'active';
  RETURN QUERY SELECT 'active_tools'::text, tool_count > 0, format('Found %s active tools', tool_count);
  
  -- Test 2: Check if embeddings exist
  SELECT COUNT(*) INTO embedding_count FROM tools_minimal WHERE embedding IS NOT NULL;
  RETURN QUERY SELECT 'embeddings_exist'::text, embedding_count > 0, format('Found %s tools with embeddings', embedding_count);
  
  -- Test 3: Test vector search function
  IF embedding_count > 0 THEN
    -- Get a sample embedding for testing
    SELECT embedding INTO test_embedding FROM tools_minimal WHERE embedding IS NOT NULL LIMIT 1;
    
    BEGIN
      PERFORM vector_search_minimal(test_embedding, 0.5, 1);
      RETURN QUERY SELECT 'vector_search'::text, true, 'Vector search function works';
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT 'vector_search'::text, false, format('Vector search failed: %s', SQLERRM);
    END;
  ELSE
    RETURN QUERY SELECT 'vector_search'::text, false, 'No embeddings available for testing';
  END IF;
  
  -- Test 4: Check pgvector extension
  BEGIN
    PERFORM ''::vector(1536);
    RETURN QUERY SELECT 'pgvector_extension'::text, true, 'pgvector extension is available';
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'pgvector_extension'::text, false, 'pgvector extension not available';
  END;
  
END;
$$;

-- Add helpful comments
COMMENT ON FUNCTION vector_search_minimal IS 'Semantic vector search with cosine similarity and post-filtering for ICP, challenge, and budget constraints';
COMMENT ON FUNCTION test_vector_search IS 'Test function to validate vector search setup and requirements';

-- Grant necessary permissions
-- GRANT EXECUTE ON FUNCTION vector_search_minimal TO anon, authenticated;
-- GRANT EXECUTE ON FUNCTION test_vector_search TO anon, authenticated;