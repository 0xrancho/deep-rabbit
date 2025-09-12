-- Check existing users and auth settings

-- 1. Check if any users exist in auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    confirmation_sent_at,
    confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check if any users exist in public.users
SELECT 
    id,
    email,
    full_name,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- 3. Clean up any test users if needed (uncomment to run)
-- DELETE FROM auth.users WHERE email = 'test@example.com';
-- DELETE FROM public.users WHERE email = 'test@example.com';