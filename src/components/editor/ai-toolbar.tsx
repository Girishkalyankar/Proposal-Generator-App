"use client"

import { useState } from "react"
import DOMPurify from "isomorphic-dompurify"
import { Sparkles, Loader2, ArrowDown, ArrowUp, RotateCcw, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { AiTone } from "@/types"

type AiProvider = "groq" | "gemini" | "grok" | "claude"

interface Section {
  id: string
  type: string
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
}

export function AiToolbar({
  proposalId,
  activeSection,
  context,
  onContentGenerated,
}: {
  proposalId: string
  activeSection: Section | null
  context: { companyName: string; clientName: string; projectBrief: string }
  onContentGenerated: (content: string) => void
}) {
  const [tone, setTone] = useState<AiTone>("professional")
  const [provider, setProvider] = useState<AiProvider>("groq")
  const [brief, setBrief] = useState("")
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState("")

  async function generate(action: "generate" | "rewrite" | "shorter" | "longer") {
    if (!activeSection) return
    setLoading(true)
    setPreview("")

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionType: activeSection.type,
          tone,
          provider,
          context: { ...context, projectBrief: brief || context.projectBrief },
          existingContent: (activeSection.content as { html?: string }).html || "",
          action,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || "Generation failed")
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let result = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          result += decoder.decode(value)
          setPreview(result)
        }
      }
    } catch (err) {
      setPreview(err instanceof Error ? err.message : "Failed to generate content. Check your API key.")
    } finally {
      setLoading(false)
    }
  }

  function applyContent() {
    onContentGenerated(preview)
    setPreview("")
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!activeSection ? (
          <p className="text-sm text-muted-foreground">
            Click a section to use AI generation
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Active Section</Label>
              <Badge variant="outline">{activeSection.title}</Badge>
            </div>

            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <Bot className="h-3 w-3" />
                AI Model
              </Label>
              <Select value={provider} onValueChange={(v) => v && setProvider(v as AiProvider)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="groq">
                    Groq (Llama) — Free
                  </SelectItem>
                  <SelectItem value="gemini">
                    Gemini (Google)
                  </SelectItem>
                  <SelectItem value="grok">
                    Grok (xAI)
                  </SelectItem>
                  <SelectItem value="claude">
                    Claude (Anthropic)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Tone</Label>
              <Select value={tone} onValueChange={(v) => v && setTone(v as AiTone)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Brief / Context</Label>
              <Textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Describe what this section should cover..."
                className="min-h-[60px] resize-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                onClick={() => generate("generate")}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="mr-1 h-3 w-3" />
                )}
                Generate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generate("rewrite")}
                disabled={loading}
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Rewrite
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generate("shorter")}
                disabled={loading}
              >
                <ArrowDown className="mr-1 h-3 w-3" />
                Shorter
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generate("longer")}
                disabled={loading}
              >
                <ArrowUp className="mr-1 h-3 w-3" />
                Longer
              </Button>
            </div>

            {preview && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Preview</Label>
                  <Badge variant="secondary" className="text-[10px]">
                    {provider === "groq" ? "Groq" : provider === "gemini" ? "Gemini" : provider === "grok" ? "Grok" : "Claude"}
                  </Badge>
                </div>
                <div
                  className="prose prose-sm dark:prose-invert max-h-[200px] overflow-y-auto rounded-md border p-2 text-sm"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(preview) }}
                />
                <Button size="sm" onClick={applyContent} className="w-full">
                  Apply to Section
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
