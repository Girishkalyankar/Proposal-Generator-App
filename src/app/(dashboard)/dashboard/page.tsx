import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const proposals = await prisma.proposal.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { sections: { orderBy: { order: "asc" } } },
  })

  const stats = {
    total: proposals.length,
    draft: proposals.filter((p) => p.status === "DRAFT").length,
    sent: proposals.filter((p) => p.status === "SENT").length,
    viewed: proposals.filter((p) => p.status === "VIEWED").length,
    accepted: proposals.filter((p) => p.status === "ACCEPTED").length,
    declined: proposals.filter((p) => p.status === "DECLINED").length,
    totalValue: proposals
      .filter((p) => p.status === "ACCEPTED")
      .reduce((sum, p) => sum + Number(p.totalValue || 0), 0),
  }

  const winRate =
    stats.accepted + stats.declined > 0
      ? Math.round((stats.accepted / (stats.accepted + stats.declined)) * 100)
      : 0

  return (
    <DashboardContent
      proposals={JSON.parse(JSON.stringify(proposals))}
      stats={{ ...stats, winRate }}
    />
  )
}
