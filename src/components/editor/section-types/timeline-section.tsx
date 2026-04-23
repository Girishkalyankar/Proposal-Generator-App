"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TimelineItem {
  id: string
  phase: string
  description: string
  duration: string
  startDate?: string
}

interface TimelineContent {
  items?: TimelineItem[]
}

export function TimelineSection({
  content,
  onChange,
}: {
  content: TimelineContent
  onChange: (content: TimelineContent) => void
}) {
  const items = (content.items || []) as TimelineItem[]

  function updateItem(id: string, updates: Partial<TimelineItem>) {
    onChange({
      ...content,
      items: items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })
  }

  function addItem() {
    onChange({
      ...content,
      items: [
        ...items,
        { id: crypto.randomUUID(), phase: "", description: "", duration: "" },
      ],
    })
  }

  function removeItem(id: string) {
    onChange({ ...content, items: items.filter((item) => item.id !== id) })
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-start gap-3">
          <div className="flex flex-col items-center pt-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {index + 1}
            </div>
            {index < items.length - 1 && (
              <div className="w-px flex-1 bg-border mt-1" />
            )}
          </div>
          <div className="flex-1 grid gap-2 sm:grid-cols-3">
            <Input
              value={item.phase}
              onChange={(e) => updateItem(item.id, { phase: e.target.value })}
              placeholder="Phase name"
              className="h-8"
            />
            <Input
              value={item.description}
              onChange={(e) =>
                updateItem(item.id, { description: e.target.value })
              }
              placeholder="Description"
              className="h-8"
            />
            <Input
              value={item.duration}
              onChange={(e) =>
                updateItem(item.id, { duration: e.target.value })
              }
              placeholder="e.g. 2 weeks"
              className="h-8"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-2 h-4 w-4" />
        Add Phase
      </Button>
    </div>
  )
}
