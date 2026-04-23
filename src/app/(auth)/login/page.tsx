"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { FileText, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [devEmail, setDevEmail] = useState("demo@proposalforge.app")
  const [devName, setDevName] = useState("Demo User")
  const [loading, setLoading] = useState<string | null>(null)

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading("email")
    await signIn("resend", { email, callbackUrl: "/dashboard" })
    setLoading(null)
  }

  async function handleGoogleSignIn() {
    setLoading("google")
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  async function handleDevSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading("dev")
    await signIn("credentials", {
      email: devEmail,
      name: devName,
      callbackUrl: "/dashboard",
    })
    setLoading(null)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-primary/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight">ProposalForge</span>
        </Link>

        <Card className="border-border/50 shadow-xl shadow-primary/5">
          <CardHeader className="text-center space-y-2 pb-4">
            <CardTitle className="text-xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Sign in to create beautiful proposals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dev Login */}
            <form onSubmit={handleDevSignIn} className="space-y-3">
              <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5 p-4 space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs font-semibold text-primary">Quick Access</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Name</Label>
                  <Input
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                    placeholder="Your name"
                    className="h-9 text-sm rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Email</Label>
                  <Input
                    type="email"
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-9 text-sm rounded-lg"
                    required
                  />
                </div>
                <Button type="submit" className="w-full rounded-lg shadow-lg shadow-primary/20" disabled={loading !== null}>
                  {loading === "dev" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Sign In Instantly
                </Button>
              </div>
            </form>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground font-medium">
                or continue with
              </span>
            </div>

            <Button
              variant="outline"
              className="w-full rounded-lg h-10"
              onClick={handleGoogleSignIn}
              disabled={loading !== null}
            >
              {loading === "google" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg h-10"
                required
              />
              <Button type="submit" variant="outline" className="w-full rounded-lg h-10" disabled={loading !== null}>
                {loading === "email" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Send Magic Link
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
