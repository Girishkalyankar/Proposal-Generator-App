"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { FileText, Loader2, KeyRound, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function ActivatePage() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Invalid code")
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1500)
    } catch {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-primary/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Propify.ai</span>
        </Link>

        <Card className="border-border/50 shadow-xl shadow-primary/5">
          <CardHeader className="text-center space-y-2 pb-4">
            {success ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-2">
                  <ShieldCheck className="h-7 w-7 text-emerald-600" />
                </div>
                <CardTitle className="text-xl font-bold text-emerald-600">Activated!</CardTitle>
                <CardDescription>Redirecting to dashboard...</CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-2">
                  <KeyRound className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Enter Access Code</CardTitle>
                <CardDescription>
                  Enter the access code you received to unlock Propify.ai
                </CardDescription>
              </>
            )}
          </CardHeader>

          {!success && (
            <CardContent>
              <form onSubmit={handleActivate} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Access Code</Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Enter your code (e.g. PF-XXXX-XXXX)"
                    className="rounded-lg h-12 text-center text-lg font-mono tracking-widest"
                    required
                    maxLength={20}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-lg h-10 shadow-lg shadow-primary/20"
                  disabled={loading || code.length < 4}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="mr-2 h-4 w-4" />
                  )}
                  Activate
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Don&apos;t have a code? Contact the admin to purchase access.
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
