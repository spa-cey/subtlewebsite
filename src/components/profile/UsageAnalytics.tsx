import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Activity, DollarSign, Zap, Clock, TrendingUp, BarChart3 } from 'lucide-react'
import { useUserUsageAnalytics } from '@/hooks/useUsers'
import { useAuth } from '@/contexts/AuthContext'

type TimeRange = 'daily' | 'weekly' | 'monthly'

const UsageAnalytics = () => {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly')
  
  const { 
    data: activityData, 
    isLoading, 
    error 
  } = useUserUsageAnalytics(user?.id || '', timeRange)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <Activity className="mx-auto h-12 w-12 mb-4" />
            <p>Failed to load usage analytics</p>
            <p className="text-sm mt-2">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!activityData || Object.keys(activityData).length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <BarChart3 className="mx-auto h-12 w-12 mb-4" />
            <p>No usage data available</p>
            <p className="text-sm mt-2">Start using Subtle to see your analytics here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const {
    totalRequests = 0,
    totalTokens = 0,
    totalCost = 0,
    lastActive,
    dailyUsage = [],
    recentActivity = [],
    usageByFeature = {}
  } = activityData

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUsageTrend = () => {
    if (dailyUsage.length < 2) return 0
    const recent = dailyUsage.slice(-7).reduce((sum: number, day: any) => sum + (day.requests || 0), 0)
    const previous = dailyUsage.slice(-14, -7).reduce((sum: number, day: any) => sum + (day.requests || 0), 0)
    if (previous === 0) return 100
    return (((recent as number) - (previous as number)) / (previous as number)) * 100
  }

  const usageTrend = getUsageTrend()

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalRequests)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              {usageTrend > 0 ? '+' : ''}{usageTrend.toFixed(1)}% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Consumed</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalTokens)}</div>
            <p className="text-xs text-muted-foreground">
              Average per request: {totalRequests > 0 ? Math.round(totalTokens / totalRequests) : 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              Average per request: {formatCurrency(totalRequests > 0 ? totalCost / totalRequests : 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastActive ? formatDate(lastActive) : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastActive ? 'Recent activity detected' : 'No recent activity'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector and Charts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usage Trends</CardTitle>
              <CardDescription>
                Track your usage patterns over time
              </CardDescription>
            </div>
            <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {dailyUsage.length > 0 ? (
            <div className="space-y-4">
              <div className="h-64 w-full flex items-end justify-between gap-2">
                {dailyUsage.slice(-14).map((day, index) => {
                  const maxRequests = Math.max(...dailyUsage.map(d => (d as any).requests || 0))
                  const height = maxRequests > 0 ? (((day as any).requests || 0) / maxRequests) * 200 : 0
                  
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1 min-w-0"
                    >
                      <div
                        className="w-full bg-primary rounded-t-sm transition-all hover:bg-primary/80"
                        style={{ height: `${Math.max(height, 2)}px` }}
                        title={`${(day as any).date}: ${(day as any).requests || 0} requests`}
                      />
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {new Date((day as any).date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 mb-2" />
                <p>No usage data for the selected period</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Usage and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Usage by Feature</CardTitle>
            <CardDescription>
              Breakdown of requests by feature type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(usageByFeature).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(usageByFeature)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .map(([feature, count]) => {
                    const percentage = totalRequests > 0 ? ((count as number) / totalRequests) * 100 : 0
                    return (
                      <div key={feature} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {feature.replace('_', ' ')}
                          </span>
                          <Badge variant="secondary">
                            {count as number} ({percentage.toFixed(1)}%)
                          </Badge>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Activity className="mx-auto h-8 w-8 mb-2" />
                <p>No feature usage data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest interactions with Subtle
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {activity.action || 'API Request'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(activity.timestamp)}
                        {activity.tokens && (
                          <>
                            <span>•</span>
                            <Zap className="h-3 w-3" />
                            {formatNumber(activity.tokens)} tokens
                          </>
                        )}
                        {activity.cost && (
                          <>
                            <span>•</span>
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(activity.cost)}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Clock className="mx-auto h-8 w-8 mb-2" />
                <p>No recent activity</p>
                <p className="text-xs mt-1">Activity will appear here as you use Subtle</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UsageAnalytics