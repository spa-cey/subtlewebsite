// Authentication Test Utilities
// Use these to verify real Supabase functionality

import { supabase } from '@/lib/supabase'

export const testAuthConnection = async () => {
  try {
    // Test 1: Check if Supabase client is properly configured
    console.log('Testing Supabase connection...')
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase client connected successfully')
    
    // Test 2: Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
      console.error('❌ VITE_SUPABASE_URL not properly configured')
      return false
    }
    
    if (!supabaseKey || supabaseKey.includes('your-anon-key')) {
      console.error('❌ VITE_SUPABASE_ANON_KEY not properly configured')
      return false
    }
    
    console.log('✅ Environment variables configured')
    console.log(`📍 Connected to: ${supabaseUrl}`)
    
    return true
  } catch (error) {
    console.error('❌ Auth test failed:', error)
    return false
  }
}

export const testProfilesTable = async () => {
  try {
    console.log('Testing users table access...')

    // Test if we can query the users table (even if empty)
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Users table access failed:', error.message)
      return false
    }
    
    console.log('✅ Users table accessible')
    return true
  } catch (error) {
    console.error('❌ Users table test failed:', error)
    return false
  }
}

// Call this in browser console to test: testAuthConnection()
if (typeof window !== 'undefined') {
  (window as any).testAuthConnection = testAuthConnection;
  (window as any).testProfilesTable = testProfilesTable;
}