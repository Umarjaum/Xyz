import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const allowedDomains = [
    "codigenhub.site",
    "codigenhub.netlify.app",
    "codigen.netlify.app"
  ]

  const origin = request.headers.get("origin") || ""
  const referer = request.headers.get("referer") || ""

  // Function to check if origin/referer belongs to allowed domains
  const isAllowed = (url: string) => {
    try {
      const { hostname } = new URL(url)
      return allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      )
    } catch {
      return false // Invalid or missing URL
    }
  }

  // Check if request is coming from an allowed domain
  if (origin && !isAllowed(origin) && referer && !isAllowed(referer)) {
    return NextResponse.json({ error: "Access Denied" }, { status: 403 })
  }

  // Handle preflight CORS requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin || `https://${allowedDomains[0]}`,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    })
  }

  // Process regular requests
  const response = NextResponse.next()

  // Set CORS headers correctly to allow all allowed domains dynamically
  if (origin && isAllowed(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
  } else {
    response.headers.set("Access-Control-Allow-Origin", `https://${allowedDomains[0]}`)
  }

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

  return response
}

// Apply middleware only to API routes
export const config = {
  matcher: "/api/:path*",
}
