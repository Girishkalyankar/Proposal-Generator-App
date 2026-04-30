import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOwnerFilter } from "@/lib/admin-filter"
import { redirect } from "next/navigation"
import { ProposalEditor } from "@/components/editor/proposal-editor"

export default async function EditProposalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const ownerFilter = await getOwnerFilter(session.user.id)
  const proposal = await prisma.proposal.findFirst({
    where: { id, ...ownerFilter, deletedAt: null },
    include: { sections: { orderBy: { order: "asc" } } },
  })

  if (!proposal) redirect("/proposals")

  return (
    <ProposalEditor
      proposal={JSON.parse(JSON.stringify(proposal))}
    />
  )
}
