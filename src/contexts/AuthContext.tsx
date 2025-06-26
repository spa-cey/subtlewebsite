import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, Database } from '@/lib/supabase'
import { debugLogger } from '../utils/debug'
import { fetchProfileDirect, getStoredSession } from '@/lib/supabaseDirectFetch'

type Profile = Database['public']['Tables']['users']['Row']

export interface SubscriptionTier {
  name: string;
  quotaLimit: number;
  features: string[];
}

export interface UserSubscription {
  tier: SubscriptionTier;
  quotaUsed: number;
  quotaResetDate: string;
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  subscription: UserSubscription | null
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null }>
  signInWithProvider: (provider: 'google' | 'github' | 'apple') => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  refreshSubscription: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const COMPONENT_NAME = 'AuthContext'
const LOADING_TIMEOUT = 10000 // 10 seconds timeout

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
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initializingRef = useRef(false)
  const mountedRef = useRef(true)

  debugLogger.info(COMPONENT_NAME, 'AuthProvider initialized')

  // Helper to update loading state with timeout
  const setLoadingWithTimeout = useCallback((isLoading: boolean, reason: string) => {
    if (!mountedRef.current) return;
    
    debugLogger.info(COMPONENT_NAME, `Setting loading to ${isLoading}`, { reason })
    
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }

    if (isLoading) {
      const timeout = setTimeout(() => {
        if (!mountedRef.current) return;
        
        debugLogger.error(COMPONENT_NAME, 'Loading timeout exceeded', {
          user: !!user,
          profile: !!profile,
          session: !!session,
          reason
        })
        setLoading(false)
      }, LOADING_TIMEOUT)
      loadingTimeoutRef.current = timeout
    }

    setLoading(isLoading)
  }, [])

  // Fetch user subscription details
  const fetchSubscription = useCallback(async (userId: string) => {
    if (!mountedRef.current) return;
    
    debugLogger.info(COMPONENT_NAME, 'Fetching subscription', { userId })
    const startTime = performance.now()
    
    try {
      // Get user's tier from profile
      debugLogger.debug(COMPONENT_NAME, 'Fetching user tier from profile')
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', userId)
        .single();

      if (profileError) {
        debugLogger.error(COMPONENT_NAME, 'Error fetching user tier', profileError)
      }

      const tierName = profile?.subscription_tier || 'free';
      debugLogger.debug(COMPONENT_NAME, 'User tier determined', { tierName })

      // Get tier quota limits - changed to match the actual table name from migrations
      debugLogger.debug(COMPONENT_NAME, 'Fetching tier definitions')
      const { data: quotaData, error: quotaError } = await supabase
        .from('tier_definitions')
        .select('*')
        .eq('tier', tierName)
        .single();

      if (quotaError) {
        debugLogger.error(COMPONENT_NAME, 'Error fetching tier definitions', quotaError)
      }

      // Get current usage - changed to match actual table name
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);

      debugLogger.debug(COMPONENT_NAME, 'Fetching usage metrics')
      const { count: dailyUsage, error: usageError } = await supabase
        .from('usage_metrics')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', dayAgo.toISOString());

      if (usageError) {
        debugLogger.error(COMPONENT_NAME, 'Error fetching usage metrics', usageError)
      }

      if (quotaData && mountedRef.current) {
        const features = [];
        if (tierName === 'free') {
          features.push('Basic AI models', 'Standard support', '100 requests per month');
        } else if (tierName === 'pro') {
          features.push('All AI models', 'Priority support', '2,500 requests per month', 'Advanced features');
        } else if (tierName === 'team') {
          features.push('All AI models', 'Dedicated support', '10,000 requests per month', 'Team management', 'Custom integrations');
        } else if (tierName === 'admin') {
          features.push('Unlimited everything', 'All AI models', 'Admin access', 'System management', 'No quotas', 'All features enabled');
        }

        const resetDate = new Date();
        resetDate.setDate(resetDate.getDate() + 1);
        resetDate.setHours(0, 0, 0, 0);

        const newSubscription = {
          tier: {
            name: tierName.charAt(0).toUpperCase() + tierName.slice(1),
            quotaLimit: tierName === 'admin' ? -1 : quotaData.daily_request_limit, // -1 means unlimited for admin
            features,
          },
          quotaUsed: dailyUsage || 0,
          quotaResetDate: resetDate.toISOString(),
        };

        const duration = performance.now() - startTime
        debugLogger.info(COMPONENT_NAME, `Subscription fetched successfully in ${duration.toFixed(2)}ms`, newSubscription)
        setSubscription(newSubscription);
      }
    } catch (error) {
      const duration = performance.now() - startTime
      debugLogger.error(COMPONENT_NAME, `Error fetching subscription after ${duration.toFixed(2)}ms`, error)
      
      if (mountedRef.current) {
        // Set default free tier if fetch fails
        const resetDate = new Date();
        resetDate.setDate(resetDate.getDate() + 1);
        resetDate.setHours(0, 0, 0, 0);

        setSubscription({
          tier: {
            name: 'Free',
            quotaLimit: 100,
            features: ['Basic AI models', 'Standard support', '100 requests per month'],
          },
          quotaUsed: 0,
          quotaResetDate: resetDate.toISOString(),
        });
      }
    }
  }, []);

  // Initialize auth
  useEffect(() => {
    // Prevent multiple simultaneous initializations
    if (initializingRef.current) {
      debugLogger.info(COMPONENT_NAME, 'Initialization already in progress, skipping')
      return
    }

    initializingRef.current = true
    debugLogger.info(COMPONENT_NAME, 'Starting auth initialization')

    const initializeAuth = async () => {
      try {
        setLoadingWithTimeout(true, 'Getting initial session')
        const startTime = performance.now()
        
        // Get initial session
        debugLogger.debug(COMPONENT_NAME, 'Getting initial session')
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession()
        
        const duration = performance.now() - startTime
        if (sessionError) {
          debugLogger.error(COMPONENT_NAME, `Failed to get session after ${duration.toFixed(2)}ms`, sessionError)
        } else {
          debugLogger.info(COMPONENT_NAME, `Initial session retrieved in ${duration.toFixed(2)}ms`, {
            hasSession: !!initialSession,
            userId: initialSession?.user.id,
            email: initialSession?.user.email
          })
        }

        if (!mountedRef.current) return

        setSession(initialSession)
        setUser(initialSession?.user ?? null)
        
        if (initialSession?.user) {
          debugLogger.info(COMPONENT_NAME, 'User found, fetching profile and subscription')
          debugLogger.info(COMPONENT_NAME, 'About to call fetchProfile with ID:', initialSession.user.id)
          await fetchProfile(initialSession.user.id)
          debugLogger.info(COMPONENT_NAME, 'fetchProfile completed')
          await fetchSubscription(initialSession.user.id)
          debugLogger.info(COMPONENT_NAME, 'fetchSubscription completed')
        } else {
          debugLogger.info(COMPONENT_NAME, 'No user session found')
        }
      } catch (error) {
        debugLogger.error(COMPONENT_NAME, 'Auth initialization error', error)
      } finally {
        if (mountedRef.current) {
          setLoadingWithTimeout(false, 'Initialization complete')
          initializingRef.current = false
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return
        
        debugLogger.info(COMPONENT_NAME, 'Auth state change', { event, hasSession: !!session })
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
          await fetchSubscription(session.user.id)
        } else {
          debugLogger.info(COMPONENT_NAME, 'Clearing user data')
          setProfile(null)
          setSubscription(null)
        }
        setLoadingWithTimeout(false, 'Auth state change processed')
      }
    )

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    debugLogger.info(COMPONENT_NAME, 'Fetching user profile', { userId })
    const startTime = performance.now()
    
    try {
      // Add detailed logging
      debugLogger.info(COMPONENT_NAME, `Attempting to fetch profile for user ${userId}`)
      
      // Log the current auth state
      const { data: { session } } = await supabase.auth.getSession()
      debugLogger.info(COMPONENT_NAME, 'Current session state', {
        hasSession: !!session,
        sessionUserId: session?.user?.id,
        accessToken: session?.access_token ? 'present' : 'missing'
      })
      
      // First try the regular query
      debugLogger.info(COMPONENT_NAME, 'Attempting regular query')
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle to handle no rows gracefully

      debugLogger.info(COMPONENT_NAME, 'Regular query result', {
        hasData: !!data,
        hasError: !!error,
        error: error ? { message: error.message, code: error.code, details: error.details } : null
      })

      // If regular query fails, try direct fetch first
      if (!data) {
        debugLogger.info(COMPONENT_NAME, 'Regular query failed, trying direct fetch')
        
        try {
          // Store the access token for direct fetch
          const sessionData = await supabase.auth.getSession()
          if (sessionData.data.session?.access_token) {
            const token = sessionData.data.session.access_token
            // Store in sessionStorage for the direct fetch to use
            sessionStorage.setItem('supabase.auth.token', token)
            debugLogger.info(COMPONENT_NAME, 'Stored access token for direct fetch')
          }
          
          const directResult = await fetchProfileDirect(userId)
          debugLogger.info(COMPONENT_NAME, 'Direct fetch result', {
            hasData: !!directResult.data,
            hasError: !!directResult.error,
            error: directResult.error
          })
          
          if (directResult.data && !directResult.error) {
            data = directResult.data
            error = null
            debugLogger.info(COMPONENT_NAME, 'Direct fetch succeeded')
          }
        } catch (directError) {
          debugLogger.error(COMPONENT_NAME, 'Direct fetch failed', directError)
        }
      }
      
      // If direct fetch fails and it's the admin user, try the RPC function as a last resort
      if (!data && userId === '9055d88e-5fce-4dbf-893a-c0348a4c5f14') {
        debugLogger.info(COMPONENT_NAME, 'Direct fetch failed, trying RPC function')
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_user_profile_direct', { user_id: userId })
          .single()
        
        debugLogger.info(COMPONENT_NAME, 'RPC function result', {
          hasData: !!rpcData,
          hasError: !!rpcError,
          error: rpcError
        })
        
        if (rpcData && !rpcError) {
          data = rpcData
          error = null
          debugLogger.info(COMPONENT_NAME, 'RPC function succeeded')
        } else {
          debugLogger.error(COMPONENT_NAME, 'RPC function also failed', rpcError)
        }
      }
      
      // If still no data, try the get_my_profile function
      if (!data) {
        debugLogger.info(COMPONENT_NAME, 'Trying get_my_profile function')
        const { data: myProfileData, error: myProfileError } = await supabase
          .rpc('get_my_profile')
          .single()
        
        debugLogger.info(COMPONENT_NAME, 'get_my_profile result', {
          hasData: !!myProfileData,
          hasError: !!myProfileError,
          error: myProfileError
        })
        
        if (myProfileData && !myProfileError) {
          data = myProfileData
          error = null
          debugLogger.info(COMPONENT_NAME, 'get_my_profile function succeeded')
        }
      }

      const duration = performance.now() - startTime
      
      debugLogger.info(COMPONENT_NAME, `Profile query completed in ${duration.toFixed(2)}ms`, {
        hasData: !!data,
        hasError: !!error,
        errorMessage: error?.message,
        errorCode: error?.code,
        data: data ? { id: data.id, email: data.email, tier: data.subscription_tier } : null
      })

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        debugLogger.error(COMPONENT_NAME, `Error fetching profile after ${duration.toFixed(2)}ms`, error)
        // Don't throw, continue with profile creation
      }
      
      if (!data) {
        debugLogger.warn(COMPONENT_NAME, `Profile not found after ${duration.toFixed(2)}ms, creating new profile`)
        
        // Profile doesn't exist, create it
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          await createProfile(userData.user)
        }
      } else {
        debugLogger.info(COMPONENT_NAME, `Profile fetched successfully in ${duration.toFixed(2)}ms`, {
          profileId: data.id,
          email: data.email,
          tier: data.subscription_tier
        })
        setProfile(data)
      }
    } catch (error) {
      debugLogger.error(COMPONENT_NAME, 'Error in fetchProfile', error)
    }
  }

  const createProfile = async (user: User) => {
    debugLogger.info(COMPONENT_NAME, 'Creating user profile', { userId: user.id, email: user.email })
    const startTime = performance.now()
    
    try {
      const newProfile = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        subscription_tier: 'free'
      }

      debugLogger.debug(COMPONENT_NAME, 'Inserting new profile', newProfile)
      const { data, error } = await supabase
        .from('users')
        .insert(newProfile)
        .select()
        .single()

      const duration = performance.now() - startTime

      if (error) {
        debugLogger.error(COMPONENT_NAME, `Error creating profile after ${duration.toFixed(2)}ms`, { error, newProfile })
      } else if (data) {
        debugLogger.info(COMPONENT_NAME, `Profile created successfully in ${duration.toFixed(2)}ms`, data)
        setProfile(data)
      }
    } catch (error) {
      debugLogger.error(COMPONENT_NAME, 'Error creating profile', error)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    debugLogger.info(COMPONENT_NAME, 'Sign up attempt', { email, hasFullName: !!fullName })
    const startTime = performance.now()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    const duration = performance.now() - startTime

    if (error) {
      debugLogger.error(COMPONENT_NAME, `Sign up failed after ${duration.toFixed(2)}ms`, error)
    } else {
      debugLogger.info(COMPONENT_NAME, `Sign up successful in ${duration.toFixed(2)}ms`, { userId: data.user?.id })
      
      // Create profile immediately after signup
      if (data.user) {
        try {
          await createProfile(data.user)
        } catch (profileError) {
          debugLogger.error(COMPONENT_NAME, 'Failed to create profile after signup', profileError)
        }
      }
    }
    
    return { error }
  }

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    debugLogger.info(COMPONENT_NAME, 'Sign in attempt', { email, rememberMe })
    const startTime = performance.now()
    
    // Note: Supabase handles session persistence automatically based on the persistSession option
    // which is already set to true in our client configuration
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    const duration = performance.now() - startTime
    
    if (error) {
      debugLogger.error(COMPONENT_NAME, `Sign in failed after ${duration.toFixed(2)}ms`, error)
    } else {
      debugLogger.info(COMPONENT_NAME, `Sign in successful in ${duration.toFixed(2)}ms`)
      
      // If remember me is checked, we'll use localStorage to store a preference
      // Supabase will handle the actual session persistence
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }
    }
    
    return { error }
  }

  const signInWithMagicLink = async (email: string) => {
    debugLogger.info(COMPONENT_NAME, 'Magic link sign in attempt', { email })
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    return { error }
  }

  const signInWithProvider = async (provider: 'google' | 'github' | 'apple') => {
    debugLogger.info(COMPONENT_NAME, 'OAuth sign in attempt', { provider })
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { error }
  }

  const signOut = async () => {
    debugLogger.info(COMPONENT_NAME, 'Sign out attempt')
    const startTime = performance.now()
    
    const { error } = await supabase.auth.signOut()

    const duration = performance.now() - startTime
    
    if (error) {
      debugLogger.error(COMPONENT_NAME, `Sign out failed after ${duration.toFixed(2)}ms`, error)
    } else {
      debugLogger.info(COMPONENT_NAME, `Sign out successful in ${duration.toFixed(2)}ms`)
    }
    
    return { error }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    debugLogger.info(COMPONENT_NAME, 'Updating profile', { userId: user.id, updates })

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        debugLogger.error(COMPONENT_NAME, 'Profile update failed', error)
        return { error }
      }

      debugLogger.info(COMPONENT_NAME, 'Profile updated successfully')
      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...updates } : null)
      return { error: null }
    } catch (error) {
      debugLogger.error(COMPONENT_NAME, 'Profile update error', error)
      return { error: error as Error }
    }
  }

  const refreshSubscription = async () => {
    debugLogger.info(COMPONENT_NAME, 'Refreshing subscription')
    
    if (user) {
      await fetchSubscription(user.id);
    } else {
      debugLogger.warn(COMPONENT_NAME, 'Cannot refresh subscription - no user')
    }
  };

  // Log current state periodically in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        debugLogger.debug(COMPONENT_NAME, 'Current auth state', {
          user: user ? { id: user.id, email: user.email } : null,
          profile: profile ? { id: profile.id, email: profile.email } : null,
          session: !!session,
          loading,
          subscription: subscription ? { tier: subscription.tier.name, quotaUsed: subscription.quotaUsed } : null
        })
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [user, profile, session, loading, subscription])

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    subscription,
    signUp,
    signIn,
    signInWithMagicLink,
    signInWithProvider,
    signOut,
    updateProfile,
    refreshSubscription
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
