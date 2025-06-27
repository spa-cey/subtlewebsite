import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('[AuthCallback] Starting auth callback handling')
      console.log('[AuthCallback] Current URL:', window.location.href)
      console.log('[AuthCallback] Hash fragment:', window.location.hash)
      
      try {
        // First, check if we have tokens in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        console.log('[AuthCallback] URL tokens found:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        })
        
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[AuthCallback] Session error:', error)
          navigate('/login?error=auth_callback_failed')
          return
        }

        console.log('[AuthCallback] Session status:', {
          hasSession: !!data.session,
          userId: data.session?.user?.id,
          email: data.session?.user?.email
        })

        if (data.session) {
          console.log('[AuthCallback] Valid session found, redirecting to dashboard')
          navigate('/dashboard')
        } else {
          console.log('[AuthCallback] No session found, redirecting to login')
          navigate('/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/login?error=auth_callback_failed')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold mb-2">Completing sign in...</h2>
        <p className="text-muted-foreground">Please wait while we log you in.</p>
      </div>
    </div>
  )
}