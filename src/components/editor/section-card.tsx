"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

const RichTextSection = dynamic(() => import("./section-types/rich-text-section").then((m) => m.RichTextSection), { ssr: false })
const PricingSection = dynamic(() => import("./section-types/pricing-section").then((m) => m.PricingSection), { ssr: false })
const CoverSection = dynamic(() => import("./section-types/cover-section").then((m) => m.CoverSection), { ssr: false })
const TimelineSection = dynamic(() => import("./section-types/timeline-section").then((m) => m.TimelineSection), { ssr: false })
const TeamSection = dynamic(() => import("./section-types/team-section").then((m) => m.TeamSection), { ssr: false })
const ContactSection = dynamic(() => import("./section-types/contact-section").then((m) => m.ContactSection), { ssr: false })

interface Section {
  id: string
  type: string
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
  order: number
}

export function SectionCard({
  section,
  isActive,
  onFocus,
  onUpdate,
  onDelete,
}: {
  section: Section
  isActive: boolean
  onFocus: () => void
  onUpdate: (updates: Partial<Section>) => void
  onDelete: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  function renderContent() {
    switch (section.type) {
      case "COVER":
        return (
          <CoverSection
            content={section.content}
            onChange={(content) => onUpdate({ content })}
          />
        )
      case "PRICING":
        return (
          <PricingSection
            content={section.content}
            onChange={(content) => onUpdate({ content })}
          />
        )
      case "TIMELINE":
        return (
          <TimelineSection
            content={section.content}
            onChange={(content) => onUpdate({ content })}
          />
        )
      case "TEAM":
        return (
          <TeamSection
            content={section.content}
            onChange={(content) => onUpdate({ content })}
          />
        )
      case "CONTACT":
        return (
          <ContactSection
            content={section.content}
            onChange={(content) => onUpdate({ content })}
          />
        )
      default:
        return (
          <RichTextSection
            content={(section.content as { html?: string }).html || ""}
            onChange={(html) => onUpdate({ content: { html } })}
          />
        )
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={cn(
          "transition-all",
          isDragging && "opacity-50 shadow-lg",
          isActive && "ring-2 ring-primary"
        )}
        onClick={onFocus}
      >
        <CardHeader className="flex flex-row items-center gap-2 py-3 px-4">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <Input
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="h-auto border-0 p-0 text-sm font-semibold shadow-none focus-visible:ring-0"
          />
          <Badge variant="outline" className="shrink-0 text-xs">
            {section.type}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        {!collapsed && (
          <CardContent className="px-4 pb-4 pt-0">
            {renderContent()}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
