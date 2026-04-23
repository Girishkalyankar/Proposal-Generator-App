"use client"

import Link from "next/link"
import { Plus, FileText, CheckCircle2, TrendingUp, IndianRupee, ArrowUpRight, Eye, Send, FileEdit, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "@/lib/date"
import { WinRateChart } from "./win-rate-chart"
import { ValueChart } from "./value-chart"

interface DashboardStats {
  total: number
  draft: number
  sent: number
  viewed: number
  accepted: number
  declined: number
  totalValue: number
  winRate: number
}

interface DashboardProposal {
  id: string
  title: string
  clientName: string | null
  status: string
  totalValue: string | null
  updatedAt: string
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; dot: string }> = {
  DRAFT: { label: "Draft", variant: "secondary", dot: "bg-gray-400" },
  SENT: { label: "Sent", variant: "outline", dot: "bg-blue-500" },
  VIEWED: { label: "Viewed", variant: "outline", dot: "bg-amber-500" },
  ACCEPTED: { label: "Accepted", variant: "default", dot: "bg-emerald-500" },
  DECLINED: { label: "Declined", variant: "destructive", dot: "bg-red-500" },
}

export function DashboardContent({
  proposals,
  stats,
}: {
  proposals: DashboardProposal[]
  stats: DashboardStats
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your proposals</p>
        </div>
        <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
          <Link href="/proposals/new">
            <Plus className="mr-2 h-4 w-4" />
            New Proposal
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-border/50">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Viewed</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.viewed}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sent</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
              <Send className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.sent}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gray-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-500/10">
              <FileEdit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accepted</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.accepted}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Declined</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.declined}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/50 col-span-2">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
              <IndianRupee className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{stats.totalValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">From accepted proposals</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Proposal Status</CardTitle>
          </CardHeader>
          <CardContent>
            <WinRateChart
              accepted={stats.accepted}
              declined={stats.declined}
              sent={stats.sent}
              draft={stats.draft}
            />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Proposals</CardTitle>
            {proposals.length > 0 && (
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/proposals">View all <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {proposals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">No proposals yet</h3>
                <p className="text-muted-foreground text-sm mt-1 mb-5">
                  Create your first proposal to get started
                </p>
                <Button asChild className="rounded-xl">
                  <Link href="/proposals/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Proposal
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {proposals.slice(0, 10).map((proposal) => {
                  const config = statusConfig[proposal.status] || statusConfig.DRAFT
                  return (
                    <Link
                      key={proposal.id}
                      href={`/proposals/${proposal.id}/edit`}
                      className="flex items-center justify-between rounded-xl border border-border/50 p-3.5 hover:bg-accent/50 hover:border-primary/20 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-2 w-2 rounded-full ${config.dot} shrink-0`} />
                        <div className="min-w-0">
                          <p className="font-medium truncate text-sm">{proposal.title}</p>
                          {proposal.clientName && (
                            <p className="text-xs text-muted-foreground truncate">
                              {proposal.clientName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {proposal.totalValue && (
                          <span className="text-sm font-semibold">
                            ₹{Number(proposal.totalValue).toFixed(0)}
                          </span>
                        )}
                        <Badge variant={config.variant} className="text-[10px] rounded-md">{config.label}</Badge>
                        <span className="text-[10px] text-muted-foreground hidden sm:inline">
                          {formatDistanceToNow(new Date(proposal.updatedAt))}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Value Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-primary" />
            Total Value from Accepted Proposals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ValueChart
            proposals={proposals.filter((p) => p.status === "ACCEPTED")}
          />
        </CardContent>
      </Card>
    </div>
  )
}
