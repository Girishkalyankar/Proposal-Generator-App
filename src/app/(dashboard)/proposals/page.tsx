import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOwnerFilter } from "@/lib/admin-filter"
import { redirect } from "next/navigation"
import { ProposalsList } from "@/components/proposals-list"

export default async function ProposalsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const ownerFilter = await getOwnerFilter(session.user.id)
  const proposals = await prisma.proposal.findMany({
    where: { ...ownerFilter, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: { sections: { select: { id: true } } },
  })

  return <ProposalsList proposals={JSON.parse(JSON.stringify(proposals))} />
}
