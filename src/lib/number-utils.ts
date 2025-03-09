export const numberUtils = {
  clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max)
  },

  round(num: number, decimals: number = 0): number {
    const multiplier = Math.pow(10, decimals)
    return Math.round(num * multiplier) / multiplier
  },

  floor(num: number, decimals: number = 0): number {
    const multiplier = Math.pow(10, decimals)
    return Math.floor(num * multiplier) / multiplier
  },

  ceil(num: number, decimals: number = 0): number {
    const multiplier = Math.pow(10, decimals)
    return Math.ceil(num * multiplier) / multiplier
  },

  random(min: number, max: number): number {
    return Math.random() * (max - min) + min
  },

  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  lerp(start: number, end: number, t: number): number {
    return start * (1 - t) + end * t
  },

  map(
    num: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number {
    return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
  },

  toDegrees(radians: number): number {
    return (radians * 180) / Math.PI
  },

  toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180
  },

  isEven(num: number): boolean {
    return num % 2 === 0
  },

  isOdd(num: number): boolean {
    return num % 2 !== 0
  },

  isPrime(num: number): boolean {
    if (num <= 1) return false
    if (num <= 3) return true
    if (num % 2 === 0 || num % 3 === 0) return false

    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false
    }
    return true
  },

  factorial(num: number): number {
    if (num < 0) throw new Error('Factorial is not defined for negative numbers')
    if (num === 0) return 1
    return num * this.factorial(num - 1)
  },

  gcd(a: number, b: number): number {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b) {
      const t = b
      b = a % b
      a = t
    }
    return a
  },

  lcm(a: number, b: number): number {
    return Math.abs(a * b) / this.gcd(a, b)
  },

  sum(numbers: number[]): number {
    return numbers.reduce((acc, curr) => acc + curr, 0)
  },

  average(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return this.sum(numbers) / numbers.length
  },

  median(numbers: number[]): number {
    if (numbers.length === 0) return 0
    
    const sorted = [...numbers].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2
    }
    return sorted[middle]
  },

  mode(numbers: number[]): number[] {
    if (numbers.length === 0) return []
    
    const frequency: { [key: number]: number } = {}
    let maxFreq = 0
    
    numbers.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1
      maxFreq = Math.max(maxFreq, frequency[num])
    })
    
    return Object.entries(frequency)
      .filter(([_, freq]) => freq === maxFreq)
      .map(([num]) => Number(num))
  },

  standardDeviation(numbers: number[]): number {
    if (numbers.length === 0) return 0
    
    const avg = this.average(numbers)
    const squareDiffs = numbers.map(num => Math.pow(num - avg, 2))
    return Math.sqrt(this.average(squareDiffs))
  },

  percentile(numbers: number[], p: number): number {
    if (numbers.length === 0) return 0
    if (p < 0 || p > 100) throw new Error('Percentile must be between 0 and 100')
    
    const sorted = [...numbers].sort((a, b) => a - b)
    const index = (p / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    
    if (lower === upper) return sorted[lower]
    
    const fraction = index - lower
    return sorted[lower] * (1 - fraction) + sorted[upper] * fraction
  },

  formatWithCommas(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  toFixed(num: number, decimals: number): string {
    return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals).toFixed(decimals)
  },

  isWithinRange(num: number, min: number, max: number): boolean {
    return num >= min && num <= max
  },
}
