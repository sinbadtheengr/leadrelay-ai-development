import Link from "next/link"
import { notFound } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ScoreBadge,
  WebsiteStatusBadge,
  AutomationFitBadge,
} from "@/components/lead-badges"
import { OutreachEmail } from "@/components/outreach-email"
import { getLeadById } from "@/lib/lead-service"
import { leads, buildOutreachEmail } from "@/lib/leads"
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Globe,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react"

export function generateStaticParams() {
  return leads.map((lead) => ({ id: lead.id }))
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lead = await getLeadById(id)
  if (!lead) notFound()

  const email = buildOutreachEmail(lead)

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Button
          render={<Link href="/dashboard" />}
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to opportunities
        </Button>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{lead.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {lead.category} · {lead.city}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <WebsiteStatusBadge status={lead.websiteStatus} />
            <AutomationFitBadge fit={lead.automationFit} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Business information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Business information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{lead.description}</p>
                <Separator />
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Info icon={Star} label="Rating">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-chart-5 text-chart-5" />
                      {lead.rating} ({lead.reviews} reviews)
                    </span>
                  </Info>
                  <Info icon={Globe} label="Website">
                    {lead.websiteUrl ?? "None found"}
                  </Info>
                  <Info icon={MapPin} label="Address">
                    {lead.address}
                  </Info>
                  <Info icon={Phone} label="Phone">
                    {lead.phone}
                  </Info>
                </dl>
              </CardContent>
            </Card>

            {/* AI opportunity analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Opportunity Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {lead.gaps.map((gap) => (
                    <li key={gap} className="flex items-start gap-3 text-sm">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <span className="text-foreground">{gap}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recommended services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommended RelayOps services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.recommendedServices.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                      ${service.monthlyValue.toLocaleString()}/mo
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Campaign Builder */}
            <Card>
              <CardContent className="pt-6">
                <OutreachEmail leadId={lead.id} email={email} />
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Opportunity score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <ScoreBadge score={lead.opportunityScore} className="text-base" />
                  <span className="text-sm text-muted-foreground">
                    {lead.opportunityScore >= 80
                      ? "High opportunity"
                      : lead.opportunityScore >= 60
                        ? "Medium opportunity"
                        : "Low opportunity"}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${lead.opportunityScore}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estimated monthly value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-primary">
                    <TrendingUp className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-2xl font-semibold tabular-nums text-foreground">
                      ${lead.estimatedMonthlyValue.toLocaleString()}
                      <span className="text-base font-normal text-muted-foreground">/mo</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Projected recurring revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-foreground">Automation fit</p>
                <div className="mt-2">
                  <AutomationFitBadge fit={lead.automationFit} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {lead.outreachReady
                    ? "This opportunity is verified and ready for campaign outreach."
                    : "This opportunity needs more market research before campaign outreach."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

function Info({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-accent text-primary">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium text-foreground">{children}</dd>
      </div>
    </div>
  )
}
