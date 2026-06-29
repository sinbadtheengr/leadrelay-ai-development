import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const issues = []
const warnings = []
const notes = []

function check(condition, message) {
  if (condition) {
    console.log(`[OK] ${message}`)
  } else {
    issues.push(message)
    console.log(`[FAIL] ${message}`)
  }
}

function warn(message) {
  warnings.push(message)
  console.log(`[WARN] ${message}`)
}

function note(message) {
  notes.push(message)
  console.log(`[INFO] ${message}`)
}

function run(command, args) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
    timeout: 15_000,
  })
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {}

  const env = {}
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const equals = trimmed.indexOf("=")
    if (equals === -1) continue

    const key = trimmed.slice(0, equals).trim()
    let value = trimmed.slice(equals + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

console.log("LeadRelay AI demo preflight\n")

const nodeMajor = Number(process.versions.node.split(".")[0])
check(nodeMajor >= 20, `Node.js 20+ is available (${process.version})`)

const pnpmResult = run("pnpm", ["--version"])
check(pnpmResult.status === 0, "pnpm is available")
if (pnpmResult.status === 0) {
  note(`pnpm version: ${pnpmResult.stdout.trim()}`)
}

const requiredFiles = [
  ".env.example",
  "package.json",
  "pnpm-lock.yaml",
  "prisma/schema.prisma",
  "prisma/migrations/20260626000000_init/migration.sql",
  "prisma/migrations/20260628000000_campaign_pipeline/migration.sql",
  "public/devpost/leadrelay-architecture.png",
  "public/devpost/leadrelay-architecture.svg",
]

for (const file of requiredFiles) {
  check(existsSync(join(root, file)), `${file} exists`)
}

const envLocalPath = join(root, ".env.local")
const hasEnvLocal = existsSync(envLocalPath)
if (!hasEnvLocal) {
  warn(".env.local is missing. Copy .env.example to .env.local before the demo.")
}

const env = {
  ...parseEnvFile(join(root, ".env")),
  ...parseEnvFile(envLocalPath),
}

const databaseUrl = env.DATABASE_URL?.trim()
const iamAuth = env.AWS_RDS_IAM_AUTH === "true"

if (!databaseUrl) {
  note("DATABASE_URL is empty: the app will use the reliable Local Market Dataset fallback.")
} else {
  try {
    const parsed = new URL(databaseUrl)
    check(parsed.protocol.startsWith("postgres"), "DATABASE_URL looks like PostgreSQL")
    note(`Database host: ${parsed.hostname}`)

    if (iamAuth) {
      check(Boolean(env.AWS_REGION), "AWS_REGION is set for IAM database authentication")

      const hasProfile = Boolean(env.AWS_PROFILE)
      const hasStaticAwsKeys = Boolean(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY)
      check(
        hasProfile || hasStaticAwsKeys,
        "AWS_PROFILE or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY is set for IAM auth",
      )

      if (parsed.password) {
        warn("DATABASE_URL includes a password even though AWS_RDS_IAM_AUTH=true. IAM-only Aurora should use a passwordless URL.")
      }

      const awsResult = run("aws", ["--version"])
      if (awsResult.status !== 0) {
        warn("AWS CLI was not found. Install it if this Windows machine will connect to Aurora with AWS_PROFILE.")
      } else {
        note(`AWS CLI: ${(awsResult.stdout || awsResult.stderr).trim()}`)
      }

      if (hasProfile && awsResult.status === 0) {
        const sts = run("aws", ["sts", "get-caller-identity", "--profile", env.AWS_PROFILE])
        if (sts.status === 0) {
          note(`AWS profile '${env.AWS_PROFILE}' can call STS.`)
        } else {
          warn(`AWS profile '${env.AWS_PROFILE}' could not call STS. Run 'aws configure --profile ${env.AWS_PROFILE}' or 'aws sso login --profile ${env.AWS_PROFILE}'.`)
        }
      }
    } else {
      note("AWS_RDS_IAM_AUTH is not true. Prisma will use password-based DATABASE_URL auth if a password is present.")
      if (!parsed.password) {
        warn("DATABASE_URL has no password and IAM auth is disabled. This is fine only if the database accepts passwordless local connections.")
      }
    }
  } catch {
    check(false, "DATABASE_URL is a valid URL")
  }
}

if (!env.OPENAI_API_KEY) {
  note("OPENAI_API_KEY is empty: Campaign Builder and AI analysis will use the built-in generated output.")
}

if (!env.GOOGLE_PLACES_API_KEY) {
  note("GOOGLE_PLACES_API_KEY is empty: market search will use the Local Market Dataset.")
}

console.log("\nRecommended Windows demo commands:")
console.log("  corepack enable")
console.log("  corepack prepare pnpm@11.9.0 --activate")
console.log("  pnpm install")
console.log("  pnpm demo:preflight")
console.log("  pnpm dev")

if (warnings.length > 0) {
  console.log(`\nWarnings: ${warnings.length}`)
}

if (issues.length > 0) {
  console.log(`\nPreflight failed with ${issues.length} blocker(s). Fix those before the demo.`)
  process.exit(1)
}

console.log("\nPreflight passed. LeadRelay AI is ready to run on this machine.")
