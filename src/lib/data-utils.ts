export function groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as { [key: string]: T[] })
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const valueA = a[key]
    const valueB = b[key]

    if (valueA < valueB) return order === 'asc' ? -1 : 1
    if (valueA > valueB) return order === 'asc' ? 1 : -1
    return 0
  })
}

export function filterBy<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate)
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

export function chunk<T>(array: T[], size: number): T[][] {
  return array.reduce((chunks, item, index) => {
    const chunkIndex = Math.floor(index / size)
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = []
    }
    chunks[chunkIndex].push(item)
    return chunks
  }, [] as T[][])
}

export function paginate<T>(
  array: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; totalPages: number } {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = array.slice(start, end)
  const total = array.length
  const totalPages = Math.ceil(total / pageSize)

  return { data, total, totalPages }
}

export function search<T>(
  array: T[],
  query: string,
  keys: (keyof T)[]
): T[] {
  const normalizedQuery = query.toLowerCase()
  return array.filter(item =>
    keys.some(key => {
      const value = String(item[key]).toLowerCase()
      return value.includes(normalizedQuery)
    })
  )
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(deepClone) as unknown as T
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
  ) as T
}

export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

export function mapValues<T extends object, U>(
  obj: T,
  fn: (value: T[keyof T]) => U
): { [K in keyof T]: U } {
  const result = {} as { [K in keyof T]: U }
  Object.entries(obj).forEach(([key, value]) => {
    result[key as keyof T] = fn(value)
  })
  return result
}

export function mergeDeep<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target }
  Object.keys(source).forEach(key => {
    const targetValue = result[key as keyof T]
    const sourceValue = source[key as keyof T]

    if (
      targetValue &&
      sourceValue &&
      typeof targetValue === 'object' &&
      typeof sourceValue === 'object'
    ) {
      result[key as keyof T] = mergeDeep(
        targetValue as object,
        sourceValue as object
      ) as T[keyof T]
    } else if (sourceValue !== undefined) {
      result[key as keyof T] = sourceValue as T[keyof T]
    }
  })
  return result
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
