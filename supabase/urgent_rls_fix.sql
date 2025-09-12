-- URGENT: Fix RLS policies blocking user signup
-- Copy and paste this into Supabase SQL Editor and run it

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users manage own profile" ON users;

-- Create separate policies that allow signup
CREATE POLICY "Users insert own profile" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users select own profile" ON users  
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Alternative: Temporarily disable RLS for testing
-- Uncomment the next line if the above doesn't work
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;