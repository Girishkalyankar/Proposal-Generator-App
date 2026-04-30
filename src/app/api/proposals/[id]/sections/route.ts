import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOwnerFilter, isUserActivated } from "@/lib/admin-filter"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!(await isUserActivated(session.user.id))) {
    return NextResponse.json({ error: "Account not activated" }, { status: 403 })
  }

  const ownerFilter = await getOwnerFilter(session.user.id)
  const proposal = await prisma.proposal.findFirst({
    where: { id, ...ownerFilter, deletedAt: null },
  })
  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { sections } = await req.json()

  await prisma.$transaction(
    sections.map(
      (section: { id: string; title: string; content: unknown; order: number }) =>
        prisma.proposalSection.update({
          where: { id: section.id, proposalId: id },
          data: {
            title: section.title,
            content: section.content as never,
            order: section.order,
          },
        })
    )
  )

  const updated = await prisma.proposal.findUnique({
    where: { id },
    include: { sections: { orderBy: { order: "asc" } } },
  })

  return NextResponse.json(updated)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!(await isUserActivated(session.user.id))) {
    return NextResponse.json({ error: "Account not activated" }, { status: 403 })
  }

  const ownerFilter = await getOwnerFilter(session.user.id)
  const proposal = await prisma.proposal.findFirst({
    where: { id, ...ownerFilter, deletedAt: null },
    include: { sections: true },
  })
  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json()
  const maxOrder = Math.max(0, ...proposal.sections.map((s) => s.order))

  const section = await prisma.proposalSection.create({
    data: {
      proposalId: id,
      type: body.type || "CUSTOM",
      title: body.title || "New Section",
      content: body.content || { html: "" },
      order: maxOrder + 1,
    },
  })

  return NextResponse.json(section, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!(await isUserActivated(session.user.id))) {
    return NextResponse.json({ error: "Account not activated" }, { status: 403 })
  }

  const { sectionId } = await req.json()

  const section = await prisma.proposalSection.findUnique({
    where: { id: sectionId },
    include: { proposal: true },
  })

  if (!section || section.proposal.deletedAt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const ownerFilter = await getOwnerFilter(session.user.id)
  const hasAccess = await prisma.proposal.findFirst({
    where: { id: section.proposalId, ...ownerFilter },
  })
  if (!hasAccess) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.proposalSection.delete({ where: { id: sectionId } })
  return NextResponse.json({ ok: true })
}
