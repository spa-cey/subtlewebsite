import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

interface QuotaStatusProps {
  used: number;
  limit: number;
  resetDate: string;
  planName?: string;
  onUpgrade?: () => void;
}

export function QuotaStatus({ used, limit, resetDate, planName = 'Free', onUpgrade }: QuotaStatusProps) {
  const percentage = Math.round((used / limit) * 100);
  const isNearLimit = percentage >= 80;
  const isExceeded = percentage >= 100;
  
  const formattedResetDate = format(new Date(resetDate), 'MMM d, yyyy');
  const remaining = Math.max(0, limit - used);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Usage Quota</CardTitle>
            <CardDescription>
              {planName} Plan - Resets on {formattedResetDate}
            </CardDescription>
          </div>
          {onUpgrade && (isNearLimit || isExceeded) && (
            <Button 
              onClick={onUpgrade} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Upgrade
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Usage</span>
            <span className="font-medium">
              {used.toLocaleString()} / {limit.toLocaleString()} requests
            </span>
          </div>
          <Progress 
            value={percentage} 
            className={`h-2 ${isExceeded ? 'bg-destructive/20' : isNearLimit ? 'bg-orange-100' : ''}`}
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {remaining.toLocaleString()} requests remaining
            </span>
            <span className={`font-medium ${isExceeded ? 'text-destructive' : isNearLimit ? 'text-orange-600' : 'text-green-600'}`}>
              {percentage}%
            </span>
          </div>
        </div>

        {isExceeded && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've reached your monthly quota limit. Upgrade your plan to continue using AI features.
            </AlertDescription>
          </Alert>
        )}
        
        {!isExceeded && isNearLimit && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You're approaching your monthly quota limit. Consider upgrading to avoid interruption.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}