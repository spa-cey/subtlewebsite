'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role?: string;
  subscriptionTier?: string;
  emailVerified?: boolean;
  lastSignInAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ error: any }>;
  signInWithMagicLink: (email: string, options?: any) => Promise<{ error: any }>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure axios defaults
axios.defaults.baseURL = typeof window !== 'undefined' 
  ? window.location.origin 
  : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
axios.defaults.withCredentials = true;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      console.log('Checking user...');
      const response = await axios.get('/api/auth/me');
      console.log('Check user response:', response.data);
      if (response.data.success && response.data.user) {
        console.log('Setting user from checkUser:', response.data.user);
        setUser(response.data.user);
      }
    } catch (error) {
      console.log('Check user error:', error);
      // User is not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        console.log('Login successful, setting user:', response.data.user);
        setUser(response.data.user);
        return { error: null };
      }
      
      return { error: new Error('Login failed') };
    } catch (error: any) {
      return { 
        error: {
          message: error.response?.data?.error || 'An error occurred during login'
        }
      };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        fullName,
      });

      if (response.data.success) {
        setUser(response.data.user);
        return { error: null };
      }
      
      return { error: new Error('Registration failed') };
    } catch (error: any) {
      return { 
        error: {
          message: error.response?.data?.error || 'An error occurred during registration'
        }
      };
    }
  };

  const signOut = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const signInWithProvider = async (provider: 'google' | 'github') => {
    // For OAuth, we need to redirect to the provider
    // This will be implemented based on your OAuth setup
    return { error: { message: 'OAuth not implemented yet' } };
  };

  const signInWithMagicLink = async (email: string, options?: any) => {
    // Magic link functionality to be implemented
    return { error: { message: 'Magic link not implemented yet' } };
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post('/api/auth/refresh');
      if (response.data.success) {
        // Token refreshed successfully
        await checkUser();
      }
    } catch (error) {
      // Refresh failed, user needs to login again
      setUser(null);
      router.push('/login');
    }
  };

  // Set up axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Don't intercept auth endpoints to prevent loops
        if (originalRequest.url?.includes('/api/auth/')) {
          return Promise.reject(error);
        }
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await refreshToken();
            return axios(originalRequest);
          } catch (refreshError) {
            setUser(null);
            router.push('/login');
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    signInWithMagicLink,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}