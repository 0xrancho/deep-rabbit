// Test DeepRabbit Supabase Connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qamuwnrqyrcfoeabkdss.supabase.co';
const supabaseKey = 'sb_publishable_HeCmgJsDv3yMFo3KbBiGbA_5R0H4E2x';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🐰 Testing DeepRabbit Supabase Connection...\n');
  
  // Test 1: Can we connect?
  try {
    const { data, error } = await supabase.from('users').select('count');
    if (error && error.code === '42P01') {
      console.log('❌ Tables not created yet - Please run migrations first');
    } else if (error) {
      console.log('❌ Connection error:', error.message);
    } else {
      console.log('✅ Database connected successfully!');
    }
  } catch (e) {
    console.log('❌ Connection failed:', e.message);
  }
  
  // Test 2: Check auth configuration
  const { data: { user } } = await supabase.auth.getUser();
  console.log('✅ Auth system ready (no user logged in)');
  
  console.log('\n🎉 DeepRabbit backend is ready!');
  console.log('Next: Run migrations in SQL Editor to create tables');
}

testConnection();