// Development logger that sends logs to both console and terminal
const isDev = import.meta.env.DEV;

export const devLog = {
  log: (...args: any[]) => {
    console.log(...args);
    if (isDev) {
      sendToTerminal('log', args);
    }
  },
  error: (...args: any[]) => {
    console.error(...args);
    if (isDev) {
      sendToTerminal('error', args);
    }
  },
  warn: (...args: any[]) => {
    console.warn(...args);
    if (isDev) {
      sendToTerminal('warn', args);
    }
  },
  info: (...args: any[]) => {
    console.info(...args);
    if (isDev) {
      sendToTerminal('info', args);
    }
  }
};

async function sendToTerminal(level: string, args: any[]) {
  // DISABLED: No backend endpoint available for dev logging
  // This was causing 404 errors and request spam
  // Console logging is sufficient for development
  return;
}

// Intercept all console methods in development
if (isDev) {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  };

  // Store all logs for easy copying
  (window as any).__ALL_LOGS__ = [];

  ['log', 'error', 'warn', 'info'].forEach(method => {
    (console as any)[method] = (...args: any[]) => {
      // Call original
      (originalConsole as any)[method](...args);
      
      // Store for copying
      (window as any).__ALL_LOGS__.push({
        level: method,
        timestamp: new Date().toISOString(),
        message: args
      });
      
      // Send to terminal
      sendToTerminal(method, args);
    };
  });

  // Add helper to copy all logs
  (window as any).copyAllLogs = () => {
    const logs = (window as any).__ALL_LOGS__.map((log: any) => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message.map((m: any) => 
        typeof m === 'object' ? JSON.stringify(m, null, 2) : m
      ).join(' ')}`
    ).join('\n');
    
    navigator.clipboard.writeText(logs);
    console.log(`✅ Copied ${(window as any).__ALL_LOGS__.length} log entries to clipboard`);
    return logs;
  };

  console.log('📋 Dev logger initialized. Use copyAllLogs() in console to copy all logs.');
}