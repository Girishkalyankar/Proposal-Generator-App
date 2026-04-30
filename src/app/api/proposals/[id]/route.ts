import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOwnerFilter, isUserActivated } from "@/lib/admin-filter"

export async function GET(
  _req: NextRequest,
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
    include: { sections: { orderBy: { order: "asc" } } },
  })

  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(proposal)
}

export async function PATCH(
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

  const body = await req.json()
  const ownerFilter = await getOwnerFilter(session.user.id)

  const allowedStatuses = ["DRAFT", "SENT", "VIEWED", "ACCEPTED", "DECLINED"]
  if (body.status && !allowedStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }
  if (body.totalValue != null && (typeof body.totalValue !== "number" || body.totalValue < 0)) {
    return NextResponse.json({ error: "Invalid totalValue" }, { status: 400 })
  }

  const proposal = await prisma.proposal.findFirst({
    where: { id, ...ownerFilter, deletedAt: null },
  })
  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const updated = await prisma.proposal.update({
    where: { id },
    data: {
      title: body.title,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      status: body.status,
      totalValue: body.totalValue,
      lastEditedBy: session.user.name || session.user.email || session.user.id,
      lastEditedAt: new Date(),
    },
    include: { sections: { orderBy: { order: "asc" } } },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
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

  await prisma.proposal.update({ where: { id }, data: { deletedAt: new Date() } })
  return NextResponse.json({ ok: true })
}
