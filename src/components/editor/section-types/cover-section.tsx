"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CoverContent {
  companyName?: string
  clientName?: string
  projectTitle?: string
  date?: string
}

export function CoverSection({
  content,
  onChange,
}: {
  content: CoverContent
  onChange: (content: CoverContent) => void
}) {
  function update(field: keyof CoverContent, value: string) {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Company Name</Label>
        <Input
          value={content.companyName || ""}
          onChange={(e) => update("companyName", e.target.value)}
          placeholder="Your company"
        />
      </div>
      <div className="space-y-2">
        <Label>Client Name</Label>
        <Input
          value={content.clientName || ""}
          onChange={(e) => update("clientName", e.target.value)}
          placeholder="Client company"
        />
      </div>
      <div className="space-y-2">
        <Label>Project Title</Label>
        <Input
          value={content.projectTitle || ""}
          onChange={(e) => update("projectTitle", e.target.value)}
          placeholder="Project name"
        />
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Input
          type="date"
          value={content.date || ""}
          onChange={(e) => update("date", e.target.value)}
        />
      </div>
    </div>
  )
}
