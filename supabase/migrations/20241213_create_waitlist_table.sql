-- Create waitlist table for capturing interested users
CREATE TABLE waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company_url TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for common queries
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for public waitlist form)
CREATE POLICY "Allow anonymous inserts" ON waitlist
    FOR INSERT 
    WITH CHECK (true);

-- Allow authenticated users to view all entries (for admin purposes)
CREATE POLICY "Allow authenticated users to view all" ON waitlist
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Add some helpful comments
COMMENT ON TABLE waitlist IS 'Stores waitlist signups from the landing page';
COMMENT ON COLUMN waitlist.name IS 'Full name of the person signing up';
COMMENT ON COLUMN waitlist.email IS 'Email address for follow-up';
COMMENT ON COLUMN waitlist.company_url IS 'URL of their company website';
COMMENT ON COLUMN waitlist.user_agent IS 'Browser user agent for analytics';