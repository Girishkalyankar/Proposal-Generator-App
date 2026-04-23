"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  LayoutDashboard,
  Plus,
  FolderOpen,
  Settings,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Proposals", href: "/proposals", icon: FileText },
  { name: "Templates", href: "/templates", icon: FolderOpen },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r bg-sidebar">
      <div className="flex h-16 items-center border-b px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25">
            <FileText className="h-4 w-4" />
          </div>
          <span className="text-lg tracking-tight">ProposalForge</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col gap-1.5 p-4">
        <Button asChild className="mb-4 w-full justify-start gap-2 rounded-xl h-10 shadow-lg shadow-primary/20">
          <Link href="/proposals/new">
            <Plus className="h-4 w-4" />
            New Proposal
          </Link>
        </Button>

        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* AI Tip Card */}
        <div className="mt-auto mb-2 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">AI Powered</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Generate proposal content instantly with AI. Select any section and click Generate.
          </p>
        </div>
      </div>

      <div className="border-t p-4">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            pathname === "/settings"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
