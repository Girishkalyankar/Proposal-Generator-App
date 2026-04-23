import { auth } from "@/lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login")
  const isPublicPage =
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/view/") ||
    req.nextUrl.pathname.startsWith("/api/auth")

  if (isPublicPage) return

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
  matcher: ["/((?!_next|static|favicon.ico).*)"],
}
