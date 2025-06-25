export interface DebugLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  component: string;
  message: string;
  data?: any;
}

class DebugLogger {
  private logs: DebugLog[] = [];
  private enabled: boolean = true;

  constructor() {
    // Enable debug mode in development
    this.enabled = process.env.NODE_ENV === 'development';
  }

  private formatMessage(level: string, component: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}`;
  }

  private log(level: DebugLog['level'], component: string, message: string, data?: any) {
    if (!this.enabled) return;

    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data
    };

    this.logs.push(log);

    const formattedMessage = this.formatMessage(level, component, message);
    
    switch (level) {
      case 'info':
        console.log(`%c${formattedMessage}`, 'color: #3b82f6', data);
        break;
      case 'warn':
        console.warn(`%c${formattedMessage}`, 'color: #f59e0b', data);
        break;
      case 'error':
        console.error(`%c${formattedMessage}`, 'color: #ef4444', data);
        break;
      case 'debug':
        console.log(`%c${formattedMessage}`, 'color: #8b5cf6', data);
        break;
    }
  }

  info(component: string, message: string, data?: any) {
    this.log('info', component, message, data);
  }

  warn(component: string, message: string, data?: any) {
    this.log('warn', component, message, data);
  }

  error(component: string, message: string, data?: any) {
    this.log('error', component, message, data);
  }

  debug(component: string, message: string, data?: any) {
    this.log('debug', component, message, data);
  }

  getLogs(): DebugLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const debugLogger = new DebugLogger();

// Helper function to measure async operation time
export async function measureAsync<T>(
  operation: () => Promise<T>,
  component: string,
  operationName: string
): Promise<T> {
  const startTime = performance.now();
  debugLogger.info(component, `Starting ${operationName}`);
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    debugLogger.info(component, `Completed ${operationName} in ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    debugLogger.error(component, `Failed ${operationName} after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}

// Helper to log state changes
export function logStateChange(
  component: string,
  stateName: string,
  oldValue: any,
  newValue: any
) {
  debugLogger.debug(component, `State change: ${stateName}`, {
    old: oldValue,
    new: newValue,
    changed: oldValue !== newValue
  });
}