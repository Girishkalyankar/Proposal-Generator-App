"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Download } from "lucide-react"
import { pdfDesigns } from "@/lib/pdf-designs"

interface PdfDesignPickerProps {
  open: boolean
  onClose: () => void
  proposalId: string
}

export function PdfDesignPicker({ open, onClose, proposalId }: PdfDesignPickerProps) {
  const [selected, setSelected] = useState("corporate-blue")
  const [loading, setLoading] = useState(false)

  function handleExport() {
    setLoading(true)
    window.open(`/api/proposals/${proposalId}/pdf?design=${selected}`, "_blank")
    setTimeout(() => {
      setLoading(false)
      onClose()
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose PDF Design</DialogTitle>
          <DialogDescription>Select a design template for your proposal PDF</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-2">
          {pdfDesigns.map((design) => (
            <button
              key={design.id}
              onClick={() => setSelected(design.id)}
              className={`group relative flex flex-col rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.03] ${
                selected === design.id
                  ? "border-primary ring-2 ring-primary/20 shadow-lg"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {/* Mini preview */}
              <div
                className="h-24 relative flex flex-col items-center justify-center p-3"
                style={{ backgroundColor: design.colors.coverBg }}
              >
                <div className="text-2xl mb-1">{design.preview}</div>
                <div
                  className="text-[8px] font-bold tracking-widest uppercase"
                  style={{ color: design.colors.coverText, opacity: 0.7 }}
                >
                  PROPOSAL
                </div>
                <div
                  className="text-[10px] font-semibold mt-0.5"
                  style={{ color: design.colors.coverText }}
                >
                  {design.name}
                </div>

                {selected === design.id && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                )}
              </div>

              {/* Bottom section mimicking page content */}
              <div className="p-2 bg-white space-y-1.5">
                <div className="h-1 rounded-full w-3/4" style={{ backgroundColor: design.colors.primary }} />
                <div className="h-0.5 rounded-full w-full" style={{ backgroundColor: design.colors.border }} />
                <div className="h-0.5 rounded-full w-5/6" style={{ backgroundColor: design.colors.border }} />
                <div className="h-0.5 rounded-full w-2/3" style={{ backgroundColor: design.colors.border }} />
                <div className="flex gap-1 mt-1">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: design.colors.accent }} />
                  <div className="h-0.5 rounded-full w-1/2 mt-0.5" style={{ backgroundColor: design.colors.border }} />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div>
            <p className="text-sm font-medium">{pdfDesigns.find((d) => d.id === selected)?.name}</p>
            <p className="text-xs text-muted-foreground">{pdfDesigns.find((d) => d.id === selected)?.description}</p>
          </div>
          <Button onClick={handleExport} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            {loading ? "Generating..." : "Export PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
