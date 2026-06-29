# LeadRelay AI Windows Demo Setup

Use this checklist on the Windows PC before the presentation. The safest demo path is to run the app locally with the Local Market Dataset. If AWS credentials and network access are ready, you can also connect the same app to Aurora PostgreSQL with IAM database authentication.

## What To Install

- Git for Windows
- Node.js 20+ LTS
- AWS CLI v2, only if you will connect to Aurora from Windows
- A browser with good screen sharing support, such as Chrome or Edge

Enable the pinned pnpm version with Corepack:

```powershell
corepack enable
corepack prepare pnpm@11.9.0 --activate
pnpm --version
```

## Get The Project

Clone the repo, then install dependencies:

```powershell
git clone <YOUR_REPO_URL>
cd leadrelay-ai-development
pnpm install
```

Create your local environment file:

```powershell
Copy-Item .env.example .env.local
```

## Option A: Reliable Local Dataset Demo

This is the recommended fallback. It does not need AWS, OpenAI, or Google Places keys.

In `.env.local`, leave these values empty:

```powershell
DATABASE_URL=
OPENAI_API_KEY=
GOOGLE_PLACES_API_KEY=
AWS_RDS_IAM_AUTH=false
```

Run:

```powershell
pnpm demo:preflight
pnpm dev
```

Open:

```text
http://localhost:3000/dashboard
```

Expected behavior:

- Platform Health shows the Local Market Dataset path.
- Searching `Toronto + Beauty Salon` returns realistic market opportunities.
- AI Opportunity Analysis and Campaign Builder still work with generated output.
- Save campaign works in the active runtime dataset.

## Option B: Live Aurora PostgreSQL IAM Demo

Use this only if the Windows PC has AWS credentials, network access to Aurora, and enough time to test before presenting.

In `.env.local`, use your Aurora writer endpoint:

```powershell
DATABASE_URL="postgresql://postgres@YOUR-AURORA-WRITER-ENDPOINT.rds.amazonaws.com:5432/postgres?schema=public&sslmode=require"
AWS_RDS_IAM_AUTH=true
AWS_REGION=ca-central-1
AWS_PROFILE=leadrelay
OPENAI_API_KEY=
GOOGLE_PLACES_API_KEY=
```

Configure AWS credentials:

```powershell
aws configure --profile leadrelay
aws sts get-caller-identity --profile leadrelay
```

Then verify Prisma can connect through an IAM token:

```powershell
pnpm prisma:iam:url
pnpm prisma:iam migrate deploy
pnpm prisma:iam db seed
pnpm demo:preflight
pnpm dev
```

Expected behavior:

- Platform Health shows Aurora PostgreSQL (AWS).
- Row counts appear for opportunities, searches, campaigns, and AI analyses.
- Saving a campaign persists to Aurora.

## Demo Flow

1. Open `/dashboard`.
2. Point to Platform Health.
3. Search `Toronto + Beauty Salon`.
4. Review opportunity scoring and website gaps.
5. Save the result set as a campaign.
6. Open a high-score opportunity.
7. Show AI Opportunity Analysis, estimated monthly value, and Campaign Builder copy.
8. Show the architecture diagram if asked:

```text
public/devpost/leadrelay-architecture.png
```

## Fast Troubleshooting

- If `pnpm` is not recognized, run `corepack enable`, close PowerShell, reopen it, then run `corepack prepare pnpm@11.9.0 --activate`.
- If port 3000 is busy, run `pnpm dev -- -p 3001` and open `http://localhost:3001/dashboard`.
- If Aurora times out, switch to Option A by clearing `DATABASE_URL` and setting `AWS_RDS_IAM_AUTH=false`.
- If AWS says `NoCredentials`, run `aws configure --profile leadrelay` again, then retry `aws sts get-caller-identity --profile leadrelay`.
- If OpenAI or Google Places keys are missing, keep going. The app is designed to produce a complete product experience without them.

## Files To Have Ready

- `.env.local`, not committed
- `public/devpost/leadrelay-architecture.png`
- `README.md`
- `WINDOWS_DEMO_SETUP.md`
