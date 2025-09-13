-- Fix RLS policies for waitlist table
-- First, drop existing policies
DROP POLICY IF EXISTS "Allow anonymous inserts" ON waitlist;
DROP POLICY IF EXISTS "Allow authenticated users to view all" ON waitlist;

-- Create new, more permissive policies for waitlist signups
-- Allow ALL users (authenticated and anonymous) to insert
CREATE POLICY "Enable insert for all users" ON waitlist
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Allow authenticated users to view all entries (for admin purposes)
CREATE POLICY "Enable read for authenticated users" ON waitlist
    FOR SELECT 
    TO authenticated
    USING (true);

-- Also allow service role to do everything (for admin operations)
CREATE POLICY "Enable all for service role" ON waitlist
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);