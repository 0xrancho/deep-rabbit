-- DeepRabbit Row-Level Security Policies
-- Ensures users can only access their own data

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE elicitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own profile
-- Allow INSERT during signup, then restrict to own profile for SELECT/UPDATE/DELETE
CREATE POLICY "Users insert own profile" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users manage own profile" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Users can only manage their own sessions
CREATE POLICY "Users manage own sessions" ON sessions
  FOR ALL USING (user_id = auth.uid());

-- Users can only access elicitations from their own sessions
CREATE POLICY "Users manage own elicitations" ON elicitations
  FOR ALL USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

-- Users can only manage their own reports
CREATE POLICY "Users manage own reports" ON reports
  FOR ALL USING (user_id = auth.uid());

-- Public report viewing (anonymous access via public_id)
CREATE POLICY "Public report viewing" ON reports
  FOR SELECT USING (
    public_id IS NOT NULL 
    AND LENGTH(public_id) > 0
  );

-- Users can only see their own activity logs
CREATE POLICY "Users view own activity" ON activity_log
  FOR SELECT USING (user_id = auth.uid());

-- Admin users can insert activity logs for any user (for system events)
CREATE POLICY "System activity logging" ON activity_log
  FOR INSERT WITH CHECK (true);

-- Function to check subscription status
CREATE OR REPLACE FUNCTION check_subscription_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_uuid 
    AND (
      subscription_status = 'active' 
      OR (subscription_status = 'trialing' AND trial_ends_at > NOW())
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy to only allow session creation for active subscribers
CREATE POLICY "Active subscribers create sessions" ON sessions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND check_subscription_active(auth.uid())
  );

-- Policy to only allow elicitation creation for active subscribers
CREATE POLICY "Active subscribers create elicitations" ON elicitations
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM sessions 
      WHERE user_id = auth.uid() 
      AND check_subscription_active(auth.uid())
    )
  );

-- Policy to only allow report generation for active subscribers
CREATE POLICY "Active subscribers generate reports" ON reports
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND check_subscription_active(auth.uid())
  );