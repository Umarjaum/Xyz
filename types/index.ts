export interface FetchResult {
  sourceCode: string
  url: string
  status: number
  headers: Record<string, string>
}

export interface SitemapValidationResult {
  isValid: boolean
  errors: string[]
  urls: string[]
  lastModified?: string
}

export interface ApiError {
  message: string
  status: number
}
