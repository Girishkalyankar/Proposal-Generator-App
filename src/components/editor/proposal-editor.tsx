"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Save, Send, Download, Loader2, CheckCircle2, XCircle, Eye, FileEdit } from "lucide-react"
import { SectionCard } from "./section-card"
import { AiToolbar } from "./ai-toolbar"
import { useAutoSave } from "@/hooks/use-auto-save"
import { toast } from "sonner"
import { PdfDesignPicker } from "./pdf-design-picker"
import type { SectionType } from "@/types"

interface Section {
  id: string
  type: string
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
  order: number
}

interface Proposal {
  id: string
  title: string
  clientName: string | null
  clientEmail: string | null
  status: string
  shareToken: string | null
  sections: Section[]
  lastEditedBy?: string | null
  lastEditedAt?: string | null
}

const sectionTypes: { type: SectionType; label: string }[] = [
  { type: "SUMMARY", label: "Executive Summary" },
  { type: "PROBLEM", label: "Problem Statement" },
  { type: "SOLUTION", label: "Proposed Solution" },
  { type: "PRICING", label: "Pricing Table" },
  { type: "TIMELINE", label: "Timeline" },
  { type: "TEAM", label: "Team" },
  { type: "TERMS", label: "Terms & Conditions" },
  { type: "CONTACT", label: "Studio / Contact Details" },
  { type: "CUSTOM", label: "Custom Section" },
]

export function ProposalEditor({ proposal: initial }: { proposal: Proposal }) {
  const [proposal, setProposal] = useState(initial)
  const [sections, setSections] = useState(initial.sections)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showPdfPicker, setShowPdfPicker] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const computeTotalValue = useCallback(() => {
    return sections
      .filter((s) => s.type === "PRICING")
      .reduce((total, s) => {
        const items = (s.content?.items || []) as { qty: number; unitPrice: number }[]
        const subtotal = items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0)
        const discount = (s.content?.discount || 0) as number
        const taxRate = (s.content?.taxRate || 0) as number
        const afterDiscount = subtotal - subtotal * (discount / 100)
        return total + afterDiscount + afterDiscount * (taxRate / 100)
      }, 0)
  }, [sections])

  async function changeStatus(newStatus: string) {
    setProposal((p) => ({ ...p, status: newStatus }))
    await fetch(`/api/proposals/${proposal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, totalValue: computeTotalValue() }),
    })
    toast.success(`Status changed to ${newStatus.toLowerCase()}`)
  }

  const save = useCallback(async () => {
    setSaving(true)
    try {
      await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: proposal.title,
          clientName: proposal.clientName,
          clientEmail: proposal.clientEmail,
          status: proposal.status,
          totalValue: computeTotalValue(),
        }),
      })

      await fetch(`/api/proposals/${proposal.id}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: sections.map((s, i) => ({
            id: s.id,
            title: s.title,
            content: s.content,
            order: i,
          })),
        }),
      })

      toast.success("Saved")
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }, [proposal, sections, computeTotalValue])

  const triggerAutoSave = useAutoSave(save)

  function updateSection(id: string, updates: Partial<Section>) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
    triggerAutoSave()
  }

  async function addSection(type: SectionType, title: string) {
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, content: type === "PRICING" ? { items: [], currency: "INR" } : type === "TIMELINE" ? { items: [] } : type === "TEAM" ? { members: [] } : type === "CONTACT" ? { studioName: "", services: "", email: "", phone: "", address: "", website: "", instagram: "" } : { html: "" } }),
      })
      const section = await res.json()
      setSections((prev) => [...prev, section])
      toast.success("Section added")
    } catch {
      toast.error("Failed to add section")
    }
  }

  async function deleteSection(sectionId: string) {
    try {
      await fetch(`/api/proposals/${proposal.id}/sections`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId }),
      })
      setSections((prev) => prev.filter((s) => s.id !== sectionId))
      toast.success("Section removed")
    } catch {
      toast.error("Failed to delete section")
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id)
      const newIndex = prev.findIndex((s) => s.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
    triggerAutoSave()
  }

  function handleExportPdf() {
    setShowPdfPicker(true)
  }

  const [now] = useState(() => Date.now())
  const recentEdit = initial.lastEditedAt && (now - new Date(initial.lastEditedAt).getTime()) < 5 * 60 * 1000

  return (
    <div className="space-y-4">
      {recentEdit && initial.lastEditedBy && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 px-4 py-2 text-sm text-amber-800 dark:text-amber-200">
          {initial.lastEditedBy} was editing this proposal recently. Changes may overlap.
        </div>
      )}
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          value={proposal.title}
          onChange={(e) => {
            setProposal((p) => ({ ...p, title: e.target.value }))
            triggerAutoSave()
          }}
          className="text-lg font-semibold max-w-md"
          placeholder="Proposal title"
        />
        <Input
          value={proposal.clientName || ""}
          onChange={(e) => {
            setProposal((p) => ({ ...p, clientName: e.target.value }))
            triggerAutoSave()
          }}
          className="max-w-xs"
          placeholder="Client name"
        />
        <Select value={proposal.status} onValueChange={(v) => v && changeStatus(v)}>
          <SelectTrigger className="w-[150px] h-8 text-xs font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">
              <span className="flex items-center gap-2"><FileEdit className="h-3 w-3 text-gray-500" /> Draft</span>
            </SelectItem>
            <SelectItem value="SENT">
              <span className="flex items-center gap-2"><Send className="h-3 w-3 text-blue-500" /> Sent</span>
            </SelectItem>
            <SelectItem value="VIEWED">
              <span className="flex items-center gap-2"><Eye className="h-3 w-3 text-amber-500" /> Viewed</span>
            </SelectItem>
            <SelectItem value="ACCEPTED">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Accepted</span>
            </SelectItem>
            <SelectItem value="DECLINED">
              <span className="flex items-center gap-2"><XCircle className="h-3 w-3 text-red-500" /> Declined</span>
            </SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save
        </Button>
<Button variant="outline" size="sm" onClick={handleExportPdf}>
          <Download className="mr-2 h-4 w-4" />
          PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  isActive={activeSection === section.id}
                  onFocus={() => setActiveSection(section.id)}
                  onUpdate={(updates) => updateSection(section.id, updates)}
                  onDelete={() => deleteSection(section.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-md border border-dashed border-input bg-background px-4 py-2 text-sm font-medium w-full hover:bg-accent hover:text-accent-foreground transition-colors">
              <Plus className="h-4 w-4" />
              Add Section
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {sectionTypes.map((st) => (
                <DropdownMenuItem
                  key={st.type}
                  onClick={() => addSection(st.type, st.label)}
                >
                  {st.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="hidden lg:block">
          <AiToolbar
            proposalId={proposal.id}
            activeSection={
              activeSection
                ? sections.find((s) => s.id === activeSection) || null
                : null
            }
            context={{
              companyName: "",
              clientName: proposal.clientName || "",
              projectBrief: proposal.title,
            }}
            onContentGenerated={(content) => {
              if (activeSection) {
                updateSection(activeSection, { content: { html: content } })
              }
            }}
          />
        </div>
      </div>

      <PdfDesignPicker
        open={showPdfPicker}
        onClose={() => setShowPdfPicker(false)}
        proposalId={proposal.id}
      />
    </div>
  )
}
