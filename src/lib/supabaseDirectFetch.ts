// Direct fetch wrapper for Supabase API
// Use this temporarily while debugging the Supabase client timeout issue

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper to get access token
function getAccessToken(): string | null {
  try {
    // First try sessionStorage (set by AuthContext)
    const sessionToken = sessionStorage.getItem('supabase.auth.token');
    if (sessionToken) {
      return sessionToken;
    }
    
    // Then try localStorage with the Supabase key format
    const storageKey = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.access_token || null;
    }
  } catch (error) {
    console.error('Error getting access token:', error);
  }
  
  return null;
}

export async function directSupabaseFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  
  // Get the user's access token for authenticated requests
  const accessToken = getAccessToken();
  
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Direct fetch error:', error);
    return { data: null, error };
  }
}

// Fetch user profile directly
export async function fetchProfileDirect(userId: string) {
  console.log('[DirectFetch] Fetching profile for:', userId);
  
  try {
    const token = getAccessToken();
    if (!token) {
      console.error('[DirectFetch] No access token available');
      return { data: null, error: new Error('No access token available') };
    }

    console.log('[DirectFetch] Using access token:', token.substring(0, 20) + '...');

    // Make the direct API call with proper auth header
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DirectFetch] Error response:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[DirectFetch] Profile data:', data);
    
    if (data && Array.isArray(data) && data.length > 0) {
      return { data: data[0], error: null };
    }
    
    return { data: null, error: new Error('Profile not found') };
  } catch (error) {
    console.error('[DirectFetch] Error:', error);
    return { data: null, error };
  }
}

// Get session from localStorage (where Supabase stores it)
export function getStoredSession() {
  try {
    // Supabase v2 stores session in localStorage
    const storageKey = Object.keys(localStorage).find(key => 
      key.startsWith('sb-') && key.endsWith('-auth-token')
    );
    
    if (storageKey) {
      const sessionData = localStorage.getItem(storageKey);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error getting stored session:', error);
  }
  return null;
}

// Make functions available globally for testing
(window as any).fetchProfileDirect = fetchProfileDirect;
(window as any).getStoredSession = getStoredSession;