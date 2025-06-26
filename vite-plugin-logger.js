// Vite plugin to capture frontend logs in the terminal
export default function viteLoggerPlugin() {
  return {
    name: 'vite-logger',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/__log' && req.method === 'POST') {
          let body = '';
          
          req.on('data', chunk => {
            body += chunk.toString();
          });
          
          req.on('end', () => {
            try {
              const logData = JSON.parse(body);
              const { level, component, message, data, timestamp } = logData;
              
              // Format the log for terminal output
              const color = {
                error: '\x1b[31m', // Red
                warn: '\x1b[33m',  // Yellow
                info: '\x1b[36m',  // Cyan
                debug: '\x1b[90m'  // Gray
              }[level] || '\x1b[0m';
              
              const reset = '\x1b[0m';
              const bold = '\x1b[1m';
              
              console.log(
                `${color}[${level.toUpperCase()}]${reset} ${bold}[${component}]${reset} ${message}${data ? ` ${JSON.stringify(data, null, 2)}` : ''}`
              );
              
              res.statusCode = 200;
              res.end('OK');
            } catch (error) {
              console.error('Failed to parse log data:', error);
              res.statusCode = 400;
              res.end('Bad Request');
            }
          });
        } else {
          next();
        }
      });
    }
  };
}