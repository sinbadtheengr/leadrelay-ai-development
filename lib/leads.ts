export type WebsiteStatus = "none" | "outdated" | "modern"
export type AutomationFit = "High" | "Medium" | "Low"

export type Lead = {
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
  gaps: string[]
  recommendedServices: {
    name: string
    description: string
    monthlyValue: number
  }[]
}

export const SERVICE_CATALOG = [
  "Beauty Salon",
  "Dental Clinic",
  "Auto Repair",
  "Restaurant",
  "Law Firm",
  "Fitness Studio",
  "Real Estate Agency",
  "Med Spa",
]

export const CITIES = ["Toronto", "Vancouver", "Calgary", "Montreal", "Ottawa"]

export const leads: Lead[] = [
  {
    id: "luxe-beauty-bar",
    name: "Luxe Beauty Bar",
    category: "Beauty Salon",
    city: "Toronto",
    address: "212 Queen St W, Toronto, ON",
    phone: "(416) 555-0142",
    rating: 4.8,
    reviews: 326,
    websiteStatus: "none",
    websiteUrl: null,
    opportunityScore: 94,
    automationFit: "High",
    estimatedMonthlyValue: 2400,
    outreachReady: true,
    description:
      "High-volume beauty salon with strong reviews but no online presence beyond a social profile. Bookings are handled manually over the phone.",
    gaps: [
      "No website — only an Instagram page",
      "No online booking system",
      "No automated appointment reminders",
      "No review collection workflow",
    ],
    recommendedServices: [
      {
        name: "Conversion-focused website",
        description: "Modern, mobile-first site with service menu and gallery.",
        monthlyValue: 800,
      },
      {
        name: "Online booking automation",
        description: "Self-serve booking with calendar sync and deposits.",
        monthlyValue: 900,
      },
      {
        name: "AI follow-up & reminders",
        description: "Automated SMS reminders and rebooking nudges.",
        monthlyValue: 700,
      },
    ],
  },
  {
    id: "north-end-dental",
    name: "North End Dental",
    category: "Dental Clinic",
    city: "Toronto",
    address: "88 Yonge St, Toronto, ON",
    phone: "(416) 555-0188",
    rating: 4.6,
    reviews: 198,
    websiteStatus: "outdated",
    websiteUrl: "northenddental.example",
    opportunityScore: 81,
    automationFit: "High",
    estimatedMonthlyValue: 3100,
    outreachReady: true,
    description:
      "Established dental clinic with an outdated, non-responsive website. New patient intake is entirely manual and slow.",
    gaps: [
      "Website not mobile responsive",
      "No new-patient intake forms online",
      "No automated recall reminders",
      "Slow page load and poor SEO",
    ],
    recommendedServices: [
      {
        name: "Website rebuild",
        description: "Fast, accessible site optimized for local SEO.",
        monthlyValue: 1100,
      },
      {
        name: "Patient intake automation",
        description: "Digital intake forms synced to practice software.",
        monthlyValue: 1000,
      },
      {
        name: "AI recall & follow-up",
        description: "Automated 6-month recall and no-show recovery.",
        monthlyValue: 1000,
      },
    ],
  },
  {
    id: "gearhead-auto",
    name: "Gearhead Auto Repair",
    category: "Auto Repair",
    city: "Toronto",
    address: "540 Dundas St E, Toronto, ON",
    phone: "(416) 555-0210",
    rating: 4.4,
    reviews: 142,
    websiteStatus: "none",
    websiteUrl: null,
    opportunityScore: 88,
    automationFit: "Medium",
    estimatedMonthlyValue: 1800,
    outreachReady: true,
    description:
      "Busy independent auto shop relying entirely on walk-ins and phone calls. No digital quoting or scheduling.",
    gaps: [
      "No website or online quotes",
      "No appointment scheduling",
      "Missing from local map searches",
      "No customer follow-up after service",
    ],
    recommendedServices: [
      {
        name: "Lead-gen website",
        description: "Service pages with instant quote request forms.",
        monthlyValue: 700,
      },
      {
        name: "Booking & quoting automation",
        description: "Online scheduling with automated quote replies.",
        monthlyValue: 600,
      },
      {
        name: "AI review requests",
        description: "Automated post-service review and rebooking texts.",
        monthlyValue: 500,
      },
    ],
  },
  {
    id: "maple-bistro",
    name: "Maple & Oak Bistro",
    category: "Restaurant",
    city: "Toronto",
    address: "19 Baldwin St, Toronto, ON",
    phone: "(416) 555-0299",
    rating: 4.7,
    reviews: 512,
    websiteStatus: "outdated",
    websiteUrl: "mapleoakbistro.example",
    opportunityScore: 72,
    automationFit: "Medium",
    estimatedMonthlyValue: 1500,
    outreachReady: false,
    description:
      "Popular bistro with a dated website. Reservations come through a third party with high commission fees.",
    gaps: [
      "Outdated menu and photos online",
      "Reliant on costly third-party reservations",
      "No email list or marketing automation",
    ],
    recommendedServices: [
      {
        name: "Website refresh",
        description: "Refreshed brand site with live menu and gallery.",
        monthlyValue: 600,
      },
      {
        name: "Direct reservation system",
        description: "Commission-free bookings with table management.",
        monthlyValue: 500,
      },
      {
        name: "AI marketing automation",
        description: "Automated email and SMS campaigns for regulars.",
        monthlyValue: 400,
      },
    ],
  },
  {
    id: "summit-law",
    name: "Summit Law Group",
    category: "Law Firm",
    city: "Toronto",
    address: "150 King St W, Toronto, ON",
    phone: "(416) 555-0333",
    rating: 4.9,
    reviews: 87,
    websiteStatus: "modern",
    websiteUrl: "summitlaw.example",
    opportunityScore: 58,
    automationFit: "Medium",
    estimatedMonthlyValue: 2200,
    outreachReady: false,
    description:
      "Boutique law firm with a modern website but no lead capture or intake automation. Inbound inquiries go unanswered for hours.",
    gaps: [
      "No live chat or lead capture",
      "Slow response to new inquiries",
      "No automated client intake",
    ],
    recommendedServices: [
      {
        name: "AI intake assistant",
        description: "24/7 chat that qualifies and books consultations.",
        monthlyValue: 1200,
      },
      {
        name: "Follow-up automation",
        description: "Automated nurture sequences for prospective clients.",
        monthlyValue: 1000,
      },
    ],
  },
  {
    id: "pulse-fitness",
    name: "Pulse Fitness Studio",
    category: "Fitness Studio",
    city: "Toronto",
    address: "77 Spadina Ave, Toronto, ON",
    phone: "(416) 555-0410",
    rating: 4.5,
    reviews: 264,
    websiteStatus: "none",
    websiteUrl: null,
    opportunityScore: 90,
    automationFit: "High",
    estimatedMonthlyValue: 2000,
    outreachReady: true,
    description:
      "Growing boutique fitness studio with no website. Class sign-ups are managed through DMs and a paper sheet.",
    gaps: [
      "No website or class schedule online",
      "No membership or class booking system",
      "No lead capture for free-trial offers",
      "No automated member follow-up",
    ],
    recommendedServices: [
      {
        name: "Studio website",
        description: "Schedule, pricing, and free-trial lead capture.",
        monthlyValue: 700,
      },
      {
        name: "Class booking automation",
        description: "Membership and class booking with waitlists.",
        monthlyValue: 800,
      },
      {
        name: "AI member retention",
        description: "Automated check-ins and win-back campaigns.",
        monthlyValue: 500,
      },
    ],
  },
]

export function getLead(id: string): Lead | undefined {
  return leads.find((l) => l.id === id)
}

export const websiteStatusLabel: Record<WebsiteStatus, string> = {
  none: "No website",
  outdated: "Outdated",
  modern: "Modern",
}

export function scoreTier(score: number): "high" | "medium" | "low" {
  if (score >= 80) return "high"
  if (score >= 60) return "medium"
  return "low"
}

export function buildOutreachEmail(lead: Lead): string {
  const topService = lead.recommendedServices[0]?.name.toLowerCase() ?? "a new website"
  return `Subject: Quick idea for ${lead.name}

Hi ${lead.name} team,

I came across ${lead.name} while researching top-rated ${lead.category.toLowerCase()}s in ${lead.city} — your ${lead.rating}-star rating across ${lead.reviews} reviews really stands out.

I noticed a few quick wins that could help you capture more of the demand you're already earning:
${lead.gaps.map((g) => `  • ${g}`).join("\n")}

At RelayOps, we help ${lead.category.toLowerCase()}s like yours turn that reputation into booked revenue with ${topService}, online booking, and AI-powered customer follow-up. For a business your size, this typically adds an estimated $${lead.estimatedMonthlyValue.toLocaleString()}/mo in recovered and new revenue.

Would you be open to a 15-minute call this week? I'll bring a tailored plan — no obligation.

Best,
Alex Rivera
RelayOps | LeadRelay AI
alex@relayops.ai`
}
