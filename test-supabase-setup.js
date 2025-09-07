// Test script to check Supabase table setup
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load from .env.local file
const supabaseUrl = 'https://flbyvhxinryspgciamhm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYnl2aHhpbnJ5c3BnY2lhbWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjI0OTAsImV4cCI6MjA3MTczODQ5MH0.ntceM42R1i43deNTwwxCQ7MJhG69kRF7q81u2-FDRLk'

console.log('🔧 Testing Supabase setup...')
console.log('📍 URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  try {
    console.log('\n📊 Checking tools table...')
    const { data: toolsData, error: toolsError } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true })
      
    if (toolsError) {
      console.log('❌ Tools table error:', toolsError.message)
    } else {
      console.log('✅ Tools table exists, count:', toolsData)
    }

    console.log('\n📋 Checking patterns table...')
    const { data: patternsData, error: patternsError } = await supabase
      .from('patterns')
      .select('*', { count: 'exact', head: true })
      
    if (patternsError) {
      console.log('❌ Patterns table error:', patternsError.message)
    } else {
      console.log('✅ Patterns table exists, count:', patternsData)
    }

    console.log('\n🔍 Testing vector_search function...')
    const { data: funcData, error: funcError } = await supabase
      .rpc('vector_search_minimal', {
        query_embedding: new Array(1536).fill(0.1),
        match_count: 1
      })
      
    if (funcError) {
      console.log('❌ Function error:', funcError.message)
    } else {
      console.log('✅ Function works, returned:', funcData?.length, 'results')
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

async function applyMigration() {
  try {
    console.log('\n🚀 Attempting to apply migration...')
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/004_missing_functions.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split into individual statements and execute
    const statements = migrationSQL.split(';').filter(s => s.trim())
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}`)
        const { error } = await supabase.rpc('exec', { sql: statement })
        if (error) {
          console.log('⚠️ Statement error:', error.message)
        }
      }
    }
    
    console.log('✅ Migration application complete')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
  }
}

// Run the checks
checkTables().then(() => {
  console.log('\n🎯 Run this script to diagnose Supabase setup issues')
  console.log('📝 If tables are missing, you need to apply the migration manually in Supabase SQL Editor')
})