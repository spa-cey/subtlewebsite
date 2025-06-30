import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { refreshSession } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('[AuthCallback] Starting auth callback handling')
      console.log('[AuthCallback] Current URL:', window.location.href)
      
      try {
        // Check if we have a token in URL params (from magic link or OAuth)
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const error = urlParams.get('error')
        
        if (error) {
          console.error('[AuthCallback] Auth error from URL:', error)
          navigate('/login?error=auth_callback_failed')
          return
        }

        if (token) {
          // Store the token and check auth status
          localStorage.setItem('token', token)
          console.log('[AuthCallback] Token received, checking auth status')
          
          // Let the auth context handle the rest
          await refreshSession()
          navigate('/dashboard')
        } else {
          // No token found, redirect to login
          console.log('[AuthCallback] No token found, redirecting to login')
          navigate('/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/login?error=auth_callback_failed')
      }
    }

    handleAuthCallback()
  }, [navigate, refreshSession])

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