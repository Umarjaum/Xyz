"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [mode, setMode] = useState<"source" | "sitemap">("source")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const endpoint = mode === "source" ? "/api/fetch" : "/api/validate-sitemap"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Website Analyzer</CardTitle>
            <CardDescription>Fetch source code or validate sitemaps from any website</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <Input
                  type="url"
                  placeholder="Enter website URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant={mode === "source" ? "default" : "outline"}
                  onClick={() => setMode("source")}
                >
                  Source
                </Button>
                <Button
                  type="button"
                  variant={mode === "sitemap" ? "default" : "outline"}
                  onClick={() => setMode("sitemap")}
                >
                  Sitemap
                </Button>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Processing..." : "Analyze"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && (
              <div className="w-full">
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
