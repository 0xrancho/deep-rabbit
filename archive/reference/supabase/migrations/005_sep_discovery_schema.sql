-- SEP Discovery Wizard Multi-Tenant Schema

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Users table with organization relationship
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL CHECK (role IN ('Consultant', 'Senior Consultant', 'Principal', 'Manager')),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Discovery sessions table
CREATE TABLE IF NOT EXISTS discovery_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_role VARCHAR(255),
  consultant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  client_icp VARCHAR(100),
  business_area TEXT,
  discovery_context TEXT,
  solution_scope VARCHAR(100) CHECK (solution_scope IN (
    'Software consultation ($10K-$50K)',
    'Custom development project ($50K-$200K)',
    'Enterprise system integration ($200K-$1M+)',
    'Long-term development partnership ($1M+)'
  )),
  next_step_goal VARCHAR(100) CHECK (next_step_goal IN (
    'Technical deep-dive meeting',
    'Architecture assessment',
    'Proposal development',
    'Proof of concept discussion'
  )),
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Prospect discovery data storage
CREATE TABLE IF NOT EXISTS prospect_discovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES discovery_sessions(id) ON DELETE CASCADE,
  
  -- Contact Details
  contact_string_1 TEXT,  -- Name, title, role
  contact_string_2 TEXT,  -- Email, phone, assistant  
  contact_string_3 TEXT,  -- Additional stakeholders
  
  -- Decision Makers
  decision_string_1 TEXT, -- Primary decision maker
  decision_string_2 TEXT, -- Technical decision maker
  decision_string_3 TEXT, -- Budget approval process
  
  -- Pain Statements
  pain_string_1 TEXT,     -- Primary technical pain
  pain_string_2 TEXT,     -- Business impact pain
  pain_string_3 TEXT,     -- Process/workflow pain
  
  -- Assumptions
  assumption_string_1 TEXT, -- Technical assumptions
  assumption_string_2 TEXT, -- Business assumptions
  assumption_string_3 TEXT, -- Timeline assumptions
  
  -- Opportunities
  opportunity_string_1 TEXT, -- Primary opportunity
  opportunity_string_2 TEXT, -- Secondary opportunities
  opportunity_string_3 TEXT, -- Strategic opportunities
  
  -- Timeline & Urgency
  timeline_string_1 TEXT,   -- Decision timeline
  timeline_string_2 TEXT,   -- Implementation timeline
  timeline_string_3 TEXT,   -- Urgency drivers
  
  -- Budget
  budget_string_1 TEXT,     -- Budget range
  budget_string_2 TEXT,     -- Budget approval process
  budget_string_3 TEXT,     -- Funding source
  
  -- Process
  process_string_1 TEXT,    -- Technical evaluation process
  process_string_2 TEXT,    -- Vendor selection process
  process_string_3 TEXT,    -- Implementation process
  
  raw_conversation_data JSONB DEFAULT '{}',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(session_id)
);

-- Discovery areas table (for the 8 discovery topics)
CREATE TABLE IF NOT EXISTS discovery_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES discovery_sessions(id) ON DELETE CASCADE,
  area_name VARCHAR(255) NOT NULL CHECK (area_name IN (
    'Current Technology Stack',
    'Pain Points & Challenges',
    'Business Impact & Urgency',
    'Decision Process & Timeline',
    'Budget & Resource Allocation',
    'Technical Requirements',
    'Integration & Infrastructure',
    'Success Metrics & Outcomes'
  )),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  conversation_data JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(session_id, area_name)
);

-- Create indexes for performance
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_discovery_sessions_consultant ON discovery_sessions(consultant_id);
CREATE INDEX idx_discovery_sessions_status ON discovery_sessions(status);
CREATE INDEX idx_prospect_discovery_session ON prospect_discovery(session_id);
CREATE INDEX idx_discovery_areas_session ON discovery_areas(session_id);
CREATE INDEX idx_discovery_areas_active ON discovery_areas(is_active) WHERE is_active = true;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discovery_sessions_updated_at BEFORE UPDATE ON discovery_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospect_discovery_updated_at BEFORE UPDATE ON prospect_discovery
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discovery_areas_updated_at BEFORE UPDATE ON discovery_areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_discovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_areas ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view their organization" ON organizations
    FOR SELECT USING (auth.uid()::text IN (
        SELECT users.id::text FROM users WHERE users.organization_id = organizations.id
    ));

-- Users: Can see users in their organization
CREATE POLICY "Users can view colleagues" ON users
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Discovery sessions: Can see own and team sessions
CREATE POLICY "Users can view team discovery sessions" ON discovery_sessions
    FOR ALL USING (
        consultant_id IN (
            SELECT id FROM users WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

-- Prospect discovery: Same as discovery sessions
CREATE POLICY "Users can view team prospect data" ON prospect_discovery
    FOR ALL USING (
        session_id IN (
            SELECT id FROM discovery_sessions WHERE consultant_id IN (
                SELECT id FROM users WHERE organization_id IN (
                    SELECT organization_id FROM users WHERE id = auth.uid()
                )
            )
        )
    );

-- Discovery areas: Same as discovery sessions
CREATE POLICY "Users can view team discovery areas" ON discovery_areas
    FOR ALL USING (
        session_id IN (
            SELECT id FROM discovery_sessions WHERE consultant_id IN (
                SELECT id FROM users WHERE organization_id IN (
                    SELECT organization_id FROM users WHERE id = auth.uid()
                )
            )
        )
    );

-- Create default organization for development
INSERT INTO organizations (name, domain) 
VALUES ('SEP Indiana', 'sep.com')
ON CONFLICT (domain) DO NOTHING;