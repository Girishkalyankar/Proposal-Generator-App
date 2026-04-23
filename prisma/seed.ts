import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const starterTemplates = [
  {
    name: "SaaS Proposal",
    description: "For software-as-a-service product offerings",
    category: "Technology",
    sections: [
      { type: "COVER", title: "Cover Page", content: { companyName: "", clientName: "", projectTitle: "SaaS Implementation Proposal", date: "" }, order: 0 },
      { type: "SUMMARY", title: "Executive Summary", content: { html: "<p>This proposal outlines our SaaS solution designed to streamline your operations and drive measurable results.</p>" }, order: 1 },
      { type: "PROBLEM", title: "Challenges", content: { html: "<p>Your organization faces key challenges including manual processes, data silos, and scaling limitations that impact growth.</p>" }, order: 2 },
      { type: "SOLUTION", title: "Our Solution", content: { html: "<p>Our cloud-based platform provides an integrated suite of tools that automate workflows, unify data, and scale with your business.</p>" }, order: 3 },
      { type: "PRICING", title: "Pricing", content: { items: [{ id: "1", name: "Platform License", description: "Annual subscription", qty: 1, unitPrice: 12000 }, { id: "2", name: "Implementation", description: "Setup and configuration", qty: 1, unitPrice: 5000 }, { id: "3", name: "Training", description: "Team onboarding sessions", qty: 4, unitPrice: 500 }], currency: "USD" }, order: 4 },
      { type: "TIMELINE", title: "Implementation Timeline", content: { items: [{ id: "1", phase: "Discovery", description: "Requirements gathering", duration: "1 week" }, { id: "2", phase: "Setup", description: "Platform configuration", duration: "2 weeks" }, { id: "3", phase: "Migration", description: "Data migration", duration: "1 week" }, { id: "4", phase: "Launch", description: "Go-live and support", duration: "1 week" }] }, order: 5 },
      { type: "TERMS", title: "Terms & Conditions", content: { html: "<p>This proposal is valid for 30 days from the date of issue. Payment terms: 50% upfront, 50% upon completion.</p>" }, order: 6 },
    ],
  },
  {
    name: "Consulting Proposal",
    description: "For professional consulting engagements",
    category: "Consulting",
    sections: [
      { type: "COVER", title: "Cover Page", content: { companyName: "", clientName: "", projectTitle: "Consulting Engagement Proposal", date: "" }, order: 0 },
      { type: "SUMMARY", title: "Executive Summary", content: { html: "<p>We propose a strategic consulting engagement to help your organization achieve its business objectives through expert guidance and hands-on support.</p>" }, order: 1 },
      { type: "PROBLEM", title: "Current Situation", content: { html: "<p>Based on our initial assessment, we've identified several areas where targeted consulting support can deliver significant impact.</p>" }, order: 2 },
      { type: "SOLUTION", title: "Our Approach", content: { html: "<p>Our proven methodology combines deep industry expertise with practical, actionable recommendations tailored to your unique needs.</p>" }, order: 3 },
      { type: "TEAM", title: "Project Team", content: { members: [{ id: "1", name: "Lead Consultant", role: "Project Lead", bio: "15+ years of industry experience" }, { id: "2", name: "Senior Analyst", role: "Research & Analysis", bio: "Specializes in data-driven strategy" }] }, order: 4 },
      { type: "PRICING", title: "Investment", content: { items: [{ id: "1", name: "Strategy Workshop", description: "2-day facilitated session", qty: 1, unitPrice: 8000 }, { id: "2", name: "Consulting Hours", description: "Senior consultant rate", qty: 40, unitPrice: 250 }], currency: "USD" }, order: 5 },
      { type: "TERMS", title: "Terms & Conditions", content: { html: "<p>This proposal is valid for 30 days. Consulting hours are billed monthly in arrears. Travel expenses billed at cost.</p>" }, order: 6 },
    ],
  },
  {
    name: "Freelance Project",
    description: "For individual freelance project proposals",
    category: "Freelance",
    sections: [
      { type: "COVER", title: "Cover Page", content: { companyName: "", clientName: "", projectTitle: "Project Proposal", date: "" }, order: 0 },
      { type: "SUMMARY", title: "Project Overview", content: { html: "<p>Thank you for considering me for this project. Here's my proposal for delivering high-quality work on time and within budget.</p>" }, order: 1 },
      { type: "SOLUTION", title: "What I'll Deliver", content: { html: "<p>A complete, polished deliverable that meets all your requirements, with regular check-ins throughout the process.</p>" }, order: 2 },
      { type: "PRICING", title: "Pricing", content: { items: [{ id: "1", name: "Project Fee", description: "Fixed price for complete delivery", qty: 1, unitPrice: 3000 }], currency: "USD" }, order: 3 },
      { type: "TIMELINE", title: "Timeline", content: { items: [{ id: "1", phase: "Kickoff", description: "Brief and requirements review", duration: "2 days" }, { id: "2", phase: "First Draft", description: "Initial delivery for feedback", duration: "1 week" }, { id: "3", phase: "Revisions", description: "Up to 2 rounds", duration: "3 days" }, { id: "4", phase: "Final Delivery", description: "Polished final version", duration: "2 days" }] }, order: 4 },
      { type: "TERMS", title: "Terms", content: { html: "<p>50% deposit required to begin. Remaining 50% due upon final delivery. Includes 2 revision rounds.</p>" }, order: 5 },
    ],
  },
  {
    name: "Agency Pitch",
    description: "For marketing/creative agency proposals",
    category: "Agency",
    sections: [
      { type: "COVER", title: "Cover Page", content: { companyName: "", clientName: "", projectTitle: "Marketing Campaign Proposal", date: "" }, order: 0 },
      { type: "SUMMARY", title: "The Opportunity", content: { html: "<p>We see a tremendous opportunity to elevate your brand presence and drive measurable growth through a strategic, multi-channel campaign.</p>" }, order: 1 },
      { type: "PROBLEM", title: "Market Landscape", content: { html: "<p>The current market presents both challenges and opportunities. Your competitors are investing heavily in digital, but there are clear gaps we can exploit.</p>" }, order: 2 },
      { type: "SOLUTION", title: "Campaign Strategy", content: { html: "<p>Our integrated campaign combines content marketing, social media, paid advertising, and email nurturing to create a cohesive brand experience.</p>" }, order: 3 },
      { type: "TEAM", title: "Your Team", content: { members: [{ id: "1", name: "Account Director", role: "Strategic Lead", bio: "Your primary point of contact" }, { id: "2", name: "Creative Director", role: "Creative Strategy", bio: "Award-winning creative vision" }, { id: "3", name: "Digital Strategist", role: "Channel Strategy", bio: "Data-driven campaign optimization" }] }, order: 4 },
      { type: "PRICING", title: "Investment", content: { items: [{ id: "1", name: "Campaign Strategy", description: "Research, planning, creative brief", qty: 1, unitPrice: 5000 }, { id: "2", name: "Content Creation", description: "Monthly content package", qty: 3, unitPrice: 4000 }, { id: "3", name: "Ad Management", description: "Monthly ad spend management", qty: 3, unitPrice: 2500 }, { id: "4", name: "Analytics & Reporting", description: "Monthly performance reports", qty: 3, unitPrice: 1000 }], currency: "USD" }, order: 5 },
      { type: "TIMELINE", title: "Campaign Timeline", content: { items: [{ id: "1", phase: "Strategy", description: "Research and planning", duration: "2 weeks" }, { id: "2", phase: "Creative Development", description: "Content and asset creation", duration: "2 weeks" }, { id: "3", phase: "Launch", description: "Campaign go-live", duration: "1 week" }, { id: "4", phase: "Optimization", description: "Monitor and optimize", duration: "Ongoing" }] }, order: 6 },
      { type: "TERMS", title: "Terms & Conditions", content: { html: "<p>3-month minimum engagement. Payment due NET 15. Ad spend billed separately at cost. This proposal is valid for 14 days.</p>" }, order: 7 },
    ],
  },
]

async function main() {
  console.log("Seeding starter templates...")

  for (const tpl of starterTemplates) {
    const existing = await prisma.template.findFirst({
      where: { name: tpl.name, isPublic: true },
    })
    if (existing) {
      console.log(`  Skipping "${tpl.name}" (already exists)`)
      continue
    }

    // Create a system user for public templates if needed
    let systemUser = await prisma.user.findFirst({
      where: { email: "system@proposalforge.app" },
    })
    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: "system@proposalforge.app",
          name: "ProposalForge",
        },
      })
    }

    await prisma.template.create({
      data: {
        name: tpl.name,
        description: tpl.description,
        category: tpl.category,
        isPublic: true,
        userId: systemUser.id,
        sections: {
          create: tpl.sections.map((s) => ({
            type: s.type as never,
            title: s.title,
            content: s.content as never,
            order: s.order,
          })),
        },
      },
    })
    console.log(`  Created "${tpl.name}"`)
  }

  console.log("Seeding complete!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
