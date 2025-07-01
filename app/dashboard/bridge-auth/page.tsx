'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BridgeAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const bridgeToken = searchParams.get('bridge_token');
    
    if (!bridgeToken) {
      setStatus('error');
      setError('No bridge token provided');
      return;
    }

    // Exchange bridge token for session
    exchangeBridgeToken(bridgeToken);
  }, [searchParams]);

  const exchangeBridgeToken = async (bridgeToken: string) => {
    try {
      const response = await fetch('/api/auth/bridge-token/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bridge_token: bridgeToken }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        // Redirect to dashboard after successful authentication
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setStatus('error');
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      setStatus('error');
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        {status === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Authenticating...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="text-green-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold">Authentication successful!</p>
            <p className="text-gray-600 text-sm mt-2">Redirecting to dashboard...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-gray-800 font-semibold">Authentication failed</p>
            <p className="text-gray-600 text-sm mt-2">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}