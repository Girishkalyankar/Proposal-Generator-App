import { redirect } from "next/navigation"

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/proposals/${id}/edit`)
}
