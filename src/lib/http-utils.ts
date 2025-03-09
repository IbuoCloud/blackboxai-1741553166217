type FetchOptions = RequestInit & {
  timeout?: number
  retries?: number
  retryDelay?: number
}

export class HTTPError extends Error {
  constructor(
    public response: Response,
    public data: any,
    message?: string
  ) {
    super(message || `HTTP Error ${response.status}: ${response.statusText}`)
    this.name = 'HTTPError'
  }
}

export async function fetchWithTimeout(
  resource: RequestInfo,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 8000, ...fetchOptions } = options

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(resource, {
      ...fetchOptions,
      signal: controller.signal,
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

async function fetchWithRetry(
  resource: RequestInfo,
  options: FetchOptions = {}
): Promise<Response> {
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options

  let lastError: Error | null = null
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchWithTimeout(resource, fetchOptions)
    } catch (error) {
      lastError = error as Error
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)))
      }
    }
  }
  throw lastError
}

export async function http<T>(
  resource: RequestInfo,
  options: FetchOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(resource, options)
  const data = await response.json()

  if (!response.ok) {
    throw new HTTPError(response, data)
  }

  return data as T
}

export const httpClient = {
  async get<T>(url: string, options: FetchOptions = {}): Promise<T> {
    return http<T>(url, { ...options, method: 'GET' })
  },

  async post<T>(url: string, data?: any, options: FetchOptions = {}): Promise<T> {
    return http<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    })
  },

  async put<T>(url: string, data?: any, options: FetchOptions = {}): Promise<T> {
    return http<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    })
  },

  async patch<T>(url: string, data?: any, options: FetchOptions = {}): Promise<T> {
    return http<T>(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    })
  },

  async delete<T>(url: string, options: FetchOptions = {}): Promise<T> {
    return http<T>(url, { ...options, method: 'DELETE' })
  },
}

export function createQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value))
    }
  })
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

export function parseQueryString<T extends Record<string, string>>(queryString: string): Partial<T> {
  const searchParams = new URLSearchParams(queryString)
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params as Partial<T>
}

export async function uploadFile(
  url: string,
  file: File,
  options: FetchOptions = {}
): Promise<Response> {
  const formData = new FormData()
  formData.append('file', file)

  return fetch(url, {
    ...options,
    method: 'POST',
    body: formData,
  })
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export async function streamResponse(
  response: Response,
  onChunk: (chunk: string) => void
): Promise<void> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('Response body is null')

  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    onChunk(chunk)
  }
}
