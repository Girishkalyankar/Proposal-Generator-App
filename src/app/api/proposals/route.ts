import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSchema = z.object({
  title: z.string().min(1),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional(),
  templateId: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const proposals = await prisma.proposal.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { sections: { orderBy: { order: "asc" } } },
  })

  return NextResponse.json(proposals)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { title, clientName, clientEmail, templateId } = parsed.data

  let sections: { type: string; title: string; content: unknown; order: number }[] = []

  if (templateId) {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: { sections: { orderBy: { order: "asc" } } },
    })
    if (template) {
      sections = template.sections.map((s) => ({
        type: s.type,
        title: s.title,
        content: s.content,
        order: s.order,
      }))
    }
  }

  if (sections.length === 0) {
    sections = [
      { type: "COVER", title: "Cover Page", content: { companyName: "", clientName: clientName || "", projectTitle: title, date: new Date().toISOString().split("T")[0] }, order: 0 },
      { type: "SUMMARY", title: "Executive Summary", content: { html: "" }, order: 1 },
      { type: "PROBLEM", title: "Problem Statement", content: { html: "" }, order: 2 },
      { type: "SOLUTION", title: "Proposed Solution", content: { html: "" }, order: 3 },
      { type: "PRICING", title: "Pricing", content: { items: [], currency: "USD" }, order: 4 },
      { type: "TIMELINE", title: "Timeline", content: { items: [] }, order: 5 },
      { type: "TERMS", title: "Terms & Conditions", content: { html: "" }, order: 6 },
    ]
  }

  const proposal = await prisma.proposal.create({
    data: {
      title,
      clientName,
      clientEmail,
      userId: session.user.id,
      sections: {
        create: sections.map((s) => ({
          type: s.type as never,
          title: s.title,
          content: s.content as never,
          order: s.order,
        })),
      },
    },
    include: { sections: { orderBy: { order: "asc" } } },
  })

  return NextResponse.json(proposal, { status: 201 })
}
