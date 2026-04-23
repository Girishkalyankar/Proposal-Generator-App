import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const proposal = await prisma.proposal.findFirst({
    where: { id, userId: session.user.id },
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

  const body = await req.json()

  const proposal = await prisma.proposal.findFirst({
    where: { id, userId: session.user.id },
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

  const proposal = await prisma.proposal.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.proposal.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
