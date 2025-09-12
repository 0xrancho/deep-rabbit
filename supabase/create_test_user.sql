-- Create a test user with a known password
-- This bypasses all the signup complexity

-- 1. Delete any existing test user
DELETE FROM public.users WHERE email = 'test@deeprabbit.com';
DELETE FROM auth.users WHERE email = 'test@deeprabbit.com';

-- 2. Create a new auth user directly
-- Note: You'll need to use Supabase's auth admin functions
-- Run this in Supabase SQL editor

-- First, check if we can see existing users
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- The proper way to create a test user is through Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add user" 
-- 3. Create user with:
--    Email: test@deeprabbit.com
--    Password: TestPassword123!
-- 4. Auto confirm email: YES

-- After creating the user in dashboard, run this to add to public.users:
INSERT INTO public.users (
    id,
    email,
    full_name,
    company,
    role,
    subscription_status,
    trial_ends_at,
    created_at
) 
SELECT 
    id,
    'test@deeprabbit.com',
    'Test User',
    'deeprabbit.com',
    'Tester',
    'trialing',
    NOW() + INTERVAL '7 days',
    NOW()
FROM auth.users 
WHERE email = 'test@deeprabbit.com'
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    company = EXCLUDED.company,
    role = EXCLUDED.role;