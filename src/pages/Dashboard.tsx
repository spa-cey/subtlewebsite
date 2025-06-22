import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, Settings, CreditCard, Download, User, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'enterprise':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-panel border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Subtle Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={getTierColor(profile.subscription_tier)}>
                {profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1)}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {profile.full_name || user.email}!
          </h2>
          <p className="text-muted-foreground">
            Manage your Subtle AI assistant and account settings.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="glass-panel border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile
              </CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Subscription</p>
                <Badge className={getTierColor(profile.subscription_tier)}>
                  {profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1)}
                </Badge>
              </div>
              <Button variant="outline" className="w-full glass-light">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Download Card */}
          <Card className="glass-panel border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Subtle App
              </CardTitle>
              <CardDescription>
                Download the macOS application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Get the latest version of Subtle for macOS and start using your AI assistant.
              </p>
              <Link to="/download">
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download for macOS
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="glass-panel border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Subscription
              </CardTitle>
              <CardDescription>
                Manage your billing and plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Current Plan</p>
                <Badge className={getTierColor(profile.subscription_tier)}>
                  {profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1)}
                </Badge>
              </div>
              {profile.subscription_tier === 'free' && (
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro for unlimited requests and advanced features.
                </p>
              )}
              <Link to="/pricing">
                <Button variant="outline" className="w-full glass-light">
                  {profile.subscription_tier === 'free' ? 'Upgrade Plan' : 'Manage Billing'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Section */}
        {profile.subscription_tier === 'free' && (
          <Card className="glass-panel border-0 mt-8">
            <CardHeader>
              <CardTitle>Getting Started with Subtle</CardTitle>
              <CardDescription>
                Follow these steps to make the most of your AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg glass-light">
                  <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium mb-1">1. Download App</h3>
                  <p className="text-sm text-muted-foreground">
                    Install Subtle on your Mac
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg glass-light">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium mb-1">2. Setup Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure your preferences
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg glass-light">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium mb-1">3. Start Using</h3>
                  <p className="text-sm text-muted-foreground">
                    Begin your AI-powered workflow
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}