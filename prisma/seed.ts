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

  console.log(`Seeded ${leads.length} LeadRelay demo leads.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
