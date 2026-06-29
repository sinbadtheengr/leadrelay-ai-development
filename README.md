# LeadRelay AI

LeadRelay AI is a full-stack B2B product MVP for agencies and automation consultants. It discovers local businesses, scores their website and automation opportunity, summarizes business gaps, generates campaign-ready outreach, and saves opportunities into a revenue pipeline.

The current UI started in v0 and is now backed by Next.js API routes, Prisma ORM, PostgreSQL-compatible models, Google Places search when configured, and OpenAI-powered analysis/outreach when configured.

## H0 Hackathon Fit

LeadRelay AI fits H0 because it turns AI into a practical operator workflow: find a local market, identify overlooked revenue opportunities, and produce a concrete next action. It is demoable without external APIs, but can become live with real Places data, AI analysis, and a managed PostgreSQL database.

For the H0 "Hack the Zero Stack with Vercel v0 and AWS Databases" judging story, the app demonstrates:

- v0-generated frontend upgraded into a full-stack Next.js product.
- Amazon Aurora PostgreSQL persistence through Prisma ORM.
- AWS IAM database authentication support for Aurora PostgreSQL.
- B2B monetization workflow: market discovery, opportunity scoring, AI campaign copy, and saved sales campaigns.
- Demo-safe fallbacks when Google Places or OpenAI credentials are not present.

## Stack

- Next.js App Router
- React 19
- Prisma ORM
- Amazon Aurora PostgreSQL-compatible database
- AWS IAM database authentication tokens through `@aws-sdk/rds-signer`
- Optional Google Places API
- Optional OpenAI Responses API

## Architecture

```mermaid
flowchart LR
  A["v0 / Next.js UI"] --> B["App Router API routes"]
  B --> C["Lead service layer"]
  C --> D["Prisma ORM"]
  D --> E["Amazon Aurora PostgreSQL"]
  C --> F["Google Places API (optional)"]
  C --> G["OpenAI Responses API (optional)"]
  C --> H["Fallback local-market dataset"]
```

The user-facing Command Center calls `POST /api/search`, `POST /api/campaigns`, and the opportunity detail AI routes. The service layer writes `Lead`, `SearchRun`, `LeadAnalysis`, `Campaign`, and `CampaignLead` rows to Aurora when the database is reachable.

## H0 Hackathon Architecture Notes

- Frontend: Vercel + Next.js App Router with a v0-generated UI refined into a business-facing Command Center.
- Backend: Next.js API routes power market search, opportunity retrieval, AI analysis, campaign generation, and saved campaign workflows.
- Database: AWS Aurora PostgreSQL-compatible storage accessed through Prisma ORM, including support for IAM database authentication tokens.
- Optional APIs: Google Places can provide live market discovery; OpenAI can provide live AI opportunity analysis and campaign copy.
- Reliable product experience: when optional APIs are missing, LeadRelay uses a fallback local-market dataset and strong generated AI copy so the workflow remains complete.
- Future architecture: SQS background jobs, S3 exports and reports, RDS Proxy connection management, CloudWatch observability, and CRM integrations.

## API Routes

- `POST /api/search` searches a city and category.
- `GET /api/leads` lists leads, with optional `city` and `category` query params.
- `GET /api/leads/[id]` returns one lead.
- `POST /api/leads/[id]/analyze` generates and stores lead analysis when a database is available.
- `POST /api/leads/[id]/outreach` generates an outreach email.
- `GET /api/campaigns` lists saved campaigns.
- `POST /api/campaigns` saves the current result set as a campaign pipeline.

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

```bash
DATABASE_URL=
AWS_RDS_IAM_AUTH=false
AWS_REGION=
AWS_PROFILE=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=
OPENAI_API_KEY=
GOOGLE_PLACES_API_KEY=
```

For password-based PostgreSQL, `DATABASE_URL` should include the password:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/leadrelay?schema=public"
```

For Aurora PostgreSQL with IAM-only authentication, do not put a password in the URL:

```bash
DATABASE_URL="postgresql://postgres@YOUR-WRITER-ENDPOINT.rds.amazonaws.com:5432/leadrelay?schema=public&sslmode=require"
AWS_RDS_IAM_AUTH=true
AWS_REGION="us-east-1"
```

For local development with AWS SSO or named profiles, set `AWS_PROFILE`. For Vercel, leave `AWS_PROFILE` blank and set `AWS_ACCESS_KEY_ID` plus `AWS_SECRET_ACCESS_KEY` instead.

## Demo Mode

The app works without Google Places, OpenAI, or a database.

If `GOOGLE_PLACES_API_KEY` is missing, searches use realistic seeded Toronto businesses. If `OPENAI_API_KEY` is missing, the app generates strong mock lead analysis and outreach email copy. If `DATABASE_URL` is missing or unavailable, the API routes use in-app demo data instead of Prisma persistence.

This makes the project safe to run during judging, on a laptop, or in a fresh Vercel preview before infrastructure is connected.

The Command Center makes the current mode visible with a **Platform Health** card. Judges can see whether the app is using Aurora rows or the fallback local-market dataset, along with counts for opportunities, market searches, campaigns, and AI analyses.

## Run Locally

Install dependencies:

```bash
pnpm install
```

Run in demo mode:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

For a Windows presentation machine, follow [WINDOWS_DEMO_SETUP.md](WINDOWS_DEMO_SETUP.md). It includes a reliable Local Market Dataset path, an Aurora IAM path, and a preflight command:

```bash
pnpm demo:preflight
```

To use password-based PostgreSQL locally or on AWS, set `DATABASE_URL`, then run:

```bash
pnpm prisma:migrate
pnpm db:seed
pnpm dev
```

For Aurora PostgreSQL IAM-only authentication, set the IAM env vars above, then run Prisma through the IAM wrapper:

```bash
pnpm prisma:iam migrate dev
pnpm prisma:iam db seed
pnpm dev
```

The wrapper generates a short-lived AWS IAM database token and passes it to Prisma as a temporary `DATABASE_URL`. The running app uses the same AWS signer at runtime and asks for fresh tokens when PostgreSQL opens new connections.

## Aurora PostgreSQL Usage

For the hackathon requirement, use Aurora PostgreSQL-compatible. LeadRelay supports two Aurora auth modes:

- Password auth: simplest Prisma/Vercel setup.
- IAM-only auth: supported by this repo, but more operationally complex.

If your cluster is IAM-only, the database user in `DATABASE_URL` must be allowed to authenticate with IAM. AWS also requires the application IAM principal to have `rds-db:connect` permission for that DB user.

Example IAM policy shape:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "rds-db:connect",
      "Resource": "arn:aws:rds-db:REGION:ACCOUNT_ID:dbuser:DB_RESOURCE_ID/postgres"
    }
  ]
}
```

Replace `REGION`, `ACCOUNT_ID`, `DB_RESOURCE_ID`, and `postgres`. The DB resource ID is not the friendly cluster name; find it in the RDS console details/configuration view.

To print a temporary signed database URL for debugging:

```bash
pnpm prisma:iam:url
```

Do not commit or paste that generated URL into Vercel. It contains a temporary auth token.

If this is too much for the hackathon timeline, recreate the Aurora PostgreSQL cluster with password authentication or password + IAM authentication. That lets you use the normal `DATABASE_URL` flow and avoids AWS credential setup inside Vercel.

## Vercel Deployment

1. Import the GitHub repository into Vercel.
2. For IAM-only Aurora, add these environment variables:
   - `DATABASE_URL`, without a password
   - `AWS_RDS_IAM_AUTH=true`
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - optional `AWS_SESSION_TOKEN`
   - `OPENAI_API_KEY`, when available
   - `GOOGLE_PLACES_API_KEY`, when available
3. Attach an IAM policy that allows `rds-db:connect` for the Aurora DB user.
4. Ensure Aurora accepts network connections from Vercel. For a hackathon, this usually means public access plus a permissive-but-temporary database access rule. For production, use a private networking/RDS Proxy strategy.
5. Deploy.

The `postinstall` script runs `prisma generate` so the generated Prisma client exists during the build. Run migrations separately before relying on persistent data in production.

For IAM-only Aurora production migrations, run from a trusted machine with AWS credentials:

```bash
pnpm prisma:iam migrate deploy
pnpm prisma:iam db seed
```

## AWS Database Proof

To prove Aurora PostgreSQL usage during judging:

1. Open the Command Center and point to the **Platform Health** card.
2. Show the Aurora endpoint, IAM auth mode, and persisted row counts.
3. Run a search. The app records a `SearchRun` row when Aurora accepts the write.
4. Click **Save campaign**. The app writes `Campaign` and `CampaignLead` rows.
5. Open an opportunity and refresh Campaign Builder copy. The app uses OpenAI when configured or mock AI output when not.

Useful local verification commands:

```bash
pnpm prisma:iam migrate dev
pnpm prisma:iam db seed
pnpm dev
```

For a database sanity check, inspect row counts with Prisma Studio or a SQL client:

```sql
select count(*) from "Lead";
select count(*) from "SearchRun";
select count(*) from "Campaign";
select count(*) from "CampaignLead";
```

## Judge Demo Script

1. Start at `/dashboard`.
2. Point out **Platform Health**: Aurora PostgreSQL, IAM auth, row counts.
3. Search `Toronto + Beauty Salon`.
4. Explain that missing Google Places key uses persisted demo leads, while a configured key saves live discovered leads into Aurora.
5. Click **Save campaign** to create a monetizable sales pipeline.
6. Open a high-score opportunity.
7. Show recommended services, estimated monthly value, and Campaign Builder email.
8. Close by saying the product is an agency revenue cockpit: discover opportunities, save campaigns, and turn gaps into recurring retainers.

## Devpost Screenshot Checklist

Capture these images for submission:

- Architecture diagram: `public/devpost/leadrelay-architecture.png` or `public/devpost/leadrelay-architecture.svg`.
- Landing page hero showing the LeadRelay AI positioning.
- Command Center with the **Platform Health** card visible.
- Search results after `Toronto + Beauty Salon`.
- Saved campaign pipeline after clicking **Save campaign**.
- Opportunity detail page showing AI Opportunity Analysis and estimated monthly value.
- Campaign Builder email panel.
- AWS RDS/Aurora console showing the `database-1` Aurora PostgreSQL cluster and writer endpoint.

Use browser width around 1440px for Command Center screenshots so the Platform Health card and pipeline panel are visible in one frame.

## Future Roadmap

- Lead ownership, saved lists, and user accounts.
- Real website crawling and Lighthouse-based site scoring.
- CRM export to HubSpot, Airtable, and Google Sheets.
- Automated multi-step outreach sequences.
- Business verification and enrichment from additional data providers.
- Team dashboards for agency pipeline management.
