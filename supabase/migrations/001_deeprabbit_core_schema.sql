-- DeepRabbit Core Database Schema
-- Paid-only SaaS with 7-day trial

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with subscription status
CREATE TABLE users (
  id UUID DEFAULT auth.uid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT,
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'trialing', -- trialing, active, canceled, past_due
  subscription_tier TEXT DEFAULT 'professional', -- professional, team, enterprise
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (discoveries)
CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  -- Prospect info
  prospect_name TEXT NOT NULL,
  prospect_email TEXT NOT NULL,
  prospect_company TEXT NOT NULL,
  prospect_role TEXT,
  -- Discovery context
  industry TEXT,
  business_area TEXT,
  discovery_context TEXT,
  expected_solution_scope TEXT,
  expected_next_step TEXT,
  -- Status
  status TEXT DEFAULT 'active', -- active, completed, abandoned
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  -- Report
  report_generated BOOLEAN DEFAULT false,
  report_url TEXT,
  share_with_prospect BOOLEAN DEFAULT false,
  -- Metadata
  total_questions_asked INTEGER DEFAULT 0,
  total_elicitation_time INTEGER -- seconds
);

-- Elicitation data (the actual discovery notes)
CREATE TABLE elicitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  area TEXT NOT NULL, -- 'tech_stack', 'pain_points', etc.
  sequence_number INTEGER NOT NULL, -- 1st question, 2nd question, etc.
  depth_level INTEGER DEFAULT 1, -- How deep we've gone
  question_text TEXT NOT NULL,
  notes TEXT, -- Raw consultant notes
  gpt_synthesis TEXT, -- AI-processed summary
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  public_id TEXT UNIQUE DEFAULT substr(md5(random()::text), 0, 9), -- Short URL
  html_content TEXT, -- Full HTML report
  markdown_content TEXT, -- For exports
  shared_with_emails TEXT[], -- Who has access
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for compliance
CREATE TABLE activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL, -- 'session_created', 'report_shared', etc.
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_elicitations_session_id ON elicitations(session_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_public_id ON reports(public_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();