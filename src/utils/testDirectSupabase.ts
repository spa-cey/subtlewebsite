import { supabase } from '../lib/supabase';

export async function testDirectSupabase() {
  console.log('=== Direct Supabase Test ===');
  
  // Test 1: Check if client is initialized
  console.log('1. Supabase client initialized:', !!supabase);
  console.log('2. Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('3. Has anon key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  
  // Test 2: Try a simple auth check
  console.log('\n4. Testing auth.getSession()...');
  try {
    const startTime = Date.now();
    const { data, error } = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout after 5s')), 5000)
      )
    ]) as any;
    
    const duration = Date.now() - startTime;
    console.log(`   - Completed in ${duration}ms`);
    console.log('   - Has session:', !!data?.session);
    console.log('   - Error:', error);
    
    if (data?.session) {
      console.log('   - User ID:', data.session.user.id);
      console.log('   - Email:', data.session.user.email);
    }
  } catch (error) {
    console.error('   - Failed:', error);
  }
  
  // Test 3: Try a simple database query (no auth required since RLS is disabled)
  console.log('\n5. Testing database query (count users)...');
  try {
    const startTime = Date.now();
    const { count, error } = await Promise.race([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout after 5s')), 5000)
      )
    ]) as any;
    
    const duration = Date.now() - startTime;
    console.log(`   - Completed in ${duration}ms`);
    console.log('   - Count:', count);
    console.log('   - Error:', error);
  } catch (error) {
    console.error('   - Failed:', error);
  }
  
  // Test 4: Direct profile query
  console.log('\n6. Testing direct profile query...');
  try {
    const startTime = Date.now();
    const { data, error } = await Promise.race([
      supabase
        .from('users')
        .select('*')
        .eq('id', '9055d88e-5fce-4dbf-893a-c0348a4c5f14')
        .single(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout after 5s')), 5000)
      )
    ]) as any;
    
    const duration = Date.now() - startTime;
    console.log(`   - Completed in ${duration}ms`);
    console.log('   - Data:', data);
    console.log('   - Error:', error);
  } catch (error) {
    console.error('   - Failed:', error);
  }
  
  // Test 5: Check network tab
  console.log('\n7. Check your Network tab for failed requests to:');
  console.log(`   - ${import.meta.env.VITE_SUPABASE_URL}/rest/v1/*`);
  console.log(`   - ${import.meta.env.VITE_SUPABASE_URL}/auth/v1/*`);
  
  console.log('\n=== Test Complete ===');
  return {
    clientInitialized: !!supabase,
    hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  };
}

// Make it available globally
(window as any).testDirectSupabase = testDirectSupabase;