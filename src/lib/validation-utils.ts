export type ValidationResult = {
  isValid: boolean
  error?: string
}

export const validators = {
  isString(value: unknown): value is string {
    return typeof value === 'string'
  },

  isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value)
  },

  isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean'
  },

  isArray(value: unknown): value is unknown[] {
    return Array.isArray(value)
  },

  isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  },

  isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime())
  },

  isEmail(value: string): boolean {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    return emailRegex.test(value)
  },

  isURL(value: string): boolean {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  isPhoneNumber(value: string): boolean {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/
    return phoneRegex.test(value.replace(/\s+/g, ''))
  },

  isPostalCode(value: string): boolean {
    // This is a basic example for US postal codes
    const postalRegex = /^\d{5}(-\d{4})?$/
    return postalRegex.test(value)
  },

  hasMinLength(value: string, minLength: number): boolean {
    return value.length >= minLength
  },

  hasMaxLength(value: string, maxLength: number): boolean {
    return value.length <= maxLength
  },

  isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max
  },

  matchesPattern(value: string, pattern: RegExp): boolean {
    return pattern.test(value)
  },
}

export const typeCheckers = {
  isNullOrUndefined(value: unknown): value is null | undefined {
    return value === null || value === undefined
  },

  isEmptyString(value: unknown): boolean {
    return typeof value === 'string' && value.trim().length === 0
  },

  isEmptyArray(value: unknown): boolean {
    return Array.isArray(value) && value.length === 0
  },

  isEmptyObject(value: unknown): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    )
  },
}

export const validateField = {
  required(value: unknown, fieldName: string): ValidationResult {
    if (typeCheckers.isNullOrUndefined(value) || typeCheckers.isEmptyString(value)) {
      return {
        isValid: false,
        error: `${fieldName} is required`,
      }
    }
    return { isValid: true }
  },

  email(value: string): ValidationResult {
    if (!validators.isEmail(value)) {
      return {
        isValid: false,
        error: 'Invalid email address',
      }
    }
    return { isValid: true }
  },

  password(value: string): ValidationResult {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(value)
    const hasLowerCase = /[a-z]/.test(value)
    const hasNumbers = /\d/.test(value)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)

    if (value.length < minLength) {
      return {
        isValid: false,
        error: `Password must be at least ${minLength} characters long`,
      }
    }

    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      return {
        isValid: false,
        error:
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      }
    }

    return { isValid: true }
  },

  url(value: string): ValidationResult {
    if (!validators.isURL(value)) {
      return {
        isValid: false,
        error: 'Invalid URL',
      }
    }
    return { isValid: true }
  },

  phoneNumber(value: string): ValidationResult {
    if (!validators.isPhoneNumber(value)) {
      return {
        isValid: false,
        error: 'Invalid phone number',
      }
    }
    return { isValid: true }
  },

  postalCode(value: string): ValidationResult {
    if (!validators.isPostalCode(value)) {
      return {
        isValid: false,
        error: 'Invalid postal code',
      }
    }
    return { isValid: true }
  },

  length(value: string, options: { min?: number; max?: number }): ValidationResult {
    const { min, max } = options

    if (min && value.length < min) {
      return {
        isValid: false,
        error: `Must be at least ${min} characters long`,
      }
    }

    if (max && value.length > max) {
      return {
        isValid: false,
        error: `Must be no more than ${max} characters long`,
      }
    }

    return { isValid: true }
  },

  numeric(value: string): ValidationResult {
    if (!/^\d+$/.test(value)) {
      return {
        isValid: false,
        error: 'Must contain only numbers',
      }
    }
    return { isValid: true }
  },

  alphanumeric(value: string): ValidationResult {
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return {
        isValid: false,
        error: 'Must contain only letters and numbers',
      }
    }
    return { isValid: true }
  },
}

export function validateObject<T extends Record<string, unknown>>(
  object: T,
  validations: { [K in keyof T]?: (value: T[K]) => ValidationResult }
): ValidationResult[] {
  return Object.entries(validations).map(([key, validate]) => {
    if (!validate) return { isValid: true }
    return validate(object[key])
  })
}
