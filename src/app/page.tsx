import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Sparkles,
  GripVertical,
  Download,
  Share2,
  BarChart3,
  ArrowRight,
  Zap,
  Shield,
  Clock,
} from "lucide-react"

const features = [
  {
    icon: GripVertical,
    title: "Drag & Drop Builder",
    description:
      "Build proposals visually with reorderable sections — cover, summary, pricing, timeline, and more.",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Sparkles,
    title: "AI Content Generation",
    description:
      "Generate compelling content for any section with multiple tone options. Rewrite, shorten, or expand with one click.",
    color: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: FileText,
    title: "Dynamic Pricing Tables",
    description:
      "Create professional pricing tables with auto-calculated totals, discounts, and tax.",
    color: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Download,
    title: "PDF Export",
    description:
      "Export proposals as beautifully formatted PDFs, ready to send to clients.",
    color: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    icon: Share2,
    title: "Share & Track",
    description:
      "Send proposals via email or shareable link. Track views and get notified when clients respond.",
    color: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analytics",
    description:
      "Monitor proposal status, win rates, and total value from a single dashboard.",
    color: "from-teal-500/20 to-cyan-500/20",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
]

const stats = [
  { icon: Zap, value: "10x", label: "Faster Creation" },
  { icon: Shield, value: "100%", label: "Secure & Private" },
  { icon: Clock, value: "24/7", label: "AI Assistance" },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5 font-bold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <span className="text-xl tracking-tight">Propify.ai</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/25">
              <Link href="/login">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          {/* Background effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl" />
            <div className="absolute top-20 left-20 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl animate-glow" />
            <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-glow delay-200" />
          </div>

          <div className="container mx-auto px-4 pt-20 pb-24 text-center">
            {/* Badge */}
            <div className="animate-slide-up inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Proposal Builder
            </div>

            <h1 className="animate-slide-up delay-100 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl leading-[1.1]">
              Create winning proposals
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                in minutes, not hours
              </span>
            </h1>

            <p className="animate-slide-up delay-200 mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Propify.ai is the AI-powered proposal builder that helps you
              create professional, compelling proposals with drag-and-drop ease.
              Close more deals, faster.
            </p>

            <div className="animate-slide-up delay-300 mt-10 flex items-center justify-center gap-4">
              <Button size="lg" asChild className="rounded-full px-8 h-12 text-base shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all">
                <Link href="/login">
                  Start Building Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 text-base">
                <Link href="#features">See Features</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="animate-slide-up delay-400 mt-16 flex items-center justify-center gap-8 sm:gap-16">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-2">
                    <stat.icon className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent"> close deals</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              From AI content generation to PDF export, Propify.ai handles the entire proposal workflow.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-violet-600 p-12 sm:p-16 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to win more deals?
              </h2>
              <p className="text-white/80 max-w-lg mx-auto mb-8 text-lg">
                Join thousands of professionals creating stunning proposals with AI. Start for free, no credit card required.
              </p>
              <Button size="lg" variant="secondary" asChild className="rounded-full px-10 h-12 text-base font-semibold shadow-xl">
                <Link href="/login">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <span>Propify.ai</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Propify.ai. Built with Next.js, Tailwind, and AI.
          </p>
        </div>
      </footer>
    </div>
  )
}
