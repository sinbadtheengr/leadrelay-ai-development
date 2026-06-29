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
  source?: string
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
    id: "glowhaus-salon",
    name: "GlowHaus Salon",
    category: "Beauty Salon",
    city: "Toronto",
    address: "441 College St, Toronto, ON",
    phone: "(416) 555-0164",
    rating: 4.7,
    reviews: 284,
    websiteStatus: "outdated",
    websiteUrl: "glowhaus-salon.example",
    opportunityScore: 89,
    automationFit: "High",
    estimatedMonthlyValue: 2200,
    outreachReady: true,
    description:
      "Busy color and styling salon with strong reviews but a dated website, manual booking, and no automated rebooking flow.",
    gaps: [
      "Website is slow and not optimized for mobile bookings",
      "No online deposits for high-value color appointments",
      "No automated rebooking sequence after visits",
      "No review request workflow after completed appointments",
    ],
    recommendedServices: [
      {
        name: "Salon website rebuild",
        description: "Mobile-first site with services, stylist profiles, and gallery.",
        monthlyValue: 800,
      },
      {
        name: "Booking and deposit automation",
        description: "Online booking with deposits for color and extension appointments.",
        monthlyValue: 850,
      },
      {
        name: "AI rebooking assistant",
        description: "Automated rebooking, review requests, and win-back messages.",
        monthlyValue: 550,
      },
    ],
  },
  {
    id: "queen-west-nails",
    name: "Queen West Nails",
    category: "Beauty Salon",
    city: "Toronto",
    address: "628 Queen St W, Toronto, ON",
    phone: "(416) 555-0128",
    rating: 4.5,
    reviews: 419,
    websiteStatus: "none",
    websiteUrl: null,
    opportunityScore: 92,
    automationFit: "High",
    estimatedMonthlyValue: 1900,
    outreachReady: true,
    description:
      "High-review nail studio relying on phone calls and walk-ins despite strong local demand and repeat appointment potential.",
    gaps: [
      "No website or service menu outside social media",
      "No self-serve booking for recurring nail appointments",
      "No SMS reminders to reduce no-shows",
      "No loyalty or reactivation campaigns",
    ],
    recommendedServices: [
      {
        name: "Booking-ready website",
        description: "Fast landing site with menu, prices, photos, and booking CTA.",
        monthlyValue: 650,
      },
      {
        name: "Recurring appointment automation",
        description: "Automated booking links, reminders, and repeat-visit nudges.",
        monthlyValue: 750,
      },
      {
        name: "Client retention campaigns",
        description: "Win-back and loyalty messages for regular customers.",
        monthlyValue: 500,
      },
    ],
  },
  {
    id: "bloor-brow-studio",
    name: "Bloor Brow Studio",
    category: "Beauty Salon",
    city: "Toronto",
    address: "1214 Bloor St W, Toronto, ON",
    phone: "(416) 555-0177",
    rating: 4.9,
    reviews: 156,
    websiteStatus: "none",
    websiteUrl: null,
    opportunityScore: 91,
    automationFit: "High",
    estimatedMonthlyValue: 2100,
    outreachReady: true,
    description:
      "Specialty brow and lash studio with premium services, excellent reviews, and no owned digital booking funnel.",
    gaps: [
      "No owned website for premium service positioning",
      "No pre-appointment intake or aftercare automation",
      "No automated review collection",
      "No package or membership follow-up sequence",
    ],
    recommendedServices: [
      {
        name: "Premium service website",
        description: "Conversion page for brow, lash, and package bookings.",
        monthlyValue: 750,
      },
      {
        name: "Client intake automation",
        description: "Digital consent, preferences, and aftercare messages.",
        monthlyValue: 650,
      },
      {
        name: "AI retention workflows",
        description: "Membership, package, and review request automation.",
        monthlyValue: 700,
      },
    ],
  },
  {
    id: "annex-beauty-lounge",
    name: "Annex Beauty Lounge",
    category: "Beauty Salon",
    city: "Toronto",
    address: "332 Bloor St W, Toronto, ON",
    phone: "(416) 555-0191",
    rating: 4.3,
    reviews: 237,
    websiteStatus: "outdated",
    websiteUrl: "annexbeautylounge.example",
    opportunityScore: 76,
    automationFit: "Medium",
    estimatedMonthlyValue: 1600,
    outreachReady: true,
    description:
      "Established multi-service salon with an old website, unclear pricing, and manual follow-up for consultations.",
    gaps: [
      "Outdated website with unclear service pages",
      "No consultation request funnel",
      "No automated follow-up after inquiries",
      "No monthly promotion or reactivation system",
    ],
    recommendedServices: [
      {
        name: "Service page refresh",
        description: "Clear service pages with pricing, FAQs, and consultation CTAs.",
        monthlyValue: 650,
      },
      {
        name: "Consultation funnel",
        description: "Forms and automated replies for higher-value services.",
        monthlyValue: 550,
      },
      {
        name: "Promotion automation",
        description: "Monthly campaign and reactivation sequences.",
        monthlyValue: 400,
      },
    ],
  },
  {
    id: "yorkville-skin-and-lash",
    name: "Yorkville Skin & Lash",
    category: "Beauty Salon",
    city: "Toronto",
    address: "74 Cumberland St, Toronto, ON",
    phone: "(416) 555-0159",
    rating: 4.8,
    reviews: 312,
    websiteStatus: "modern",
    websiteUrl: "yorkvilleskinlash.example",
    opportunityScore: 83,
    automationFit: "High",
    estimatedMonthlyValue: 2600,
    outreachReady: true,
    description:
      "Premium beauty studio with a modern site but weak automation around lead capture, consults, and high-ticket package follow-up.",
    gaps: [
      "No AI chat or lead qualification on service pages",
      "No package quote follow-up automation",
      "No abandoned booking recovery",
      "No segmented nurture for skincare and lash clients",
    ],
    recommendedServices: [
      {
        name: "AI website concierge",
        description: "Chat assistant that qualifies visitors and recommends services.",
        monthlyValue: 1000,
      },
      {
        name: "Booking recovery automation",
        description: "Abandoned booking and consultation follow-up workflows.",
        monthlyValue: 800,
      },
      {
        name: "Package nurture campaigns",
        description: "Segmented messages for premium beauty packages.",
        monthlyValue: 800,
      },
    ],
  },
  {
    id: "danforth-hair-co",
    name: "Danforth Hair Co.",
    category: "Beauty Salon",
    city: "Toronto",
    address: "1015 Danforth Ave, Toronto, ON",
    phone: "(416) 555-0183",
    rating: 4.4,
    reviews: 188,
    websiteStatus: "outdated",
    websiteUrl: "danforthhairco.example",
    opportunityScore: 74,
    automationFit: "Medium",
    estimatedMonthlyValue: 1450,
    outreachReady: false,
    description:
      "Neighborhood salon with loyal customers but limited online conversion and no structured reactivation campaigns.",
    gaps: [
      "Website lacks clear online booking calls to action",
      "No automated waitlist or cancellation fill workflow",
      "No review generation process",
      "No win-back campaign for lapsed clients",
    ],
    recommendedServices: [
      {
        name: "Website conversion refresh",
        description: "Improve service pages, booking CTA, and mobile flow.",
        monthlyValue: 550,
      },
      {
        name: "Waitlist automation",
        description: "Fill cancellations with automated SMS waitlist messages.",
        monthlyValue: 500,
      },
      {
        name: "Client win-back campaigns",
        description: "Reactivate lapsed clients with targeted offers.",
        monthlyValue: 400,
      },
    ],
  },
  {
    id: "liberty-village-glam",
    name: "Liberty Village Glam",
    category: "Beauty Salon",
    city: "Toronto",
    address: "155 Liberty St, Toronto, ON",
    phone: "(416) 555-0116",
    rating: 4.6,
    reviews: 271,
    websiteStatus: "none",
    websiteUrl: null,
    opportunityScore: 87,
    automationFit: "High",
    estimatedMonthlyValue: 2050,
    outreachReady: true,
    description:
      "Fast-growing glam studio serving events and bridal clients, but bookings are fragmented across DMs and phone calls.",
    gaps: [
      "No website for event and bridal packages",
      "No quote request form for group bookings",
      "No automated deposit and reminder workflow",
      "No post-event review and referral campaign",
    ],
    recommendedServices: [
      {
        name: "Event booking website",
        description: "Package pages, quote forms, galleries, and inquiry routing.",
        monthlyValue: 850,
      },
      {
        name: "Deposit workflow automation",
        description: "Automated quote follow-up, deposits, and reminders.",
        monthlyValue: 700,
      },
      {
        name: "Referral automation",
        description: "Post-event review and referral request campaigns.",
        monthlyValue: 500,
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
