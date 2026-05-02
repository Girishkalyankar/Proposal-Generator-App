import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ProposalView } from "@/components/proposal-view"

export const maxDuration = 30

export default async function ViewProposalPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  let proposal
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      proposal = await prisma.proposal.findUnique({
        where: { shareToken: token },
        include: { sections: { orderBy: { order: "asc" } }, user: { select: { name: true } } },
      })
      break
    } catch {
      if (attempt === 2) throw new Error("Database temporarily unavailable. Please refresh the page.")
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  if (!proposal || proposal.deletedAt) notFound()

  if (proposal.status === "SENT") {
    await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: "VIEWED", viewedAt: new Date() },
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <ProposalView proposal={JSON.parse(JSON.stringify(proposal))} />
    </div>
  )
}
