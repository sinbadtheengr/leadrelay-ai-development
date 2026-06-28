import { NextResponse } from "next/server"
import { createCampaign, listCampaigns } from "@/lib/lead-service"

export async function GET() {
  try {
    const campaigns = await listCampaigns()
    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("Unable to list campaigns.", error)
    return NextResponse.json({ error: "Unable to list campaigns." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const name = typeof body.name === "string" ? body.name : "New campaign"
    const city = typeof body.city === "string" ? body.city : "Toronto"
    const category = typeof body.category === "string" ? body.category : "Beauty Salon"
    const leadIds = Array.isArray(body.leadIds) ? body.leadIds.map(String) : []

    const campaign = await createCampaign({ name, city, category, leadIds })
    return NextResponse.json({ campaign })
  } catch (error) {
    console.error("Unable to create campaign.", error)
    return NextResponse.json({ error: "Unable to create campaign." }, { status: 500 })
  }
}
