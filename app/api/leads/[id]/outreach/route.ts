import { NextResponse } from "next/server"
import { generateOutreach } from "@/lib/lead-service"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const outreach = await generateOutreach(id)

    if (!outreach) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 })
    }

    return NextResponse.json(outreach)
  } catch (error) {
    console.error("Unable to generate outreach.", error)
    return NextResponse.json({ error: "Unable to generate outreach." }, { status: 500 })
  }
}
