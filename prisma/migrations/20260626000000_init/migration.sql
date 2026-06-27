-- CreateEnum
CREATE TYPE "WebsiteStatus" AS ENUM ('none', 'outdated', 'modern');

-- CreateEnum
CREATE TYPE "AutomationFit" AS ENUM ('High', 'Medium', 'Low');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "reviews" INTEGER NOT NULL,
    "websiteStatus" "WebsiteStatus" NOT NULL,
    "websiteUrl" TEXT,
    "opportunityScore" INTEGER NOT NULL,
    "automationFit" "AutomationFit" NOT NULL,
    "estimatedMonthlyValue" INTEGER NOT NULL,
    "outreachReady" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "gaps" JSONB NOT NULL,
    "recommendedServices" JSONB NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'seed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadAnalysis" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "gaps" JSONB NOT NULL,
    "recommendedServices" JSONB NOT NULL,
    "opportunityScore" INTEGER NOT NULL,
    "automationFit" "AutomationFit" NOT NULL,
    "estimatedMonthlyValue" INTEGER NOT NULL,
    "rawResponse" JSONB,
    "source" TEXT NOT NULL DEFAULT 'mock',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchRun" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL,
    "usedDemoData" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'seed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_city_category_idx" ON "Lead"("city", "category");

-- CreateIndex
CREATE INDEX "Lead_opportunityScore_idx" ON "Lead"("opportunityScore");

-- CreateIndex
CREATE INDEX "LeadAnalysis_leadId_createdAt_idx" ON "LeadAnalysis"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "SearchRun_city_category_createdAt_idx" ON "SearchRun"("city", "category", "createdAt");

-- AddForeignKey
ALTER TABLE "LeadAnalysis" ADD CONSTRAINT "LeadAnalysis_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
