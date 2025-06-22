import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Github, Mail, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function Signup() {
  const [searchParams] = useSearchParams()
  const selectedPlan = searchParams.get('plan') || 'free'
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp, signInWithProvider } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    const { error } = await signUp(formData.email, formData.password, formData.fullName)
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    
    setIsLoading(false)
  }

  const handleOAuthSignup = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    setError('')

    const { error } = await signInWithProvider(provider)
    
    if (error) {
      setError(error.message)
    }
    
    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="glass-panel border-0 w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Check your email</h2>
            <p className="text-muted-foreground mb-4">
              We've sent you a confirmation link at <strong>{formData.email}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Click the link in the email to activate your account and start using Subtle.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Subtle</h1>
          <p className="text-muted-foreground mt-2">
            Create your account
          </p>
          {selectedPlan !== 'free' && (
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
              Selected: {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
            </div>
          )}
        </div>

        <Card className="glass-panel border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Get started</CardTitle>
            <CardDescription className="text-center">
              Create your account to start using Subtle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleOAuthSignup('google')}
                disabled={isLoading}
                className="w-full glass-light border-border/50"
              >
                <Mail className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthSignup('github')}
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

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="glass-light border-border/50 bg-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="glass-light border-border/50 bg-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="glass-light border-border/50 bg-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="glass-light border-border/50 bg-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}