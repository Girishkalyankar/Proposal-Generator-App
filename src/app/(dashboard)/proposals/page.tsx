import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProposalsList } from "@/components/proposals-list"

export default async function ProposalsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const proposals = await prisma.proposal.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { sections: { select: { id: true } } },
  })

  return <ProposalsList proposals={JSON.parse(JSON.stringify(proposals))} />
}
