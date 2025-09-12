-- Force disable RLS on users table
-- This MUST work to allow signup

-- First, drop ALL policies on users table
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', pol.policyname);
    END LOOP;
END $$;

-- Now disable RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verify it's actually disabled
SELECT 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN 'RLS is STILL ENABLED - Problem!'
        ELSE 'RLS is DISABLED - Should work now!'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- Also check if any policies remain (should be 0)
SELECT COUNT(*) as remaining_policies
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';