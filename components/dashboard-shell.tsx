import Link from "next/link"
import { Logo } from "@/components/site-header"
import { Button } from "@/components/ui/button"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo />
            <span className="hidden rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground sm:inline">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button render={<Link href="/" />} variant="ghost" size="sm">
              Back to site
            </Button>
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
              aria-hidden="true"
            >
              AR
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
