import type { FetchResult } from "@/types"

export async function fetchWithProxy(url: string): Promise<FetchResult> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WebAnalyzer/1.0;)",
      },
    })

    const sourceCode = await response.text()
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })

    return {
      sourceCode,
      url,
      status: response.status,
      headers,
    }
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error}`)
  }
}
