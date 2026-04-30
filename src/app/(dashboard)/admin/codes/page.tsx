"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Copy, Ban, Loader2, Pencil, Check } from "lucide-react"
import { toast } from "sonner"

interface AccessCode {
  id: string
  code: string
  label: string | null
  isUsed: boolean
  revoked: boolean
  usedAt: string | null
  revokedAt: string | null
  createdAt: string
  usedBy: { email: string; name: string | null } | null
}

export default function AdminCodesPage() {
  const [codes, setCodes] = useState<AccessCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [count, setCount] = useState(1)
  const [label, setLabel] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")

  useEffect(() => {
    fetch("/api/admin/codes")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCodes(data)
      })
      .finally(() => setLoading(false))
  }, [])

  async function generate() {
    setGenerating(true)
    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, label: label.trim() || null }),
      })
      if (!res.ok) throw new Error("API error")
      const newCodes = await res.json()
      if (!Array.isArray(newCodes)) throw new Error("Invalid response")
      setCodes((prev) => [...newCodes, ...prev])
      setLabel("")
      toast.success(`Generated ${newCodes.length} code(s)`)
    } catch {
      toast.error("Failed to generate codes")
    } finally {
      setGenerating(false)
    }
  }

  async function revoke(codeId: string) {
    await fetch("/api/admin/codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codeId, action: "revoke" }),
    })
    setCodes((prev) =>
      prev.map((c) => (c.id === codeId ? { ...c, revoked: true, revokedAt: new Date().toISOString() } : c))
    )
    toast.success("Code revoked")
  }

  async function saveLabel(codeId: string) {
    await fetch("/api/admin/codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codeId, action: "label", label: editLabel.trim() }),
    })
    setCodes((prev) =>
      prev.map((c) => (c.id === codeId ? { ...c, label: editLabel.trim() || null } : c))
    )
    setEditingId(null)
    toast.success("Label updated")
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    toast.success("Code copied")
  }

  const available = codes.filter((c) => !c.isUsed && !c.revoked).length
  const used = codes.filter((c) => c.isUsed).length
  const revoked = codes.filter((c) => c.revoked).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Access Codes</h1>
        <p className="text-muted-foreground">Generate and manage unique pincodes for buyers</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{available}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{used}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revoked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{revoked}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Codes</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3 flex-wrap">
          <Input
            placeholder="Buyer name (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-48"
          />
          <Input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-20"
          />
          <Button onClick={generate} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Generate
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Used By (Account)</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono font-bold">{code.code}</TableCell>
                  <TableCell>
                    {editingId === code.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="h-7 w-32 text-sm"
                          placeholder="Buyer name"
                          onKeyDown={(e) => e.key === "Enter" && saveLabel(code.id)}
                          autoFocus
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveLabel(code.id)}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{code.label || "—"}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground"
                          onClick={() => { setEditingId(code.id); setEditLabel(code.label || "") }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {code.revoked ? (
                      <Badge variant="destructive">Revoked</Badge>
                    ) : code.isUsed ? (
                      <Badge variant="secondary">Used</Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-700">Available</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {code.usedBy ? code.usedBy.email : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(code.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyCode(code.code)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    {!code.revoked && !code.isUsed && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => revoke(code.id)}>
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
