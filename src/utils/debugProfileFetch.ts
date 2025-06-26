import { supabase } from '../lib/supabase';

export async function debugProfileFetch() {
  console.log('=== Debug Profile Fetch ===');
  
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session:', session);
    console.log('Session Error:', sessionError);
    
    if (!session) {
      console.log('No session found');
      return;
    }
    
    const userId = session.user.id;
    console.log('User ID from session:', userId);
    
    // Test 1: Direct query with logging
    console.log('\n--- Test 1: Direct Query ---');
    const query1 = supabase
      .from('users')
      .select('*')
      .eq('id', userId);
    
    console.log('Query:', query1);
    const { data: data1, error: error1 } = await query1;
    console.log('Result:', { data: data1, error: error1 });
    
    // Test 2: Query with maybeSingle
    console.log('\n--- Test 2: With maybeSingle ---');
    const { data: data2, error: error2 } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    console.log('Result:', { data: data2, error: error2 });
    
    // Test 3: Query all users (to see if RLS is blocking)
    console.log('\n--- Test 3: Query All Users ---');
    const { data: data3, error: error3, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' });
    console.log('Result:', { 
      data: data3, 
      error: error3, 
      count,
      canSeeAnyUsers: !error3 && data3 && data3.length > 0
    });
    
    // Test 4: Raw SQL query
    console.log('\n--- Test 4: Raw SQL Query ---');
    const { data: data4, error: error4 } = await supabase.rpc('get_current_user_profile', {});
    console.log('RPC Result:', { data: data4, error: error4 });
    
    // Test 5: Check auth.uid() function
    console.log('\n--- Test 5: Check auth.uid() ---');
    // This would need to be done in SQL, but we can check what the client thinks
    console.log('Client thinks user ID is:', userId);
    console.log('Type of user ID:', typeof userId);
    
  } catch (error) {
    console.error('Debug error:', error);
  }
  
  console.log('=== Debug Complete ===');
}

// Create RPC function for testing
export const createDebugRPCFunction = `
-- Create a debug function to check auth context
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE (
  auth_uid UUID,
  has_profile BOOLEAN,
  profile_data JSON
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as auth_uid,
    EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid()) as has_profile,
    (SELECT row_to_json(u.*) FROM public.users u WHERE u.id = auth.uid()) as profile_data;
END;
$$;
`;

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).debugProfileFetch = debugProfileFetch;
}