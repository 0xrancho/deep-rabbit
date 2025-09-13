// Test script to verify waitlist functionality
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qamuwnrqyrcfoeabkdss.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbXV3bnJxeXJjZm9lYWJrZHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDkxNTYsImV4cCI6MjA3MzAyNTE1Nn0.wtZ4CUA6eJjvPR60JPWZxAl9sxt2y0dNMHiBhvf7SH8';

console.log('Testing Supabase Waitlist Connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Missing');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test function
async function testWaitlistSave() {
  try {
    // Test data
    const testEntry = {
      name: 'Test User',
      email: 'test@example.com',
      company_url: 'https://example.com',
      user_agent: 'Test Script'
    };

    console.log('\n1. Testing waitlist table insert...');
    const { data, error } = await supabase
      .from('waitlist')
      .insert(testEntry)
      .select()
      .single();

    if (error) {
      console.error('❌ Insert failed:', error);
      return;
    }

    console.log('✅ Insert successful:', data);

    console.log('\n2. Testing waitlist table read...');
    const { data: readData, error: readError } = await supabase
      .from('waitlist')
      .select('*')
      .eq('email', 'test@example.com')
      .order('created_at', { ascending: false })
      .limit(1);

    if (readError) {
      console.error('❌ Read failed:', readError);
      return;
    }

    console.log('✅ Read successful:', readData);

    console.log('\n3. Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('waitlist')
      .delete()
      .eq('email', 'test@example.com');

    if (deleteError) {
      console.error('❌ Cleanup failed:', deleteError);
      return;
    }

    console.log('✅ Cleanup successful');
    console.log('\n🎉 All waitlist tests passed!');

  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }
}

// Run the test
testWaitlistSave();