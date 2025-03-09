export const stringUtils = {
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },

  titleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  },

  camelCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
  },

  kebabCase(str: string): string {
    return str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      ?.map(x => x.toLowerCase())
      .join('-') || ''
  },

  snakeCase(str: string): string {
    return str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      ?.map(x => x.toLowerCase())
      .join('_') || ''
  },

  truncate(str: string, length: number, ending: string = '...'): string {
    if (str.length > length) {
      return str.substring(0, length - ending.length) + ending
    }
    return str
  },

  slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  },

  removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  },

  stripHtml(str: string): string {
    return str.replace(/<[^>]*>/g, '')
  },

  escapeHtml(str: string): string {
    const htmlEntities: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return str.replace(/[&<>"']/g, tag => htmlEntities[tag] || tag)
  },

  formatNumber(num: number, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale).format(num)
  },

  formatCurrency(
    amount: number,
    currency: string = 'USD',
    locale: string = 'en-US'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount)
  },

  formatPercentage(num: number, decimals: number = 0, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  },

  generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map(x => chars[x % chars.length])
      .join('')
  },

  mask(str: string, start: number = 4, end: number = 4, mask: string = '*'): string {
    const firstChars = str.slice(0, start)
    const lastChars = str.slice(-end)
    const maskedLength = str.length - start - end
    const maskedChars = mask.repeat(maskedLength)
    return `${firstChars}${maskedChars}${lastChars}`
  },

  countWords(str: string): number {
    return str.trim().split(/\s+/).length
  },

  countCharacters(str: string, excludeSpaces: boolean = false): number {
    return excludeSpaces ? str.replace(/\s/g, '').length : str.length
  },

  reverse(str: string): string {
    return str.split('').reverse().join('')
  },

  isPalindrome(str: string): boolean {
    const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '')
    return cleanStr === cleanStr.split('').reverse().join('')
  },

  extractEmails(str: string): string[] {
    const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
    return str.match(emailRegex) || []
  },

  extractUrls(str: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return str.match(urlRegex) || []
  },

  extractNumbers(str: string): number[] {
    const numberRegex = /-?\d+(\.\d+)?/g
    return (str.match(numberRegex) || []).map(Number)
  },

  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
  },
}
