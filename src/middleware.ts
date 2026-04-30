import { auth } from "@/lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const path = req.nextUrl.pathname
  const isAuthPage = path.startsWith("/login") || path.startsWith("/signup")
  const isActivatePage = path.startsWith("/activate")
  const isPublicPage =
    path === "/" ||
    path.startsWith("/view/") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/activate")

  if (isPublicPage) return

  if (isActivatePage) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login", req.nextUrl))
    }
    return
  }

  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", req.nextUrl))
    }
    return
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!_next|static|favicon\\.ico|.*\\.svg$|.*\\.png$|.*\\.jpg$|api/ai).*)"],
}
