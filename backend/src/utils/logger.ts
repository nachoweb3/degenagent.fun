import fs from 'fs';
import path from 'path';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  error?: any;
}

class Logger {
  private logDir: string;
  private logFile: string;
  private enableConsole: boolean;
  private enableFile: boolean;
  private minLevel: LogLevel;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logFile = path.join(this.logDir, `app-${this.getDateString()}.log`);
    this.enableConsole = process.env.LOG_CONSOLE !== 'false';
    this.enableFile = process.env.LOG_FILE !== 'false';
    this.minLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;

    // Create logs directory if it doesn't exist
    if (this.enableFile && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.CRITICAL];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatLogEntry(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level}]`,
      `[${entry.category}]`,
      entry.message,
    ];

    if (entry.data) {
      parts.push(`\nData: ${JSON.stringify(entry.data, null, 2)}`);
    }

    if (entry.error) {
      if (entry.error instanceof Error) {
        parts.push(`\nError: ${entry.error.message}`);
        if (entry.error.stack) {
          parts.push(`\nStack: ${entry.error.stack}`);
        }
      } else {
        parts.push(`\nError: ${JSON.stringify(entry.error, null, 2)}`);
      }
    }

    return parts.join(' ');
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.enableFile) return;

    try {
      const logLine = this.formatLogEntry(entry) + '\n';
      fs.appendFileSync(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private writeToConsole(entry: LogEntry): void {
    if (!this.enableConsole) return;

    const formatted = this.formatLogEntry(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.log(`\x1b[36m${formatted}\x1b[0m`); // Cyan
        break;
      case LogLevel.INFO:
        console.log(`\x1b[32m${formatted}\x1b[0m`); // Green
        break;
      case LogLevel.WARN:
        console.warn(`\x1b[33m${formatted}\x1b[0m`); // Yellow
        break;
      case LogLevel.ERROR:
        console.error(`\x1b[31m${formatted}\x1b[0m`); // Red
        break;
      case LogLevel.CRITICAL:
        console.error(`\x1b[41m\x1b[37m${formatted}\x1b[0m`); // White on Red
        break;
      default:
        console.log(formatted);
    }
  }

  private log(level: LogLevel, category: string, message: string, data?: any, error?: any): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      category,
      message,
      data,
      error,
    };

    this.writeToConsole(entry);
    this.writeToFile(entry);
  }

  // Public logging methods
  debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, error?: any, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  critical(category: string, message: string, error?: any, data?: any): void {
    this.log(LogLevel.CRITICAL, category, message, data, error);
  }

  // Category-specific loggers
  agent(message: string, data?: any): void {
    this.info('AGENT', message, data);
  }

  trading(message: string, data?: any): void {
    this.info('TRADING', message, data);
  }

  api(message: string, data?: any): void {
    this.info('API', message, data);
  }

  database(message: string, data?: any): void {
    this.info('DATABASE', message, data);
  }

  security(message: string, data?: any): void {
    this.warn('SECURITY', message, data);
  }

  performance(message: string, data?: any): void {
    this.debug('PERFORMANCE', message, data);
  }

  // Request logging helper
  logRequest(method: string, url: string, statusCode: number, duration: number, userId?: string): void {
    this.info('HTTP', `${method} ${url} ${statusCode} ${duration}ms`, {
      method,
      url,
      statusCode,
      duration,
      userId,
    });
  }

  // Error logging helper with context
  logError(error: Error, context?: any): void {
    this.error('ERROR', error.message, error, context);
  }

  // Transaction logging for important business events
  logTransaction(type: string, details: any): void {
    this.info('TRANSACTION', type, details);
  }

  // Cleanup old log files (keep last 30 days)
  cleanupOldLogs(): void {
    if (!this.enableFile) return;

    try {
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

      files.forEach((file) => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Middleware for HTTP request logging
export function requestLogger(req: any, res: any, next: any) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.id || req.headers['x-user-id'] || 'anonymous';

    logger.logRequest(
      req.method,
      req.originalUrl || req.url,
      res.statusCode,
      duration,
      userId
    );
  });

  next();
}

// Global error handler
export function errorLogger(err: Error, req: any, res: any, next: any) {
  logger.logError(err, {
    method: req.method,
    url: req.originalUrl || req.url,
    body: req.body,
    query: req.query,
    headers: req.headers,
  });

  next(err);
}

export default logger;
