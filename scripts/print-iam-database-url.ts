import { config } from "dotenv"
import { buildIamDatabaseUrl } from "@/lib/aws-rds-iam"

config({ path: ".env.local" })
config({ path: ".env", override: false })

buildIamDatabaseUrl()
  .then((url) => {
    console.log(url)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
