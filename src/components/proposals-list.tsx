"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  FileText,
  Plus,
  MoreHorizontal,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { formatDistanceToNow } from "@/lib/date"

interface Proposal {
  id: string
  title: string
  clientName: string | null
  status: string
  totalValue: string | null
  shareToken: string | null
  updatedAt: string
  sections: { id: string }[]
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SENT: { label: "Sent", variant: "outline" },
  VIEWED: { label: "Viewed", variant: "outline" },
  ACCEPTED: { label: "Accepted", variant: "default" },
  DECLINED: { label: "Declined", variant: "destructive" },
}

export function ProposalsList({ proposals: initial }: { proposals: Proposal[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const filtered = initial.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.clientName || "").toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function deleteProposal(id: string) {
    if (!confirm("Are you sure you want to delete this proposal?\n\nDon't worry — it can be recovered by the admin if needed.")) return
    await fetch(`/api/proposals/${id}`, { method: "DELETE" })
    toast.success("Proposal moved to trash")
    router.refresh()
  }

  async function duplicateProposal(id: string) {
    const res = await fetch(`/api/proposals/${id}`)
    if (!res.ok) { toast.error("Failed to load proposal"); return }
    const original = await res.json()
    const newRes = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `${original.title} (Copy)`, clientName: original.clientName, duplicateId: id }),
    })
    if (!newRes.ok) { toast.error("Failed to duplicate"); return }
    const created = await newRes.json()
    toast.success("Proposal duplicated")
    router.push(`/proposals/${created.id}/edit`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground">{initial.length} total proposals</p>
        </div>
        <Button asChild>
          <Link href="/proposals/new">
            <Plus className="mr-2 h-4 w-4" />
            New Proposal
          </Link>
        </Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search proposals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="VIEWED">Viewed</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="DECLINED">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No proposals found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {search || statusFilter !== "ALL"
              ? "Try adjusting your filters"
              : "Create your first proposal to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((proposal) => {
            const config = statusConfig[proposal.status] || statusConfig.DRAFT
            return (
              <div
                key={proposal.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
              >
                <Link
                  href={`/proposals/${proposal.id}/edit`}
                  className="flex items-center gap-3 min-w-0 flex-1"
                >
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{proposal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {proposal.clientName || "No client"} &middot;{" "}
                      {proposal.sections.length} sections &middot;{" "}
                      {formatDistanceToNow(new Date(proposal.updatedAt))}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-3 shrink-0">
                  {proposal.totalValue && (
                    <span className="text-sm font-medium">
                      ₹{Number(proposal.totalValue).toFixed(0)}
                    </span>
                  )}
                  <Badge variant={config.variant}>{config.label}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent hover:text-accent-foreground transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => window.location.href = `/proposals/${proposal.id}/edit`}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateProposal(proposal.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      {proposal.shareToken && (
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/view/${proposal.shareToken}`
                            )
                            toast.success("Link copied")
                          }}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Copy Share Link
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteProposal(proposal.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
