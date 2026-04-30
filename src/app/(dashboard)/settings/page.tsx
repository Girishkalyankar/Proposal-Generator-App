"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button } from "@/components/ui/button"
import { useColorTheme, type ColorTheme } from "@/hooks/use-color-theme"
import { Check, Download, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

const colorOptions: { value: ColorTheme; label: string; bg: string }[] = [
  { value: "blue", label: "Blue", bg: "oklch(0.488 0.243 264.376)" },
  { value: "purple", label: "Purple", bg: "oklch(0.488 0.243 295)" },
  { value: "orange", label: "Orange", bg: "oklch(0.55 0.22 45)" },
  { value: "pink", label: "Pink", bg: "oklch(0.55 0.22 350)" },
]

export default function SettingsPage() {
  const { data: session } = useSession()
  const { colorTheme, setColorTheme } = useColorTheme()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={session?.user?.name || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={session?.user?.email || ""} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the app appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Toggle dark/light mode</p>
            </div>
            <ThemeToggle />
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Accent Color</p>
            <p className="text-sm text-muted-foreground mb-3">Choose your preferred color scheme</p>
            <div className="flex gap-3">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setColorTheme(option.value)}
                  className="group flex flex-col items-center gap-2"
                >
                  <div
                    style={{ backgroundColor: option.bg }}
                    className={`relative w-10 h-10 rounded-full transition-transform group-hover:scale-110 ${
                      colorTheme === option.value ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110" : ""
                    }`}
                  >
                    {colorTheme === option.value && (
                      <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                    )}
                  </div>
                  <span className={`text-xs font-medium ${colorTheme === option.value ? "text-primary" : "text-muted-foreground"}`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Data Safety
          </CardTitle>
          <CardDescription>Download a backup of all your proposals and templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Export All Data</p>
              <p className="text-sm text-muted-foreground">Download as Excel file — includes all proposals, pricing, and sections</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                window.open("/api/export", "_blank")
                toast.success("Backup download started")
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Backup
            </Button>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              Deleted proposals are kept safely in the database and can be recovered by the admin. We recommend exporting a backup regularly for extra safety.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
