import { NextResponse } from "next/server"
import { listLeads } from "@/lib/lead-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city") ?? undefined
    const category = searchParams.get("category") ?? undefined
    const leads = await listLeads({ city, category })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error("Unable to list leads.", error)
    return NextResponse.json({ error: "Unable to list leads." }, { status: 500 })
  }
}
