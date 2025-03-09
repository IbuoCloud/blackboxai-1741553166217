import { NextResponse } from "next/server"

export type ApiResponse<T = any> = {
  data?: T
  error?: string
  message?: string
  status: number
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        status: error.statusCode,
        code: error.code,
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
        status: 500,
      },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      status: 500,
    },
    { status: 500 }
  )
}

export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      message,
      status: 200,
    },
    { status: 200 }
  )
}

export function validateRequestBody(body: any, requiredFields: string[]): void {
  for (const field of requiredFields) {
    if (!body[field]) {
      throw new ApiError(`Missing required field: ${field}`, 400)
    }
  }
}

export function sanitizeOutput<T extends Record<string, any>>(
  data: T,
  sensitiveFields: string[] = ['password', 'token']
): Partial<T> {
  const sanitized = { ...data }
  for (const field of sensitiveFields) {
    delete sanitized[field]
  }
  return sanitized
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    const result = await fn()
    return successResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
