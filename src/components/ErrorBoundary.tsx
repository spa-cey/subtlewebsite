import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from 'lucide-react';
import { debugLogger } from '../utils/debug';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    debugLogger.error('ErrorBoundary', 'Caught error', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      }
    });

    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Application Error
              </CardTitle>
              <CardDescription>
                An unexpected error occurred. The error details have been logged.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Error Message:</h3>
                  <p className="text-sm text-muted-foreground font-mono bg-muted p-3 rounded">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <details className="space-y-2">
                  <summary className="cursor-pointer font-semibold">Stack Trace (Development Only)</summary>
                  <pre className="text-xs overflow-auto bg-muted p-3 rounded max-h-64">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              {process.env.NODE_ENV === 'development' && this.state.errorInfo?.componentStack && (
                <details className="space-y-2">
                  <summary className="cursor-pointer font-semibold">Component Stack (Development Only)</summary>
                  <pre className="text-xs overflow-auto bg-muted p-3 rounded max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button variant="outline" onClick={this.handleReset}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}