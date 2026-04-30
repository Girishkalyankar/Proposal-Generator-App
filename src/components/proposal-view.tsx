"use client"

import DOMPurify from "isomorphic-dompurify"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { CheckCircle2, XCircle, Mail, Phone, MapPin, Globe, AtSign, Camera } from "lucide-react"
import { toast } from "sonner"

interface Section {
  id: string
  type: string
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
}

interface Proposal {
  id: string
  title: string
  clientName: string | null
  status: string
  shareToken: string | null
  sections: Section[]
  user: { name: string | null; email: string }
}

export function ProposalView({ proposal }: { proposal: Proposal }) {
  async function respond(status: "ACCEPTED" | "DECLINED") {
    await fetch(`/api/proposals/${proposal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    toast.success(status === "ACCEPTED" ? "Proposal accepted!" : "Proposal declined")
    window.location.reload()
  }

  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      {proposal.sections.map((section) => {
        const content = section.content

        if (section.type === "COVER") {
          return (
            <div key={section.id} className="text-center py-12 mb-8 border-b">
              <h1 className="text-3xl font-bold">
                {(content.projectTitle as string) || proposal.title}
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Prepared for{" "}
                {(content.clientName as string) || proposal.clientName || "Client"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {(content.date as string) || ""}
              </p>
              {content.companyName && (
                <p className="text-sm text-muted-foreground mt-4">
                  By {content.companyName as string}
                </p>
              )}
            </div>
          )
        }

        if (section.type === "PRICING") {
          const items = ((content.items as unknown[]) || []) as {
            id: string; name: string; description: string; qty: number; unitPrice: number
          }[]
          const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0)
          const currency = (content.currency as string) || "INR"
          const locale = currency === "INR" ? "en-IN" : "en-US"
          const symbol = currency === "INR" ? "₹" : "$"
          const fmt = (n: number) => `${symbol}${n.toLocaleString(locale, { minimumFractionDigits: 2 })}`

          return (
            <Card key={section.id} className="mb-6">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{item.qty}</TableCell>
                        <TableCell className="text-right">{fmt(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{fmt(item.qty * item.unitPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">{fmt(subtotal)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          )
        }

        if (section.type === "TIMELINE") {
          const items = ((content.items as unknown[]) || []) as {
            id: string; phase: string; description: string; duration: string
          }[]
          return (
            <Card key={section.id} className="mb-6">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, i) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                        {i < items.length - 1 && <div className="w-px flex-1 bg-border" />}
                      </div>
                      <div>
                        <p className="font-medium">{item.phase}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <Badge variant="outline" className="mt-1">{item.duration}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        }

        if (section.type === "TEAM") {
          const members = ((content.members as unknown[]) || []) as {
            id: string; name: string; role: string; bio?: string
          }[]
          return (
            <Card key={section.id} className="mb-6">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {members.map((m) => (
                    <div key={m.id} className="rounded-lg border p-3">
                      <p className="font-medium">{m.name}</p>
                      <p className="text-sm text-muted-foreground">{m.role}</p>
                      {m.bio && <p className="text-sm mt-1">{m.bio}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        }

        if (section.type === "CONTACT") {
          return (
            <Card key={section.id} className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {content.studioName && (
                  <p className="text-lg font-semibold mb-3">{content.studioName as string}</p>
                )}
                {content.services && (
                  <p className="text-sm text-muted-foreground mb-4">{content.services as string}</p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {content.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>{content.email as string}</span>
                    </div>
                  )}
                  {content.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{content.phone as string}</span>
                    </div>
                  )}
                  {content.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-primary" />
                      <span>{content.website as string}</span>
                    </div>
                  )}
                  {content.instagram && (
                    <div className="flex items-center gap-2 text-sm">
                      <AtSign className="h-4 w-4 text-primary" />
                      <span>{content.instagram as string}</span>
                    </div>
                  )}
                </div>
                {content.address && (
                  <div className="flex items-start gap-2 text-sm mt-3">
                    <MapPin className="h-4 w-4 text-primary mt-0.5" />
                    <span>{content.address as string}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        }

        return (
          <Card key={section.id} className="mb-6">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize((content.html as string) || "") }}
              />
            </CardContent>
          </Card>
        )
      })}

      {(proposal.status === "VIEWED" || proposal.status === "SENT") && (
        <div className="flex justify-center gap-4 py-8 border-t mt-8">
          <Button onClick={() => respond("ACCEPTED")} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Accept Proposal
          </Button>
          <Button variant="outline" onClick={() => respond("DECLINED")} className="gap-2">
            <XCircle className="h-4 w-4" />
            Decline
          </Button>
        </div>
      )}

      {proposal.status === "ACCEPTED" && (
        <div className="text-center py-8 border-t mt-8">
          <Badge className="text-base px-4 py-2">Accepted</Badge>
        </div>
      )}
    </div>
  )
}
