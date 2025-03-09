export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public data?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400, errors)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(message, 'AUTHORIZATION_ERROR', 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
    this.name = 'ConflictError'
  }
}

export const errorUtils = {
  isAppError(error: unknown): error is AppError {
    return error instanceof AppError
  },

  isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError
  },

  isAuthenticationError(error: unknown): error is AuthenticationError {
    return error instanceof AuthenticationError
  },

  isAuthorizationError(error: unknown): error is AuthorizationError {
    return error instanceof AuthorizationError
  },

  isNotFoundError(error: unknown): error is NotFoundError {
    return error instanceof NotFoundError
  },

  isConflictError(error: unknown): error is ConflictError {
    return error instanceof ConflictError
  },

  createError(
    message: string,
    code: string,
    statusCode: number = 500,
    data?: unknown
  ): AppError {
    return new AppError(message, code, statusCode, data)
  },

  handleError(error: unknown): AppError {
    if (this.isAppError(error)) {
      return error
    }

    if (error instanceof Error) {
      return new AppError(error.message, 'INTERNAL_ERROR', 500)
    }

    return new AppError('An unexpected error occurred', 'UNKNOWN_ERROR', 500)
  },

  formatError(error: unknown): {
    message: string
    code: string
    statusCode: number
    data?: unknown
  } {
    const appError = this.handleError(error)
    return {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      data: appError.data,
    }
  },

  async withErrorHandling<T>(
    fn: () => Promise<T>,
    errorHandler?: (error: unknown) => Promise<T>
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (errorHandler) {
        return errorHandler(error)
      }
      throw this.handleError(error)
    }
  },

  createValidationError(
    message: string,
    errors: Record<string, string[]>
  ): ValidationError {
    return new ValidationError(message, errors)
  },

  createAuthenticationError(message?: string): AuthenticationError {
    return new AuthenticationError(message)
  },

  createAuthorizationError(message?: string): AuthorizationError {
    return new AuthorizationError(message)
  },

  createNotFoundError(resource: string): NotFoundError {
    return new NotFoundError(resource)
  },

  createConflictError(message: string): ConflictError {
    return new ConflictError(message)
  },

  getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'An unexpected error occurred'
  },

  getErrorStack(error: unknown): string | undefined {
    if (error instanceof Error) {
      return error.stack
    }
    return undefined
  },

  logError(error: unknown, context?: Record<string, unknown>): void {
    const errorDetails = {
      message: this.getErrorMessage(error),
      stack: this.getErrorStack(error),
      context,
      timestamp: new Date().toISOString(),
    }

    console.error('Error occurred:', errorDetails)
  },

  isOperationalError(error: unknown): boolean {
    return (
      this.isValidationError(error) ||
      this.isAuthenticationError(error) ||
      this.isAuthorizationError(error) ||
      this.isNotFoundError(error) ||
      this.isConflictError(error)
    )
  },

  isTrustedError(error: unknown): boolean {
    return this.isAppError(error) && this.isOperationalError(error)
  },
}
