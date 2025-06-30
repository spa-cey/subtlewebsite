import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { apiClient, User, AuthResponse } from '@/lib/api'

// Define error interface compatible with existing code
interface AuthError {
  message: string
  code?: string
}

// Profile type for backward compatibility
type Profile = User

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: { user: User } | null
  loading: boolean
  error: AuthError | null
  isFromMacAppBridge: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>
  signInWithMagicLink: (email: string, options?: { returnUrl?: string; desktopAuth?: boolean }) => Promise<{ error: AuthError | null }>
  signInWithProvider: (provider: 'google' | 'github' | 'apple') => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>
  refreshSession: () => Promise<{ error: AuthError | null }>
  broadcastSettingsChange: (settings: Record<string, any>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<{ user: User } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)
  const [isFromMacAppBridge, setIsFromMacAppBridge] = useState(false)
  
  // Track initialization to prevent duplicate operations
  const initializationRef = useRef<Promise<void> | null>(null)

  // Helper function to handle auth errors
  const handleAuthError = (error: any) => {
    const authError: AuthError = {
      message: error?.response?.data?.error || error?.message || 'An error occurred',
      code: error?.response?.status?.toString() || 'UNKNOWN'
    }
    setError(authError)
    console.error('Auth error:', authError)
  }

  // Set user and session from API response
  const setUserSession = useCallback((userData: User) => {
    setUser(userData)
    setProfile(userData) // Profile is the same as user data
    setSession({ user: userData })
    setError(null)
  }, [])

  // Check for bridge token authentication (Mac app integration)
  const handleBridgeTokenAuth = useCallback(async (): Promise<boolean> => {
    const bridgeToken = getBridgeTokenFromURL()
    if (!bridgeToken) {
      return false
    }

    console.log('[AuthContext] Processing bridge token authentication')
    removeBridgeTokenFromURL()
    
    try {
      // For now, bridge token auth is disabled since it requires Supabase functions
      // This can be re-implemented with the new backend API later
      console.warn('[AuthContext] Bridge token auth not yet implemented with new API')
      return false
    } catch (error) {
      console.error('[AuthContext] Bridge token exchange failed:', error)
      handleAuthError(error)
      return false
    }
  }, [])

  // Main initialization function
  const initializeAuth = useCallback(async () => {
    console.log('[AuthContext] Starting auth initialization')
    
    try {
      // Check for bridge token first
      const hasBridgeAuth = await handleBridgeTokenAuth()
      if (hasBridgeAuth) {
        console.log('[AuthContext] Authenticated via bridge token')
        return
      }

      // Check if user is already authenticated
      if (apiClient.isAuthenticated()) {
        console.log('[AuthContext] Found existing session, fetching user data')
        
        try {
          const userData = await apiClient.getCurrentUser()
          setUserSession(userData)
          
          // Mark session as active
          sessionStorage.setItem('subtle_session_active', 'true')
          
          console.log('[AuthContext] Session restored for user:', userData.id)
        } catch (error) {
          console.error('[AuthContext] Failed to fetch user data:', error)
          // Clear invalid tokens
          await apiClient.logout()
        }
      } else {
        console.log('[AuthContext] No active session found')
      }
    } catch (error) {
      console.error('[AuthContext] Initialization error:', error)
      handleAuthError(error)
    } finally {
      setLoading(false)
    }
  }, [handleBridgeTokenAuth, setUserSession])

  // Initialize auth on mount
  useEffect(() => {
    // Prevent multiple simultaneous initializations
    if (initializationRef.current) {
      console.log('[AuthContext] Initialization already in progress')
      return
    }

    initializationRef.current = initializeAuth()
    
    // Debug: Log all click events to find what's triggering logout
    const debugClickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        console.log('[AuthContext] Button clicked:', {
          text: target.innerText,
          className: target.className,
          id: target.id,
          onclick: target.onclick?.toString()
        })
      }
    }
    window.addEventListener('click', debugClickHandler)

    // Session refresh interval
    const refreshInterval = setInterval(async () => {
      if (apiClient.isAuthenticated()) {
        try {
          await apiClient.refreshSession()
        } catch (error) {
          console.error('[AuthContext] Session refresh failed:', error)
          // Don't handle as error here, let the API client handle token refresh
        }
      }
    }, 30000) // Check every 30 seconds

    // Handle browser/tab close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      sessionStorage.removeItem('subtle_session_active')
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      initializationRef.current = null
      clearInterval(refreshInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('click', debugClickHandler)
    }
  }, [initializeAuth])

  // Auth methods
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setError(null)
      const response = await apiClient.register(email, password, fullName)
      
      setUserSession(response.user)
      sessionStorage.setItem('subtle_session_active', 'true')
      
      return { error: null }
    } catch (err: any) {
      const authError: AuthError = {
        message: err?.response?.data?.error || err.message || 'Registration failed',
        code: err?.response?.status?.toString() || 'REGISTRATION_ERROR'
      }
      handleAuthError(authError)
      return { error: authError }
    }
  }

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    try {
      setError(null)
      
      const response = await apiClient.login(email, password)
      
      setUserSession(response.user)
      
      // Mark session as active immediately after successful login
      sessionStorage.setItem('subtle_session_active', 'true')
      
      return { error: null }
    } catch (err: any) {
      const authError: AuthError = {
        message: err?.response?.data?.error || err.message || 'Login failed',
        code: err?.response?.status?.toString() || 'LOGIN_ERROR'
      }
      handleAuthError(authError)
      return { error: authError }
    }
  }

  const signInWithMagicLink = async (email: string, options?: { returnUrl?: string; desktopAuth?: boolean }) => {
    try {
      setError(null)
      
      // Magic link auth not implemented with new API yet
      const authError: AuthError = {
        message: 'Magic link authentication is not yet available',
        code: 'NOT_IMPLEMENTED'
      }
      handleAuthError(authError)
      return { error: authError }
    } catch (err: any) {
      const authError: AuthError = {
        message: err?.response?.data?.error || err.message || 'Magic link failed',
        code: err?.response?.status?.toString() || 'MAGIC_LINK_ERROR'
      }
      handleAuthError(authError)
      return { error: authError }
    }
  }

  const signInWithProvider = async (provider: 'google' | 'github' | 'apple') => {
    try {
      setError(null)
      
      // OAuth provider auth not implemented with new API yet
      const authError: AuthError = {
        message: `${provider} authentication is not yet available`,
        code: 'NOT_IMPLEMENTED'
      }
      handleAuthError(authError)
      return { error: authError }
    } catch (err: any) {
      const authError: AuthError = {
        message: err?.response?.data?.error || err.message || 'Provider auth failed',
        code: err?.response?.status?.toString() || 'PROVIDER_AUTH_ERROR'
      }
      handleAuthError(authError)
      return { error: authError }
    }
  }

  const signOut = async () => {
    console.log('[AuthContext] signOut called - Stack trace:', new Error().stack)
    try {
      setError(null)
      
      await apiClient.logout()
      
      // Clear state
      setSession(null)
      setUser(null)
      setProfile(null)
      setError(null)
      setIsFromMacAppBridge(false)
      
      // Clear all session storage
      sessionStorage.removeItem('subtle_session_active')
      sessionStorage.removeItem('subtle_session_source')
      sessionStorage.removeItem('subtle_bridge_token_used')
      
      return { error: null }
    } catch (err: any) {
      const authError: AuthError = {
        message: err?.response?.data?.error || err.message || 'Logout failed',
        code: err?.response?.status?.toString() || 'LOGOUT_ERROR'
      }
      handleAuthError(authError)
      return { error: authError }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      
      // Password reset not implemented with new API yet
      const authError: AuthError = {
        message: 'Password reset is not yet available',
        code: 'NOT_IMPLEMENTED'
      }
      handleAuthError(authError)
      return { error: authError }
    } catch (err: any) {
      const authError: AuthError = {
        message: err?.response?.data?.error || err.message || 'Password reset failed',
        code: err?.response?.status?.toString() || 'PASSWORD_RESET_ERROR'
      }
      handleAuthError(authError)
      return { error: authError }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      setError(null)
      
      // Password update not implemented with new API yet
      const authError: AuthError = {
        message: 'Password update is not yet available',
        code: 'NOT_IMPLEMENTED'
      }
      handleAuthError(authError)
      return { error: authError }
    } catch (err: any) {
      const authError: AuthError = {
        message: err?.response?.data?.error || err.message || 'Password update failed',
        code: err?.response?.status?.toString() || 'PASSWORD_UPDATE_ERROR'
      }
      handleAuthError(authError)
      return { error: authError }
    }
  }

  const refreshSession = async () => {
    try {
      setError(null)
      
      await apiClient.refreshSession()
      
      // Fetch updated user data
      if (apiClient.isAuthenticated()) {
        const userData = await apiClient.getCurrentUser()
        setUserSession(userData)
      }
      
      return { error: null }
    } catch (err: any) {
      const authError: AuthError = {
        message: err?.response?.data?.error || err.message || 'Session refresh failed',
        code: err?.response?.status?.toString() || 'REFRESH_ERROR'
      }
      handleAuthError(authError)
      return { error: authError }
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setError(null)
      
      const updatedUser = await apiClient.updateUserProfile(updates)
      setUserSession(updatedUser)
      
      return { error: null }
    } catch (err: any) {
      const error = new Error(err?.response?.data?.error || err.message || 'Profile update failed')
      console.error('[AuthContext] Profile update error:', error)
      return { error }
    }
  }

  const broadcastSettingsChange = async (settings: Record<string, any>) => {
    // Settings broadcast not implemented with new API yet
    console.log('[AuthContext] Settings broadcast not yet implemented:', settings)
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    error,
    isFromMacAppBridge,
    signUp,
    signIn,
    signInWithMagicLink,
    signInWithProvider,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    refreshSession,
    broadcastSettingsChange,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Utility functions for bridge token handling (kept for compatibility)
function getBridgeTokenFromURL(): string | null {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('bridge_token')
}

function removeBridgeTokenFromURL(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete('bridge_token')
  window.history.replaceState({}, document.title, url.toString())
}