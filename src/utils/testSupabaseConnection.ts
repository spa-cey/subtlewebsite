import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  console.log('=== Testing Supabase Connection ===');
  
  const tests = [];
  
  // Test 1: Basic connection
  console.log('\n1. Testing basic connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    tests.push({
      test: 'Get Session',
      success: !error,
      data: data,
      error: error
    });
    console.log('Session test:', { success: !error, hasSession: !!data?.session });
  } catch (e) {
    tests.push({
      test: 'Get Session',
      success: false,
      error: e
    });
    console.error('Session test failed:', e);
  }
  
  // Test 2: Direct table query (no auth required for service role)
  console.log('\n2. Testing direct query...');
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    tests.push({
      test: 'Count Users',
      success: !error,
      count: count,
      error: error
    });
    console.log('Count test:', { success: !error, count });
  } catch (e) {
    tests.push({
      test: 'Count Users',
      success: false,
      error: e
    });
    console.error('Count test failed:', e);
  }
  
  // Test 3: RPC function call
  console.log('\n3. Testing RPC function...');
  try {
    const { data, error } = await supabase
      .rpc('get_my_profile');
    
    tests.push({
      test: 'RPC get_my_profile',
      success: !error,
      data: data,
      error: error
    });
    console.log('RPC test:', { success: !error, hasData: !!data });
  } catch (e) {
    tests.push({
      test: 'RPC get_my_profile',
      success: false,
      error: e
    });
    console.error('RPC test failed:', e);
  }
  
  // Test 4: Check Supabase URL and Anon Key
  console.log('\n4. Checking Supabase configuration...');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  tests.push({
    test: 'Supabase Config',
    success: !!(supabaseUrl && supabaseKey),
    data: {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseKey?.length || 0,
      urlPrefix: supabaseUrl?.substring(0, 30) + '...'
    }
  });
  
  console.log('Config test:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    url: supabaseUrl?.substring(0, 30) + '...'
  });
  
  // Summary
  console.log('\n=== Test Summary ===');
  const passed = tests.filter(t => t.success).length;
  const failed = tests.filter(t => !t.success).length;
  console.log(`Passed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}/${tests.length}`);
  
  tests.forEach(t => {
    console.log(`${t.success ? '✅' : '❌'} ${t.test}:`, t);
  });
  
  return tests;
}

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
}