-- Check if users table exists and create it if needed

-- First, check what tables exist
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema IN ('public', 'auth')
AND table_name IN ('users', 'profiles')
ORDER BY table_schema, table_name;

-- Check if users table exists in public schema
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
) as users_table_exists;

-- If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text,
    company text,
    role text,
    subscription_status text DEFAULT 'trialing',
    subscription_tier text DEFAULT 'professional',
    trial_ends_at timestamp with time zone DEFAULT (now() + interval '7 days'),
    subscription_ends_at timestamp with time zone,
    stripe_customer_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Now disable RLS on the table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verify the final state
SELECT 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity = false THEN '✅ SUCCESS - RLS is disabled!'
        ELSE '❌ FAILED - RLS still enabled'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';