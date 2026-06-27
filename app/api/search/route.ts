import { NextResponse } from "next/server"
import { searchLeads } from "@/lib/lead-service"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const city = typeof body.city === "string" ? body.city : "Toronto"
    const category = typeof body.category === "string" ? body.category : "Beauty Salon"

    const result = await searchLeads(city, category)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Lead search failed.", error)
    return NextResponse.json({ error: "Unable to search leads." }, { status: 500 })
  }
}
