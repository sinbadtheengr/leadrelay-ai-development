import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  type AutomationFit,
  type WebsiteStatus,
  websiteStatusLabel,
  scoreTier,
} from "@/lib/leads"
import { Globe, AlertTriangle, XCircle } from "lucide-react"

export function ScoreBadge({
  score,
  className,
}: {
  score: number
  className?: string
}) {
  const tier = scoreTier(score)
  const styles = {
    high: "bg-primary/10 text-primary border-primary/20",
    medium: "bg-chart-3/15 text-foreground border-chart-3/30",
    low: "bg-muted text-muted-foreground border-border",
  }[tier]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm font-semibold tabular-nums",
        styles,
        className,
      )}
    >
      {score}
      <span className="text-xs font-normal opacity-70">/100</span>
    </span>
  )
}

export function WebsiteStatusBadge({ status }: { status: WebsiteStatus }) {
  const config = {
    none: {
      icon: XCircle,
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    outdated: {
      icon: AlertTriangle,
      className: "bg-chart-5/15 text-foreground border-chart-5/30",
    },
    modern: {
      icon: Globe,
      className: "bg-chart-4/15 text-foreground border-chart-4/30",
    },
  }[status]
  const Icon = config.icon
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", config.className)}>
      <Icon className="h-3.5 w-3.5" />
      {websiteStatusLabel[status]}
    </Badge>
  )
}

export function AutomationFitBadge({ fit }: { fit: AutomationFit }) {
  const className = {
    High: "bg-primary/10 text-primary border-primary/20",
    Medium: "bg-accent text-accent-foreground border-border",
    Low: "bg-muted text-muted-foreground border-border",
  }[fit]
  return (
    <Badge variant="outline" className={cn("font-medium", className)}>
      {fit}
    </Badge>
  )
}
