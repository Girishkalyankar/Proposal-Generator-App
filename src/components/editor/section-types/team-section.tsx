"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface TeamMember {
  id: string
  name: string
  role: string
  bio?: string
}

interface TeamContent {
  members?: TeamMember[]
}

export function TeamSection({
  content,
  onChange,
}: {
  content: TeamContent
  onChange: (content: TeamContent) => void
}) {
  const members = (content.members || []) as TeamMember[]

  function updateMember(id: string, updates: Partial<TeamMember>) {
    onChange({
      ...content,
      members: members.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })
  }

  function addMember() {
    onChange({
      ...content,
      members: [
        ...members,
        { id: crypto.randomUUID(), name: "", role: "", bio: "" },
      ],
    })
  }

  function removeMember(id: string) {
    onChange({ ...content, members: members.filter((m) => m.id !== id) })
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex gap-3 rounded-lg border p-3"
        >
          <div className="flex-1 space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                value={member.name}
                onChange={(e) =>
                  updateMember(member.id, { name: e.target.value })
                }
                placeholder="Name"
                className="h-8"
              />
              <Input
                value={member.role}
                onChange={(e) =>
                  updateMember(member.id, { role: e.target.value })
                }
                placeholder="Role"
                className="h-8"
              />
            </div>
            <Textarea
              value={member.bio || ""}
              onChange={(e) =>
                updateMember(member.id, { bio: e.target.value })
              }
              placeholder="Short bio..."
              className="min-h-[60px] resize-none"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => removeMember(member.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addMember}>
        <Plus className="mr-2 h-4 w-4" />
        Add Team Member
      </Button>
    </div>
  )
}
