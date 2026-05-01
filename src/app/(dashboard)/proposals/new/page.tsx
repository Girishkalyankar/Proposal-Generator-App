"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FolderOpen, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Template {
  id: string
  name: string
  description: string | null
  category: string | null
  sections: { id: string }[]
}

export default function NewProposalPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [templates, setTemplates] = useState<Template[]>([])
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then(setTemplates)
      .catch(() => {})
  }, [])

  async function createProposal(templateId?: string) {
    if (!title.trim()) {
      toast.error("Please enter a proposal title")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          clientName: clientName || undefined,
          clientEmail: clientEmail || undefined,
          templateId,
        }),
      })
      const proposal = await res.json()
      router.push(`/proposals/${proposal.id}/edit`)
    } catch {
      toast.error("Failed to create proposal")
      setCreating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Proposal</h1>
        <p className="text-muted-foreground">
          Start from scratch or pick a template
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Proposal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Proposal Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website Redesign Proposal"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client company"
              />
            </div>
            <div className="space-y-2">
              <Label>Client Email</Label>
              <Input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@company.com"
              />
            </div>
          </div>
          <Button
            onClick={() => createProposal()}
            disabled={creating || !title.trim()}
            className="w-full"
          >
            {creating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create Blank Proposal
          </Button>
        </CardContent>
      </Card>

      {templates.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Or start from a template
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => {
                  if (title.trim()) createProposal(template.id)
                  else toast.error("Enter a title first")
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                    {template.category && (
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    )}
                  </div>
                  {template.description && (
                    <CardDescription className="text-xs">
                      {template.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    {template.sections.length} sections
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
