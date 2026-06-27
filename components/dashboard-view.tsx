"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Search, Star, Users, Target, Send, Gauge, ArrowRight } from "lucide-react"

export function DashboardView({ initialLeads }: { initialLeads: Lead[] }) {
  const [city, setCity] = useState("Toronto")
  const [category, setCategory] = useState("Beauty Salon")
  const [query, setQuery] = useState({ city: "", category: "" })
  const [results, setResults] = useState(initialLeads)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      const data = (await response.json()) as { leads?: Lead[] }
      setResults(data.leads ?? [])
      setQuery({ city, category })
    } catch {
      setError("Search failed. Showing the last available lead list.")
    } finally {
      setIsSearching(false)
    }
  }

  const statCards = [
    { label: "Total Leads", value: stats.total, icon: Users },
    { label: "High Opportunity Leads", value: stats.high, icon: Target },
    { label: "Outreach Ready", value: stats.outreachReady, icon: Send },
    {
      label: "Avg. Opportunity Score",
      value: stats.avg,
      suffix: "/100",
      icon: Gauge,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Lead Discovery</h1>
        <p className="text-sm text-muted-foreground">
          Search a market to surface local businesses that need websites and AI automation.
        </p>
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
              {isSearching ? "Searching..." : "Find leads"}
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              <>
                Try{" "}
                <span className="font-medium text-foreground">Toronto + Beauty Salon</span> to see
                example results. If API keys are missing, demo Toronto leads are used.
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

      {/* Results table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">
            {results.length} {results.length === 1 ? "result" : "results"}
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
                  <TableHead>Business Name</TableHead>
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
                      No leads found for this market. Try a different city or category.
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{lead.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {lead.category} · {lead.city}
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
