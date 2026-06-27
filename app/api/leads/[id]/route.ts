import { NextResponse } from "next/server"
import { getLeadById } from "@/lib/lead-service"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const lead = await getLeadById(id)

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 })
    }

    return NextResponse.json({ lead })
  } catch (error) {
    console.error("Unable to load lead.", error)
    return NextResponse.json({ error: "Unable to load lead." }, { status: 500 })
  }
}
