"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ScoreBadge,
  WebsiteStatusBadge,
  AutomationFitBadge,
} from "@/components/lead-badges"
import { SERVICE_CATALOG, CITIES, type Lead } from "@/lib/leads"
import type { CampaignSummary, DatabaseStatus } from "@/lib/lead-service"
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Database,
  Gauge,
  History,
  Search,
  Send,
  Server,
  Sparkles,
  Star,
  Target,
} from "lucide-react"

export function DashboardView({
  initialLeads,
  initialDatabaseStatus,
  initialCampaigns,
}: {
  initialLeads: Lead[]
  initialDatabaseStatus: DatabaseStatus
  initialCampaigns: CampaignSummary[]
}) {
  const [city, setCity] = useState("Toronto")
  const [category, setCategory] = useState("Beauty Salon")
  const [query, setQuery] = useState({ city: "", category: "" })
  const [results, setResults] = useState(initialLeads)
  const [databaseStatus, setDatabaseStatus] = useState(initialDatabaseStatus)
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [isSearching, setIsSearching] = useState(false)
  const [isSavingCampaign, setIsSavingCampaign] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [campaignMessage, setCampaignMessage] = useState<string | null>(null)

  const stats = useMemo(() => {
    const total = results.length
    const high = results.filter((l) => l.opportunityScore >= 80).length
    const outreachReady = results.filter((l) => l.outreachReady).length
    const avg =
      total === 0
        ? 0
        : Math.round(results.reduce((sum, l) => sum + l.opportunityScore, 0) / total)
    return { total, high, outreachReady, avg }
  }, [results])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, category }),
      })

      if (!response.ok) throw new Error("Search failed")

      const data = (await response.json()) as { leads?: Lead[]; searchRun?: { source?: string } }
      setResults(data.leads ?? [])
      setQuery({ city, category })
      setDatabaseStatus((status) => ({
        ...status,
        dataMode: data.searchRun?.source === "google-places" ? "aurora" : status.dataMode,
        message:
          data.searchRun?.source === "google-places"
            ? "Live Google Places opportunities were saved into Aurora."
            : status.message,
      }))
    } catch {
      setError("Search failed. Showing the last available opportunity list.")
    } finally {
      setIsSearching(false)
    }
  }

  async function saveCampaign() {
    setIsSavingCampaign(true)
    setCampaignMessage(null)

    try {
      const activeCity = query.city || city
      const activeCategory = query.category || category
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${activeCity} ${activeCategory} campaign`,
          city: activeCity,
          category: activeCategory,
          leadIds: results.map((lead) => lead.id),
        }),
      })

      if (!response.ok) throw new Error("Campaign save failed")

      const data = (await response.json()) as { campaign?: CampaignSummary }
      if (data.campaign) {
        setCampaigns((current) => [data.campaign!, ...current.filter((c) => c.id !== data.campaign!.id)].slice(0, 4))
        setCampaignMessage("Campaign saved to the pipeline.")
        setDatabaseStatus((status) => ({
          ...status,
          campaignCount: status.campaignCount + 1,
          message: status.connected
            ? "Campaign saved in Aurora PostgreSQL."
            : "Campaign saved to the active local market dataset.",
        }))
      }
    } catch {
      setCampaignMessage("Unable to save campaign. Keep working from the visible opportunities.")
    } finally {
      setIsSavingCampaign(false)
    }
  }

  const totalPipelineValue = results.reduce((sum, lead) => sum + lead.estimatedMonthlyValue, 0)
  const statCards = [
    {
      label: "Total pipeline value",
      value: `$${totalPipelineValue.toLocaleString()}`,
      suffix: "/mo",
      icon: BriefcaseBusiness,
    },
    { label: "Outreach-ready opportunities", value: stats.outreachReady, icon: Send },
    { label: "High-fit opportunities", value: stats.high, icon: Target },
    {
      label: "Average opportunity score",
      value: stats.avg,
      suffix: "/100",
      icon: Gauge,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">Command Center</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            AI-powered revenue intelligence for local-market growth teams
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Find local businesses with weak or missing websites, score their revenue opportunity,
            generate personalized campaign copy, and save high-fit accounts into your opportunity
            pipeline.
          </p>
        </div>
        <Button onClick={saveCampaign} disabled={results.length === 0 || isSavingCampaign}>
          <BriefcaseBusiness className="h-4 w-4" />
          {isSavingCampaign ? "Saving..." : "Save campaign"}
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
            <CardTitle className="text-base">Platform Health</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-primary">
              <Database className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {databaseStatus.connected ? "Data Platform Connected" : "Local Market Dataset"}
              </span>
              <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                {databaseStatus.connected ? "Aurora PostgreSQL (AWS)" : "Starter Dataset"}
              </span>
              <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                {databaseStatus.authMode}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{databaseStatus.message}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <StatusMetric label="Opportunities stored" value={databaseStatus.leadCount} />
              <StatusMetric label="Market searches retained" value={databaseStatus.searchRunCount} />
              <StatusMetric label="Campaigns stored" value={databaseStatus.campaignCount} />
              <StatusMetric label="AI analyses generated" value={databaseStatus.analysisCount} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <HealthCheck icon={Database} label="Data Platform Connected" active={databaseStatus.connected} />
              <HealthCheck icon={Sparkles} label="AI Analysis Engine Active" active />
              <HealthCheck icon={History} label="Search History Retained" active={databaseStatus.searchRunCount > 0 || databaseStatus.connected} />
              <HealthCheck icon={BriefcaseBusiness} label="Campaign Storage Enabled" active={databaseStatus.campaignCount > 0 || databaseStatus.connected} />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Server className="h-3.5 w-3.5" />
              <span className="truncate">{databaseStatus.endpoint}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {["Search a market", "Review opportunities", "Open AI opportunity analysis", "Generate campaign outreach", "Save to opportunity pipeline"].map(
              (step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </div>
              ),
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search form */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <form
            onSubmit={handleSearch}
            className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Select value={city} onValueChange={(value) => value && setCity(value)}>
                <SelectTrigger id="city">
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Business Category</Label>
              <Select value={category} onValueChange={(value) => value && setCategory(value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATALOG.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="sm:w-auto" disabled={isSearching}>
              <Search className="h-4 w-4" />
              {isSearching ? "Searching..." : "Search market"}
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              <>
                Start with{" "}
                <span className="font-medium text-foreground">Toronto + Beauty Salon</span> to see
                the Local Market Dataset, or connect Google Places for live market discovery.
              </>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-primary">
                <card.icon className="h-4 w-4" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums text-foreground">
                {card.value}
                {card.suffix ? (
                  <span className="text-lg font-normal text-muted-foreground">{card.suffix}</span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaignMessage ? (
              <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                {campaignMessage}
              </p>
            ) : null}
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.leadCount} opportunities · {campaign.targetOffer}
                    </p>
                  </div>
                  <div className="text-right text-sm font-semibold tabular-nums text-foreground">
                    ${campaign.estimatedPipelineValue.toLocaleString()}
                    <span className="block text-xs font-normal text-muted-foreground">/mo opp.</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {(["New", "Qualified", "Outreach", "Won"] as const).map((stage) => (
                    <div key={stage} className="rounded-md bg-muted/40 p-2 text-center">
                      <div className="text-lg font-semibold tabular-nums text-foreground">
                        {campaign.stages[stage]}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{stageLabel(stage)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Business-value summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <SnapshotMetric
              label="Total pipeline value"
              value={`$${totalPipelineValue.toLocaleString()}`}
              suffix="estimated monthly value"
            />
            <SnapshotMetric
              label="Outreach-ready opportunities"
              value={String(stats.outreachReady)}
              suffix="ready for campaign builder"
            />
            <SnapshotMetric
              label="High-fit opportunities"
              value={String(stats.high)}
              suffix={`avg. score ${stats.avg}/100`}
            />
          </CardContent>
        </Card>
      </div>

      {/* Results table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">
            {results.length} {results.length === 1 ? "market opportunity" : "market opportunities"}
            {query.city || query.category ? (
              <span className="ml-2 font-normal text-muted-foreground">
                {[query.category, query.city].filter(Boolean).join(" in ")}
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Website Status</TableHead>
                  <TableHead>Opportunity Score</TableHead>
                  <TableHead>Automation Fit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No opportunities found for this market. Try a different city or category.
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{lead.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {lead.category} · {lead.city}
                          {lead.source ? ` · ${sourceLabel(lead.source)}` : ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm tabular-nums">
                          <Star className="h-3.5 w-3.5 fill-chart-5 text-chart-5" />
                          {lead.rating}
                          <span className="text-muted-foreground">({lead.reviews})</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <WebsiteStatusBadge status={lead.websiteStatus} />
                      </TableCell>
                      <TableCell>
                        <ScoreBadge score={lead.opportunityScore} />
                      </TableCell>
                      <TableCell>
                        <AutomationFitBadge fit={lead.automationFit} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          render={<Link href={`/dashboard/leads/${lead.id}`} />}
                          variant="ghost"
                          size="sm"
                        >
                          View
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function sourceLabel(source: string) {
  if (source === "google-places") return "Google Places"
  if (source === "seed") return "Local Market Dataset"
  return source
}

function stageLabel(stage: "New" | "Qualified" | "Outreach" | "Won") {
  if (stage === "Outreach") return "Campaign"
  return stage
}

function StatusMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted/40 p-3">
      <div className="text-xl font-semibold tabular-nums text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function HealthCheck({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span className="font-medium text-foreground">{label}</span>
      <span className="ml-auto text-primary">{active ? "Active" : "Pending"}</span>
    </div>
  )
}

function SnapshotMetric({
  label,
  value,
  suffix,
}: {
  label: string
  value: string
  suffix: string
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 text-xl font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{suffix}</div>
    </div>
  )
}
