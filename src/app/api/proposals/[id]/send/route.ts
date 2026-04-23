import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
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

  const { email } = await req.json()
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/view/${proposal.shareToken}`

  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@example.com",
      to: email || proposal.clientEmail || "",
      subject: `Proposal: ${proposal.title}`,
      html: `
        <h2>${proposal.title}</h2>
        <p>You've received a proposal. Click below to view it:</p>
        <a href="${shareUrl}" style="display:inline-block;background:#0f172a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px;">View Proposal</a>
      `,
    })
  }

  await prisma.proposal.update({
    where: { id },
    data: { status: "SENT", sentAt: new Date(), clientEmail: email || proposal.clientEmail },
  })

  return NextResponse.json({ ok: true, shareUrl })
}
