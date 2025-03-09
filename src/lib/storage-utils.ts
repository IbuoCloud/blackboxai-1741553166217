type StorageType = 'local' | 'session'

interface StorageOptions {
  expires?: number // Time in milliseconds
  secure?: boolean
  type?: StorageType
}

interface StorageItem<T> {
  value: T
  expires: number | null
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageError'
  }
}

export const storage = {
  set<T>(key: string, value: T, options: StorageOptions = {}): void {
    try {
      const { expires, type = 'local' } = options
      const item: StorageItem<T> = {
        value,
        expires: expires ? new Date().getTime() + expires : null,
      }
      const storageType = type === 'local' ? localStorage : sessionStorage
      storageType.setItem(key, JSON.stringify(item))
    } catch (err) {
      const error = err as Error
      throw new StorageError(`Failed to set item: ${error.message}`)
    }
  },

  get<T>(key: string, options: StorageOptions = {}): T | null {
    try {
      const { type = 'local' } = options
      const storageType = type === 'local' ? localStorage : sessionStorage
      const item = storageType.getItem(key)
      
      if (!item) return null

      const parsed = JSON.parse(item) as StorageItem<T>
      
      if (parsed.expires && new Date().getTime() > parsed.expires) {
        storageType.removeItem(key)
        return null
      }

      return parsed.value
    } catch (err) {
      const error = err as Error
      throw new StorageError(`Failed to get item: ${error.message}`)
    }
  },

  remove(key: string, options: StorageOptions = {}): void {
    try {
      const { type = 'local' } = options
      const storageType = type === 'local' ? localStorage : sessionStorage
      storageType.removeItem(key)
    } catch (err) {
      const error = err as Error
      throw new StorageError(`Failed to remove item: ${error.message}`)
    }
  },

  clear(options: StorageOptions = {}): void {
    try {
      const { type = 'local' } = options
      const storageType = type === 'local' ? localStorage : sessionStorage
      storageType.clear()
    } catch (err) {
      const error = err as Error
      throw new StorageError(`Failed to clear storage: ${error.message}`)
    }
  },

  exists(key: string, options: StorageOptions = {}): boolean {
    try {
      const { type = 'local' } = options
      const storageType = type === 'local' ? localStorage : sessionStorage
      const item = storageType.getItem(key)
      
      if (!item) return false

      const parsed = JSON.parse(item) as StorageItem<unknown>
      
      if (parsed.expires && new Date().getTime() > parsed.expires) {
        storageType.removeItem(key)
        return false
      }

      return true
    } catch (err) {
      const error = err as Error
      throw new StorageError(`Failed to check item existence: ${error.message}`)
    }
  },
}

interface CookieOptions {
  expires?: Date
  path?: string
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

export const cookies = {
  set(name: string, value: string, options: CookieOptions = {}): void {
    try {
      const { expires, path = '/', secure = true, sameSite = 'Lax' } = options
      let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
      
      if (expires) {
        cookie += `; expires=${expires.toUTCString()}`
      }
      
      cookie += `; path=${path}`
      
      if (secure) {
        cookie += '; secure'
      }
      
      cookie += `; samesite=${sameSite}`
      
      document.cookie = cookie
    } catch (err) {
      const error = err as Error
      throw new StorageError(`Failed to set cookie: ${error.message}`)
    }
  },

  get(name: string): string | null {
    try {
      const cookies = document.cookie.split(';')
      const cookie = cookies.find(c => c.trim().startsWith(`${name}=`))
      
      if (!cookie) return null
      
      return decodeURIComponent(cookie.split('=')[1].trim())
    } catch (err) {
      const error = err as Error
      throw new StorageError(`Failed to get cookie: ${error.message}`)
    }
  },

  remove(name: string, path: string = '/'): void {
    try {
      document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`
    } catch (err) {
      const error = err as Error
      throw new StorageError(`Failed to remove cookie: ${error.message}`)
    }
  },

  exists(name: string): boolean {
    return this.get(name) !== null
  },
}

export interface StorageHook<T> {
  value: T
  setValue: (newValue: T) => void
  remove: () => void
  exists: () => boolean
}

export function createStorageHook<T>(key: string, initialValue: T): StorageHook<T> {
  return {
    get value(): T {
      return storage.get<T>(key) ?? initialValue
    },
    setValue(newValue: T): void {
      storage.set(key, newValue)
    },
    remove(): void {
      storage.remove(key)
    },
    exists(): boolean {
      return storage.exists(key)
    },
  }
}

// Example usage:
// const userPreferences = createStorageHook('userPreferences', { theme: 'light' })
// userPreferences.setValue({ theme: 'dark' })
// console.log(userPreferences.value.theme)
