-- DeepRabbit Auth Triggers and Helper Functions
-- Automatically creates user records and handles auth events

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user record on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get user's subscription status with details
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_id UUID)
RETURNS TABLE (
  is_active BOOLEAN,
  status TEXT,
  tier TEXT,
  trial_days_left INTEGER,
  message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN u.subscription_status = 'active' THEN true
      WHEN u.subscription_status = 'trialing' AND u.trial_ends_at > NOW() THEN true
      ELSE false
    END as is_active,
    u.subscription_status as status,
    u.subscription_tier as tier,
    CASE 
      WHEN u.subscription_status = 'trialing' 
      THEN GREATEST(0, EXTRACT(DAY FROM u.trial_ends_at - NOW())::INTEGER)
      ELSE NULL
    END as trial_days_left,
    CASE
      WHEN u.subscription_status = 'active' THEN 'Subscription active'
      WHEN u.subscription_status = 'trialing' AND u.trial_ends_at > NOW() 
        THEN 'Trial active - ' || GREATEST(0, EXTRACT(DAY FROM u.trial_ends_at - NOW())::INTEGER) || ' days left'
      WHEN u.subscription_status = 'trialing' AND u.trial_ends_at <= NOW() 
        THEN 'Trial expired - Please subscribe to continue'
      WHEN u.subscription_status = 'canceled' THEN 'Subscription canceled'
      WHEN u.subscription_status = 'past_due' THEN 'Payment past due'
      ELSE 'No active subscription'
    END as message
  FROM users u
  WHERE u.id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count user's monthly usage
CREATE OR REPLACE FUNCTION get_user_monthly_usage(user_id UUID)
RETURNS TABLE (
  sessions_this_month INTEGER,
  reports_this_month INTEGER,
  questions_this_month INTEGER,
  last_session_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT s.id)::INTEGER as sessions_this_month,
    COUNT(DISTINCT r.id)::INTEGER as reports_this_month,
    COALESCE(SUM(s.total_questions_asked), 0)::INTEGER as questions_this_month,
    MAX(s.started_at) as last_session_date
  FROM sessions s
  LEFT JOIN reports r ON r.session_id = s.id
  WHERE s.user_id = $1
    AND s.started_at >= date_trunc('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely increment report view count
CREATE OR REPLACE FUNCTION increment_report_view(report_public_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE reports 
  SET view_count = view_count + 1
  WHERE public_id = report_public_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions for functions
GRANT EXECUTE ON FUNCTION get_user_subscription_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_monthly_usage TO authenticated;
GRANT EXECUTE ON FUNCTION increment_report_view TO anon, authenticated;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_trial_ends_at ON users(trial_ends_at);

-- Add some helpful views for analytics
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.company,
  u.subscription_status,
  u.trial_ends_at,
  COUNT(DISTINCT s.id) as total_sessions,
  COUNT(DISTINCT r.id) as total_reports,
  MAX(s.started_at) as last_activity
FROM users u
LEFT JOIN sessions s ON s.user_id = u.id
LEFT JOIN reports r ON r.user_id = u.id
GROUP BY u.id;

-- Grant access to the view
GRANT SELECT ON user_activity_summary TO authenticated;