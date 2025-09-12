-- Complete RLS Reset for Users Table
-- This drops ALL existing policies and recreates them properly

-- Step 1: Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Users manage own profile" ON users;
DROP POLICY IF EXISTS "Users insert own profile" ON users;
DROP POLICY IF EXISTS "Users select own profile" ON users;
DROP POLICY IF EXISTS "Users update own profile" ON users;

-- Step 2: Recreate policies correctly
-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to delete their own profile (if needed)
CREATE POLICY "Users can delete own profile" ON users
  FOR DELETE USING (auth.uid() = id);

-- Step 3: Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;