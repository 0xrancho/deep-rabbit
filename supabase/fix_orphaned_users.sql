-- Fix orphaned user records

-- 1. Find orphaned auth.users (exist in auth but not in public)
SELECT 
    a.id,
    a.email,
    a.created_at,
    'Orphaned - exists in auth but not public' as status
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
WHERE p.id IS NULL;

-- 2. Option A: Delete orphaned auth users (uncomment to run)
-- This will remove auth users that don't have matching public.users records
/*
DELETE FROM auth.users 
WHERE id IN (
    SELECT a.id 
    FROM auth.users a
    LEFT JOIN public.users p ON a.id = p.id
    WHERE p.id IS NULL
);
*/

-- 3. Option B: Create missing public.users records for orphaned auth users
-- This will create the missing public records so login works
INSERT INTO public.users (id, email, full_name, company, role, created_at)
SELECT 
    a.id,
    a.email,
    COALESCE(a.raw_user_meta_data->>'full_name', 'Unknown'),
    COALESCE(a.raw_user_meta_data->>'company', 'Unknown'),
    COALESCE(a.raw_user_meta_data->>'role', 'Unknown'),
    a.created_at
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. Verify the fix
SELECT 
    COUNT(*) as orphaned_users_remaining
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
WHERE p.id IS NULL;

-- Should show 0 orphaned users