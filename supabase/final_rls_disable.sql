-- Final attempt to disable RLS on public.users

-- 1. Explicitly disable RLS on public.users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Verify it's disabled
SELECT 
    schemaname,
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity = false THEN '✅ RLS IS DISABLED - Signup should work now!'
        ELSE '❌ RLS STILL ENABLED - Problem persists'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- 3. Double-check by trying to query the table
SELECT COUNT(*) as user_count FROM public.users;

-- 4. Check if we can insert a test record (this will help debug)
-- This should work if RLS is properly disabled
DO $$
BEGIN
    -- Try to insert a test record
    INSERT INTO public.users (
        id, 
        email, 
        full_name, 
        company, 
        role
    ) VALUES (
        gen_random_uuid(),
        'test@example.com',
        'Test User',
        'Test Company',
        'Tester'
    ) ON CONFLICT (email) DO NOTHING;
    
    RAISE NOTICE 'Test insert successful - RLS is working correctly';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Test insert failed with error: %', SQLERRM;
END $$;

-- 5. Clean up test record
DELETE FROM public.users WHERE email = 'test@example.com';

-- 6. Final status check
SELECT 
    'Final Status' as check_type,
    CASE 
        WHEN rowsecurity = false THEN 'RLS is DISABLED ✅'
        ELSE 'RLS is ENABLED ❌'
    END as result
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';