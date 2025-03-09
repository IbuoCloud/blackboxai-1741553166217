import { randomBytes, scryptSync, timingSafeEqual, createCipheriv, createDecipheriv } from 'crypto'

interface HashOptions {
  saltLength?: number
  keyLength?: number
}

interface EncryptionOptions {
  algorithm?: string
  keyLength?: number
  ivLength?: number
}

export const securityUtils = {
  /**
   * Generate a random string of specified length
   */
  generateRandomString(length: number): string {
    return randomBytes(length).toString('hex')
  },

  /**
   * Generate a secure token
   */
  generateToken(length: number = 32): string {
    return this.generateRandomString(length)
  },

  /**
   * Hash a password with a random salt
   */
  hashPassword(
    password: string,
    options: HashOptions = {}
  ): { hash: string; salt: string } {
    const { saltLength = 16, keyLength = 64 } = options

    const salt = randomBytes(saltLength).toString('hex')
    const hash = scryptSync(password, salt, keyLength).toString('hex')

    return { hash, salt }
  },

  /**
   * Verify a password against a hash and salt
   */
  verifyPassword(
    password: string,
    hash: string,
    salt: string,
    options: HashOptions = {}
  ): boolean {
    const { keyLength = 64 } = options

    const hashedBuffer = scryptSync(password, salt, keyLength)
    const keyBuffer = Buffer.from(hash, 'hex')

    return hashedBuffer.length === keyBuffer.length && timingSafeEqual(hashedBuffer, keyBuffer)
  },

  /**
   * Encrypt data using AES
   */
  encrypt(
    data: string,
    encryptionKey: string,
    options: EncryptionOptions = {}
  ): { encryptedData: string; iv: string } {
    const {
      algorithm = 'aes-256-cbc',
      keyLength = 32,
      ivLength = 16,
    } = options

    // Create a buffer of the specified key length
    const key = Buffer.from(encryptionKey.padEnd(keyLength, '0')).slice(0, keyLength)
    const iv = randomBytes(ivLength)

    const cipher = createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
    }
  },

  /**
   * Decrypt data using AES
   */
  decrypt(
    encryptedData: string,
    iv: string,
    encryptionKey: string,
    options: EncryptionOptions = {}
  ): string {
    const {
      algorithm = 'aes-256-cbc',
      keyLength = 32,
    } = options

    // Create a buffer of the specified key length
    const key = Buffer.from(encryptionKey.padEnd(keyLength, '0')).slice(0, keyLength)
    const ivBuffer = Buffer.from(iv, 'hex')

    const decipher = createDecipheriv(algorithm, key, ivBuffer)
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  },

  /**
   * Generate a secure random number within a range
   */
  generateSecureRandomNumber(min: number, max: number): number {
    const range = max - min
    const randomBuffer = randomBytes(4)
    const randomNumber = randomBuffer.readUInt32LE(0)
    return min + (randomNumber % (range + 1))
  },

  /**
   * Generate a secure password with specified options
   */
  generateSecurePassword(options: {
    length?: number
    includeUppercase?: boolean
    includeLowercase?: boolean
    includeNumbers?: boolean
    includeSpecial?: boolean
  } = {}): string {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSpecial = true,
    } = options

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    let chars = ''
    if (includeUppercase) chars += uppercase
    if (includeLowercase) chars += lowercase
    if (includeNumbers) chars += numbers
    if (includeSpecial) chars += special

    let password = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = this.generateSecureRandomNumber(0, chars.length - 1)
      password += chars[randomIndex]
    }

    return password
  },

  /**
   * Sanitize a string by removing potentially dangerous characters
   */
  sanitizeString(str: string): string {
    return str.replace(/[<>'"]/g, '')
  },

  /**
   * Validate password strength
   */
  validatePasswordStrength(
    password: string,
    options: {
      minLength?: number
      requireUppercase?: boolean
      requireLowercase?: boolean
      requireNumbers?: boolean
      requireSpecial?: boolean
    } = {}
  ): { isValid: boolean; errors: string[] } {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecial = true,
    } = options

    const errors: string[] = []

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`)
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (requireSpecial && !/[!@#$%^&*()_+\-=[\]{};:,.<>?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  /**
   * Compare two strings in constant time
   */
  constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    return timingSafeEqual(Buffer.from(a), Buffer.from(b))
  },
}
