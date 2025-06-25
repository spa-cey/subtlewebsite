import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DiagnosticResult {
  name: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export default function DiagnosticDashboard() {
  const { user, profile, session, loading, subscription } = useAuth()
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const results: DiagnosticResult[] = []

    // Test 1: Auth State
    results.push({
      name: 'Auth State',
      status: user ? 'success' : 'error',
      message: user ? `User authenticated: ${user.email}` : 'No user authenticated',
      details: { user, session }
    })

    // Test 2: Profile Loading
    results.push({
      name: 'Profile Loading',
      status: profile ? 'success' : loading ? 'warning' : 'error',
      message: profile ? 'Profile loaded successfully' : loading ? 'Profile is loading...' : 'Profile not found',
      details: profile
    })

    // Test 3: Database Type Mismatch
    const typeCheck = {
      name: 'Type Definition Check',
      status: 'warning' as const,
      message: 'Type mismatch detected in supabase.ts',
      details: {
        issue: 'Database type still references "profiles" table instead of "users"',
        location: 'src/lib/supabase.ts line 17',
        impact: 'May cause TypeScript errors but should not affect runtime'
      }
    }
    results.push(typeCheck)

    // Test 4: Direct Database Query
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id || '')
        .single()

      results.push({
        name: 'Direct Users Table Query',
        status: userError ? 'error' : 'success',
        message: userError ? `Error: ${userError.message}` : 'Successfully queried users table',
        details: { data: userData, error: userError }
      })
    } catch (err) {
      results.push({
        name: 'Direct Users Table Query',
        status: 'error',
        message: `Exception: ${err}`,
        details: err
      })
    }

    // Test 5: Tier Definitions Query
    try {
      const { data: tierData, error: tierError } = await supabase
        .from('tier_definitions')
        .select('*')

      results.push({
        name: 'Tier Definitions Table',
        status: tierError ? 'error' : 'success',
        message: tierError ? `Error: ${tierError.message}` : `Found ${tierData?.length || 0} tier definitions`,
        details: { data: tierData, error: tierError }
      })
    } catch (err) {
      results.push({
        name: 'Tier Definitions Table',
        status: 'error',
        message: `Exception: ${err}`,
        details: err
      })
    }

    // Test 6: Usage Metrics Query
    try {
      const { data: usageData, error: usageError } = await supabase
        .from('usage_metrics')
        .select('*')
        .eq('user_id', user?.id || '')
        .limit(5)

      results.push({
        name: 'Usage Metrics Table',
        status: usageError ? 'error' : 'success',
        message: usageError ? `Error: ${usageError.message}` : `Found ${usageData?.length || 0} usage records`,
        details: { data: usageData, error: usageError }
      })
    } catch (err) {
      results.push({
        name: 'Usage Metrics Table',
        status: 'error',
        message: `Exception: ${err}`,
        details: err
      })
    }

    // Test 7: Subscription State
    results.push({
      name: 'Subscription State',
      status: subscription ? 'success' : 'error',
      message: subscription ? `Tier: ${subscription.tier.name}` : 'No subscription data',
      details: subscription
    })

    // Test 8: RLS Check
    try {
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      results.push({
        name: 'RLS Policy Check',
        status: countError ? 'error' : 'success',
        message: countError ? `RLS may be blocking: ${countError.message}` : `Can access ${count || 0} user records`,
        details: { count, error: countError }
      })
    } catch (err) {
      results.push({
        name: 'RLS Policy Check',
        status: 'error',
        message: `Exception: ${err}`,
        details: err
      })
    }

    setDiagnostics(results)
    setIsRunning(false)
  }

  useEffect(() => {
    if (!loading) {
      runDiagnostics()
    }
  }, [loading, user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Dashboard Diagnostics</h1>
        
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Auth Context State</CardTitle>
              <CardDescription>Current authentication state from useAuth hook</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Loading:</span>
                  <Badge variant={loading ? "secondary" : "outline"}>{loading ? 'Yes' : 'No'}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">User:</span>
                  <span className="text-sm text-muted-foreground">{user ? user.email : 'Not authenticated'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Profile:</span>
                  <span className="text-sm text-muted-foreground">{profile ? 'Loaded' : 'Not loaded'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Session:</span>
                  <span className="text-sm text-muted-foreground">{session ? 'Active' : 'No session'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Tests</CardTitle>
              <CardDescription>Click to run comprehensive diagnostics</CardDescription>
              <Button onClick={runDiagnostics} disabled={isRunning}>
                {isRunning ? 'Running...' : 'Run Diagnostics'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {diagnostics.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{result.name}</h3>
                      <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                    {result.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Key Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-medium text-yellow-900">Type Definition Mismatch</p>
                <p className="text-yellow-700">The supabase.ts file still references 'profiles' table in type definitions while the actual table is 'users'. This should be fixed but doesn't affect runtime.</p>
              </div>
              
              {!profile && !loading && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium text-red-900">Profile Not Loading</p>
                  <p className="text-red-700">The profile is not loading even though the user is authenticated. This is causing the infinite loading state.</p>
                </div>
              )}
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900">Next Steps</p>
                <ul className="list-disc list-inside text-blue-700 mt-1">
                  <li>Fix the type definition in supabase.ts (change 'profiles' to 'users')</li>
                  <li>Check if the users table has the correct columns expected by the frontend</li>
                  <li>Verify RLS policies allow authenticated users to read their own profile</li>
                  <li>Ensure user records are created during signup</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}