import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import {
  ArrowRight,
  Search,
  Gauge,
  Sparkles,
  MapPin,
  CalendarCheck,
  MessageSquareText,
  ShieldCheck,
  Database,
} from "lucide-react"

const features = [
  {
    icon: Search,
    title: "Local business discovery",
    description:
      "Search any city and category to surface local businesses, complete with ratings, reviews, and contact details.",
  },
  {
    icon: Gauge,
    title: "Opportunity scoring",
    description:
      "Every opportunity is scored 0–100 based on website gaps, automation fit, and revenue potential so you prioritize the best accounts.",
  },
  {
    icon: MapPin,
    title: "AI Opportunity Analysis",
    description:
      "Instantly see who has no site, an outdated one, or a modern one — and exactly what they're missing.",
  },
  {
    icon: CalendarCheck,
    title: "Booking & automation fit",
    description:
      "Identify which businesses are ideal for online booking, intake, and AI customer follow-up systems.",
  },
  {
    icon: MessageSquareText,
    title: "Campaign Builder",
    description:
      "Generate tailored, ready-to-send campaign emails for each opportunity in one click — personalized to their gaps.",
  },
  {
    icon: ShieldCheck,
    title: "Campaign-ready signals",
    description:
      "Know which opportunities are verified and ready to contact, with estimated monthly value to focus your pipeline.",
  },
]

const steps = [
  {
    step: "01",
    title: "Search a market",
    description:
      "Enter a city and business category — like Toronto + Beauty Salon — and LeadRelay surfaces matching local businesses.",
  },
  {
    step: "02",
    title: "Review opportunities",
    description:
      "Each business gets an opportunity score, website status, and automation fit so you can spot high-value targets fast.",
  },
  {
    step: "03",
    title: "Build a campaign",
    description:
      "Open an AI Opportunity Analysis, review recommended RelayOps services, then copy a personalized campaign email.",
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.95_0.05_277),transparent)]" />
          <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-powered revenue intelligence for agencies
            </div>
            <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Find, score, and convert local business opportunities.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              LeadRelay AI gives agencies a revenue intelligence workflow for selling websites,
              automation, and growth systems to local businesses with weak digital infrastructure.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button render={<Link href="/dashboard" />} size="lg">
                Open Command Center
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button render={<a href="#how-it-works" />} size="lg" variant="outline">
                See how it works
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Database className="h-4 w-4 text-primary" />
                Aurora PostgreSQL-backed
              </span>
              <span>Prisma-powered API routes</span>
              <span>Optional AI and Places providers</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-primary">Features</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Everything you need to fill your pipeline
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground">
                From market search to campaign copy, LeadRelay AI gives consultants a complete
                workflow for finding and winning local business clients.
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-medium text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-primary">How it works</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                From search to signed client in three steps
              </h2>
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.step} className="relative">
                  <div className="text-sm font-semibold text-primary">{step.step}</div>
                  <div className="mt-3 h-px w-full bg-border" />
                  <h3 className="mt-5 text-lg font-medium text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="rounded-2xl border border-border bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
              <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Start building a higher-value opportunity pipeline
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-primary-foreground/80">
                Search your first market in seconds and see which local businesses are ready for
                websites and AI automation.
              </p>
              <div className="mt-8 flex justify-center">
                <Button render={<Link href="/dashboard" />} size="lg" variant="secondary">
                  Open Command Center
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
