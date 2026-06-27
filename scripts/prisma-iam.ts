import { config } from "dotenv"
import { spawnSync } from "node:child_process"
import { buildIamDatabaseUrl } from "@/lib/aws-rds-iam"

config({ path: ".env.local" })
config({ path: ".env", override: false })

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error("Usage: pnpm prisma:iam <prisma command>")
    console.error("Example: pnpm prisma:iam migrate deploy")
    process.exit(1)
  }

  const databaseUrl = await buildIamDatabaseUrl()
  const result = spawnSync("pnpm", ["exec", "prisma", ...args], {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  })

  process.exit(result.status ?? 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
