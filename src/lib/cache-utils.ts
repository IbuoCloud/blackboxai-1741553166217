interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items in cache
}

interface CacheItem<T> {
  value: T
  expiry: number | null
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  maxSize: number | null
}

class Cache<T> {
  private cache: Map<string, CacheItem<T>>
  private stats: CacheStats
  private options: Required<CacheOptions>

  constructor(options: CacheOptions = {}) {
    this.cache = new Map<string, CacheItem<T>>()
    this.options = {
      ttl: options.ttl || 0, // 0 means no expiration
      maxSize: options.maxSize || 0, // 0 means no limit
    }
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      maxSize: this.options.maxSize || null,
    }
  }

  set(key: string, value: T, ttl?: number): void {
    this.removeExpired()

    if (this.options.maxSize > 0 && this.cache.size >= this.options.maxSize) {
      const firstKey = Array.from(this.cache.keys())[0]
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    const expiry = ttl || this.options.ttl
      ? Date.now() + (ttl || this.options.ttl)
      : null

    this.cache.set(key, { value, expiry })
    this.stats.size = this.cache.size
  }

  get(key: string): T | undefined {
    this.removeExpired()

    const item = this.cache.get(key)
    if (!item) {
      this.stats.misses++
      return undefined
    }

    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.size = this.cache.size
      return undefined
    }

    this.stats.hits++
    return item.value
  }

  delete(key: string): boolean {
    const result = this.cache.delete(key)
    this.stats.size = this.cache.size
    return result
  }

  has(key: string): boolean {
    this.removeExpired()
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
    this.stats.size = 0
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  private removeExpired(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && now > item.expiry) {
        this.cache.delete(key)
      }
    }
    this.stats.size = this.cache.size
  }
}

interface StorageCache<T> {
  set(key: string, value: T, ttl?: number): void
  get(key: string): T | undefined
  delete(key: string): void
  clear(): void
}

export const cacheUtils = {
  createCache<T>(options?: CacheOptions): Cache<T> {
    return new Cache<T>(options)
  },

  createLocalStorageCache<T>(prefix: string = ''): StorageCache<T> {
    return {
      set(key: string, value: T, ttl?: number): void {
        const item: CacheItem<T> = {
          value,
          expiry: ttl ? Date.now() + ttl : null,
        }
        localStorage.setItem(
          `${prefix}${key}`,
          JSON.stringify(item)
        )
      },

      get(key: string): T | undefined {
        const data = localStorage.getItem(`${prefix}${key}`)
        if (!data) return undefined

        try {
          const item: CacheItem<T> = JSON.parse(data)
          if (item.expiry && Date.now() > item.expiry) {
            localStorage.removeItem(`${prefix}${key}`)
            return undefined
          }
          return item.value
        } catch {
          return undefined
        }
      },

      delete(key: string): void {
        localStorage.removeItem(`${prefix}${key}`)
      },

      clear(): void {
        if (prefix) {
          const keys = Object.keys(localStorage)
          keys.forEach(key => {
            if (key.startsWith(prefix)) {
              localStorage.removeItem(key)
            }
          })
        } else {
          localStorage.clear()
        }
      },
    }
  },

  createSessionStorageCache<T>(prefix: string = ''): StorageCache<T> {
    return {
      set(key: string, value: T, ttl?: number): void {
        const item: CacheItem<T> = {
          value,
          expiry: ttl ? Date.now() + ttl : null,
        }
        sessionStorage.setItem(
          `${prefix}${key}`,
          JSON.stringify(item)
        )
      },

      get(key: string): T | undefined {
        const data = sessionStorage.getItem(`${prefix}${key}`)
        if (!data) return undefined

        try {
          const item: CacheItem<T> = JSON.parse(data)
          if (item.expiry && Date.now() > item.expiry) {
            sessionStorage.removeItem(`${prefix}${key}`)
            return undefined
          }
          return item.value
        } catch {
          return undefined
        }
      },

      delete(key: string): void {
        sessionStorage.removeItem(`${prefix}${key}`)
      },

      clear(): void {
        if (prefix) {
          const keys = Object.keys(sessionStorage)
          keys.forEach(key => {
            if (key.startsWith(prefix)) {
              sessionStorage.removeItem(key)
            }
          })
        } else {
          sessionStorage.clear()
        }
      },
    }
  },

  memoize<T, Args extends any[]>(
    fn: (...args: Args) => T,
    options: CacheOptions & { keyFn?: (...args: Args) => string } = {}
  ): (...args: Args) => T {
    const cache = new Cache<T>(options)
    const { keyFn = (...args: Args) => JSON.stringify(args) } = options

    return (...args: Args): T => {
      const key = keyFn(...args)
      let result = cache.get(key)

      if (result === undefined) {
        result = fn(...args)
        cache.set(key, result)
      }

      return result
    }
  },

  memoizeAsync<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>,
    options: CacheOptions & { keyFn?: (...args: Args) => string } = {}
  ): (...args: Args) => Promise<T> {
    const cache = new Cache<T>(options)
    const { keyFn = (...args: Args) => JSON.stringify(args) } = options

    return async (...args: Args): Promise<T> => {
      const key = keyFn(...args)
      let result = cache.get(key)

      if (result === undefined) {
        result = await fn(...args)
        cache.set(key, result)
      }

      return result
    }
  },
}
