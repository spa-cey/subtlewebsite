import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Github, Mail, Loader2, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function Login() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [activeTab, setActiveTab] = useState('password')
  const { signIn, signInWithProvider, signInWithMagicLink } = useAuth()
  const navigate = useNavigate()
  
  const returnUrl = searchParams.get('returnUrl')
  const isDesktopAuth = searchParams.get('desktopAuth') === 'true'

  useEffect(() => {
    // Check for error query param from auth callback
    const error = searchParams.get('error')
    if (error === 'auth_callback_failed') {
      setError('Authentication failed. Please try again.')
    }
    
    // Check if remember me was previously selected
    setRememberMe(savedRememberMe)
  }, [searchParams])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!password) {
      setError('Please enter your password')
      return
    }

    setIsLoading(true)

    const { error } = await signIn(email, password)
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else {
        setError(error.message)
      }
    } else {
      // If this is a desktop auth flow, redirect back to the desktop login page
      if (returnUrl && isDesktopAuth) {
        window.location.href = decodeURIComponent(returnUrl)
      } else {
        navigate('/dashboard')
      }
    }
    
    setIsLoading(false)
  }

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    const { error } = await signInWithMagicLink(email, {
      returnUrl: returnUrl || undefined,
      desktopAuth: isDesktopAuth
    })
    
    if (error) {
      setError(error.message)
    } else {
      setMagicLinkSent(true)
    }
    
    setIsLoading(false)
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    setError('')

    const { error } = await signInWithProvider(provider)
    
    if (error) {
      setError(error.message)
    }
    
    setIsLoading(false)
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="glass-panel border-0 w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Check your email</h2>
            <p className="text-muted-foreground mb-4">
              We've sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Click the link in the email to sign in. The link will expire in 1 hour.
            </p>
            <Button
              onClick={() => {
                setMagicLinkSent(false)
                setActiveTab('password')
              }}
              variant="outline"
              className="w-full"
            >
              Back to login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="glass-panel border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              {isDesktopAuth
                ? "Sign in to continue to Subtle Desktop"
                : "Sign in to your account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading}
                className="w-full glass-light border-border/50"
              >
                <Mail className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthLogin('github')}
                disabled={isLoading}
                className="w-full glass-light border-border/50"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 glass-light">
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
              </TabsList>
              
              <TabsContent value="password" className="space-y-4 mt-4">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="glass-light border-border/50 bg-transparent"
                      autoComplete="email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="glass-light border-border/50 bg-transparent pr-10"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !email || !password}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="magic-link" className="space-y-4 mt-4">
                <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <Input
                      id="magic-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="glass-light border-border/50 bg-transparent"
                      autoComplete="email"
                    />
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    We'll send you a magic link to sign in without a password.
                  </p>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending magic link...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Send Magic Link
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link
                to="/signup"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}