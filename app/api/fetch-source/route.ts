import { NextResponse } from "next/server"
import { fetchWebsiteSource } from "@/app/utils/fetcher"
import { limiter } from "@/app/utils/rate-limit"

export async function POST(request: Request) {
  try {
    // Get client IP
    const ip = request.headers.get("x-forwarded-for") || "anonymous"

    // Check rate limit
    if (!limiter.check(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const result = await fetchWebsiteSource(url)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
