export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

let currentLogLevel = LogLevel.INFO;

/**
 * Custom logger that writes to stderr to avoid interfering with stdio
 */
export const logger = {
  setLevel(level: LogLevel) {
    currentLogLevel = level;
  },
  
  debug(message: string, ...args: any[]) {
    if (currentLogLevel <= LogLevel.DEBUG) {
      const timestamp = new Date().toISOString();
      process.stderr.write(`[${timestamp}] DEBUG: ${message}${args.length ? ' ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') : ''}\n`);
    }
  },
  
  info(message: string, ...args: any[]) {
    if (currentLogLevel <= LogLevel.INFO) {
      const timestamp = new Date().toISOString();
      process.stderr.write(`[${timestamp}] INFO: ${message}${args.length ? ' ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') : ''}\n`);
    }
  },
  
  warn(message: string, ...args: any[]) {
    if (currentLogLevel <= LogLevel.WARN) {
      const timestamp = new Date().toISOString();
      process.stderr.write(`[${timestamp}] WARN: ${message}${args.length ? ' ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') : ''}\n`);
    }
  },
  
  error(message: string, ...args: any[]) {
    if (currentLogLevel <= LogLevel.ERROR) {
      const timestamp = new Date().toISOString();
      process.stderr.write(`[${timestamp}] ERROR: ${message}${args.length ? ' ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') : ''}\n`);
    }
  }
};
