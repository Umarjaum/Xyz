import type { SitemapValidationResult } from "@/types"
import { XMLParser } from "fast-xml-parser"

export async function validateSitemap(xml: string): Promise<SitemapValidationResult> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  })

  try {
    const result = parser.parse(xml)
    const errors: string[] = []
    const urls: string[] = []
    let lastModified: string | undefined

    // Check if it's a valid sitemap
    if (!result.urlset && !result.sitemapindex) {
      errors.push("Invalid sitemap: Missing urlset or sitemapindex")
      return { isValid: false, errors, urls: [] }
    }

    // Process URLs from urlset
    if (result.urlset?.url) {
      const urlEntries = Array.isArray(result.urlset.url) ? result.urlset.url : [result.urlset.url]

      urlEntries.forEach((entry: any) => {
        if (entry.loc) {
          urls.push(entry.loc)
          if (entry.lastmod) {
            lastModified = entry.lastmod
          }
        } else {
          errors.push(`Invalid URL entry: Missing location`)
        }
      })
    }

    // Process sitemap index
    if (result.sitemapindex?.sitemap) {
      const sitemaps = Array.isArray(result.sitemapindex.sitemap)
        ? result.sitemapindex.sitemap
        : [result.sitemapindex.sitemap]

      sitemaps.forEach((sitemap: any) => {
        if (sitemap.loc) {
          urls.push(sitemap.loc)
          if (sitemap.lastmod) {
            lastModified = sitemap.lastmod
          }
        } else {
          errors.push(`Invalid sitemap entry: Missing location`)
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      urls,
      lastModified,
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Failed to parse XML: ${error}`],
      urls: [],
    }
  }
}
