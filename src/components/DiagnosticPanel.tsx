import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2, XCircle } from 'lucide-react';

interface DiagnosticLog {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  data?: any;
}

export function DiagnosticPanel() {
  const { user, profile, loading } = useAuth();
  const [logs, setLogs] = useState<DiagnosticLog[]>([]);

  useEffect(() => {
    const addLog = (message: string, level: 'info' | 'warn' | 'error' = 'info', data?: any) => {
      const log: DiagnosticLog = {
        timestamp: new Date().toISOString(),
        message,
        level,
        data
      };
      
      setLogs(prev => [...prev, log]);
      
      // Also log to console
      const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      consoleMethod(`[Diagnostic] ${message}`, data || '');
    };

    // Initial state
    addLog('Diagnostic panel mounted', 'info', {
      loading,
      hasUser: !!user,
      hasProfile: !!profile
    });

    // Set up console interceptor
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      if (message.includes('[AuthContext]') || message.includes('[Dashboard]')) {
        addLog(message, 'info');
      }
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      if (message.includes('[AuthContext]') || message.includes('[Dashboard]')) {
        addLog(message, 'error');
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      if (message.includes('[AuthContext]') || message.includes('[Dashboard]')) {
        addLog(message, 'warn');
      }
      originalWarn.apply(console, args);
    };

    return () => {
      // Restore original console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  useEffect(() => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      message: `State update: loading=${loading}, user=${!!user}, profile=${!!profile}`,
      level: 'info'
    }]);
  }, [loading, user, profile]);

  const getLevelIcon = (level: DiagnosticLog['level']) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warn':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-hidden shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Diagnostic Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-64 overflow-y-auto text-xs font-mono">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`p-2 rounded ${
                log.level === 'error' ? 'bg-red-50' : 
                log.level === 'warn' ? 'bg-yellow-50' : 
                'bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-2">
                {getLevelIcon(log.level)}
                <div className="flex-1">
                  <div className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="break-all">{log.message}</div>
                  {log.data && (
                    <pre className="text-xs mt-1 text-gray-600">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}