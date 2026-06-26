"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy, Sparkles } from "lucide-react"

export function OutreachEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable — silently ignore.
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
            <h3 className="text-sm font-medium text-foreground">AI-generated outreach email</h3>
            <p className="text-xs text-muted-foreground">
              Personalized to this lead&apos;s gaps and market.
            </p>
          </div>
        </div>
        <Button onClick={copy} variant={copied ? "secondary" : "default"} size="sm">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy Email"}
        </Button>
      </div>
      <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4 font-sans text-sm leading-relaxed text-foreground">
        {email}
      </pre>
    </div>
  )
}
