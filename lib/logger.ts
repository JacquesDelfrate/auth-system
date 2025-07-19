type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatLog(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true
    
    // In production, only log warn and error
    return level === 'warn' || level === 'error'
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    if (!this.shouldLog(level)) return

    const logEntry = this.formatLog(level, message, context, error)
    
    if (this.isDevelopment) {
      // Development: Pretty console output
      const colorMap = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m'  // Red
      }
      
      console.log(`${colorMap[level]}${level.toUpperCase()}\x1b[0m [${logEntry.timestamp}] ${message}`)
      
      if (context && Object.keys(context).length > 0) {
        console.log('Context:', JSON.stringify(context, null, 2))
      }
      
      if (error) {
        console.error('Error:', error.message)
        if (error.stack) {
          console.error('Stack:', error.stack)
        }
      }
    } else {
      // Production: JSON structured logging
      console.log(JSON.stringify(logEntry))
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, any>, error?: Error) {
    this.log('warn', message, context, error)
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log('error', message, context, error)
  }

  // Specialized logging methods for auth system
  authInfo(message: string, userId?: string, email?: string) {
    this.info(message, { 
      component: 'auth',
      userId: userId ? this.maskUserId(userId) : undefined,
      email: email ? this.maskEmail(email) : undefined
    })
  }

  authError(message: string, error?: Error, userId?: string, email?: string) {
    this.error(message, {
      component: 'auth',
      userId: userId ? this.maskUserId(userId) : undefined,
      email: email ? this.maskEmail(email) : undefined
    }, error)
  }

  emailInfo(message: string, recipientEmail?: string) {
    this.info(message, {
      component: 'email',
      recipient: recipientEmail ? this.maskEmail(recipientEmail) : undefined
    })
  }

  emailError(message: string, error?: Error, recipientEmail?: string) {
    this.error(message, {
      component: 'email',
      recipient: recipientEmail ? this.maskEmail(recipientEmail) : undefined
    }, error)
  }

  // Privacy helpers - mask sensitive data
  private maskUserId(userId: string): string {
    return userId.length > 8 ? `${userId.slice(0, 4)}...${userId.slice(-4)}` : '***'
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@')
    if (!domain) return '***'
    
    const maskedLocal = local.length > 2 ? `${local.slice(0, 1)}***${local.slice(-1)}` : '***'
    return `${maskedLocal}@${domain}`
  }
}

export const logger = new Logger() 