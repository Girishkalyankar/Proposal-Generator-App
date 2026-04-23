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

  const html = buildPdfHtml(proposal)

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
}

function fmt(n: number, currency = "INR") {
  const symbol = currency === "USD" ? "$" : "₹"
  const locale = currency === "USD" ? "en-US" : "en-IN"
  return `${symbol}${n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function buildPdfHtml(proposal: {
  title: string
  clientName: string | null
  sections: { type: string; title: string; content: unknown }[]
}) {
  const sectionHtml = proposal.sections
    .map((section, idx) => {
      const content = section.content as Record<string, unknown>

      if (section.type === "COVER") {
        return `
          <div class="cover-page">
            <div class="cover-accent"></div>
            <div class="cover-content">
              <div class="cover-badge">PROPOSAL</div>
              <h1 class="cover-title">${content.projectTitle || proposal.title}</h1>
              <div class="cover-divider"></div>
              <p class="cover-client">Prepared for <strong>${content.clientName || proposal.clientName || "Client"}</strong></p>
              <p class="cover-date">${content.date || new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
              ${content.companyName ? `<div class="cover-company"><span class="cover-company-label">Presented by</span><span class="cover-company-name">${content.companyName}</span></div>` : ""}
            </div>
          </div>`
      }

      if (section.type === "PRICING") {
        const items = (content.items || []) as { name: string; description: string; qty: number; unitPrice: number }[]
        const cur = (content.currency as string) || "INR"
        const discount = (content.discount as number) || 0
        const taxRate = (content.taxRate as number) || 0
        const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0)
        const discountAmount = subtotal * (discount / 100)
        const afterDiscount = subtotal - discountAmount
        const taxAmount = afterDiscount * (taxRate / 100)
        const total = afterDiscount + taxAmount
        return `
          <div class="section">
            <div class="section-header">
              <span class="section-number">${String(idx + 1).padStart(2, "0")}</span>
              <h2 class="section-title">${section.title}</h2>
            </div>
            <table class="pricing-table">
              <thead>
                <tr>
                  <th style="text-align:left;width:45%;">Item</th>
                  <th style="text-align:center;width:10%;">Qty</th>
                  <th style="text-align:right;width:20%;">Unit Price</th>
                  <th style="text-align:right;width:25%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((i, j) => `
                  <tr class="${j % 2 === 0 ? "row-even" : "row-odd"}">
                    <td style="text-align:left;"><strong>${i.name}</strong>${i.description ? `<br/><span class="item-desc">${i.description}</span>` : ""}</td>
                    <td style="text-align:center;">${i.qty}</td>
                    <td style="text-align:right;">${fmt(i.unitPrice, cur)}</td>
                    <td style="text-align:right;">${fmt(i.qty * i.unitPrice, cur)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            <div class="pricing-summary">
              <div class="summary-row"><span>Subtotal</span><span>${fmt(subtotal, cur)}</span></div>
              ${discount > 0 ? `<div class="summary-row discount"><span>Discount (${discount}%)</span><span>-${fmt(discountAmount, cur)}</span></div>` : ""}
              ${taxRate > 0 ? `<div class="summary-row"><span>Tax (${taxRate}%)</span><span>${fmt(taxAmount, cur)}</span></div>` : ""}
              <div class="summary-row total"><span>Total</span><span>${fmt(total, cur)}</span></div>
            </div>
          </div>`
      }

      if (section.type === "TEAM") {
        const members = (content.members || []) as { name: string; role: string; bio: string }[]
        if (members.length === 0) return ""
        return `
          <div class="section">
            <div class="section-header">
              <span class="section-number">${String(idx + 1).padStart(2, "0")}</span>
              <h2 class="section-title">${section.title}</h2>
            </div>
            <div class="team-grid">
              ${members.map((m) => `
                <div class="team-card">
                  <div class="team-avatar">${(m.name || "?")[0].toUpperCase()}</div>
                  <div class="team-info">
                    <div class="team-name">${m.name}</div>
                    <div class="team-role">${m.role}</div>
                    ${m.bio ? `<div class="team-bio">${m.bio}</div>` : ""}
                  </div>
                </div>
              `).join("")}
            </div>
          </div>`
      }

      if (section.type === "TIMELINE") {
        const items = (content.items || []) as { phase: string; duration: string; description: string }[]
        if (items.length === 0) {
          return `
            <div class="section">
              <div class="section-header">
                <span class="section-number">${String(idx + 1).padStart(2, "0")}</span>
                <h2 class="section-title">${section.title}</h2>
              </div>
              <div class="body-content">${(content.html as string) || ""}</div>
            </div>`
        }
        return `
          <div class="section">
            <div class="section-header">
              <span class="section-number">${String(idx + 1).padStart(2, "0")}</span>
              <h2 class="section-title">${section.title}</h2>
            </div>
            <div class="timeline">
              ${items.map((item, j) => `
                <div class="timeline-item">
                  <div class="timeline-dot ${j === items.length - 1 ? "last" : ""}"></div>
                  <div class="timeline-content">
                    <div class="timeline-phase">${item.phase}</div>
                    <div class="timeline-duration">${item.duration}</div>
                    ${item.description ? `<div class="timeline-desc">${item.description}</div>` : ""}
                  </div>
                </div>
              `).join("")}
            </div>
          </div>`
      }

      return `
        <div class="section">
          <div class="section-header">
            <span class="section-number">${String(idx + 1).padStart(2, "0")}</span>
            <h2 class="section-title">${section.title}</h2>
          </div>
          <div class="body-content">${(content.html as string) || ""}</div>
        </div>`
    })
    .join("")

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${proposal.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    :root {
      --primary: #1e3a5f;
      --primary-light: #2a5a8f;
      --accent: #0ea5e9;
      --accent-light: #e0f2fe;
      --text: #1a1a2e;
      --text-secondary: #64748b;
      --border: #e2e8f0;
      --bg-subtle: #f8fafc;
      --success: #10b981;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 850px;
      margin: 0 auto;
      padding: 0;
      color: var(--text);
      font-size: 14px;
      line-height: 1.7;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Cover Page */
    .cover-page {
      position: relative;
      min-height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 40px;
      margin-bottom: 20px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      border-radius: 12px;
      overflow: hidden;
    }
    .cover-accent {
      position: absolute;
      top: -60px;
      right: -60px;
      width: 300px;
      height: 300px;
      background: rgba(255,255,255,0.05);
      border-radius: 50%;
    }
    .cover-content { text-align: center; position: relative; z-index: 1; }
    .cover-badge {
      display: inline-block;
      background: var(--accent);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 3px;
      padding: 6px 20px;
      border-radius: 20px;
      margin-bottom: 32px;
    }
    .cover-title {
      font-size: 36px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.2;
      margin-bottom: 24px;
    }
    .cover-divider {
      width: 60px;
      height: 3px;
      background: var(--accent);
      margin: 0 auto 24px;
      border-radius: 2px;
    }
    .cover-client { font-size: 17px; color: rgba(255,255,255,0.85); margin-bottom: 8px; }
    .cover-client strong { color: #ffffff; }
    .cover-date { font-size: 14px; color: rgba(255,255,255,0.6); }
    .cover-company { margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.15); }
    .cover-company-label { display: block; font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
    .cover-company-name { display: block; font-size: 16px; color: #ffffff; font-weight: 600; }

    /* Sections */
    .section {
      margin-top: 40px;
      page-break-inside: avoid;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 2px solid var(--primary);
    }
    .section-number {
      font-size: 12px;
      font-weight: 700;
      color: var(--accent);
      background: var(--accent-light);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .section-title {
      font-size: 22px;
      font-weight: 700;
      color: var(--primary);
      letter-spacing: -0.3px;
    }

    /* Body content */
    .body-content { color: var(--text); }
    .body-content p { margin-bottom: 14px; }
    .body-content h3 { font-size: 16px; font-weight: 600; color: var(--primary); margin: 20px 0 10px; }
    .body-content ul, .body-content ol { margin: 10px 0 14px 24px; }
    .body-content li { margin-bottom: 6px; }
    .body-content strong { color: var(--primary); }

    /* Pricing Table */
    .pricing-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .pricing-table thead tr {
      background: var(--primary);
      color: #fff;
    }
    .pricing-table th {
      padding: 12px 16px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .pricing-table td {
      padding: 12px 16px;
      font-size: 13px;
      border-bottom: 1px solid var(--border);
    }
    .row-even { background: #fff; }
    .row-odd { background: var(--bg-subtle); }
    .item-desc { font-size: 12px; color: var(--text-secondary); }
    .pricing-summary {
      margin-top: 16px;
      margin-left: auto;
      width: 280px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px;
      font-size: 13px;
      color: var(--text-secondary);
    }
    .summary-row.discount { color: var(--success); }
    .summary-row.total {
      background: var(--primary);
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      border-radius: 8px;
      margin-top: 8px;
      padding: 12px 16px;
    }

    /* Team */
    .team-grid { display: flex; flex-wrap: wrap; gap: 16px; }
    .team-card {
      display: flex;
      gap: 14px;
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: 10px;
      width: calc(50% - 8px);
      background: var(--bg-subtle);
    }
    .team-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
      flex-shrink: 0;
    }
    .team-info { flex: 1; }
    .team-name { font-weight: 600; font-size: 14px; color: var(--primary); }
    .team-role { font-size: 12px; color: var(--accent); font-weight: 500; margin-top: 2px; }
    .team-bio { font-size: 12px; color: var(--text-secondary); margin-top: 6px; line-height: 1.5; }

    /* Timeline */
    .timeline { position: relative; padding-left: 32px; }
    .timeline::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 8px;
      bottom: 8px;
      width: 2px;
      background: linear-gradient(to bottom, var(--accent), var(--primary));
      border-radius: 1px;
    }
    .timeline-item {
      position: relative;
      padding-bottom: 24px;
    }
    .timeline-item:last-child { padding-bottom: 0; }
    .timeline-dot {
      position: absolute;
      left: -29px;
      top: 6px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--accent);
      border: 2px solid #fff;
      box-shadow: 0 0 0 2px var(--accent);
    }
    .timeline-dot.last { background: var(--success); box-shadow: 0 0 0 2px var(--success); }
    .timeline-phase { font-weight: 600; font-size: 15px; color: var(--primary); }
    .timeline-duration { font-size: 12px; color: var(--accent); font-weight: 500; margin-top: 2px; }
    .timeline-desc { font-size: 13px; color: var(--text-secondary); margin-top: 6px; }

    /* Footer */
    .pdf-footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      text-align: center;
      font-size: 11px;
      color: var(--text-secondary);
    }

    @media print {
      body { padding: 0; }
      .cover-page { border-radius: 0; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  ${sectionHtml}
  <div class="pdf-footer">
    Generated with ProposalForge &middot; ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
  </div>
  <script>window.print()</script>
</body>
</html>`
}
