type Primitive = string | number | boolean | null | undefined
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export const objectUtils = {
  isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  },

  deepClone<T>(obj: T): T {
    if (!this.isObject(obj)) {
      return obj
    }

    const clone: any = Array.isArray(obj) ? [] : {}

    Object.entries(obj).forEach(([key, value]) => {
      clone[key] = this.deepClone(value)
    })

    return clone
  },

  deepMerge<T extends object>(target: T, ...sources: DeepPartial<T>[]): T {
    if (!sources.length) return target
    const source = sources.shift()

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} })
          this.deepMerge(target[key] as object, source[key] as object)
        } else {
          Object.assign(target, { [key]: source[key] })
        }
      })
    }

    return this.deepMerge(target, ...sources)
  },

  pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    return keys.reduce((acc, key) => {
      if (key in obj) {
        acc[key] = obj[key]
      }
      return acc
    }, {} as Pick<T, K>)
  },

  omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (!keys.includes(key as K)) {
        acc[key as keyof Omit<T, K>] = value
      }
      return acc
    }, {} as Omit<T, K>)
  },

  flatten(obj: Record<string, any>, prefix: string = ''): Record<string, Primitive> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key

      if (this.isObject(value)) {
        Object.assign(acc, this.flatten(value, newKey))
      } else {
        acc[newKey] = value
      }

      return acc
    }, {} as Record<string, Primitive>)
  },

  unflatten(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {}

    Object.entries(obj).forEach(([key, value]) => {
      const parts = key.split('.')
      let current = result

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = value
        } else {
          current[part] = current[part] || {}
          current = current[part]
        }
      })
    })

    return result
  },

  isEmpty(obj: Record<string, any>): boolean {
    return Object.keys(obj).length === 0
  },

  hasCircularReference(obj: any, seen = new Set()): boolean {
    if (!this.isObject(obj)) {
      return false
    }

    if (seen.has(obj)) {
      return true
    }

    seen.add(obj)

    return Object.values(obj).some(value => this.hasCircularReference(value, seen))
  },

  transform<T extends object, U>(
    obj: T,
    transformer: (value: any, key: string, object: T) => any
  ): U {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[key] = transformer(value, key, obj)
      return acc
    }, {} as U)
  },

  getValueByPath(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, part) => current?.[part], obj)
  },

  setValueByPath(obj: Record<string, any>, path: string, value: any): void {
    const parts = path.split('.')
    const lastPart = parts.pop()!
    let current = obj

    parts.forEach(part => {
      if (!(part in current)) {
        current[part] = {}
      }
      current = current[part]
    })

    current[lastPart] = value
  },

  removeUndefined<T extends object>(obj: T): Partial<T> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key as keyof T] = value
      }
      return acc
    }, {} as Partial<T>)
  },

  isEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true
    if (!this.isObject(obj1) || !this.isObject(obj2)) return obj1 === obj2

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) return false

    return keys1.every(key => this.isEqual(obj1[key], obj2[key]))
  },

  diff(obj1: Record<string, any>, obj2: Record<string, any>): Record<string, any> {
    return Object.entries(obj1).reduce((acc, [key, value]) => {
      if (obj2[key] !== value) {
        acc[key] = {
          old: value,
          new: obj2[key],
        }
      }
      return acc
    }, {} as Record<string, { old: any; new: any }>)
  },

  toQueryString(obj: Record<string, any>): string {
    return Object.entries(obj)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
  },

  fromQueryString(queryString: string): Record<string, string> {
    return queryString
      .replace(/^\?/, '')
      .split('&')
      .reduce((acc, pair) => {
        const [key, value] = pair.split('=')
        if (key) {
          acc[decodeURIComponent(key)] = decodeURIComponent(value || '')
        }
        return acc
      }, {} as Record<string, string>)
  },
}
