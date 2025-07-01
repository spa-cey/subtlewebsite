'use client';

import { useAuth } from '@/contexts/AuthContext-nextjs';
import { useEffect } from 'react';

export default function TestAuthPage() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Log all cookies
    console.log('All cookies:', document.cookie);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      <div className="space-y-2">
        <p>Loading: {loading ? 'true' : 'false'}</p>
        <p>User: {user ? JSON.stringify(user, null, 2) : 'null'}</p>
        <p>Cookies: {document.cookie || 'none'}</p>
      </div>
    </div>
  );
}