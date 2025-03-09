type Primitive = string | number | boolean | null | undefined

export const arrayUtils = {
  chunk<T>(array: T[], size: number): T[][] {
    return array.reduce((chunks, item, index) => {
      const chunkIndex = Math.floor(index / size)
      if (!chunks[chunkIndex]) {
        chunks[chunkIndex] = []
      }
      chunks[chunkIndex].push(item)
      return chunks
    }, [] as T[][])
  },

  unique<T extends Primitive>(array: T[]): T[] {
    return Array.from(new Set(array))
  },

  uniqueBy<T extends object>(array: T[], key: keyof T): T[] {
    const seen = new Set()
    return array.filter(item => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  },

  shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  },

  groupBy<T extends object>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key])
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
      return groups
    }, {} as Record<string, T[]>)
  },

  sortBy<T extends object>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      if (a[key] < b[key]) return order === 'asc' ? -1 : 1
      if (a[key] > b[key]) return order === 'asc' ? 1 : -1
      return 0
    })
  },

  flatten<T>(arrays: T[][]): T[] {
    return arrays.reduce((flat, current) => flat.concat(current), [])
  },

  flattenDeep<T>(array: any[]): T[] {
    return array.reduce((flat, current) => {
      return flat.concat(
        Array.isArray(current) ? this.flattenDeep(current) : current
      )
    }, [])
  },

  intersection<T extends Primitive>(...arrays: T[][]): T[] {
    return arrays.reduce((a, b) => a.filter(c => b.includes(c)))
  },

  difference<T extends Primitive>(array1: T[], array2: T[]): T[] {
    return array1.filter(x => !array2.includes(x))
  },

  union<T extends Primitive>(...arrays: T[][]): T[] {
    return this.unique(arrays.flat())
  },

  range(start: number, end: number, step: number = 1): number[] {
    const length = Math.floor((end - start) / step) + 1
    return Array.from({ length }, (_, i) => start + i * step)
  },

  partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
    return array.reduce(
      ([pass, fail], item) => {
        return predicate(item) ? [[...pass, item], fail] : [pass, [...fail, item]]
      },
      [[] as T[], [] as T[]]
    )
  },

  rotate<T>(array: T[], k: number): T[] {
    const len = array.length
    k = ((k % len) + len) % len // Normalize k
    return [...array.slice(k), ...array.slice(0, k)]
  },

  findDuplicates<T extends Primitive>(array: T[]): T[] {
    return array.filter((item, index) => array.indexOf(item) !== index)
  },

  countOccurrences<T extends Primitive>(array: T[]): Map<T, number> {
    return array.reduce((acc, item) => {
      return acc.set(item, (acc.get(item) || 0) + 1)
    }, new Map<T, number>())
  },

  sample<T>(array: T[], n: number = 1): T[] {
    const shuffled = this.shuffle(array)
    return shuffled.slice(0, n)
  },

  zip<T, U>(array1: T[], array2: U[]): [T | undefined, U | undefined][] {
    const length = Math.min(array1.length, array2.length)
    return Array.from({ length }, (_, i) => [array1[i], array2[i]])
  },

  cartesianProduct<T, U>(array1: T[], array2: U[]): [T, U][] {
    return array1.flatMap(a => array2.map(b => [a, b] as [T, U]))
  },

  findAllIndexes<T>(array: T[], predicate: (item: T) => boolean): number[] {
    return array.reduce((indexes, item, i) => {
      if (predicate(item)) {
        indexes.push(i)
      }
      return indexes
    }, [] as number[])
  },

  moveItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
    const result = [...array]
    const [removed] = result.splice(fromIndex, 1)
    result.splice(toIndex, 0, removed)
    return result
  },

  splitIntoGroups<T>(array: T[], numGroups: number): T[][] {
    const result: T[][] = Array.from({ length: numGroups }, () => [])
    array.forEach((item, index) => {
      result[index % numGroups].push(item)
    })
    return result
  },

  paginate<T>(
    array: T[],
    pageSize: number,
    pageNumber: number
  ): { data: T[]; total: number; pages: number } {
    const start = (pageNumber - 1) * pageSize
    const end = start + pageSize
    return {
      data: array.slice(start, end),
      total: array.length,
      pages: Math.ceil(array.length / pageSize),
    }
  },
}
