import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOwnerFilter, isUserActivated } from "@/lib/admin-filter"
import { rateLimit } from "@/lib/rate-limit"

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
  if (!rateLimit(`send:${session.user.id}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many emails. Please wait a minute." }, { status: 429 })
  }

  const ownerFilter = await getOwnerFilter(session.user.id)
  const proposal = await prisma.proposal.findFirst({
    where: { id, ...ownerFilter, deletedAt: null },
  })

  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { email } = await req.json()
  const targetEmail = email || proposal.clientEmail || ""
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!targetEmail || !emailRegex.test(targetEmail)) {
    return NextResponse.json({ error: "Valid email address required" }, { status: 400 })
  }
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/view/${proposal.shareToken}`

  let emailSent = false
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@example.com",
      to: targetEmail,
      subject: `Proposal: ${proposal.title}`,
      html: `
        <h2>${proposal.title}</h2>
        <p>You've received a proposal. Click below to view it:</p>
        <a href="${shareUrl}" style="display:inline-block;background:#0f172a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px;">View Proposal</a>
      `,
    })
    emailSent = true
  }

  await prisma.proposal.update({
    where: { id },
    data: { status: "SENT", sentAt: new Date(), clientEmail: targetEmail },
  })

  return NextResponse.json({ ok: true, shareUrl, emailSent })
}
