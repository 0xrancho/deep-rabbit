// DeepRabbit Core API Service
import { supabase, getCurrentUser, hasActiveSubscription, logActivity } from './supabase-auth';

export interface CreateSessionData {
  prospectName: string;
  prospectEmail: string;
  prospectCompany: string;
  prospectRole?: string;
  industry: string;
  businessArea: string;
  discoveryContext: string;
  expectedSolutionScope: string;
  expectedNextStep: string;
}

export interface DeepRabbitSession {
  id: string;
  user_id: string;
  prospect_name: string;
  prospect_email: string;
  prospect_company: string;
  prospect_role: string | null;
  industry: string;
  business_area: string;
  discovery_context: string;
  expected_solution_scope: string;
  expected_next_step: string;
  status: 'active' | 'completed' | 'abandoned';
  started_at: string;
  completed_at: string | null;
  last_activity: string;
  report_generated: boolean;
  report_url: string | null;
  share_with_prospect: boolean;
  total_questions_asked: number;
  total_elicitation_time: number | null;
}

export interface ElicitationData {
  sessionId: string;
  area: string;
  sequenceNumber: number;
  depthLevel: number;
  questionText: string;
  notes: string;
  gptSynthesis?: string;
}

export interface DeepRabbitElicitation {
  id: string;
  session_id: string;
  area: string;
  sequence_number: number;
  depth_level: number;
  question_text: string;
  notes: string;
  gpt_synthesis: string | null;
  created_at: string;
}

// Session Management
export async function createSession(sessionData: CreateSessionData): Promise<DeepRabbitSession> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Authentication required');
  
  const hasActive = await hasActiveSubscription();
  if (!hasActive) throw new Error('Active subscription required');
  
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      prospect_name: sessionData.prospectName,
      prospect_email: sessionData.prospectEmail,
      prospect_company: sessionData.prospectCompany,
      prospect_role: sessionData.prospectRole,
      industry: sessionData.industry,
      business_area: sessionData.businessArea,
      discovery_context: sessionData.discoveryContext,
      expected_solution_scope: sessionData.expectedSolutionScope,
      expected_next_step: sessionData.expectedNextStep
    })
    .select()
    .single();
    
  if (error) throw error;
  
  await logActivity('session_created', { 
    sessionId: data.id,
    prospectCompany: sessionData.prospectCompany,
    industry: sessionData.industry 
  });
  
  return data;
}

export async function getSession(sessionId: string): Promise<DeepRabbitSession | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
    
  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }
  
  return data;
}

export async function getUserSessions(): Promise<DeepRabbitSession[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
  
  return data || [];
}

export async function updateSessionActivity(sessionId: string, totalQuestions: number) {
  const { error } = await supabase
    .from('sessions')
    .update({ 
      last_activity: new Date().toISOString(),
      total_questions_asked: totalQuestions 
    })
    .eq('id', sessionId);
    
  if (error) console.error('Error updating session activity:', error);
}

export async function completeSession(sessionId: string) {
  const { error } = await supabase
    .from('sessions')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', sessionId);
    
  if (error) throw error;
  
  await logActivity('session_completed', { sessionId });
}

// Elicitation Management
export async function saveElicitation(elicitationData: ElicitationData): Promise<DeepRabbitElicitation> {
  const hasActive = await hasActiveSubscription();
  if (!hasActive) throw new Error('Active subscription required');
  
  const { data, error } = await supabase
    .from('elicitations')
    .insert({
      session_id: elicitationData.sessionId,
      area: elicitationData.area,
      sequence_number: elicitationData.sequenceNumber,
      depth_level: elicitationData.depthLevel,
      question_text: elicitationData.questionText,
      notes: elicitationData.notes,
      gpt_synthesis: elicitationData.gptSynthesis
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Update session activity
  await updateSessionActivity(elicitationData.sessionId, elicitationData.sequenceNumber);
  
  await logActivity('elicitation_saved', { 
    sessionId: elicitationData.sessionId,
    area: elicitationData.area,
    sequenceNumber: elicitationData.sequenceNumber 
  });
  
  return data;
}

export async function getSessionElicitations(sessionId: string): Promise<DeepRabbitElicitation[]> {
  const { data, error } = await supabase
    .from('elicitations')
    .select('*')
    .eq('session_id', sessionId)
    .order('sequence_number', { ascending: true });
    
  if (error) {
    console.error('Error fetching elicitations:', error);
    return [];
  }
  
  return data || [];
}

// Report Management
export interface ReportData {
  sessionId: string;
  htmlContent: string;
  markdownContent: string;
  sharedWithEmails?: string[];
}

export async function saveReport(reportData: ReportData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Authentication required');
  
  const hasActive = await hasActiveSubscription();
  if (!hasActive) throw new Error('Active subscription required');
  
  const { data, error } = await supabase
    .from('reports')
    .insert({
      session_id: reportData.sessionId,
      user_id: user.id,
      html_content: reportData.htmlContent,
      markdown_content: reportData.markdownContent,
      shared_with_emails: reportData.sharedWithEmails || []
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Update session to mark report as generated
  await supabase
    .from('sessions')
    .update({ 
      report_generated: true,
      report_url: `/reports/${data.public_id}`
    })
    .eq('id', reportData.sessionId);
    
  await logActivity('report_generated', { 
    sessionId: reportData.sessionId,
    reportId: data.id,
    publicId: data.public_id 
  });
  
  return data;
}

export async function getPublicReport(publicId: string) {
  const { data, error } = await supabase
    .from('reports')
    .select('html_content, markdown_content, view_count, created_at')
    .eq('public_id', publicId)
    .single();
    
  if (error) return null;
  
  // Increment view count
  await supabase
    .from('reports')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('public_id', publicId);
  
  return data;
}

// Usage Analytics
export async function getUserUsageStats() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);
  
  const [sessionsResult, reportsResult] = await Promise.all([
    supabase
      .from('sessions')
      .select('id')
      .eq('user_id', user.id)
      .gte('started_at', currentMonth.toISOString()),
    supabase
      .from('reports')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', currentMonth.toISOString())
  ]);
  
  return {
    sessionsThisMonth: sessionsResult.data?.length || 0,
    reportsThisMonth: reportsResult.data?.length || 0,
    totalSessions: (await supabase
      .from('sessions')
      .select('id')
      .eq('user_id', user.id)).data?.length || 0,
    totalReports: (await supabase
      .from('reports')
      .select('id')
      .eq('user_id', user.id)).data?.length || 0
  };
}