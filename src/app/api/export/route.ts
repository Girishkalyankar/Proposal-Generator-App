import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOwnerFilter, isUserActivated } from "@/lib/admin-filter"
import ExcelJS from "exceljs"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!(await isUserActivated(session.user.id))) {
    return NextResponse.json({ error: "Account not activated" }, { status: 403 })
  }

  const ownerFilter = await getOwnerFilter(session.user.id)
  const proposals = await prisma.proposal.findMany({
    where: { ...ownerFilter, deletedAt: null },
    include: { sections: { orderBy: { order: "asc" } } },
    orderBy: { updatedAt: "desc" },
  })

  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Propify.ai"

  // Sheet 1: Proposals overview
  const overview = workbook.addWorksheet("Proposals")
  overview.columns = [
    { header: "Title", key: "title", width: 30 },
    { header: "Client", key: "client", width: 25 },
    { header: "Status", key: "status", width: 12 },
    { header: "Total Value", key: "value", width: 15 },
    { header: "Sections", key: "sections", width: 10 },
    { header: "Created", key: "created", width: 15 },
    { header: "Updated", key: "updated", width: 15 },
  ]

  overview.getRow(1).font = { bold: true }
  overview.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } }
  overview.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }

  for (const p of proposals) {
    overview.addRow({
      title: p.title,
      client: p.clientName || "",
      status: p.status,
      value: p.totalValue ? Number(p.totalValue) : "",
      sections: p.sections.length,
      created: new Date(p.createdAt).toLocaleDateString("en-IN"),
      updated: new Date(p.updatedAt).toLocaleDateString("en-IN"),
    })
  }

  // Sheet 2: Pricing details
  const pricing = workbook.addWorksheet("Pricing Details")
  pricing.columns = [
    { header: "Proposal", key: "proposal", width: 25 },
    { header: "Client", key: "client", width: 20 },
    { header: "Item", key: "item", width: 30 },
    { header: "Description", key: "desc", width: 30 },
    { header: "Qty", key: "qty", width: 8 },
    { header: "Unit Price", key: "price", width: 15 },
    { header: "Total", key: "total", width: 15 },
  ]

  pricing.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
  pricing.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } }

  for (const p of proposals) {
    for (const s of p.sections) {
      if (s.type === "PRICING") {
        const content = s.content as Record<string, unknown>
        const items = (content.items || []) as { name: string; description: string; qty: number; unitPrice: number }[]
        for (const item of items) {
          pricing.addRow({
            proposal: p.title,
            client: p.clientName || "",
            item: item.name,
            desc: item.description,
            qty: item.qty,
            price: item.unitPrice,
            total: item.qty * item.unitPrice,
          })
        }
      }
    }
  }

  // Sheet 3: All section content
  const sections = workbook.addWorksheet("All Sections")
  sections.columns = [
    { header: "Proposal", key: "proposal", width: 25 },
    { header: "Section Type", key: "type", width: 15 },
    { header: "Section Title", key: "title", width: 25 },
    { header: "Content", key: "content", width: 60 },
  ]

  sections.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
  sections.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } }

  for (const p of proposals) {
    for (const s of p.sections) {
      const content = s.content as Record<string, unknown>
      let text = ""
      if (content.html) {
        text = (content.html as string).replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim()
      } else if (s.type === "CONTACT") {
        text = [content.studioName, content.email, content.phone, content.website].filter(Boolean).join(" | ")
      } else if (s.type === "COVER") {
        text = [content.projectTitle, content.clientName, content.companyName].filter(Boolean).join(" | ")
      }

      sections.addRow({
        proposal: p.title,
        type: s.type,
        title: s.title,
        content: text,
      })
    }
  }

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(Buffer.from(buffer) as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Propify.ai-Backup-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  })
}
