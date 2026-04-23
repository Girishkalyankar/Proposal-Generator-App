import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { TemplatesList } from "@/components/templates-list"

export default async function TemplatesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const templates = await prisma.template.findMany({
    where: {
      OR: [{ userId: session.user.id }, { isPublic: true }],
    },
    include: { sections: { select: { id: true, type: true } } },
    orderBy: { createdAt: "desc" },
  })

  return <TemplatesList templates={JSON.parse(JSON.stringify(templates))} />
}
