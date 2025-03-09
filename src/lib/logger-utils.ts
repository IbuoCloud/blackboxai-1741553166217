type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  error?: Error
}

interface LoggerOptions {
  level: LogLevel
  enableConsole?: boolean
  enableTimestamp?: boolean
  format?: (entry: LogEntry) => string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

class Logger {
  private options: LoggerOptions

  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = {
      level: 'info',
      enableConsole: true,
      enableTimestamp: true,
      format: this.defaultFormat,
      ...options,
    }
  }

  private defaultFormat(entry: LogEntry): string {
    const timestamp = entry.timestamp ? `[${entry.timestamp}]` : ''
    const level = `[${entry.level.toUpperCase()}]`
    const context = entry.context ? `\nContext: ${JSON.stringify(entry.context, null, 2)}` : ''
    const error = entry.error ? `\nError: ${entry.error.stack}` : ''

    return `${timestamp} ${level} ${entry.message}${context}${error}`
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.options.level]
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: this.options.enableTimestamp ? new Date().toISOString() : '',
      context,
      error,
    }
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return

    const formattedMessage = this.options.format!(entry)

    if (this.options.enableConsole) {
      switch (entry.level) {
        case 'debug':
          console.debug(formattedMessage)
          break
        case 'info':
          console.info(formattedMessage)
          break
        case 'warn':
          console.warn(formattedMessage)
          break
        case 'error':
          console.error(formattedMessage)
          break
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(this.createLogEntry('debug', message, context))
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(this.createLogEntry('info', message, context))
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(this.createLogEntry('warn', message, context))
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(this.createLogEntry('error', message, context, error))
  }

  setLevel(level: LogLevel): void {
    this.options.level = level
  }

  setFormat(format: (entry: LogEntry) => string): void {
    this.options.format = format
  }

  enableConsole(): void {
    this.options.enableConsole = true
  }

  disableConsole(): void {
    this.options.enableConsole = false
  }

  enableTimestamp(): void {
    this.options.enableTimestamp = true
  }

  disableTimestamp(): void {
    this.options.enableTimestamp = false
  }
}

export const logger = new Logger()

export const loggerUtils = {
  createLogger(options?: Partial<LoggerOptions>): Logger {
    return new Logger(options)
  },

  formatError(error: Error): string {
    return `${error.name}: ${error.message}\n${error.stack}`
  },

  formatObject(obj: unknown): string {
    return JSON.stringify(obj, null, 2)
  },

  createContext(
    context: Record<string, unknown>,
    additional?: Record<string, unknown>
  ): Record<string, unknown> {
    return {
      ...context,
      ...additional,
      timestamp: new Date().toISOString(),
    }
  },

  withLogging<T>(
    fn: () => Promise<T>,
    options: {
      message: string
      errorMessage?: string
      context?: Record<string, unknown>
    }
  ): Promise<T> {
    const { message, errorMessage = 'Operation failed', context } = options

    logger.info(message, context)

    return fn().catch(error => {
      logger.error(errorMessage, error, context)
      throw error
    })
  },

  measureExecutionTime<T>(
    fn: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const start = performance.now()

    return fn()
      .then(result => {
        const duration = performance.now() - start
        logger.info(`${operationName} completed in ${duration.toFixed(2)}ms`)
        return result
      })
      .catch(error => {
        const duration = performance.now() - start
        logger.error(
          `${operationName} failed after ${duration.toFixed(2)}ms`,
          error
        )
        throw error
      })
  },

  groupLogs<T>(name: string, fn: () => T): T {
    console.group(name)
    try {
      return fn()
    } finally {
      console.groupEnd()
    }
  },

  async groupLogsAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    console.group(name)
    try {
      return await fn()
    } finally {
      console.groupEnd()
    }
  },
}
