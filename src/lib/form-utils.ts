export type ValidationRule = {
  validate: (value: any) => boolean
  message: string
}

export type FieldValidation = {
  [key: string]: ValidationRule[]
}

export type ValidationResult = {
  isValid: boolean
  errors: { [key: string]: string[] }
}

export const commonValidations = {
  required: (message: string = 'This field is required'): ValidationRule => ({
    validate: (value: any) => {
      if (typeof value === 'string') {
        return value.trim().length > 0
      }
      return value !== null && value !== undefined
    },
    message,
  }),

  email: (message: string = 'Please enter a valid email address'): ValidationRule => ({
    validate: (value: string) =>
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
    message,
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length >= length,
    message: message || `Must be at least ${length} characters`,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length <= length,
    message: message || `Must be no more than ${length} characters`,
  }),

  matches: (pattern: RegExp, message: string): ValidationRule => ({
    validate: (value: string) => pattern.test(value),
    message,
  }),

  numeric: (message: string = 'Must be a number'): ValidationRule => ({
    validate: (value: string) => !isNaN(Number(value)),
    message,
  }),

  phone: (message: string = 'Please enter a valid phone number'): ValidationRule => ({
    validate: (value: string) =>
      /^\+?[\d\s-()]{10,}$/.test(value.replace(/\s+/g, '')),
    message,
  }),

  url: (message: string = 'Please enter a valid URL'): ValidationRule => ({
    validate: (value: string) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    message,
  }),
}

export function validateField(value: any, rules: ValidationRule[]): string[] {
  const errors: string[] = []
  
  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message)
    }
  }
  
  return errors
}

export function validateForm(
  values: { [key: string]: any },
  validations: FieldValidation
): ValidationResult {
  const errors: { [key: string]: string[] } = {}
  let isValid = true

  for (const [field, rules] of Object.entries(validations)) {
    const fieldErrors = validateField(values[field], rules)
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors
      isValid = false
    }
  }

  return { isValid, errors }
}

export function serializeFormData(formData: FormData): { [key: string]: any } {
  const values: { [key: string]: any } = {}
  
  formData.forEach((value, key) => {
    // Handle array inputs (multiple select, checkboxes)
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2)
      if (!values[arrayKey]) {
        values[arrayKey] = []
      }
      values[arrayKey].push(value)
    } else {
      values[key] = value
    }
  })
  
  return values
}

export function formatValidationErrors(
  errors: { [key: string]: string[] }
): { [key: string]: string } {
  const formatted: { [key: string]: string } = {}
  
  for (const [field, fieldErrors] of Object.entries(errors)) {
    formatted[field] = fieldErrors[0] // Take first error message
  }
  
  return formatted
}

export function getFormData(event: React.FormEvent<HTMLFormElement>): FormData {
  event.preventDefault()
  return new FormData(event.currentTarget)
}

export const passwordValidation = [
  commonValidations.required('Password is required'),
  commonValidations.minLength(8, 'Password must be at least 8 characters'),
  commonValidations.matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must include uppercase, lowercase, number and special character'
  ),
]

export const emailValidation = [
  commonValidations.required('Email is required'),
  commonValidations.email(),
]

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
