import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/lib/generated/prisma/client"
import { createIamPgPool, getDatabaseUrl, getDatabaseSchema, usesIamDatabaseAuth } from "@/lib/aws-rds-iam"

const globalForPrisma = globalThis as unknown as {
  leadRelayPrisma?: PrismaClient
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim())
}

export function getPrisma() {
  if (!hasDatabaseUrl()) return null

  if (!globalForPrisma.leadRelayPrisma) {
    const databaseUrl = getDatabaseUrl()
    if (!databaseUrl) return null

    const adapter = usesIamDatabaseAuth()
      ? new PrismaPg(createIamPgPool(databaseUrl), {
          schema: getDatabaseSchema(databaseUrl),
        })
      : new PrismaPg({
          connectionString: databaseUrl.toString(),
        })

    globalForPrisma.leadRelayPrisma = new PrismaClient({ adapter })
  }

  return globalForPrisma.leadRelayPrisma
}
