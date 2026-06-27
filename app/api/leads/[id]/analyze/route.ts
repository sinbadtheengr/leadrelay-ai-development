import { NextResponse } from "next/server"
import { analyzeLead } from "@/lib/lead-service"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const analysis = await analyzeLead(id)

    if (!analysis) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 })
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Unable to analyze lead.", error)
    return NextResponse.json({ error: "Unable to analyze lead." }, { status: 500 })
  }
}
