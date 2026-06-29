import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/lib/generated/prisma/client"
import { leads } from "@/lib/leads"
import { createIamPgPool, getDatabaseSchema, getDatabaseUrl, usesIamDatabaseAuth } from "@/lib/aws-rds-iam"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.log("DATABASE_URL is not set. Skipping Prisma seed; demo mode will use in-app data.")
  process.exit(0)
}

const databaseUrl = getDatabaseUrl()
const adapter =
  usesIamDatabaseAuth() && databaseUrl
    ? new PrismaPg(createIamPgPool(databaseUrl), { schema: getDatabaseSchema(databaseUrl) })
    : new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { id: lead.id },
      create: { ...lead, source: "seed" },
      update: { ...lead, source: "seed" },
    })
  }

  const campaignLeads = leads.filter((lead) => lead.outreachReady).slice(0, 4)
  const campaign = await prisma.campaign.upsert({
    where: { id: "demo-toronto-local-services" },
    create: {
      id: "demo-toronto-local-services",
      name: "Toronto local services launch",
      city: "Toronto",
      category: "Beauty Salon",
      targetOffer: "Website + booking automation",
      status: "Active",
      estimatedPipelineValue: campaignLeads.reduce(
        (sum, lead) => sum + lead.estimatedMonthlyValue,
        0,
      ),
    },
    update: {
      status: "Active",
      estimatedPipelineValue: campaignLeads.reduce(
        (sum, lead) => sum + lead.estimatedMonthlyValue,
        0,
      ),
    },
  })

  for (const [index, lead] of campaignLeads.entries()) {
    await prisma.campaignLead.upsert({
      where: {
        campaignId_leadId: {
          campaignId: campaign.id,
          leadId: lead.id,
        },
      },
      create: {
        campaignId: campaign.id,
        leadId: lead.id,
        stage: index === 0 ? "Qualified" : index === 1 ? "Outreach" : "New",
        position: index,
      },
      update: {
        stage: index === 0 ? "Qualified" : index === 1 ? "Outreach" : "New",
        position: index,
      },
    })
  }

  const analysisLeads = leads
    .filter((lead) => lead.city === "Toronto" && lead.category === "Beauty Salon")
    .slice(0, 6)

  for (const lead of analysisLeads) {
    await prisma.leadAnalysis.upsert({
      where: { id: `seed-analysis-${lead.id}` },
      create: {
        id: `seed-analysis-${lead.id}`,
        leadId: lead.id,
        summary: `${lead.name} is a strong fit for a website, booking, and automation package because the business has visible demand, clear digital gaps, and recurring appointment revenue potential.`,
        gaps: lead.gaps,
        recommendedServices: lead.recommendedServices,
        opportunityScore: lead.opportunityScore,
        automationFit: lead.automationFit,
        estimatedMonthlyValue: lead.estimatedMonthlyValue,
        source: "seeded-ai",
      },
      update: {
        summary: `${lead.name} is a strong fit for a website, booking, and automation package because the business has visible demand, clear digital gaps, and recurring appointment revenue potential.`,
        gaps: lead.gaps,
        recommendedServices: lead.recommendedServices,
        opportunityScore: lead.opportunityScore,
        automationFit: lead.automationFit,
        estimatedMonthlyValue: lead.estimatedMonthlyValue,
        source: "seeded-ai",
      },
    })
  }

  console.log(`Seeded ${leads.length} LeadRelay market opportunities.`)
  console.log(`Seeded ${campaignLeads.length} campaign pipeline opportunities.`)
  console.log(`Seeded ${analysisLeads.length} AI opportunity analyses.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
