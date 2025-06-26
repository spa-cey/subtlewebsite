export async function diagnoseNetwork() {
  console.log('=== Network Diagnostic ===\n');
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  // Test 1: Basic fetch to Supabase
  console.log('1. Testing basic fetch to Supabase...');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      signal: controller.signal,
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      }
    });
    
    clearTimeout(timeout);
    console.log('   ✓ Fetch successful');
    console.log('   - Status:', response.status);
    console.log('   - Headers:', Object.fromEntries(response.headers.entries()));
  } catch (error: any) {
    console.error('   ✗ Fetch failed:', error.message);
    if (error.name === 'AbortError') {
      console.error('   → Connection timeout - network may be blocking Supabase');
    }
  }
  
  // Test 2: Check for CORS
  console.log('\n2. Testing CORS preflight...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'apikey, authorization',
        'Origin': window.location.origin
      }
    });
    console.log('   - CORS preflight status:', response.status);
    console.log('   - Access-Control headers:', {
      'Allow-Origin': response.headers.get('access-control-allow-origin'),
      'Allow-Headers': response.headers.get('access-control-allow-headers'),
      'Allow-Methods': response.headers.get('access-control-allow-methods')
    });
  } catch (error) {
    console.error('   ✗ CORS check failed:', error);
  }
  
  // Test 3: Direct REST API call
  console.log('\n3. Testing direct REST API call...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.9055d88e-5fce-4dbf-893a-c0348a4c5f14`, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
    
    console.log('   - Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('   ✓ Data retrieved:', data);
    } else {
      const error = await response.text();
      console.error('   ✗ Error response:', error);
    }
  } catch (error) {
    console.error('   ✗ API call failed:', error);
  }
  
  // Test 4: Check WebSocket connection
  console.log('\n4. Testing WebSocket connection...');
  try {
    const wsUrl = supabaseUrl.replace('https://', 'wss://') + '/realtime/v1/websocket?apikey=' + import.meta.env.VITE_SUPABASE_ANON_KEY;
    const ws = new WebSocket(wsUrl);
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket timeout'));
      }, 5000);
      
      ws.onopen = () => {
        clearTimeout(timeout);
        console.log('   ✓ WebSocket connected');
        ws.close();
        resolve(null);
      };
      
      ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
    });
  } catch (error) {
    console.error('   ✗ WebSocket failed:', error);
  }
  
  // Test 5: Alternative fetch methods
  console.log('\n5. Testing alternative connection methods...');
  
  // Using XMLHttpRequest
  try {
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${supabaseUrl}/rest/v1/`);
      xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY);
      xhr.timeout = 5000;
      
      xhr.onload = () => {
        console.log('   ✓ XMLHttpRequest successful:', xhr.status);
        resolve(null);
      };
      
      xhr.onerror = () => reject(new Error('XHR failed'));
      xhr.ontimeout = () => reject(new Error('XHR timeout'));
      
      xhr.send();
    });
  } catch (error) {
    console.error('   ✗ XMLHttpRequest failed:', error);
  }
  
  // Recommendations
  console.log('\n=== Recommendations ===');
  console.log('1. Check browser console for any Content Security Policy (CSP) errors');
  console.log('2. Try disabling browser extensions (especially ad blockers)');
  console.log('3. Check if you\'re behind a corporate firewall or VPN');
  console.log('4. Try accessing in incognito mode');
  console.log('5. Test from a different network (mobile hotspot)');
  console.log('6. Verify Supabase project is not paused in dashboard');
  
  console.log('\n=== Alternative Solution ===');
  console.log('Since your database has RLS disabled, you can use a direct PostgreSQL connection:');
  console.log('1. Get connection string from Supabase dashboard');
  console.log('2. Use a PostgreSQL client library directly');
  console.log('3. Or temporarily use a backend proxy to bypass CORS');
}

// Make it globally available
(window as any).diagnoseNetwork = diagnoseNetwork;