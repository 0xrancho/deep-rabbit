-- Absolute RLS disable - try different approaches
-- One of these MUST work

-- Method 1: Direct disable without schema prefix
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Method 2: With explicit public schema
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Method 3: Force disable with CASCADE (if there are dependencies)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY CASCADE;

-- Check the result
SELECT 
    schemaname,
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity = false THEN '✅ RLS DISABLED - Signup will work!'
        ELSE '❌ RLS STILL ENABLED - Check Supabase Dashboard'
    END as status
FROM pg_tables 
WHERE tablename = 'users';

-- Also check if the table exists in the expected schema
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name = 'users';