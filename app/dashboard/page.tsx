import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardView } from "@/components/dashboard-view"
import { getDashboardDatabaseStatus, listCampaigns, listLeads } from "@/lib/lead-service"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const [leads, databaseStatus, campaigns] = await Promise.all([
    listLeads(),
    getDashboardDatabaseStatus(),
    listCampaigns(),
  ])

  return (
    <DashboardShell>
      <DashboardView
        initialLeads={leads}
        initialDatabaseStatus={databaseStatus}
        initialCampaigns={campaigns}
      />
    </DashboardShell>
  )
}
