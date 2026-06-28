"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy, RefreshCw, Sparkles } from "lucide-react"

export function OutreachEmail({ leadId, email }: { leadId: string; email: string }) {
  const [currentEmail, setCurrentEmail] = useState(email)
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(currentEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable — silently ignore.
    }
  }

  async function regenerate() {
    setIsGenerating(true)
    try {
      const response = await fetch(`/api/leads/${leadId}/outreach`, { method: "POST" })
      if (!response.ok) throw new Error("Outreach generation failed")
      const data = (await response.json()) as { email?: string }
      if (data.email) setCurrentEmail(data.email)
    } catch {
      // The server already falls back to mock mode; keep the current email if the request fails.
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-medium text-foreground">Campaign Builder</h3>
            <p className="text-xs text-muted-foreground">
              Personalized outreach copy based on this opportunity&apos;s gaps and market.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button onClick={regenerate} variant="outline" size="sm" disabled={isGenerating}>
            <RefreshCw className="h-4 w-4" />
            {isGenerating ? "Generating" : "Refresh"}
          </Button>
          <Button onClick={copy} variant={copied ? "secondary" : "default"} size="sm">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy Email"}
          </Button>
        </div>
      </div>
      <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4 font-sans text-sm leading-relaxed text-foreground">
        {currentEmail}
      </pre>
    </div>
  )
}
