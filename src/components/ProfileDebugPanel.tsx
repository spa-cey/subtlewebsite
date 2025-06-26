import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { runEnhancedProfileDiagnostic, DiagnosticResult } from '../utils/enhancedProfileDiagnostic';

export function ProfileDebugPanel() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const results = await runEnhancedProfileDiagnostic();
      setDiagnostics(results);
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'border-green-500';
      case 'fail':
        return 'border-red-500';
      case 'warning':
        return 'border-yellow-500';
      default:
        return '';
    }
  };

  const toggleDetails = (test: string) => {
    setShowDetails(prev => ({ ...prev, [test]: !prev[test] }));
  };

  const summary = {
    total: diagnostics.length,
    passed: diagnostics.filter(d => d.status === 'pass').length,
    failed: diagnostics.filter(d => d.status === 'fail').length,
    warnings: diagnostics.filter(d => d.status === 'warning').length
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Profile Debug Panel</CardTitle>
        <CardDescription>
          Diagnose and fix profile access issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            variant="outline"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              'Run Diagnostics'
            )}
          </Button>
          
          {diagnostics.length > 0 && (
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {summary.passed} Passed
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                {summary.failed} Failed
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                {summary.warnings} Warnings
              </span>
            </div>
          )}
        </div>

        {diagnostics.length > 0 && (
          <div className="space-y-3">
            {diagnostics.map((result, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-3 ${getStatusColor(result.status)}`}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleDetails(result.test)}
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    {showDetails[result.test] ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
                
                {showDetails[result.test] && (
                  <div className="mt-3 space-y-2">
                    <div className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
                      <pre>{JSON.stringify(result.details, null, 2)}</pre>
                    </div>
                    
                    {result.recommendation && (
                      <Alert variant={result.status === 'fail' ? 'destructive' : 'default'}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Recommendation</AlertTitle>
                        <AlertDescription>{result.recommendation}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {diagnostics.some(d => d.status === 'fail') && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
              <p>To fix the profile issues:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Go to your Supabase Dashboard → SQL Editor</li>
                <li>Open and run the file: <code className="text-xs">Docs/fix-admin-profile-link.sql</code></li>
                <li>Refresh this page</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}