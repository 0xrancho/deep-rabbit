// DeepRabbit Supabase Authentication Service
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qamuwnrqyrcfoeabkdss.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbXV3bnJxeXJjZm9lYWJrZHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDkxNTYsImV4cCI6MjA3MzAyNTE1Nn0.wtZ4CUA6eJjvPR60JPWZxAl9sxt2y0dNMHiBhvf7SH8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserMetadata {
  fullName: string;
  company: string;
  role: string;
}

export interface DeepRabbitUser {
  id: string;
  email: string;
  full_name: string;
  company: string;
  role: string;
  subscription_status: 'trialing' | 'active' | 'canceled' | 'past_due';
  subscription_tier: 'professional' | 'team' | 'enterprise';
  trial_ends_at: string;
  subscription_ends_at: string | null;
  stripe_customer_id: string | null;
  created_at: string;
}

// Sign up with 7-day trial (no email confirmation required)
export async function signUp(email: string, password: string, metadata: UserMetadata) {
  console.log('Attempting sign up with:', { email, passwordLength: password.length, metadata });
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
      data: {
        full_name: metadata.fullName,
        company: metadata.company,
        role: metadata.role
      }
    }
  });
  
  console.log('Sign up result:', { data, error });
  
  if (!error && data.user) {
    // Create or update user record in our users table with 7-day trial
    const { error: dbError } = await supabase.from('users').upsert({
      id: data.user.id,
      email: data.user.email!,
      full_name: metadata.fullName,
      company: metadata.company,
      role: metadata.role,
      subscription_status: 'trialing',
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }, {
      onConflict: 'id'
    });
    
    if (dbError) {
      console.error('Error creating user record:', dbError);
    }
    
    // Log signup activity
    await logActivity('user_signup', { source: 'email' });
  }
  
  return { data, error };
}

// Sign in with email/password
export async function signIn(email: string, password: string) {
  console.log('Attempting sign in with:', { email, passwordLength: password.length });
  
  const result = await supabase.auth.signInWithPassword({ email, password });
  
  if (result.error) {
    console.error('Sign in error:', result.error);
    console.error('Error code:', result.error.message);
    console.error('Full error:', JSON.stringify(result.error, null, 2));
  } else {
    console.log('Sign in successful:', result.data.user?.email);
    await logActivity('user_signin', { method: 'email' });
  }
  
  return result;
}

// Sign in with Google OAuth
export async function signInWithGoogle() {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });
}

// Sign out
export async function signOut() {
  await logActivity('user_signout');
  return await supabase.auth.signOut();
}

// Get current user with subscription info
export async function getCurrentUser(): Promise<DeepRabbitUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
  
  return userData;
}

// Check if user has active subscription or trial
export async function hasActiveSubscription(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  if (user.subscription_status === 'active') return true;
  
  if (user.subscription_status === 'trialing') {
    return new Date(user.trial_ends_at) > new Date();
  }
  
  return false;
}

// Get subscription status details
export async function getSubscriptionStatus() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const isTrialExpired = user.subscription_status === 'trialing' && 
                        new Date(user.trial_ends_at) <= new Date();
  
  const daysLeft = user.subscription_status === 'trialing' ? 
    Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 
    null;
  
  return {
    status: user.subscription_status,
    tier: user.subscription_tier,
    isActive: user.subscription_status === 'active',
    isTrialing: user.subscription_status === 'trialing' && !isTrialExpired,
    isExpired: isTrialExpired || user.subscription_status === 'canceled',
    trialDaysLeft: daysLeft,
    trialEndsAt: user.trial_ends_at,
    subscriptionEndsAt: user.subscription_ends_at
  };
}

// Log user activity for compliance and analytics
export async function logActivity(action: string, metadata: any = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action,
      metadata,
      created_at: new Date().toISOString()
    });
  }
}

// Update user profile
export async function updateProfile(updates: Partial<UserMetadata>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');
  
  const { error } = await supabase
    .from('users')
    .update({
      full_name: updates.fullName,
      company: updates.company,
      role: updates.role,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);
    
  if (!error) {
    await logActivity('profile_updated', updates);
  }
  
  return { error };
}

// Auth state change listener
export function onAuthStateChange(callback: (user: DeepRabbitUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });
}