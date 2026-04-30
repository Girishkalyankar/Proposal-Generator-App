import { prisma } from "./prisma"

export async function isUserActivated(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActivated: true, isAdmin: true },
  })
  return user?.isActivated === true || user?.isAdmin === true
}

export async function getOwnerFilter(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  })

  if (user?.isAdmin) {
    const adminUsers = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true },
    })
    return { userId: { in: adminUsers.map((u) => u.id) } }
  }

  return { userId }
}
