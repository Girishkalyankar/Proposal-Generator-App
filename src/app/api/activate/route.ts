import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!rateLimit(`activate:${session.user.id}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 })
  }

  const { code } = await req.json()
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Code is required" }, { status: 400 })
  }

  const accessCode = await prisma.accessCode.findUnique({
    where: { code: code.trim().toUpperCase() },
  })

  if (!accessCode) {
    return NextResponse.json({ error: "Invalid access code" }, { status: 400 })
  }

  if (accessCode.revoked) {
    return NextResponse.json({ error: "This code has been revoked" }, { status: 400 })
  }

  if (accessCode.isUsed) {
    return NextResponse.json({ error: "This code has already been used" }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.accessCode.update({
      where: { id: accessCode.id },
      data: { isUsed: true, usedById: session.user.id, usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { isActivated: true },
    }),
  ])

  return NextResponse.json({ success: true })
}
