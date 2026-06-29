import { getDatabaseUrl, usesIamDatabaseAuth } from "@/lib/aws-rds-iam"
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma"
import {
  buildOutreachEmail,
  leads as seededLeads,
  type AutomationFit,
  type Lead,
  type WebsiteStatus,
} from "@/lib/leads"

type RecommendedService = Lead["recommendedServices"][number]

export type LeadAnalysisResult = {
  id?: string
  leadId: string
  summary: string
  gaps: string[]
  recommendedServices: RecommendedService[]
  opportunityScore: number
  automationFit: AutomationFit
  estimatedMonthlyValue: number
  source: "openai" | "mock"
  createdAt?: string
}

export type SearchResult = {
  leads: Lead[]
  searchRun: {
    id?: string
    city: string
    category: string
    query: string
    resultCount: number
    usedDemoData: boolean
    source: "google-places" | "aurora-seed" | "seed"
  }
}

export type DatabaseStatus = {
  connected: boolean
  provider: string
  authMode: string
  endpoint: string
  database: string
  schema: string
  leadCount: number
  searchRunCount: number
  campaignCount: number
  analysisCount: number
  dataMode: "aurora" | "demo"
  message: string
  lastVerifiedAt: string
}

export type CampaignSummary = {
  id: string
  name: string
  city: string
  category: string
  targetOffer: string
  status: string
  leadCount: number
  estimatedPipelineValue: number
  stages: {
    New: number
    Qualified: number
    Outreach: number
    Won: number
  }
  createdAt: string
}

const globalForDemo = globalThis as unknown as {
  leadRelayDemoLeads?: Map<string, Lead>
  leadRelaySeedDataEnsured?: boolean
}

function demoLeads() {
  if (!globalForDemo.leadRelayDemoLeads) {
    globalForDemo.leadRelayDemoLeads = new Map(seededLeads.map((lead) => [lead.id, lead]))
  }
  return globalForDemo.leadRelayDemoLeads
}

export async function listLeads(filters: { city?: string; category?: string } = {}) {
  const db = getPrisma()
  if (!db) return filterSeedLeads(filters)

  try {
    await ensureSeedData()
    const records = await db.lead.findMany({
      where: {
        city: filters.city || undefined,
        category: filters.category || undefined,
      },
      orderBy: [{ opportunityScore: "desc" }, { reviews: "desc" }],
    })
    return records.map(toLead)
  } catch (error) {
    console.warn("Falling back to local market dataset after database read failed.", error)
    return filterSeedLeads(filters)
  }
}

export async function getDashboardDatabaseStatus(): Promise<DatabaseStatus> {
  const databaseUrl = getDatabaseUrl()
  const endpoint = databaseUrl?.hostname ?? "Not configured"
  const database = databaseUrl?.pathname.replace(/^\//, "") || "demo"
  const schema = databaseUrl?.searchParams.get("schema") ?? "public"
  const base = {
    provider: "Amazon Aurora PostgreSQL",
    authMode: usesIamDatabaseAuth() ? "AWS IAM database auth" : "Password auth",
    endpoint,
    database,
    schema,
    lastVerifiedAt: new Date().toISOString(),
  }

  if (!hasDatabaseUrl()) {
    return {
      ...base,
      connected: false,
      leadCount: seededLeads.length,
      searchRunCount: 0,
      campaignCount: 0,
      analysisCount: 0,
      dataMode: "demo",
      message: "Local Market Dataset is active because the data platform is not configured.",
    }
  }

  const db = getPrisma()
  if (!db) {
    return {
      ...base,
      connected: false,
      leadCount: seededLeads.length,
      searchRunCount: 0,
      campaignCount: 0,
      analysisCount: 0,
      dataMode: "demo",
      message: "Data infrastructure is configured, but Prisma could not initialize.",
    }
  }

  try {
    const [leadCount, searchRunCount, campaignCount, analysisCount] = await Promise.all([
      db.lead.count(),
      db.searchRun.count(),
      db.campaign.count(),
      db.leadAnalysis.count(),
    ])

    return {
      ...base,
      connected: true,
      leadCount,
      searchRunCount,
      campaignCount,
      analysisCount,
      dataMode: "aurora",
      message: "Aurora PostgreSQL is connected. Opportunities, market searches, analyses, and campaigns are retained.",
    }
  } catch (error) {
    console.warn("Unable to verify database status.", error)
    return {
      ...base,
      connected: false,
      leadCount: seededLeads.length,
      searchRunCount: 0,
      campaignCount: 0,
      analysisCount: 0,
      dataMode: "demo",
      message: "Aurora is configured, but the Local Market Dataset is active after a connection error.",
    }
  }
}

export async function listCampaigns(): Promise<CampaignSummary[]> {
  const db = getPrisma()
  if (!db) return localMarketCampaigns()

  try {
    const campaigns = await db.campaign.findMany({
      include: { leads: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    })
    if (campaigns.length === 0) return localMarketCampaigns()
    return campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      city: campaign.city,
      category: campaign.category,
      targetOffer: campaign.targetOffer,
      status: campaign.status,
      leadCount: campaign.leads.length,
      estimatedPipelineValue: campaign.estimatedPipelineValue,
      stages: summarizeStages(campaign.leads.map((lead) => lead.stage)),
      createdAt: campaign.createdAt.toISOString(),
    }))
  } catch (error) {
    console.warn("Unable to load campaigns; using local market campaign.", error)
    return localMarketCampaigns()
  }
}

export async function createCampaign({
  name,
  city,
  category,
  leadIds,
}: {
  name: string
  city: string
  category: string
  leadIds: string[]
}): Promise<CampaignSummary> {
  const uniqueLeadIds = Array.from(new Set(leadIds)).filter(Boolean)
  const leads = await Promise.all(uniqueLeadIds.map((id) => getLeadById(id)))
  const validLeads = leads.filter((lead): lead is Lead => Boolean(lead))
  const estimatedPipelineValue = validLeads.reduce(
    (sum, lead) => sum + lead.estimatedMonthlyValue,
    0,
  )
  const fallback = {
    id: `local-${slugify(name || `${category}-${city}`)}`,
    name: name || `${city} ${category} outreach`,
    city,
    category,
    targetOffer: "Website + AI automation",
    status: "Active",
    leadCount: validLeads.length,
    estimatedPipelineValue,
    stages: summarizeStages(validLeads.map((_lead, index) => (index === 0 ? "Qualified" : "New"))),
    createdAt: new Date().toISOString(),
  }

  const db = getPrisma()
  if (!db || validLeads.length === 0) return fallback

  try {
    await upsertLeads(validLeads, validLeads[0]?.source ?? "seed")
    const campaign = await db.campaign.create({
      data: {
        name: fallback.name,
        city,
        category,
        targetOffer: fallback.targetOffer,
        estimatedPipelineValue,
        leads: {
          create: validLeads.map((lead, index) => ({
            leadId: lead.id,
            stage: index === 0 ? "Qualified" : "New",
            position: index,
          })),
        },
      },
      include: { leads: true },
    })

    return {
      id: campaign.id,
      name: campaign.name,
      city: campaign.city,
      category: campaign.category,
      targetOffer: campaign.targetOffer,
      status: campaign.status,
      leadCount: campaign.leads.length,
      estimatedPipelineValue: campaign.estimatedPipelineValue,
      stages: summarizeStages(campaign.leads.map((lead) => lead.stage)),
      createdAt: campaign.createdAt.toISOString(),
    }
  } catch (error) {
    console.warn("Unable to persist campaign; returning local market campaign.", error)
    return fallback
  }
}

export async function getLeadById(id: string) {
  const db = getPrisma()
  if (!db) return demoLeads().get(id)

  try {
    await ensureSeedData()
    const record = await db.lead.findUnique({ where: { id } })
    return record ? toLead(record) : demoLeads().get(id)
  } catch (error) {
    console.warn("Falling back to local market lead after database lookup failed.", error)
    return demoLeads().get(id)
  }
}

export async function searchLeads(city: string, category: string): Promise<SearchResult> {
  const normalizedCity = city.trim() || "Toronto"
  const normalizedCategory = category.trim() || "Beauty Salon"
  const query = `${normalizedCategory} in ${normalizedCity}`
  const db = getPrisma()
  const canUseGoogle = Boolean(process.env.GOOGLE_PLACES_API_KEY?.trim())

  if (canUseGoogle) {
    try {
      const googleLeads = await searchGooglePlaces(normalizedCity, normalizedCategory)
      if (googleLeads.length > 0) {
        googleLeads.forEach((lead) => demoLeads().set(lead.id, lead))
        if (db) await upsertLeads(googleLeads, "google-places")
        const searchRun = await recordSearchRun({
          city: normalizedCity,
          category: normalizedCategory,
          query,
          resultCount: googleLeads.length,
          usedDemoData: false,
          source: "google-places",
        })
        return { leads: googleLeads, searchRun }
      }
    } catch (error) {
      console.warn("Google Places search failed; using local market dataset.", error)
    }
  }

  if (db) {
    try {
      await ensureSeedData()
      const records = await db.lead.findMany({
        where: {
          city: normalizedCity,
          category: normalizedCategory,
        },
        orderBy: [{ opportunityScore: "desc" }, { reviews: "desc" }],
      })

      if (records.length > 0) {
        const leads = records.map(toLead)
        const searchRun = await recordSearchRun({
          city: normalizedCity,
          category: normalizedCategory,
          query,
          resultCount: leads.length,
          usedDemoData: false,
          source: "aurora-seed",
        })

        return { leads, searchRun }
      }
    } catch (error) {
      console.warn("Aurora market search failed; using local market dataset.", error)
    }
  }

  const fallbackLeads = filterSeedLeads({ city: normalizedCity, category: normalizedCategory })
  const searchRun = await recordSearchRun({
    city: normalizedCity,
    category: normalizedCategory,
    query,
    resultCount: fallbackLeads.length,
    usedDemoData: true,
    source: "seed",
  })

  return { leads: fallbackLeads, searchRun }
}

export async function analyzeLead(leadId: string): Promise<LeadAnalysisResult | null> {
  const lead = await getLeadById(leadId)
  if (!lead) return null

  const analysis = process.env.OPENAI_API_KEY?.trim()
    ? await generateOpenAIAnalysis(lead).catch((error) => {
        console.warn("OpenAI analysis failed; using mock analysis.", error)
        return generateMockAnalysis(lead)
      })
    : generateMockAnalysis(lead)

  const db = getPrisma()
  if (!db) return analysis

  try {
    const saved = await db.leadAnalysis.create({
      data: {
        leadId,
        summary: analysis.summary,
        gaps: analysis.gaps,
        recommendedServices: analysis.recommendedServices,
        opportunityScore: analysis.opportunityScore,
        automationFit: analysis.automationFit,
        estimatedMonthlyValue: analysis.estimatedMonthlyValue,
        rawResponse: analysis.source === "openai" ? analysis : undefined,
        source: analysis.source,
      },
    })
    return { ...analysis, id: saved.id, createdAt: saved.createdAt.toISOString() }
  } catch (error) {
    console.warn("Unable to persist lead analysis; returning generated result.", error)
    return analysis
  }
}

export async function generateOutreach(leadId: string) {
  const lead = await getLeadById(leadId)
  if (!lead) return null

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return { email: buildOutreachEmail(lead), source: "mock" as const }
  }

  try {
    const email = await callOpenAIText(
      [
        "Write a concise, high-quality cold outreach email for a web and AI automation agency.",
        "Use a specific subject line, reference the business reputation, name two practical gaps,",
        "offer a 15-minute call, and avoid hype.",
      ].join(" "),
      JSON.stringify(lead),
    )
    return { email: email.trim(), source: "openai" as const }
  } catch (error) {
    console.warn("OpenAI outreach failed; using mock email.", error)
    return { email: buildOutreachEmail(lead), source: "mock" as const }
  }
}

async function ensureSeedData() {
  const db = getPrisma()
  if (!db) return
  if (globalForDemo.leadRelaySeedDataEnsured) return

  await upsertLeads(seededLeads, "seed")
  globalForDemo.leadRelaySeedDataEnsured = true
}

async function upsertLeads(leads: Lead[], source: string) {
  const db = getPrisma()
  if (!db) return

  await Promise.all(
    leads.map((lead) =>
      db.lead.upsert({
        where: { id: lead.id },
        create: toPrismaLead(lead, source),
        update: toPrismaLead(lead, source),
      }),
    ),
  )
}

async function recordSearchRun(run: SearchResult["searchRun"]) {
  const db = getPrisma()
  if (!db) return run

  try {
    const saved = await db.searchRun.create({ data: run })
    return { ...run, id: saved.id }
  } catch (error) {
    console.warn("Unable to persist search run.", error)
    return run
  }
}

function filterSeedLeads(filters: { city?: string; category?: string }) {
  const allDemoLeads = Array.from(demoLeads().values())
  const exact = allDemoLeads.filter((lead) => {
    const cityMatch = !filters.city || lead.city === filters.city
    const categoryMatch = !filters.category || lead.category === filters.category
    return cityMatch && categoryMatch
  })
  if (exact.length > 0 || (!filters.city && !filters.category)) return exact

  const torontoCategory = allDemoLeads.filter(
    (lead) => lead.city === "Toronto" && (!filters.category || lead.category === filters.category),
  )
  return torontoCategory.length > 0
    ? torontoCategory
    : allDemoLeads.filter((lead) => lead.city === "Toronto")
}

function localMarketCampaigns(): CampaignSummary[] {
  const priorityLeads = seededLeads.filter((lead) => lead.outreachReady).slice(0, 4)
  return [
    {
      id: "local-toronto-beauty-launch",
      name: "Toronto local services launch",
      city: "Toronto",
      category: "Beauty Salon",
      targetOffer: "Website + booking automation",
      status: "Active",
      leadCount: priorityLeads.length,
      estimatedPipelineValue: priorityLeads.reduce(
        (sum, lead) => sum + lead.estimatedMonthlyValue,
        0,
      ),
      stages: {
        New: 2,
        Qualified: 1,
        Outreach: 1,
        Won: 0,
      },
      createdAt: new Date().toISOString(),
    },
  ]
}

function summarizeStages(stages: string[]) {
  return stages.reduce(
    (summary, stage) => {
      if (stage === "Qualified") summary.Qualified += 1
      else if (stage === "Outreach") summary.Outreach += 1
      else if (stage === "Won") summary.Won += 1
      else summary.New += 1
      return summary
    },
    { New: 0, Qualified: 0, Outreach: 0, Won: 0 },
  )
}

async function searchGooglePlaces(city: string, category: string) {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.types",
    },
    body: JSON.stringify({
      textQuery: `${category} in ${city}, Canada`,
      languageCode: "en",
      regionCode: "CA",
      maxResultCount: 10,
    }),
  })

  if (!response.ok) {
    throw new Error(`Google Places returned ${response.status}`)
  }

  const payload = (await response.json()) as {
    places?: Array<{
      id?: string
      displayName?: { text?: string }
      formattedAddress?: string
      nationalPhoneNumber?: string
      rating?: number
      userRatingCount?: number
      websiteUri?: string
    }>
  }

  return (payload.places ?? [])
    .filter((place) => place.displayName?.text)
    .map((place) => googlePlaceToLead(place, city, category))
}

function googlePlaceToLead(
  place: {
    id?: string
    displayName?: { text?: string }
    formattedAddress?: string
    nationalPhoneNumber?: string
    rating?: number
    userRatingCount?: number
    websiteUri?: string
  },
  city: string,
  category: string,
): Lead {
  const name = place.displayName?.text ?? "Local Business"
  const rating = place.rating ?? 4.3
  const reviews = place.userRatingCount ?? 25
  const websiteStatus = determineWebsiteStatus(place.websiteUri, reviews)
  const opportunityScore = scoreLead({ websiteStatus, rating, reviews })
  const automationFit = fitForScore(opportunityScore)
  const recommendedServices = servicesForCategory(category, websiteStatus)
  const estimatedMonthlyValue = recommendedServices.reduce(
    (sum, service) => sum + service.monthlyValue,
    0,
  )

  return {
    id: `google-${slugify(name)}-${slugify(place.id ?? place.formattedAddress ?? city)}`.slice(
      0,
      120,
    ),
    name,
    category,
    city,
    address: place.formattedAddress ?? `${city}, ON`,
    phone: place.nationalPhoneNumber ?? "Phone not listed",
    rating,
    reviews,
    websiteStatus,
    websiteUrl: place.websiteUri ?? null,
    opportunityScore,
    automationFit,
    estimatedMonthlyValue,
    outreachReady: opportunityScore >= 70,
    description: `${name} is a ${category.toLowerCase()} in ${city} with ${rating.toFixed(
      1,
    )} stars across ${reviews} Google reviews. LeadRelay flagged it for website and customer automation opportunities.`,
    gaps: gapsForWebsiteStatus(websiteStatus),
    recommendedServices,
  }
}

function determineWebsiteStatus(websiteUrl: string | undefined, reviews: number): WebsiteStatus {
  if (!websiteUrl) return "none"
  return reviews > 80 ? "outdated" : "modern"
}

function scoreLead({
  websiteStatus,
  rating,
  reviews,
}: {
  websiteStatus: WebsiteStatus
  rating: number
  reviews: number
}) {
  const websiteScore = websiteStatus === "none" ? 42 : websiteStatus === "outdated" ? 28 : 10
  const reputationScore = Math.min(28, Math.round(rating * 4 + Math.log10(reviews + 1) * 5))
  const demandScore = Math.min(25, Math.round(Math.log10(reviews + 1) * 10))
  return Math.min(96, websiteScore + reputationScore + demandScore)
}

function fitForScore(score: number): AutomationFit {
  if (score >= 80) return "High"
  if (score >= 60) return "Medium"
  return "Low"
}

function gapsForWebsiteStatus(status: WebsiteStatus) {
  if (status === "none") {
    return [
      "No dedicated website found",
      "No owned lead capture or booking flow",
      "Customer follow-up likely depends on manual calls and DMs",
      "Limited control over local SEO and conversion tracking",
    ]
  }
  if (status === "outdated") {
    return [
      "Website likely needs mobile and speed improvements",
      "No clear online booking or intake automation",
      "Weak conversion path from Google search to booked appointment",
      "No automated review request or win-back workflow visible",
    ]
  }
  return [
    "Modern website but limited automated follow-up visible",
    "Lead capture could be stronger for high-intent visitors",
    "AI intake or chat could reduce missed inquiries",
  ]
}

function servicesForCategory(category: string, websiteStatus: WebsiteStatus): RecommendedService[] {
  const websiteService =
    websiteStatus === "none"
      ? {
          name: "Conversion-focused website",
          description: "Mobile-first site with services, proof, and direct lead capture.",
          monthlyValue: 800,
        }
      : {
          name: "Website conversion upgrade",
          description: "Speed, mobile UX, local SEO, and booking-focused landing pages.",
          monthlyValue: 650,
        }

  const categoryLower = category.toLowerCase()
  const bookingService = categoryLower.includes("restaurant")
    ? {
        name: "Direct reservation automation",
        description: "Commission-free booking flow with automated confirmations.",
        monthlyValue: 550,
      }
    : categoryLower.includes("law")
      ? {
          name: "AI intake assistant",
          description: "Qualify prospects and route consultation requests automatically.",
          monthlyValue: 1200,
        }
      : {
          name: "Booking and intake automation",
          description: "Self-serve scheduling, reminders, deposits, and intake forms.",
          monthlyValue: 850,
        }

  return [
    websiteService,
    bookingService,
    {
      name: "AI follow-up workflow",
      description: "Review requests, no-show recovery, and nurture messages for new leads.",
      monthlyValue: 650,
    },
  ]
}

function generateMockAnalysis(lead: Lead): LeadAnalysisResult {
  return {
    leadId: lead.id,
    summary: `${lead.name} is a strong fit for LeadRelay because it already has local demand, visible customer proof, and clear conversion gaps. The fastest win is turning its existing reputation into owned bookings and repeatable follow-up.`,
    gaps: lead.gaps,
    recommendedServices: lead.recommendedServices,
    opportunityScore: lead.opportunityScore,
    automationFit: lead.automationFit,
    estimatedMonthlyValue: lead.estimatedMonthlyValue,
    source: "mock",
  }
}

async function generateOpenAIAnalysis(lead: Lead): Promise<LeadAnalysisResult> {
  const schema = {
    type: "object",
    additionalProperties: false,
    required: [
      "summary",
      "gaps",
      "recommendedServices",
      "opportunityScore",
      "automationFit",
      "estimatedMonthlyValue",
    ],
    properties: {
      summary: { type: "string" },
      gaps: { type: "array", items: { type: "string" } },
      recommendedServices: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "description", "monthlyValue"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            monthlyValue: { type: "number" },
          },
        },
      },
      opportunityScore: { type: "number" },
      automationFit: { type: "string", enum: ["High", "Medium", "Low"] },
      estimatedMonthlyValue: { type: "number" },
    },
  }

  const payload = await callOpenAIJson(
    "Analyze this local business as an agency lead. Return practical, sales-ready JSON.",
    JSON.stringify(lead),
    schema,
  )

  return {
    leadId: lead.id,
    summary: String(payload.summary),
    gaps: Array.isArray(payload.gaps) ? payload.gaps.map(String) : lead.gaps,
    recommendedServices: normalizeServices(payload.recommendedServices, lead.recommendedServices),
    opportunityScore: clampScore(Number(payload.opportunityScore) || lead.opportunityScore),
    automationFit: normalizeFit(payload.automationFit, lead.automationFit),
    estimatedMonthlyValue:
      Number(payload.estimatedMonthlyValue) || lead.estimatedMonthlyValue,
    source: "openai",
  }
}

async function callOpenAIText(instructions: string, input: string) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      instructions,
      input,
    }),
  })

  if (!response.ok) throw new Error(`OpenAI returned ${response.status}`)

  const payload = await response.json()
  return extractOutputText(payload)
}

async function callOpenAIJson(instructions: string, input: string, schema: object) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      instructions,
      input,
      text: {
        format: {
          type: "json_schema",
          name: "lead_analysis",
          schema,
          strict: true,
        },
      },
    }),
  })

  if (!response.ok) throw new Error(`OpenAI returned ${response.status}`)

  const payload = await response.json()
  return JSON.parse(extractOutputText(payload)) as Record<string, unknown>
}

function extractOutputText(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "output_text" in payload &&
    typeof payload.output_text === "string"
  ) {
    return payload.output_text
  }

  const output = (payload as { output?: Array<{ content?: Array<{ text?: string }> }> }).output
  const text = output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n")

  if (!text) throw new Error("OpenAI response did not include output text.")
  return text
}

function normalizeServices(value: unknown, fallback: RecommendedService[]) {
  if (!Array.isArray(value)) return fallback
  return value
    .map((service) => {
      if (!service || typeof service !== "object") return null
      const record = service as Record<string, unknown>
      return {
        name: String(record.name ?? ""),
        description: String(record.description ?? ""),
        monthlyValue: Number(record.monthlyValue ?? 0),
      }
    })
    .filter((service): service is RecommendedService => Boolean(service?.name))
}

function normalizeFit(value: unknown, fallback: AutomationFit): AutomationFit {
  return value === "High" || value === "Medium" || value === "Low" ? value : fallback
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)))
}

function toPrismaLead(lead: Lead, source: string) {
  return {
    id: lead.id,
    name: lead.name,
    category: lead.category,
    city: lead.city,
    address: lead.address,
    phone: lead.phone,
    rating: lead.rating,
    reviews: lead.reviews,
    websiteStatus: lead.websiteStatus,
    websiteUrl: lead.websiteUrl,
    opportunityScore: lead.opportunityScore,
    automationFit: lead.automationFit,
    estimatedMonthlyValue: lead.estimatedMonthlyValue,
    outreachReady: lead.outreachReady,
    description: lead.description,
    gaps: lead.gaps,
    recommendedServices: lead.recommendedServices,
    source,
  }
}

function toLead(record: {
  id: string
  name: string
  category: string
  city: string
  address: string
  phone: string
  rating: number
  reviews: number
  websiteStatus: WebsiteStatus
  websiteUrl: string | null
  opportunityScore: number
  automationFit: AutomationFit
  estimatedMonthlyValue: number
  outreachReady: boolean
  description: string
  gaps: unknown
  recommendedServices: unknown
  source?: string
}): Lead {
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    city: record.city,
    address: record.address,
    phone: record.phone,
    rating: record.rating,
    reviews: record.reviews,
    websiteStatus: record.websiteStatus,
    websiteUrl: record.websiteUrl,
    opportunityScore: record.opportunityScore,
    automationFit: record.automationFit,
    estimatedMonthlyValue: record.estimatedMonthlyValue,
    outreachReady: record.outreachReady,
    description: record.description,
    gaps: Array.isArray(record.gaps) ? record.gaps.map(String) : [],
    recommendedServices: normalizeServices(record.recommendedServices, []),
    source: record.source,
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
