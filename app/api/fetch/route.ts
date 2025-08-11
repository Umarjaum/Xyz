import { fetchWithProxy } from "@/utils/fetch-utils"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), { status: 400 })
    }

    const result = await fetchWithProxy(url)

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: `Failed to fetch: ${error}` }), { status: 500 })
  }
}
