// Server-side logging utility for debugging
// This will send logs to the Next.js server console

interface LogData {
  level: 'info' | 'warn' | 'error' | 'debug';
  component: string;
  message: string;
  data?: any;
  timestamp: string;
}

class ServerLogger {
  private isDev = process.env.NODE_ENV === 'development';

  private async sendToServer(logData: LogData) {
    if (!this.isDev) return;

    try {
      // In development, send logs to a special endpoint
      await fetch('/__log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData)
      }).catch(() => {
        // Silently fail if server logging endpoint doesn't exist
      });
    } catch (error) {
      // Don't log errors about logging
    }
  }

  private formatMessage(level: string, component: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${component}] ${message}${dataStr}`;
  }

  log(level: 'info' | 'warn' | 'error' | 'debug', component: string, message: string, data?: any) {
    const logData: LogData = {
      level,
      component,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    // Always log to browser console
    const consoleMessage = this.formatMessage(level, component, message, data);
    
    switch (level) {
      case 'error':
        console.error(consoleMessage);
        break;
      case 'warn':
        console.warn(consoleMessage);
        break;
      case 'debug':
        console.debug(consoleMessage);
        break;
      default:
        console.log(consoleMessage);
    }

    // In development, also try to send to server
    this.sendToServer(logData);
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
}

export const serverLogger = new ServerLogger();