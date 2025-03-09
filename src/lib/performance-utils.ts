interface PerformanceMetric {
  name: string
  startTime: number
  endTime: number
  duration: number
  metadata?: Record<string, unknown>
}

interface PerformanceOptions {
  threshold?: number // Duration threshold in milliseconds
  onThresholdExceeded?: (metric: PerformanceMetric) => void
  metadata?: Record<string, unknown>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private activeMetrics: Map<string, number> = new Map()
  private options: Required<PerformanceOptions>

  constructor(options: PerformanceOptions = {}) {
    this.options = {
      threshold: options.threshold || 1000,
      onThresholdExceeded: options.onThresholdExceeded || this.defaultThresholdHandler,
      metadata: options.metadata || {},
    }
  }

  private defaultThresholdHandler(metric: PerformanceMetric): void {
    console.warn(
      `Performance threshold exceeded: ${metric.name} took ${metric.duration}ms`,
      metric
    )
  }

  start(name: string, metadata?: Record<string, unknown>): void {
    this.activeMetrics.set(name, performance.now())
  }

  end(name: string, metadata?: Record<string, unknown>): PerformanceMetric | undefined {
    const startTime = this.activeMetrics.get(name)
    if (startTime === undefined) {
      console.warn(`No active metric found for: ${name}`)
      return undefined
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    const metric: PerformanceMetric = {
      name,
      startTime,
      endTime,
      duration,
      metadata: {
        ...this.options.metadata,
        ...metadata,
      },
    }

    this.metrics.push(metric)
    this.activeMetrics.delete(name)

    if (duration > this.options.threshold) {
      this.options.onThresholdExceeded(metric)
    }

    return metric
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  clear(): void {
    this.metrics = []
    this.activeMetrics.clear()
  }

  getAverageMetric(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name)
    if (relevantMetrics.length === 0) return 0

    const total = relevantMetrics.reduce((sum, metric) => sum + metric.duration, 0)
    return total / relevantMetrics.length
  }
}

type AnyFunction = (...args: any[]) => any

export const performanceUtils = {
  createMonitor(options?: PerformanceOptions): PerformanceMonitor {
    return new PerformanceMonitor(options)
  },

  /**
   * Measure execution time of a function
   */
  async measure<T>(
    fn: () => Promise<T> | T,
    name: string,
    options: PerformanceOptions = {}
  ): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const end = performance.now()
      const duration = end - start

      if (duration > (options.threshold || 1000)) {
        const metric: PerformanceMetric = {
          name,
          startTime: start,
          endTime: end,
          duration,
          metadata: options.metadata,
        }
        if (options.onThresholdExceeded) {
          options.onThresholdExceeded(metric)
        }
      }

      return result
    } catch (error) {
      const end = performance.now()
      console.error(`Error in ${name}:`, error)
      throw error
    }
  },

  /**
   * Create a debounced version of a function
   */
  debounce<F extends AnyFunction>(fn: F, delay: number): (...args: Parameters<F>) => void {
    let timeoutId: ReturnType<typeof setTimeout>

    return (...args: Parameters<F>): void => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }
  },

  /**
   * Create a throttled version of a function
   */
  throttle<F extends AnyFunction>(fn: F, limit: number): (...args: Parameters<F>) => void {
    let inThrottle = false

    return (...args: Parameters<F>): void => {
      if (!inThrottle) {
        fn(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  /**
   * Create a memoized version of a function with performance tracking
   */
  memoizeWithPerformance<F extends AnyFunction>(
    fn: F,
    options: PerformanceOptions & {
      maxCacheSize?: number
      cacheKeyFn?: (...args: Parameters<F>) => string
    } = {}
  ): F {
    const cache = new Map<string, ReturnType<F>>()
    const monitor = new PerformanceMonitor(options)
    const { maxCacheSize = 1000, cacheKeyFn = (...args) => JSON.stringify(args) } = options

    return ((...args: Parameters<F>): ReturnType<F> => {
      const key = cacheKeyFn(...args)
      monitor.start(fn.name)

      if (cache.has(key)) {
        const result = cache.get(key)!
        monitor.end(fn.name, { cached: true })
        return result
      }

      const result = fn(...args)
      if (cache.size >= maxCacheSize) {
        const firstKey = cache.keys().next().value
        cache.delete(firstKey)
      }
      cache.set(key, result)
      monitor.end(fn.name, { cached: false })
      return result
    }) as F
  },

  /**
   * Batch multiple function calls into a single execution
   */
  batch<T, R>(
    fn: (items: T[]) => Promise<R[]>,
    options: { maxSize?: number; maxDelay?: number } = {}
  ): (item: T) => Promise<R> {
    const { maxSize = 100, maxDelay = 100 } = options
    let batch: T[] = []
    let pendingPromise: Promise<R[]> | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const processBatch = async (): Promise<R[]> => {
      const items = [...batch]
      batch = []
      pendingPromise = null
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = null
      return fn(items)
    }

    return async (item: T): Promise<R> => {
      batch.push(item)

      if (!pendingPromise) {
        if (batch.length >= maxSize) {
          pendingPromise = processBatch()
        } else {
          timeoutId = setTimeout(() => {
            if (batch.length > 0) {
              pendingPromise = processBatch()
            }
          }, maxDelay)
        }
      }

      const result = await (pendingPromise || processBatch())
      const index = batch.indexOf(item)
      return result[index]
    }
  },

  /**
   * RAF-based animation frame scheduler
   */
  createAnimationScheduler() {
    let rafId: number
    let lastTime = 0
    const callbacks = new Set<(deltaTime: number) => void>()

    const tick = (time: number) => {
      const deltaTime = time - lastTime
      lastTime = time
      callbacks.forEach(callback => callback(deltaTime))
      rafId = requestAnimationFrame(tick)
    }

    return {
      start() {
        if (!rafId) {
          lastTime = performance.now()
          rafId = requestAnimationFrame(tick)
        }
      },

      stop() {
        if (rafId) {
          cancelAnimationFrame(rafId)
          rafId = 0
        }
      },

      add(callback: (deltaTime: number) => void) {
        callbacks.add(callback)
        if (callbacks.size === 1) this.start()
      },

      remove(callback: (deltaTime: number) => void) {
        callbacks.delete(callback)
        if (callbacks.size === 0) this.stop()
      },
    }
  },
}
