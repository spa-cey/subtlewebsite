import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase, Database } from '@/lib/supabase'
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
  
  // Use refs to track initialization and prevent duplicate operations
  const isInitialized = useRef(false)
  const profileFetchPromise = useRef<Promise<void> | null>(null)
  const activeUserId = useRef<string | null>(null)
  const authStateProcessed = useRef(false)
  const sessionSyncService = useRef<SessionSyncService | null>(null)

  // Helper function to handle auth errors
  const handleAuthError = (error: AuthError) => {
    setError(error)
    console.error('Auth error:', error)
    
    if (error.message?.includes('refresh_token_not_found')) {
      console.log('Session expired - authentication required')
    }
  }

  // Memoized fetchProfile with timeout and deduplication
  const fetchProfile = useCallback(async (userId: string, skipIfLoaded: boolean = false) => {
    // If we're already fetching for this user, return the existing promise
    if (activeUserId.current === userId && profileFetchPromise.current) {
      console.log('[AuthContext] Profile fetch already in progress, waiting...')
      return profileFetchPromise.current
    }
    
    // If we already have the profile for this user and skipIfLoaded is true, skip
    if (skipIfLoaded && profile && profile.id === userId) {
      console.log('[AuthContext] Profile already loaded for user')
      return
    }
    
    // Create a new fetch promise
    activeUserId.current = userId
    profileFetchPromise.current = (async () => {
      console.log('[AuthContext] Starting profile fetch for userId:', userId)
      const startTime = performance.now()
      
      try {
        console.log('[AuthContext] Making Supabase query to users table...')
        
        // Create a timeout promise that rejects after 5 seconds
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Profile query timeout after 5 seconds')), 5000)
        })
        
        const queryPromise = supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
        
        console.log('[AuthContext] Query promise created, awaiting result with timeout...')
        
        let data: any = null
        let error: any = null
        
        try {
          // Race between the query and the timeout
          const result = await Promise.race([
            queryPromise,
            timeoutPromise.then(() => ({ data: null, error: { code: 'TIMEOUT', message: 'Query timed out' } }))
          ]) as any
          
          data = result.data
          error = result.error
          
          const queryTime = performance.now() - startTime
          console.log(`[AuthContext] Profile query completed in ${queryTime.toFixed(2)}ms`)
          console.log('[AuthContext] Query result:', { data: !!data, error: !!error, errorCode: error?.code })
        } catch (timeoutError) {
          // Handle timeout error from Promise.race
          console.error('[AuthContext] Query timeout error:', timeoutError)
          const queryTime = performance.now() - startTime
          console.log(`[AuthContext] Profile query timed out after ${queryTime.toFixed(2)}ms`)
          // Don't return here - we need to handle the timeout properly
          error = { code: 'TIMEOUT', message: 'Profile query timed out' }
        }

        if (error) {
          console.error('[AuthContext] Profile fetch error:', {
            code: error.code,
            message: error.message
          })
          
          // Only attempt to create profile for "not found" errors
          if (error.code === 'PGRST116') {
            console.log('[AuthContext] Profile not found, creating...')
            
            const { data: userData } = await supabase.auth.getUser()
            if (userData.user?.id === userId) {
              const profileData = {
                id: userId,
                email: userData.user.email!,
                full_name: userData.user.user_metadata?.full_name || null,
                avatar_url: userData.user.user_metadata?.avatar_url || null,
                subscription_tier: 'free'
              }
              
              console.log('[AuthContext] Inserting new profile...')
              const { data: newProfile, error: createError } = await supabase
                .from('users')
                .insert(profileData)
                .select()
                .single()

              if (createError) {
                console.error('[AuthContext] Profile creation error:', createError)
              } else if (newProfile) {
                console.log('[AuthContext] Profile created successfully')
                setProfile(newProfile)
              }
            }
          }
        } else if (data) {
          console.log('[AuthContext] Profile fetched successfully:', {
            id: data.id,
            email: data.email,
            subscription_tier: data.subscription_tier
          })
          setProfile(data)
        } else {
          console.log('[AuthContext] No data and no error - unexpected state')
        }
      } catch (error) {
        console.error('[AuthContext] Unexpected error in fetchProfile:', error)
        console.error('[AuthContext] Error stack:', (error as Error).stack)
      } finally {
        console.log('[AuthContext] Profile fetch finally block')
        // Clear the promise ref when done
        if (activeUserId.current === userId) {
          profileFetchPromise.current = null
          activeUserId.current = null
        }
      }
    })()
    
    return profileFetchPromise.current
  }, [profile])

  // Refresh session
  const refreshSession = useCallback(async () => {
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
      console.error('Error refreshing session:', err)
      return { error: err as AuthError }
    }
  }, [])

  // Bridge token authentication handler
  const handleBridgeTokenAuth = useCallback(async () => {
    if (!isBridgeTokenSyncEnabled()) {
      console.log('[AuthContext] Bridge token sync is disabled')
      return false
    }

    const bridgeToken = getBridgeTokenFromURL()
    
    if (!bridgeToken) {
      return false
    }

    console.log('[AuthContext] Bridge token detected, initiating exchange')
    removeBridgeTokenFromURL()
    
    try {
      setLoading(true)
      setError(null)
      
      if (!sessionSyncService.current) {
        sessionSyncService.current = SessionSyncService.getInstance()
      }
      
      const bridgeSession = await sessionSyncService.current.exchangeBridgeToken(bridgeToken)
      
      console.log('[AuthContext] Bridge token exchange successful')
      setSession(bridgeSession)
      setUser(bridgeSession.user)
      setIsFromMacAppBridge(true)
      authStateProcessed.current = true
      
      // Initialize realtime sync
      await sessionSyncService.current.initializeRealtimeSync(bridgeSession.user.id)
      
      // Fetch profile for the authenticated user
      try {
        await fetchProfile(bridgeSession.user.id)
      } catch (profileError) {
        console.error('[AuthContext] Profile fetch failed after bridge auth:', profileError)
      }
      
      return true
      
    } catch (bridgeError) {
      console.error('[AuthContext] Bridge token exchange failed:', bridgeError)
      setError(bridgeError as AuthError)
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchProfile])

  // Initialize auth on mount
  useEffect(() => {
    let mounted = true
    
    const initAuth = async () => {
      if (isInitialized.current) {
        console.log('[AuthContext] Already initialized, skipping...')
        return
      }
      
      isInitialized.current = true
      console.log('[AuthContext] Starting auth initialization...')
      
      try {
        // Check for bridge token first
        const bridgeHandled = await handleBridgeTokenAuth()
        
        if (bridgeHandled) {
          console.log('[AuthContext] Bridge token handled, skipping normal auth flow')
          return
        }
        // Check for temporary session
        const isTemporarySession = sessionStorage.getItem('subtle_session_temporary')
        console.log('[AuthContext] Temporary session flag:', isTemporarySession)
        
        // Get initial session
        console.log('[AuthContext] Getting session from Supabase...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('[AuthContext] Session response received')
        
        if (!mounted) {
          console.log('[AuthContext] Component unmounted, aborting')
          return
        }
        
        if (error) {
          console.error('[AuthContext] Session error:', error)
          handleAuthError(error)
          setLoading(false)
        } else if (session) {
          console.log('[AuthContext] Session found:', { userId: session.user.id, email: session.user.email })
          
          // Handle temporary session cleanup
          if (isTemporarySession && !sessionStorage.getItem('subtle_session_active')) {
            console.log('[AuthContext] Clearing temporary session')
            await supabase.auth.signOut()
            sessionStorage.removeItem('subtle_session_temporary')
            setLoading(false)
          } else {
            console.log('[AuthContext] Valid session found, setting state')
            setSession(session)
            setUser(session.user)
            authStateProcessed.current = true
            
            // Fetch profile but ensure loading is set to false regardless
            try {
              console.log('[AuthContext] About to fetch profile for user:', session.user.id)
              await fetchProfile(session.user.id)
              console.log('[AuthContext] Profile fetch completed')
            } catch (error) {
              console.error('[AuthContext] Profile fetch failed:', error)
            } finally {
              // ALWAYS set loading to false after profile fetch attempt
              console.log('[AuthContext] Setting loading to false')
              setLoading(false)
              sessionStorage.setItem('subtle_session_active', 'true')
            }
          }
        } else {
          console.log('[AuthContext] No session found')
          authStateProcessed.current = true
          setIsFromMacAppBridge(false)
          setLoading(false)
        }
      } catch (error) {
        console.error('[AuthContext] Critical error during initialization:', error)
        if (mounted) {
          console.log('[AuthContext] Setting loading to false due to error')
          setLoading(false)
        }
      }
    }

    // Start initialization immediately
    initAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        if (!mounted) return

        console.log('Auth event:', event)
        
        // Skip duplicate processing for initial session
        if (event === 'INITIAL_SESSION' && authStateProcessed.current) {
          console.log('[AuthContext] Skipping INITIAL_SESSION - already processed')
          return
        }
        
        // Update session and user if changed
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        
        // Update Mac app bridge status
        const isBridge = sessionStorage.getItem('subtle_session_source') === 'mac_app_bridge'
        setIsFromMacAppBridge(isBridge)
        
        switch (event) {
          case 'INITIAL_SESSION':
            // Mark as processed
            authStateProcessed.current = true
            break
            
          case 'SIGNED_IN':
            // Skip if we're still initializing
            if (loading) {
              console.log('[AuthContext] Skipping SIGNED_IN profile fetch - still initializing')
              break
            }
            // Skip if we already have the profile
            if (currentSession?.user && currentSession.user.id !== profile?.id) {
              await fetchProfile(currentSession.user.id, true)
            }
            break
            
          case 'SIGNED_OUT':
            setProfile(null)
            setError(null)
            setIsFromMacAppBridge(false)
            authStateProcessed.current = false
            
            // Cleanup session sync service
            if (sessionSyncService.current) {
              await sessionSyncService.current.cleanup()
            }
            break
            
          case 'USER_UPDATED':
            if (currentSession?.user) {
              await fetchProfile(currentSession.user.id)
            }
            break
        }
      }
    )

    // Session refresh interval
    const refreshInterval = setInterval(async () => {
      if (!mounted) return
      
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (currentSession?.expires_at) {
        const expiresAt = new Date(currentSession.expires_at * 1000)
        const now = new Date()
        const timeUntilExpiry = expiresAt.getTime() - now.getTime()
        
        if (timeUntilExpiry < 60000 && timeUntilExpiry > 0) {
          refreshSession()
        }
      }
    }, 30000)

    // Cleanup
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('subtle_session_active')
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      mounted = false
      isInitialized.current = false
      authStateProcessed.current = false
      subscription.unsubscribe()
      clearInterval(refreshInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      // Cleanup session sync service
      if (sessionSyncService.current) {
        sessionSyncService.current.cleanup()
      }
    }
  }, [fetchProfile, refreshSession, loading, profile?.id, handleBridgeTokenAuth])

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
      console.error('Sign up error:', err)
      return { error: err as AuthError }
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
      } else if (!rememberMe) {
        sessionStorage.setItem('subtle_session_temporary', 'true')
      }
      
      return { error }
    } catch (err) {
      console.error('Sign in error:', err)
      return { error: err as AuthError }
    }
  }

  const signInWithMagicLink = async (email: string, options?: { returnUrl?: string; desktopAuth?: boolean }) => {
    try {
      setError(null)
      
      let redirectUrl = `${window.location.origin}/auth/callback`;
      
      if (options?.desktopAuth && options?.returnUrl) {
        // For desktop auth, preserve the original desktop-login URL with all parameters
        redirectUrl = `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(options.returnUrl)}&desktopAuth=true`;
      } else if (options?.returnUrl) {
        // Regular web auth with return URL
        redirectUrl = `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(options.returnUrl)}`;
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
      console.error('Magic link error:', err)
      return { error: err as AuthError }
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
      console.error('OAuth error:', err)
      return { error: err as AuthError }
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      
      // Cleanup session sync service
      if (sessionSyncService.current) {
        await sessionSyncService.current.cleanup()
      }
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        handleAuthError(error)
      } else {
        sessionStorage.removeItem('subtle_session_temporary')
        sessionStorage.removeItem('subtle_session_active')
        sessionStorage.removeItem('subtle_session_source')
        sessionStorage.removeItem('subtle_bridge_token_used')
        setIsFromMacAppBridge(false)
      }
      
      return { error }
    } catch (err) {
      console.error('Sign out error:', err)
      return { error: err as AuthError }
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
      console.error('Reset password error:', err)
      return { error: err as AuthError }
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
      console.error('Update password error:', err)
      return { error: err as AuthError }
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

  // Broadcast settings change to Mac app
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