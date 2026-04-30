import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOwnerFilter, isUserActivated } from "@/lib/admin-filter"
import React from "react"
import { renderToBuffer, Document, Page, Text, View, Font } from "@react-pdf/renderer"
import { pdfDesigns, type PdfDesign } from "@/lib/pdf-designs"

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf", fontWeight: 700 },
  ],
})

function fmt(n: number, currency = "INR") {
  const symbol = currency === "USD" ? "$" : "₹"
  return `${symbol}${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function makeStyles(c: PdfDesign["colors"]) {
  return {
    page: { fontFamily: "Inter" as const, fontSize: 11, color: c.text, padding: 40, lineHeight: 1.6 },
    coverPage: { fontFamily: "Inter" as const, backgroundColor: c.coverBg, padding: 60, justifyContent: "center" as const, alignItems: "center" as const, minHeight: "100%" as const },
    coverBadge: { backgroundColor: c.accent, color: c.white, fontSize: 9, fontWeight: 700 as const, letterSpacing: 3, paddingVertical: 5, paddingHorizontal: 18, borderRadius: 14, marginBottom: 28 },
    coverTitle: { fontSize: 30, fontWeight: 700 as const, color: c.coverText, textAlign: "center" as const, marginBottom: 20, lineHeight: 1.3 },
    coverDivider: { width: 50, height: 3, backgroundColor: c.accent, marginBottom: 20, borderRadius: 2 },
    coverClient: { fontSize: 14, color: c.coverText, opacity: 0.85, textAlign: "center" as const, marginBottom: 6 },
    coverClientBold: { fontWeight: 700 as const, color: c.coverText },
    coverDate: { fontSize: 11, color: c.coverText, opacity: 0.6, textAlign: "center" as const },
    coverCompany: { marginTop: 36, paddingTop: 20, borderTopWidth: 1, borderTopColor: c.coverText + "26", alignItems: "center" as const },
    coverCompanyLabel: { fontSize: 9, color: c.coverText, opacity: 0.5, letterSpacing: 2, marginBottom: 4 },
    coverCompanyName: { fontSize: 14, color: c.coverText, fontWeight: 600 as const },
    sectionHeader: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12, marginBottom: 16, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: c.primary },
    sectionNumber: { fontSize: 10, fontWeight: 700 as const, color: c.accent, backgroundColor: c.accentLight, width: 28, height: 28, borderRadius: 14, textAlign: "center" as const, lineHeight: 28 },
    sectionTitle: { fontSize: 18, fontWeight: 700 as const, color: c.primary },
    sectionBody: { marginBottom: 30 },
    bodyText: { fontSize: 11, color: c.text, lineHeight: 1.7, marginBottom: 8 },
    tableHeader: { flexDirection: "row" as const, backgroundColor: c.primary, padding: 10 },
    tableHeaderCell: { color: c.white, fontSize: 9, fontWeight: 600 as const, letterSpacing: 0.5 },
    tableRow: { flexDirection: "row" as const, padding: 10, borderBottomWidth: 1, borderBottomColor: c.border },
    tableRowEven: { backgroundColor: c.white },
    tableRowOdd: { backgroundColor: c.bgSubtle },
    tableCell: { fontSize: 10 },
    tableCellDesc: { fontSize: 9, color: c.textSecondary, marginTop: 2 },
    summaryContainer: { alignItems: "flex-end" as const, marginTop: 12 },
    summaryBox: { width: 220 },
    summaryRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, paddingVertical: 6, paddingHorizontal: 12 },
    summaryLabel: { fontSize: 10, color: c.textSecondary },
    summaryValue: { fontSize: 10, color: c.textSecondary },
    summaryDiscount: { color: c.success },
    summaryTotal: { flexDirection: "row" as const, justifyContent: "space-between" as const, backgroundColor: c.primary, borderRadius: 6, paddingVertical: 10, paddingHorizontal: 12, marginTop: 6 },
    summaryTotalLabel: { fontSize: 13, fontWeight: 700 as const, color: c.white },
    summaryTotalValue: { fontSize: 13, fontWeight: 700 as const, color: c.white },
    teamGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 12 },
    teamCard: { flexDirection: "row" as const, gap: 10, padding: 12, borderWidth: 1, borderColor: c.border, borderRadius: 8, backgroundColor: c.bgSubtle, width: "48%" },
    teamAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.primary, justifyContent: "center" as const, alignItems: "center" as const },
    teamAvatarText: { color: c.white, fontWeight: 700 as const, fontSize: 14 },
    teamName: { fontWeight: 600 as const, fontSize: 11, color: c.primary },
    teamRole: { fontSize: 9, color: c.accent, fontWeight: 600 as const, marginTop: 1 },
    teamBio: { fontSize: 9, color: c.textSecondary, marginTop: 4, lineHeight: 1.4 },
    timelineItem: { flexDirection: "row" as const, marginBottom: 16 },
    timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.accent, marginRight: 12, marginTop: 3 },
    timelineDotLast: { backgroundColor: c.success },
    timelinePhase: { fontWeight: 600 as const, fontSize: 12, color: c.primary },
    timelineDuration: { fontSize: 9, color: c.accent, fontWeight: 600 as const, marginTop: 1 },
    timelineDesc: { fontSize: 10, color: c.textSecondary, marginTop: 4 },
    footer: { marginTop: 40, paddingTop: 14, borderTopWidth: 1, borderTopColor: c.border, textAlign: "center" as const },
    footerText: { fontSize: 9, color: c.textSecondary, textAlign: "center" as const },
  }
}

interface ProposalData {
  title: string
  clientName: string | null
  sections: { type: string; title: string; content: unknown }[]
}

function ProposalPdf({ proposal, design }: { proposal: ProposalData; design: PdfDesign }) {
  const c = design.colors
  const s = makeStyles(c)
  const dateStr = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })

  const pages = proposal.sections.map((section, idx) => {
    const content = section.content as Record<string, unknown>

    if (section.type === "COVER") {
      return React.createElement(Page, { key: idx, size: "A4", style: s.coverPage },
        React.createElement(View, { style: { alignItems: "center" } },
          React.createElement(Text, { style: s.coverBadge }, "PROPOSAL"),
          React.createElement(Text, { style: s.coverTitle }, (content.projectTitle as string) || proposal.title),
          React.createElement(View, { style: s.coverDivider }),
          React.createElement(Text, { style: s.coverClient },
            "Prepared for ",
            React.createElement(Text, { style: s.coverClientBold }, (content.clientName as string) || proposal.clientName || "Client")
          ),
          React.createElement(Text, { style: s.coverDate }, (content.date as string) || dateStr),
          content.companyName
            ? React.createElement(View, { style: s.coverCompany },
                React.createElement(Text, { style: s.coverCompanyLabel }, "PRESENTED BY"),
                React.createElement(Text, { style: s.coverCompanyName }, content.companyName as string)
              )
            : null
        )
      )
    }

    if (section.type === "PRICING") {
      const items = ((content.items || []) as { name: string; description: string; qty: number; unitPrice: number }[])
      const cur = (content.currency as string) || "INR"
      const discount = (content.discount as number) || 0
      const taxRate = (content.taxRate as number) || 0
      const subtotal = items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0)
      const discountAmt = subtotal * (discount / 100)
      const afterDiscount = subtotal - discountAmt
      const taxAmt = afterDiscount * (taxRate / 100)
      const total = afterDiscount + taxAmt

      return React.createElement(Page, { key: idx, size: "A4", style: s.page },
        React.createElement(View, { style: s.sectionHeader },
          React.createElement(Text, { style: s.sectionNumber }, String(idx + 1).padStart(2, "0")),
          React.createElement(Text, { style: s.sectionTitle }, section.title)
        ),
        React.createElement(View, { style: { marginBottom: 4 } },
          React.createElement(View, { style: s.tableHeader },
            React.createElement(Text, { style: [s.tableHeaderCell, { width: "45%" }] }, "ITEM"),
            React.createElement(Text, { style: [s.tableHeaderCell, { width: "10%", textAlign: "center" }] }, "QTY"),
            React.createElement(Text, { style: [s.tableHeaderCell, { width: "20%", textAlign: "right" }] }, "UNIT PRICE"),
            React.createElement(Text, { style: [s.tableHeaderCell, { width: "25%", textAlign: "right" }] }, "AMOUNT")
          ),
          ...items.map((item, j) =>
            React.createElement(View, { key: j, style: [s.tableRow, j % 2 === 0 ? s.tableRowEven : s.tableRowOdd] },
              React.createElement(View, { style: { width: "45%" } },
                React.createElement(Text, { style: [s.tableCell, { fontWeight: 600 }] }, item.name),
                item.description ? React.createElement(Text, { style: s.tableCellDesc }, item.description) : null
              ),
              React.createElement(Text, { style: [s.tableCell, { width: "10%", textAlign: "center" }] }, String(item.qty)),
              React.createElement(Text, { style: [s.tableCell, { width: "20%", textAlign: "right" }] }, fmt(item.unitPrice, cur)),
              React.createElement(Text, { style: [s.tableCell, { width: "25%", textAlign: "right" }] }, fmt(item.qty * item.unitPrice, cur))
            )
          )
        ),
        React.createElement(View, { style: s.summaryContainer },
          React.createElement(View, { style: s.summaryBox },
            React.createElement(View, { style: s.summaryRow },
              React.createElement(Text, { style: s.summaryLabel }, "Subtotal"),
              React.createElement(Text, { style: s.summaryValue }, fmt(subtotal, cur))
            ),
            discount > 0 ? React.createElement(View, { style: s.summaryRow },
              React.createElement(Text, { style: [s.summaryLabel, s.summaryDiscount] }, `Discount (${discount}%)`),
              React.createElement(Text, { style: [s.summaryValue, s.summaryDiscount] }, `-${fmt(discountAmt, cur)}`)
            ) : null,
            taxRate > 0 ? React.createElement(View, { style: s.summaryRow },
              React.createElement(Text, { style: s.summaryLabel }, `Tax (${taxRate}%)`),
              React.createElement(Text, { style: s.summaryValue }, fmt(taxAmt, cur))
            ) : null,
            React.createElement(View, { style: s.summaryTotal },
              React.createElement(Text, { style: s.summaryTotalLabel }, "Total"),
              React.createElement(Text, { style: s.summaryTotalValue }, fmt(total, cur))
            )
          )
        )
      )
    }

    if (section.type === "TEAM") {
      const members = ((content.members || []) as { name: string; role: string; bio: string }[])
      if (members.length === 0) return null
      return React.createElement(Page, { key: idx, size: "A4", style: s.page },
        React.createElement(View, { style: s.sectionHeader },
          React.createElement(Text, { style: s.sectionNumber }, String(idx + 1).padStart(2, "0")),
          React.createElement(Text, { style: s.sectionTitle }, section.title)
        ),
        React.createElement(View, { style: s.teamGrid },
          ...members.map((m, j) =>
            React.createElement(View, { key: j, style: s.teamCard },
              React.createElement(View, { style: s.teamAvatar },
                React.createElement(Text, { style: s.teamAvatarText }, (m.name || "?")[0].toUpperCase())
              ),
              React.createElement(View, { style: { flex: 1 } },
                React.createElement(Text, { style: s.teamName }, m.name),
                React.createElement(Text, { style: s.teamRole }, m.role),
                m.bio ? React.createElement(Text, { style: s.teamBio }, m.bio) : null
              )
            )
          )
        )
      )
    }

    if (section.type === "TIMELINE") {
      const items = ((content.items || []) as { phase: string; duration: string; description: string }[])
      const htmlContent = stripHtml((content.html as string) || "")
      if (items.length === 0 && !htmlContent) return null

      return React.createElement(Page, { key: idx, size: "A4", style: s.page },
        React.createElement(View, { style: s.sectionHeader },
          React.createElement(Text, { style: s.sectionNumber }, String(idx + 1).padStart(2, "0")),
          React.createElement(Text, { style: s.sectionTitle }, section.title)
        ),
        items.length > 0
          ? React.createElement(View, {},
              ...items.map((item, j) =>
                React.createElement(View, { key: j, style: s.timelineItem },
                  React.createElement(View, { style: [s.timelineDot, j === items.length - 1 ? s.timelineDotLast : {}] }),
                  React.createElement(View, { style: { flex: 1 } },
                    React.createElement(Text, { style: s.timelinePhase }, item.phase),
                    React.createElement(Text, { style: s.timelineDuration }, item.duration),
                    item.description ? React.createElement(Text, { style: s.timelineDesc }, item.description) : null
                  )
                )
              )
            )
          : React.createElement(Text, { style: s.bodyText }, htmlContent)
      )
    }

    if (section.type === "CONTACT") {
      const contactRow = (label: string, value: string) =>
        React.createElement(View, { style: { flexDirection: "row" as const, marginBottom: 8 } },
          React.createElement(Text, { style: { fontSize: 10, fontWeight: 600, color: c.primary, width: 80 } }, label),
          React.createElement(Text, { style: { fontSize: 10, color: c.text, flex: 1 } }, value)
        )

      return React.createElement(Page, { key: idx, size: "A4", style: s.page },
        React.createElement(View, { style: s.sectionHeader },
          React.createElement(Text, { style: s.sectionNumber }, String(idx + 1).padStart(2, "0")),
          React.createElement(Text, { style: s.sectionTitle }, section.title)
        ),
        React.createElement(View, {
          style: { padding: 20, borderWidth: 1, borderColor: c.border, borderRadius: 8, backgroundColor: c.bgSubtle }
        },
          content.studioName ? React.createElement(Text, { style: { fontSize: 16, fontWeight: 700, color: c.primary, marginBottom: 4 } }, content.studioName as string) : null,
          content.services ? React.createElement(Text, { style: { fontSize: 10, color: c.textSecondary, marginBottom: 16 } }, content.services as string) : null,
          content.email ? contactRow("Email", content.email as string) : null,
          content.phone ? contactRow("Phone", content.phone as string) : null,
          content.website ? contactRow("Website", content.website as string) : null,
          content.instagram ? contactRow("Instagram", content.instagram as string) : null,
          content.address ? React.createElement(View, { style: { flexDirection: "row" as const, marginTop: 4 } },
            React.createElement(Text, { style: { fontSize: 10, fontWeight: 600, color: c.primary, width: 80 } }, "Address"),
            React.createElement(Text, { style: { fontSize: 10, color: c.text, flex: 1 } }, content.address as string)
          ) : null
        )
      )
    }

    const textContent = stripHtml((content.html as string) || "")
    if (!textContent) return null

    return React.createElement(Page, { key: idx, size: "A4", style: s.page },
      React.createElement(View, { style: s.sectionHeader },
        React.createElement(Text, { style: s.sectionNumber }, String(idx + 1).padStart(2, "0")),
        React.createElement(Text, { style: s.sectionTitle }, section.title)
      ),
      React.createElement(View, { style: s.sectionBody },
        ...textContent.split("\n\n").filter(Boolean).map((para, j) =>
          React.createElement(Text, { key: j, style: s.bodyText }, para.trim())
        )
      )
    )
  }).filter(Boolean)

  return React.createElement(Document, {},
    ...pages,
    React.createElement(Page, { size: "A4", style: s.page },
      React.createElement(View, { style: s.footer },
        React.createElement(Text, { style: s.footerText },
          `Generated with Propify.ai · ${dateStr}`
        )
      )
    )
  )
}

export async function GET(
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
    include: { sections: { orderBy: { order: "asc" } } },
  })

  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const designId = req.nextUrl.searchParams.get("design") || "corporate-blue"
  const design = pdfDesigns.find((d) => d.id === designId) || pdfDesigns[0]

  const buffer = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.createElement(ProposalPdf, { proposal, design }) as any
  )

  return new NextResponse(Buffer.from(buffer) as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${proposal.title.replace(/[^a-zA-Z0-9 ]/g, "")}.pdf"`,
    },
  })
}
