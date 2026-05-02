import { redirect } from "next/navigation"
import { Providers } from "@/components/providers"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function getUser(userId: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        select: { isActivated: true, isAdmin: true },
      })
    } catch {
      if (attempt === 2) return null
      await new Promise((r) => setTimeout(r, 1000))
    }
  }
  return null
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await getUser(session.user.id)

  if (!user?.isActivated && !user?.isAdmin) redirect("/activate")

  return (
    <Providers>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </Providers>
  )
}
