"use client"

import * as React from "react"
import { SparklesIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function DashboardSummaryButton() {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [summary, setSummary] = React.useState("")
  const [error, setError] = React.useState("")

  const handleClick = async () => {
    setOpen(true)
    setLoading(true)
    setError("")
    setSummary("")

    try {
      const response = await fetch("/api/dashboard-summary", { method: "POST" })
      const data = (await response.json()) as { summary?: string; error?: string }

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate dashboard summary.")
      }

      setSummary(data.summary || "No summary available.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={handleClick}>
        <SparklesIcon className="size-4" />
        Summarize
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Dashboard summary</h2>
                <p className="text-sm text-muted-foreground">
                  Generated with OpenAI Responses API using gpt-5.4.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close summary modal"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm leading-6">
              {loading
                ? "Generating summary..."
                : error || summary || "No summary available."}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
