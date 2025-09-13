-- Simplest possible RLS fix - completely open for inserts
-- First, check if RLS is enabled
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow anonymous inserts" ON waitlist;
DROP POLICY IF EXISTS "Allow authenticated users to view all" ON waitlist;
DROP POLICY IF EXISTS "Enable insert for all users" ON waitlist;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON waitlist;
DROP POLICY IF EXISTS "Enable all for service role" ON waitlist;

-- Create a single, simple policy that allows EVERYONE to insert
CREATE POLICY "Enable insert for everyone" ON waitlist
    FOR INSERT 
    WITH CHECK (true);

-- Optional: If you want to disable RLS entirely (easiest for testing)
-- ALTER TABLE waitlist DISABLE ROW LEVEL SECURITY;