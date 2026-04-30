import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

import { randomBytes } from "crypto"

function generateCode(): string {
  const chars = "ABCDEF0123456789"
  const bytes = randomBytes(8)
  let code = ""
  for (let i = 0; i < 8; i++) code += chars[bytes[i] % chars.length]
  return code
}

async function checkAdmin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } })
  return user?.isAdmin === true
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!(await checkAdmin(session.user.id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const codes = await prisma.accessCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { usedBy: { select: { email: true, name: true } } },
  })

  return NextResponse.json(codes)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!(await checkAdmin(session.user.id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const count = body.count || 1
    const label = body.label || null
    const qty = Math.min(Math.max(1, count), 50)

    const codes = []
    for (let i = 0; i < qty; i++) {
      let created = null
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          created = await prisma.accessCode.create({ data: { code: generateCode(), label } })
          break
        } catch {
          if (attempt === 4) throw new Error("Failed to generate unique code")
        }
      }
      if (created) codes.push(created)
    }

    return NextResponse.json(codes)
  } catch (e) {
    console.error("ADMIN POST error:", e)
    return NextResponse.json({ error: "Server error", detail: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!(await checkAdmin(session.user.id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { codeId, action, label } = await req.json()

  const validActions = ["revoke", "label", "deactivate"]
  if (!action || !validActions.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const code = await prisma.accessCode.findUnique({ where: { id: codeId } })
  if (!code) {
    return NextResponse.json({ error: "Code not found" }, { status: 404 })
  }

  if (action === "revoke") {
    await prisma.accessCode.update({
      where: { id: codeId },
      data: { revoked: true, revokedAt: new Date() },
    })
  }

  if (action === "label") {
    await prisma.accessCode.update({
      where: { id: codeId },
      data: { label: label || null },
    })
  }

  if (action === "deactivate") {
    if (!code.usedById) {
      return NextResponse.json({ error: "Code has not been used by anyone" }, { status: 400 })
    }
    await prisma.user.update({
      where: { id: code.usedById },
      data: { isActivated: false },
    })
    await prisma.accessCode.update({
      where: { id: codeId },
      data: { isUsed: false, usedById: null, usedAt: null, revoked: true, revokedAt: new Date() },
    })
  }

  return NextResponse.json({ success: true })
}
