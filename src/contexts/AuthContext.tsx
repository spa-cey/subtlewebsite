import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase, supabaseUrl, Database } from '@/lib/supabase'
import { SessionSyncService, getBridgeTokenFromURL, removeBridgeTokenFromURL, isBridgeTokenSyncEnabled } from '@/lib/SessionSyncService'

type Profile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
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
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)
  const [isFromMacAppBridge, setIsFromMacAppBridge] = useState(false)
  
  // Track initialization to prevent duplicate operations
  const initializationRef = useRef<Promise<void> | null>(null)
  const profileFetchCache = useRef<Map<string, Promise<Profile | null>>>(new Map())
  const sessionSyncService = useRef<SessionSyncService | null>(null)
  const authSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  // Helper function to handle auth errors
  const handleAuthError = (error: AuthError) => {
    setError(error)
    console.error('Auth error:', error)
  }

  // Simplified fetchProfile with proper caching
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    // Check cache first
    const cached = profileFetchCache.current.get(userId)
    if (cached) {
      console.log('[AuthContext] Using cached profile fetch for user:', userId)
      return cached
    }

    // Create new fetch promise
    const fetchPromise = (async () => {
      console.log('[AuthContext] Fetching profile for user:', userId)
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            console.log('[AuthContext] Profile not found, creating new profile')
            
            const { data: userData } = await supabase.auth.getUser()
            if (userData.user?.id === userId) {
              const newProfileData = {
                id: userId,
                email: userData.user.email!,
                full_name: userData.user.user_metadata?.full_name || null,
                avatar_url: userData.user.user_metadata?.avatar_url || null,
                subscription_tier: 'free' as const
              }
              
              const { data: newProfile, error: createError } = await supabase
                .from('users')
                .insert(newProfileData)
                .select()
                .single()

              if (createError) {
                console.error('[AuthContext] Failed to create profile:', createError)
                return null
              }
              
              return newProfile
            }
          }
          console.error('[AuthContext] Profile fetch error:', error)
          return null
        }

        return data
      } catch (err) {
        console.error('[AuthContext] Unexpected error fetching profile:', err)
        return null
      } finally {
        // Clean up cache after a delay
        setTimeout(() => {
          profileFetchCache.current.delete(userId)
        }, 5000)
      }
    })()

    // Cache the promise
    profileFetchCache.current.set(userId, fetchPromise)
    return fetchPromise
  }, [])

  // Handle bridge token authentication
  const handleBridgeTokenAuth = useCallback(async (): Promise<Session | null> => {
    if (!isBridgeTokenSyncEnabled()) {
      return null
    }

    const bridgeToken = getBridgeTokenFromURL()
    if (!bridgeToken) {
      return null
    }

    console.log('[AuthContext] Processing bridge token authentication')
    removeBridgeTokenFromURL()
    
    try {
      if (!sessionSyncService.current) {
        sessionSyncService.current = SessionSyncService.getInstance()
      }
      
      const bridgeSession = await sessionSyncService.current.exchangeBridgeToken(bridgeToken)
      
      setSession(bridgeSession)
      setUser(bridgeSession.user)
      setIsFromMacAppBridge(true)
      
      // Initialize realtime sync
      await sessionSyncService.current.initializeRealtimeSync(bridgeSession.user.id)
      
      // Fetch profile
      const userProfile = await fetchProfile(bridgeSession.user.id)
      if (userProfile) {
        setProfile(userProfile)
      }
      
      return bridgeSession
    } catch (error) {
      console.error('[AuthContext] Bridge token exchange failed:', error)
      handleAuthError(error as AuthError)
      return null
    }
  }, [fetchProfile])

  // Main initialization function
  const initializeAuth = useCallback(async () => {
    console.log('[AuthContext] Starting auth initialization')
    
    try {
      // Check for bridge token first
      const bridgeSession = await handleBridgeTokenAuth()
      if (bridgeSession) {
        console.log('[AuthContext] Authenticated via bridge token')
        return
      }

      // Get current session
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('[AuthContext] Failed to get session:', error)
        handleAuthError(error)
        return
      }

      if (currentSession) {
        console.log('[AuthContext] Found existing session for user:', currentSession.user.id)
        
        setSession(currentSession)
        setUser(currentSession.user)
        
        // Mark session as active immediately if it exists
        sessionStorage.setItem('subtle_session_active', 'true')
        
        // Fetch profile
        const userProfile = await fetchProfile(currentSession.user.id)
        if (userProfile) {
          setProfile(userProfile)
        }
        
        // Handle temporary session - but only on browser close, not navigation
        const isTemporary = sessionStorage.getItem('subtle_session_temporary') === 'true'
        if (isTemporary) {
          console.log('[AuthContext] Temporary session detected, will clear on browser close')
        }
      } else {
        console.log('[AuthContext] No active session found')
      }
    } catch (error) {
      console.error('[AuthContext] Initialization error:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchProfile, handleBridgeTokenAuth])

  // Initialize auth on mount
  useEffect(() => {
    // Prevent multiple simultaneous initializations
    if (initializationRef.current) {
      console.log('[AuthContext] Initialization already in progress')
      return
    }

    initializationRef.current = initializeAuth()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log('[AuthContext] Auth state change:', event, { 
          hasSession: !!currentSession,
          userId: currentSession?.user?.id 
        })

        switch (event) {
          case 'SIGNED_IN':
            setSession(currentSession)
            setUser(currentSession?.user ?? null)
            sessionStorage.setItem('subtle_session_active', 'true')
            
            if (currentSession?.user) {
              const userProfile = await fetchProfile(currentSession.user.id)
              if (userProfile) {
                setProfile(userProfile)
              }
            }
            break

          case 'SIGNED_OUT':
            console.log('[AuthContext] User signed out')
            setSession(null)
            setUser(null)
            setProfile(null)
            setError(null)
            setIsFromMacAppBridge(false)
            
            // Clear all session storage
            sessionStorage.removeItem('subtle_session_temporary')
            sessionStorage.removeItem('subtle_session_active')
            sessionStorage.removeItem('subtle_session_source')
            sessionStorage.removeItem('subtle_bridge_token_used')
            
            // Cleanup session sync service
            if (sessionSyncService.current) {
              sessionSyncService.current.cleanup()
            }
            break

          case 'USER_UPDATED':
            setSession(currentSession)
            setUser(currentSession?.user ?? null)
            
            if (currentSession?.user) {
              const userProfile = await fetchProfile(currentSession.user.id)
              if (userProfile) {
                setProfile(userProfile)
              }
            }
            break

          case 'TOKEN_REFRESHED':
            setSession(currentSession)
            break
        }
      }
    )

    authSubscriptionRef.current = subscription

    // Session refresh interval
    const refreshInterval = setInterval(async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (currentSession?.expires_at) {
        const expiresAt = new Date(currentSession.expires_at * 1000)
        const now = new Date()
        const timeUntilExpiry = expiresAt.getTime() - now.getTime()
        
        // Refresh if less than 60 seconds until expiry
        if (timeUntilExpiry < 60000 && timeUntilExpiry > 0) {
          console.log('[AuthContext] Refreshing session - expires soon')
          await refreshSession()
        }
      }
    }, 30000) // Check every 30 seconds

    // Handle browser/tab close for temporary sessions
    const handleBeforeUnload = () => {
      const isTemporary = sessionStorage.getItem('subtle_session_temporary') === 'true'
      if (isTemporary) {
        // Sign out synchronously on browser close
        navigator.sendBeacon(`${supabaseUrl}/auth/v1/logout`, JSON.stringify({
          access_token: session?.access_token
        }))
      }
      sessionStorage.removeItem('subtle_session_active')
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      initializationRef.current = null
      authSubscriptionRef.current?.unsubscribe()
      clearInterval(refreshInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      if (sessionSyncService.current) {
        sessionSyncService.current.cleanup()
      }
    }
  }, []) // Empty deps - only run once on mount

  // Auth methods
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        handleAuthError(error)
      }
      
      return { error }
    } catch (err) {
      const error = err as AuthError
      handleAuthError(error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    try {
      setError(null)
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        handleAuthError(error)
        return { error }
      }
      
      // Set temporary session flag if remember me is false
      if (!rememberMe) {
        sessionStorage.setItem('subtle_session_temporary', 'true')
      } else {
        sessionStorage.removeItem('subtle_session_temporary')
      }
      
      // Mark session as active immediately after successful login
      sessionStorage.setItem('subtle_session_active', 'true')
      
      return { error: null }
    } catch (err) {
      const error = err as AuthError
      handleAuthError(error)
      return { error }
    }
  }

  const signInWithMagicLink = async (email: string, options?: { returnUrl?: string; desktopAuth?: boolean }) => {
    try {
      setError(null)
      
      let redirectUrl = `${window.location.origin}/auth/callback`
      
      if (options?.desktopAuth && options?.returnUrl) {
        redirectUrl = `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(options.returnUrl)}&desktopAuth=true`
      } else if (options?.returnUrl) {
        redirectUrl = `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(options.returnUrl)}`
      }
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      })
      
      if (error) {
        handleAuthError(error)
      }
      
      return { error }
    } catch (err) {
      const error = err as AuthError
      handleAuthError(error)
      return { error }
    }
  }

  const signInWithProvider = async (provider: 'google' | 'github' | 'apple') => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        handleAuthError(error)
      }
      
      return { error }
    } catch (err) {
      const error = err as AuthError
      handleAuthError(error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      
      // Cleanup session sync service first
      if (sessionSyncService.current) {
        await sessionSyncService.current.cleanup()
      }
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        handleAuthError(error)
      }
      
      return { error }
    } catch (err) {
      const error = err as AuthError
      handleAuthError(error)
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        handleAuthError(error)
      }
      
      return { error }
    } catch (err) {
      const error = err as AuthError
      handleAuthError(error)
      return { error }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        handleAuthError(error)
      }
      
      return { error }
    } catch (err) {
      const error = err as AuthError
      handleAuthError(error)
      return { error }
    }
  }

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        handleAuthError(error)
        return { error }
      }
      
      if (data.session) {
        setSession(data.session)
        setUser(data.user)
      }
      
      return { error: null }
    } catch (err) {
      const error = err as AuthError
      handleAuthError(error)
      return { error }
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (!error && profile) {
        setProfile({ ...profile, ...updates })
      }

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const broadcastSettingsChange = async (settings: Record<string, any>) => {
    if (sessionSyncService.current && isFromMacAppBridge) {
      try {
        await sessionSyncService.current.broadcastSettingsChange(settings)
        console.log('[AuthContext] Settings change broadcasted to Mac app')
      } catch (error) {
        console.error('[AuthContext] Failed to broadcast settings change:', error)
      }
    }
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
    broadcastSettingsChange
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}