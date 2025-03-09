type Environment = 'development' | 'test' | 'staging' | 'production'

interface EnvConfig {
  NODE_ENV: Environment
  API_URL: string
  API_KEY?: string
  DEBUG?: boolean
  [key: string]: string | boolean | undefined
}

export const envUtils = {
  /**
   * Get the current environment
   */
  getEnvironment(): Environment {
    return (process.env.NODE_ENV || 'development') as Environment
  },

  /**
   * Check if running in development environment
   */
  isDevelopment(): boolean {
    return this.getEnvironment() === 'development'
  },

  /**
   * Check if running in production environment
   */
  isProduction(): boolean {
    return this.getEnvironment() === 'production'
  },

  /**
   * Check if running in test environment
   */
  isTest(): boolean {
    return this.getEnvironment() === 'test'
  },

  /**
   * Check if running in staging environment
   */
  isStaging(): boolean {
    return this.getEnvironment() === 'staging'
  },

  /**
   * Get an environment variable with type checking
   */
  get<T extends keyof EnvConfig>(key: T): EnvConfig[T] {
    return process.env[key] as EnvConfig[T]
  },

  /**
   * Get an environment variable with a default value
   */
  getWithDefault<T extends keyof EnvConfig>(
    key: T,
    defaultValue: EnvConfig[T]
  ): EnvConfig[T] {
    return (process.env[key] as EnvConfig[T]) ?? defaultValue
  },

  /**
   * Get a required environment variable
   * Throws an error if the variable is not set
   */
  getRequired<T extends keyof EnvConfig>(key: T): NonNullable<EnvConfig[T]> {
    const value = this.get(key)
    if (value === undefined) {
      throw new Error(`Required environment variable ${key} is not set`)
    }
    return value as NonNullable<EnvConfig[T]>
  },

  /**
   * Get a boolean environment variable
   */
  getBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = process.env[key]
    if (value === undefined) return defaultValue
    return value.toLowerCase() === 'true'
  },

  /**
   * Get a number environment variable
   */
  getNumber(key: string, defaultValue?: number): number | undefined {
    const value = process.env[key]
    if (value === undefined) return defaultValue
    const num = Number(value)
    return isNaN(num) ? defaultValue : num
  },

  /**
   * Get all environment variables matching a prefix
   */
  getAllWithPrefix(prefix: string): Record<string, string> {
    return Object.entries(process.env).reduce((acc, [key, value]) => {
      if (key.startsWith(prefix)) {
        acc[key] = value as string
      }
      return acc
    }, {} as Record<string, string>)
  },

  /**
   * Check if a feature flag is enabled
   */
  isFeatureEnabled(featureName: string): boolean {
    return this.getBoolean(`FEATURE_${featureName.toUpperCase()}`)
  },

  /**
   * Get API configuration
   */
  getApiConfig(): { url: string; key?: string } {
    return {
      url: this.getRequired('API_URL'),
      key: this.get('API_KEY'),
    }
  },

  /**
   * Get debug configuration
   */
  getDebugConfig(): { enabled: boolean; level?: string } {
    return {
      enabled: this.getBoolean('DEBUG'),
      level: process.env.DEBUG_LEVEL,
    }
  },

  /**
   * Validate required environment variables
   */
  validateEnv(requiredVars: string[]): void {
    const missing = requiredVars.filter(
      varName => process.env[varName] === undefined
    )

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`
      )
    }
  },

  /**
   * Load environment variables from an object
   */
  load(env: Record<string, string | undefined>): void {
    Object.entries(env).forEach(([key, value]) => {
      if (value !== undefined) {
        process.env[key] = value
      }
    })
  },

  /**
   * Get all environment variables as an object
   */
  getAll(): Record<string, string | undefined> {
    return { ...process.env }
  },

  /**
   * Check if running in a specific environment
   */
  isEnv(env: Environment): boolean {
    return this.getEnvironment() === env
  },

  /**
   * Get the current environment with additional context
   */
  getEnvContext(): {
    environment: Environment
    isDevelopment: boolean
    isProduction: boolean
    isTest: boolean
    isStaging: boolean
    debug: boolean
  } {
    const environment = this.getEnvironment()
    return {
      environment,
      isDevelopment: environment === 'development',
      isProduction: environment === 'production',
      isTest: environment === 'test',
      isStaging: environment === 'staging',
      debug: this.getBoolean('DEBUG'),
    }
  },
}
