-- AI Assessment Platform Database Schema
-- Phase 2: Intelligence Layer Implementation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Assessments table - Main assessment data
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  full_name TEXT,
  subscribe_updates BOOLEAN DEFAULT false,
  
  -- Assessment Step Data
  business_type TEXT,
  opportunity_focus TEXT,
  revenue_model TEXT,
  challenges TEXT[],
  metrics JSONB,
  metrics_quantified JSONB,
  team_description TEXT,
  process_description TEXT,
  tech_stack TEXT[],
  investment_level TEXT,
  additional_context TEXT,
  
  -- AI Analysis Metadata
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  analysis_tokens INTEGER DEFAULT 0,
  generation_time_ms INTEGER DEFAULT 0,
  
  -- Status Management
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'needs_more_info')),
  current_step INTEGER DEFAULT 1 CHECK (current_step >= 1 AND current_step <= 10),
  
  -- Timestamps
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Partial saves for abandonment tracking and progressive saving
CREATE TABLE partial_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  step_number INTEGER NOT NULL CHECK (step_number >= 1 AND step_number <= 10),
  step_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key to assessments
  CONSTRAINT fk_partial_saves_session 
    FOREIGN KEY (session_id) REFERENCES assessments(session_id)
);

-- Generated reports with AI content
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  
  -- Report Content
  report_data JSONB NOT NULL,
  executive_summary TEXT,
  recommendations TEXT,
  roadmap JSONB,
  roi_projections JSONB,
  
  -- Generation Metadata
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  generation_time_ms INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  model_version TEXT DEFAULT 'gpt-4o',
  
  -- Status
  status TEXT DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'failed')),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- User feedback collection
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  
  -- Feedback Data
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  interested_in_meeting BOOLEAN DEFAULT false,
  
  -- Additional Context
  user_agent TEXT,
  session_duration_ms INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- CTA tracking for conversion analytics
CREATE TABLE cta_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  
  -- Click Data
  cta_type TEXT NOT NULL CHECK (cta_type IN ('free_call', 'paid_consult', 'gabi_signup')),
  clicked_at TIMESTAMP DEFAULT NOW(),
  
  -- Context
  user_agent TEXT,
  referrer TEXT
);

-- Analytics events for tracking user journey
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  
  -- Event Data
  event_type TEXT NOT NULL,
  event_data JSONB,
  
  -- Context
  step_number INTEGER,
  timestamp_ms BIGINT NOT NULL,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_assessments_session ON assessments(session_id);
CREATE INDEX idx_assessments_email ON assessments(email);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_assessments_created ON assessments(created_at);

CREATE INDEX idx_partial_saves_session ON partial_saves(session_id);
CREATE INDEX idx_partial_saves_step ON partial_saves(step_number);

CREATE INDEX idx_reports_assessment ON reports(assessment_id);
CREATE INDEX idx_reports_created ON reports(created_at);

CREATE INDEX idx_feedback_assessment ON feedback(assessment_id);
CREATE INDEX idx_feedback_rating ON feedback(rating);

CREATE INDEX idx_cta_clicks_assessment ON cta_clicks(assessment_id);
CREATE INDEX idx_cta_clicks_type ON cta_clicks(cta_type);

CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);

-- Update trigger for assessments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assessments_updated_at 
    BEFORE UPDATE ON assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for complete assessment data
CREATE VIEW assessment_complete AS
SELECT 
  a.*,
  r.id as report_id,
  r.report_data,
  r.generation_time_ms as report_generation_time,
  f.rating as feedback_rating,
  f.feedback_text,
  f.interested_in_meeting
FROM assessments a
LEFT JOIN reports r ON a.id = r.assessment_id
LEFT JOIN feedback f ON a.id = f.assessment_id;

-- Row Level Security (RLS) Policies
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE partial_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for assessment creation and reading own data
-- In production, you'd want more sophisticated auth policies
CREATE POLICY "Allow anonymous assessment creation" ON assessments 
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow assessment updates by session" ON assessments 
  FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow assessment reading by session" ON assessments 
  FOR SELECT TO anon USING (true);

-- Similar policies for other tables
CREATE POLICY "Allow partial saves creation" ON partial_saves 
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow report creation" ON reports 
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow report reading" ON reports 
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow feedback creation" ON feedback 
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow cta tracking" ON cta_clicks 
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow analytics events" ON analytics_events 
  FOR INSERT TO anon WITH CHECK (true);

-- Sample data for testing (optional)
-- INSERT INTO assessments (session_id, email, company, full_name) 
-- VALUES ('test-session-123', 'test@example.com', 'Test Company', 'Test User');