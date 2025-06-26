// Test authenticated direct fetch
(window as any).testAuthDirectFetch = async () => {
  console.log('Testing authenticated direct fetch...');
  const authTestModule = await import('./authTest');
  const getSession = (authTestModule as any).getSession;
  const session = await getSession();
  
  if (!session) {
    console.error('No session found');
    return null;
  }
  
  console.log('Session user:', session.user);
  console.log('Access token:', session.access_token?.substring(0, 20) + '...');
  
  // Store token in sessionStorage for direct fetch
  sessionStorage.setItem('supabase.auth.token', session.access_token);
  
  const { fetchProfileDirect } = await import('../lib/supabaseDirectFetch');
  const result = await fetchProfileDirect(session.user.id);
  
  if (result.error) {
    console.error('Direct fetch error:', result.error);
  } else {
    console.log('Direct fetch success:', result.data);
  }
  
  return result;
};

// Test direct profile fetch
(window as any).testDirectProfile = async () => {
  const authTestModule = await import('./authTest');
  const getSession = (authTestModule as any).getSession;
  const session = await getSession();
  
  if (session?.user?.id) {
    const { fetchProfileDirect } = await import('../lib/supabaseDirectFetch');
    const result = await fetchProfileDirect(session.user.id);
    console.log('Direct profile fetch:', result);
    return result;
  } else {
    console.error('No user session found');
    return null;
  }
};

// Export functions for module usage
export const testAuthDirectFetch = (window as any).testAuthDirectFetch;
export const testDirectProfile = (window as any).testDirectProfile;