-- Fix RLS policies for user signup
-- Run this in Supabase SQL Editor to fix the signup error

-- Drop the existing policy that's blocking INSERTs
DROP POLICY IF EXISTS "Users manage own profile" ON users;

-- Create separate policies for different operations
CREATE POLICY "Users insert own profile" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users select own profile" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Verify the policies are working
-- This should show the new policies
SELECT * FROM pg_policies WHERE tablename = 'users';