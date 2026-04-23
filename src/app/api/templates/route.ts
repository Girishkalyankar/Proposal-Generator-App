import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const templates = await prisma.template.findMany({
    where: {
      OR: [{ userId: session.user.id }, { isPublic: true }],
    },
    include: { sections: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, description, category, proposalId } = await req.json()

  if (proposalId) {
    const proposal = await prisma.proposal.findFirst({
      where: { id: proposalId, userId: session.user.id },
      include: { sections: { orderBy: { order: "asc" } } },
    })

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    const template = await prisma.template.create({
      data: {
        name: name || `Template from ${proposal.title}`,
        description,
        category,
        userId: session.user.id,
        sections: {
          create: proposal.sections.map((s) => ({
            type: s.type,
            title: s.title,
            content: s.content as never,
            order: s.order,
          })),
        },
      },
      include: { sections: true },
    })

    return NextResponse.json(template, { status: 201 })
  }

  const template = await prisma.template.create({
    data: {
      name,
      description,
      category,
      userId: session.user.id,
    },
    include: { sections: true },
  })

  return NextResponse.json(template, { status: 201 })
}
