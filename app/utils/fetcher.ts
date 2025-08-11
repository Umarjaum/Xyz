import { XMLParser } from "fast-xml-parser"
import { z } from "zod"

// Schema for sitemap validation
const urlSetSchema = z.object({
  urlset: z.object({
    url: z.array(
      z.object({
        loc: z.string().url(),
        lastmod: z.string().optional(),
        changefreq: z.string().optional(),
        priority: z.number().optional(),
      }),
    ),
  }),
})

export async function fetchWebsiteSource(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0;)",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const text = await response.text()
    return { success: true, data: text }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch website",
    }
  }
}

export async function validateSitemap(url: string) {
  try {
    // Ensure URL ends with sitemap.xml
    const sitemapUrl = url.endsWith("sitemap.xml") ? url : `${url.replace(/\/$/, "")}/sitemap.xml`

    const response = await fetch(sitemapUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SitemapValidator/1.0;)",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status}`)
    }

    const xmlText = await response.text()
    const parser = new XMLParser({ ignoreAttributes: false })
    const parsed = parser.parse(xmlText)

    // Validate against schema
    const result = urlSetSchema.safeParse(parsed)

    if (!result.success) {
      return {
        success: false,
        error: "Invalid sitemap format",
        details: result.error.errors,
      }
    }

    return {
      success: true,
      data: {
        urls: result.data.urlset.url,
        totalUrls: result.data.urlset.url.length,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to validate sitemap",
    }
  }
}
