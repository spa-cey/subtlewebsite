import { supabase } from '../lib/supabase';

export interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  details: any;
  recommendation?: string;
}

export async function runEnhancedProfileDiagnostic(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  
  console.log('=== Enhanced Profile Diagnostic Started ===');
  
  try {
    // Test 1: Auth Session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    results.push({
      test: 'Auth Session Check',
      status: session ? 'pass' : 'fail',
      details: {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: sessionError
      },
      recommendation: !session ? 'User needs to be logged in' : undefined
    });
    
    if (!session) {
      return results;
    }
    
    // Test 2: Direct Profile Query
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
    
    results.push({
      test: 'Profile Query by Auth ID',
      status: profile ? 'pass' : 'fail',
      details: {
        profile,
        error: profileError,
        query: `SELECT * FROM users WHERE id = '${session.user.id}'`
      },
      recommendation: !profile ? 
        'Profile not found for auth user ID. The auth user ID may not match the profile ID in the database.' : 
        undefined
    });
    
    // Test 3: Profile Query by Email
    const { data: profileByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .maybeSingle();
    
    results.push({
      test: 'Profile Query by Email',
      status: profileByEmail ? 'pass' : 'fail',
      details: {
        profile: profileByEmail,
        error: emailError,
        profileId: profileByEmail?.id,
        authId: session.user.id,
        idsMatch: profileByEmail?.id === session.user.id
      },
      recommendation: profileByEmail && profileByEmail.id !== session.user.id ?
        'Profile exists but with different ID. This indicates a UUID mismatch between auth and profile.' :
        !profileByEmail ? 'No profile found for this email.' : undefined
    });
    
    // Test 4: RLS Policy Test
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    results.push({
      test: 'RLS Policy Test',
      status: countError ? 'fail' : 'warning',
      details: {
        visibleProfiles: count,
        error: countError,
        note: 'Should only see your own profile due to RLS'
      },
      recommendation: count === 0 ? 
        'Cannot see any profiles. RLS policies may be blocking access.' :
        count > 1 ? 'Can see multiple profiles. You may have admin access.' : undefined
    });
    
    // Test 5: Admin Status Check
    const { data: adminStatus, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();
    
    results.push({
      test: 'Admin Status Check',
      status: adminStatus ? 'pass' : 'warning',
      details: {
        isAdmin: !!adminStatus,
        adminRole: adminStatus?.role,
        error: adminError
      }
    });
    
    // Test 6: Check for Hardcoded Admin Profile
    const hardcodedId = '9055d88e-5fce-4dbf-893a-c0348a4c5f14';
    const { data: hardcodedProfile } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', hardcodedId)
      .maybeSingle();
    
    if (hardcodedProfile) {
      results.push({
        test: 'Hardcoded Profile Check',
        status: 'warning',
        details: {
          found: true,
          id: hardcodedId,
          email: hardcodedProfile.email,
          isCurrentUser: hardcodedProfile.email === session.user.email
        },
        recommendation: 'Found hardcoded admin profile. This may need to be migrated to your actual auth user ID.'
      });
    }
    
    // Test 7: Profile Creation Capability
    if (!profile && profileByEmail) {
      // Profile exists but can't access it due to ID mismatch
      results.push({
        test: 'Profile Access Issue',
        status: 'fail',
        details: {
          authUserId: session.user.id,
          profileUserId: profileByEmail.id,
          mismatch: true
        },
        recommendation: 'UUID mismatch detected. Run the fix-admin-profile-link.sql script to resolve this.'
      });
    }
    
  } catch (error) {
    results.push({
      test: 'Diagnostic Error',
      status: 'fail',
      details: { error },
      recommendation: 'An unexpected error occurred during diagnostics.'
    });
  }
  
  // Summary
  const summary = {
    totalTests: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    failed: results.filter(r => r.status === 'fail').length,
    warnings: results.filter(r => r.status === 'warning').length
  };
  
  console.log('=== Diagnostic Summary ===');
  console.log(summary);
  console.log('=== Detailed Results ===');
  results.forEach(r => {
    console.log(`${r.status.toUpperCase()}: ${r.test}`);
    console.log('Details:', r.details);
    if (r.recommendation) {
      console.log('Recommendation:', r.recommendation);
    }
    console.log('---');
  });
  
  return results;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).runEnhancedProfileDiagnostic = runEnhancedProfileDiagnostic;
}