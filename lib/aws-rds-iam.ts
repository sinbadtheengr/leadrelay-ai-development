import { Signer } from "@aws-sdk/rds-signer"
import { Pool, type PoolConfig } from "pg"

export function usesIamDatabaseAuth() {
  return process.env.AWS_RDS_IAM_AUTH === "true"
}

export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) return null
  return new URL(databaseUrl)
}

export function getDatabaseSchema(databaseUrl = getDatabaseUrl()) {
  return databaseUrl?.searchParams.get("schema") ?? "public"
}

export async function generateIamDatabaseToken(databaseUrl = getRequiredDatabaseUrl()) {
  const username = decodeURIComponent(databaseUrl.username)
  if (!username) throw new Error("DATABASE_URL must include a PostgreSQL username.")

  const signer = new Signer({
    hostname: databaseUrl.hostname,
    port: Number(databaseUrl.port || 5432),
    region: process.env.AWS_REGION,
    profile: process.env.AWS_PROFILE,
    username,
  })

  return signer.getAuthToken()
}

export async function buildIamDatabaseUrl() {
  const databaseUrl = getRequiredDatabaseUrl()
  const token = await generateIamDatabaseToken(databaseUrl)
  const signedUrl = new URL(databaseUrl.toString())

  signedUrl.password = token
  if (!signedUrl.searchParams.get("sslmode")) {
    signedUrl.searchParams.set("sslmode", "require")
  }

  return signedUrl.toString()
}

export function createIamPgPool(databaseUrl = getRequiredDatabaseUrl()) {
  const username = decodeURIComponent(databaseUrl.username)
  const database = databaseUrl.pathname.replace(/^\//, "")
  const schema = getDatabaseSchema(databaseUrl)
  const poolConfig: PoolConfig = {
    host: databaseUrl.hostname,
    port: Number(databaseUrl.port || 5432),
    user: username,
    database,
    ssl: { rejectUnauthorized: false },
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    options: schema ? `-c search_path=${schema}` : undefined,
    password: async () => generateIamDatabaseToken(databaseUrl),
  } as PoolConfig

  return new Pool(poolConfig)
}

function getRequiredDatabaseUrl() {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) throw new Error("DATABASE_URL is required for database access.")
  return databaseUrl
}
