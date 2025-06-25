import { supabase } from '../lib/supabase';

export async function diagnoseProfileIssue() {
  console.log('=== Profile Diagnostic Started ===');
  
  try {
    // 1. Check current auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Current session:', session);
    console.log('Session error:', sessionError);
    
    if (!session) {
      console.log('No active session found');
      return;
    }
    
    const userId = session.user.id;
    console.log('Current user ID:', userId);
    console.log('Current user email:', session.user.email);
    
    // 2. Try different ways to fetch the profile from users table
    console.log('\n--- Testing profile queries ---');
    
    // Method 1: Direct query with eq
    const { data: profile1, error: error1 } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    console.log('Method 1 (eq + maybeSingle):', { profile1, error1 });
    
    // Method 2: Query with single
    const { data: profile2, error: error2 } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    console.log('Method 2 (eq + single):', { profile2, error2 });
    
    // Method 3: Query all profiles for this user (should be just one)
    const { data: profiles, error: error3 } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId);
    console.log('Method 3 (all matches):', { profiles, error3 });
    
    // Method 4: Query by email
    const { data: profileByEmail, error: error4 } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email);
    console.log('Method 4 (by email):', { profileByEmail, error4 });
    
    // 3. Test RLS by checking if we can see any profiles
    const { data: allProfiles, error: allError } = await supabase
      .from('users')
      .select('id, email')
      .limit(5);
    console.log('\nCan see any profiles?:', { count: allProfiles?.length, allError });
    
    // 4. Check if we can update our own profile
    if (profile1) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userId);
      console.log('\nCan update own profile?:', { updateError });
    }
    
    // 5. Test auth.uid() function with a simple query
    const { data: authTest, error: authError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .limit(1);
    console.log('\nDirect auth.uid() test:', { authTest, authError });
    
    // 6. Check session JWT claims
    if (session?.access_token) {
      const payload = JSON.parse(atob(session.access_token.split('.')[1]));
      console.log('\nJWT payload sub (user ID):', payload.sub);
      console.log('JWT payload email:', payload.email);
      console.log('JWT payload role:', payload.role);
    }
    
  } catch (error) {
    console.error('Diagnostic error:', error);
  }
  
  console.log('=== Profile Diagnostic Complete ===');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).diagnoseProfileIssue = diagnoseProfileIssue;
}