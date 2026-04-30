export type ProposalStatus = "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "DECLINED"

export type SectionType =
  | "COVER"
  | "SUMMARY"
  | "PROBLEM"
  | "SOLUTION"
  | "PRICING"
  | "TIMELINE"
  | "TEAM"
  | "TERMS"
  | "CONTACT"
  | "CUSTOM"

export interface PricingItem {
  id: string
  name: string
  description: string
  qty: number
  unitPrice: number
}

export interface PricingContent {
  items: PricingItem[]
  discount?: number
  taxRate?: number
  currency?: string
}

export interface TimelineItem {
  id: string
  phase: string
  description: string
  duration: string
  startDate?: string
}

export interface TimelineContent {
  items: TimelineItem[]
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio?: string
  avatar?: string
}

export interface TeamContent {
  members: TeamMember[]
}

export interface CoverContent {
  companyName: string
  clientName: string
  projectTitle: string
  date: string
  logo?: string
}

export interface RichTextContent {
  html: string
}

export type SectionContent =
  | PricingContent
  | TimelineContent
  | TeamContent
  | CoverContent
  | RichTextContent

export interface ProposalSection {
  id: string
  type: SectionType
  title: string
  content: SectionContent
  order: number
}

export interface Proposal {
  id: string
  title: string
  clientName?: string
  clientEmail?: string
  status: ProposalStatus
  shareToken?: string
  sections: ProposalSection[]
  totalValue?: number
  createdAt: string
  updatedAt: string
}

export type AiTone = "professional" | "friendly" | "persuasive" | "technical"

export interface AiGenerateRequest {
  sectionType: SectionType
  tone: AiTone
  context: {
    companyName?: string
    clientName?: string
    projectBrief?: string
    industry?: string
  }
  existingContent?: string
  action: "generate" | "rewrite" | "shorter" | "longer"
}
