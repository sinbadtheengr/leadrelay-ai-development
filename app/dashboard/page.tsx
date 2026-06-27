import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardView } from "@/components/dashboard-view"
import { listLeads } from "@/lib/lead-service"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const leads = await listLeads()

  return (
    <DashboardShell>
      <DashboardView initialLeads={leads} />
    </DashboardShell>
  )
}
