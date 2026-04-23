"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"

interface PricingItem {
  id: string
  name: string
  description: string
  qty: number
  unitPrice: number
}

interface PricingContent {
  items?: PricingItem[]
  discount?: number
  taxRate?: number
  currency?: string
}

export function PricingSection({
  content,
  onChange,
}: {
  content: PricingContent
  onChange: (content: PricingContent) => void
}) {
  const items = content.items || []
  const discount = content.discount || 0
  const taxRate = content.taxRate || 0
  const currency = content.currency || "INR"

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
  const discountAmount = subtotal * (discount / 100)
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * (taxRate / 100)
  const total = afterDiscount + taxAmount

  function updateItem(id: string, updates: Partial<PricingItem>) {
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
        {
          id: crypto.randomUUID(),
          name: "",
          description: "",
          qty: 1,
          unitPrice: 0,
        },
      ],
    })
  }

  function removeItem(id: string) {
    onChange({ ...content, items: items.filter((item) => item.id !== id) })
  }

  const locale = currency === "INR" ? "en-IN" : "en-US"
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency }).format(n)

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Item</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[80px] text-right">Qty</TableHead>
            <TableHead className="w-[120px] text-right">Unit Price</TableHead>
            <TableHead className="w-[120px] text-right">Total</TableHead>
            <TableHead className="w-[40px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Input
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  placeholder="Item name"
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={item.description}
                  onChange={(e) =>
                    updateItem(item.id, { description: e.target.value })
                  }
                  placeholder="Description"
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  value={item.qty}
                  onChange={(e) =>
                    updateItem(item.id, { qty: Number(e.target.value) })
                  }
                  className="h-8 text-right"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.unitPrice}
                  onChange={(e) =>
                    updateItem(item.id, { unitPrice: Number(e.target.value) })
                  }
                  className="h-8 text-right"
                />
              </TableCell>
              <TableCell className="text-right font-medium">
                {fmt(item.qty * item.unitPrice)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="text-right font-medium">
              Subtotal
            </TableCell>
            <TableCell className="text-right font-medium">{fmt(subtotal)}</TableCell>
            <TableCell />
          </TableRow>
          {discount > 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-right">
                Discount ({discount}%)
              </TableCell>
              <TableCell className="text-right text-destructive">
                -{fmt(discountAmount)}
              </TableCell>
              <TableCell />
            </TableRow>
          )}
          {taxRate > 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-right">
                Tax ({taxRate}%)
              </TableCell>
              <TableCell className="text-right">{fmt(taxAmount)}</TableCell>
              <TableCell />
            </TableRow>
          )}
          <TableRow>
            <TableCell colSpan={4} className="text-right text-base font-bold">
              Total
            </TableCell>
            <TableCell className="text-right text-base font-bold">
              {fmt(total)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>

      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Currency</span>
          <Select value={currency} onValueChange={(v) => v && onChange({ ...content, currency: v })}>
            <SelectTrigger className="h-8 w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">₹ INR</SelectItem>
              <SelectItem value="USD">$ USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Discount %</span>
          <Input
            type="number"
            min={0}
            max={100}
            value={discount}
            onChange={(e) =>
              onChange({ ...content, discount: Number(e.target.value) })
            }
            className="h-8 w-20"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tax %</span>
          <Input
            type="number"
            min={0}
            max={100}
            value={taxRate}
            onChange={(e) =>
              onChange({ ...content, taxRate: Number(e.target.value) })
            }
            className="h-8 w-20"
          />
        </div>
      </div>
    </div>
  )
}
