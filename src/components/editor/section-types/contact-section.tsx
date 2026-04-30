"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Mail, Phone, MapPin, Globe, AtSign } from "lucide-react"

interface ContactContent {
  studioName: string
  services: string
  email: string
  phone: string
  address: string
  website: string
  instagram: string
}

interface ContactSectionProps {
  content: ContactContent
  onChange: (content: ContactContent) => void
}

export function ContactSection({ content, onChange }: ContactSectionProps) {
  function update(field: keyof ContactContent, value: string) {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary mb-2">
        <Camera className="h-5 w-5" />
        <span className="font-semibold text-sm">Studio / Business Details</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label className="text-xs font-medium">Studio / Business Name</Label>
          <Input
            value={content.studioName || ""}
            onChange={(e) => update("studioName", e.target.value)}
            placeholder="e.g. Stellar Studios"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="text-xs font-medium">Services Offered</Label>
          <Textarea
            value={content.services || ""}
            onChange={(e) => update("services", e.target.value)}
            placeholder="e.g. Photography, Videography, Drone Shots, Photo Editing, Album Design"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Email
          </Label>
          <Input
            type="email"
            value={content.email || ""}
            onChange={(e) => update("email", e.target.value)}
            placeholder="studio@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> Phone Number
          </Label>
          <Input
            value={content.phone || ""}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Location / Address
          </Label>
          <Textarea
            value={content.address || ""}
            onChange={(e) => update("address", e.target.value)}
            placeholder="123 MG Road, Pune, Maharashtra 411001"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" /> Website
          </Label>
          <Input
            value={content.website || ""}
            onChange={(e) => update("website", e.target.value)}
            placeholder="https://www.yourstudio.com"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <AtSign className="h-3.5 w-3.5" /> Instagram
          </Label>
          <Input
            value={content.instagram || ""}
            onChange={(e) => update("instagram", e.target.value)}
            placeholder="@yourstudio"
          />
        </div>
      </div>
    </div>
  )
}
