import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOwnerFilter } from "@/lib/admin-filter"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const ownerFilter = await getOwnerFilter(session.user.id)

  const [proposals, counts] = await Promise.all([
    prisma.proposal.findMany({
      where: { ...ownerFilter, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        clientName: true,
        status: true,
        totalValue: true,
        updatedAt: true,
      },
    }),
    prisma.proposal.groupBy({
      by: ["status"],
      where: { ...ownerFilter, deletedAt: null },
      _count: true,
    }),
  ])

  const countMap: Record<string, number> = {}
  for (const c of counts) countMap[c.status] = c._count

  const totalValue = await prisma.proposal.aggregate({
    where: { ...ownerFilter, status: "ACCEPTED", deletedAt: null },
    _sum: { totalValue: true },
  })

  const stats = {
    total: Object.values(countMap).reduce((a, b) => a + b, 0),
    draft: countMap["DRAFT"] || 0,
    sent: countMap["SENT"] || 0,
    viewed: countMap["VIEWED"] || 0,
    accepted: countMap["ACCEPTED"] || 0,
    declined: countMap["DECLINED"] || 0,
    totalValue: Number(totalValue._sum.totalValue || 0),
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
