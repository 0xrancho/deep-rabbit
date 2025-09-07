import { createClient } from '@supabase/supabase-js';

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using localStorage only.');
}

// Create Supabase client (will be null if env vars missing)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Type definitions matching our database schema
export interface AssessmentRecord {
  id?: string;
  session_id: string;
  email: string;
  company: string;
  full_name?: string;
  subscribe_updates?: boolean;
  
  // Assessment step data
  business_type?: string;
  opportunity_focus?: string;
  revenue_model?: string;
  challenges?: string[];
  metrics?: Record<string, any>;
  metrics_quantified?: Record<string, string>;
  team_description?: string;
  process_description?: string;
  tech_stack?: string[];
  investment_level?: string;
  additional_context?: string;
  
  // AI analysis metadata
  confidence_score?: number;
  analysis_tokens?: number;
  generation_time_ms?: number;
  
  // Status management
  status?: 'in_progress' | 'completed' | 'abandoned' | 'needs_more_info';
  current_step?: number;
  
  // Timestamps
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PartialSave {
  id?: string;
  session_id: string;
  step_number: number;
  step_data: Record<string, any>;
  created_at?: string;
}

export interface ReportRecord {
  id?: string;
  assessment_id: string;
  report_data: Record<string, any>;
  executive_summary?: string;
  recommendations?: string;
  roadmap?: Record<string, any>;
  roi_projections?: Record<string, any>;
  confidence_score?: number;
  generation_time_ms?: number;
  tokens_used?: number;
  model_version?: string;
  status?: 'generating' | 'generated' | 'failed';
  created_at?: string;
}

export interface FeedbackRecord {
  id?: string;
  assessment_id: string;
  rating: number;
  feedback_text?: string;
  interested_in_meeting?: boolean;
  user_agent?: string;
  session_duration_ms?: number;
  created_at?: string;
}

export interface CTAClick {
  id?: string;
  assessment_id?: string;
  cta_type: 'free_call' | 'paid_consult' | 'gabi_signup';
  clicked_at?: string;
  user_agent?: string;
  referrer?: string;
}

export interface AnalyticsEvent {
  id?: string;
  session_id: string;
  event_type: string;
  event_data?: Record<string, any>;
  step_number?: number;
  timestamp_ms: number;
  user_agent?: string;
  created_at?: string;
}

// Utility function to check if Supabase is available
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

// Helper function to handle graceful fallback
export const withSupabaseFallback = async <T>(
  supabaseOperation: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, using fallback');
    return fallback();
  }

  try {
    return await supabaseOperation();
  } catch (error) {
    console.error('Supabase operation failed, using fallback:', error);
    return fallback();
  }
};

// Database operation helpers
export const saveAssessment = async (assessment: AssessmentRecord): Promise<AssessmentRecord | null> => {
  return withSupabaseFallback(
    async () => {
      const { data, error } = await supabase!
        .from('assessments')
        .upsert(assessment, { onConflict: 'session_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    async () => {
      // Fallback: continue using localStorage
      const existingData = localStorage.getItem('assessment_session');
      const merged = existingData ? { ...JSON.parse(existingData), ...assessment } : assessment;
      localStorage.setItem('assessment_session', JSON.stringify(merged));
      return merged;
    }
  );
};

export const loadAssessment = async (sessionId: string): Promise<AssessmentRecord | null> => {
  return withSupabaseFallback(
    async () => {
      const { data, error } = await supabase!
        .from('assessments')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data || null;
    },
    async () => {
      // Fallback: load from localStorage
      const data = localStorage.getItem('assessment_session');
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      return parsed.sessionId === sessionId ? parsed : null;
    }
  );
};

export const savePartialStep = async (partialSave: PartialSave): Promise<void> => {
  return withSupabaseFallback(
    async () => {
      const { error } = await supabase!
        .from('partial_saves')
        .insert(partialSave);

      if (error) throw error;
    },
    async () => {
      // Fallback: save to localStorage with step history
      const key = `partial_save_${partialSave.session_id}`;
      const existing = localStorage.getItem(key);
      const history = existing ? JSON.parse(existing) : [];
      
      history.push({
        ...partialSave,
        created_at: new Date().toISOString()
      });
      
      // Keep only last 20 saves to avoid storage bloat
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }
      
      localStorage.setItem(key, JSON.stringify(history));
    }
  );
};

export const saveReport = async (report: ReportRecord): Promise<ReportRecord | null> => {
  return withSupabaseFallback(
    async () => {
      const { data, error } = await supabase!
        .from('reports')
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    async () => {
      // Fallback: save to localStorage
      const reportWithId = { ...report, id: `local_${Date.now()}` };
      localStorage.setItem(`report_${report.assessment_id}`, JSON.stringify(reportWithId));
      return reportWithId;
    }
  );
};

export const loadReport = async (assessmentId: string): Promise<ReportRecord | null> => {
  return withSupabaseFallback(
    async () => {
      const { data, error } = await supabase!
        .from('reports')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
    async () => {
      // Fallback: load from localStorage
      const data = localStorage.getItem(`report_${assessmentId}`);
      return data ? JSON.parse(data) : null;
    }
  );
};

export const saveFeedback = async (feedback: FeedbackRecord): Promise<void> => {
  return withSupabaseFallback(
    async () => {
      const { error } = await supabase!
        .from('feedback')
        .insert(feedback);

      if (error) throw error;
    },
    async () => {
      // Fallback: save to localStorage
      const key = 'assessment_feedback';
      const existing = localStorage.getItem(key);
      const feedbackList = existing ? JSON.parse(existing) : [];
      
      feedbackList.push({
        ...feedback,
        created_at: new Date().toISOString()
      });
      
      localStorage.setItem(key, JSON.stringify(feedbackList));
    }
  );
};

export const trackCTAClick = async (cta: CTAClick): Promise<void> => {
  return withSupabaseFallback(
    async () => {
      const { error } = await supabase!
        .from('cta_clicks')
        .insert({
          ...cta,
          clicked_at: new Date().toISOString(),
          user_agent: navigator.userAgent,
          referrer: document.referrer
        });

      if (error) throw error;
    },
    async () => {
      // Fallback: save to localStorage
      const key = 'cta_clicks';
      const existing = localStorage.getItem(key);
      const clicks = existing ? JSON.parse(existing) : [];
      
      clicks.push({
        ...cta,
        clicked_at: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer
      });
      
      localStorage.setItem(key, JSON.stringify(clicks));
    }
  );
};

export const trackAnalyticsEvent = async (event: Omit<AnalyticsEvent, 'timestamp_ms' | 'user_agent'>): Promise<void> => {
  return withSupabaseFallback(
    async () => {
      const { error } = await supabase!
        .from('analytics_events')
        .insert({
          ...event,
          timestamp_ms: Date.now(),
          user_agent: navigator.userAgent
        });

      if (error) throw error;
    },
    async () => {
      // Fallback: save to localStorage
      const key = 'analytics_events';
      const existing = localStorage.getItem(key);
      const events = existing ? JSON.parse(existing) : [];
      
      events.push({
        ...event,
        timestamp_ms: Date.now(),
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      });
      
      // Keep only last 100 events to avoid storage bloat
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem(key, JSON.stringify(events));
    }
  );
};