"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts"

interface ValueChartProps {
  proposals: { title: string; clientName: string | null; totalValue: string | null }[]
}

export function ValueChart({ proposals }: ValueChartProps) {
  const data = proposals
    .filter((p) => p.totalValue && Number(p.totalValue) > 0)
    .slice(0, 10)
    .reverse()
    .map((p, i) => ({
      name: p.clientName || p.title.slice(0, 15),
      value: Number(p.totalValue),
    }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
        No accepted proposals with value yet
      </div>
    )
  }

  const cumulativeData = data.reduce<(typeof data[number] & { cumulative: number })[]>((acc, d) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0
    acc.push({ ...d, cumulative: prev + d.value })
    return acc
  }, [])

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={cumulativeData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Cumulative Value"]}
          contentStyle={{
            borderRadius: "10px",
            border: "1px solid var(--color-border)",
            background: "var(--color-card)",
            fontSize: "12px",
          }}
        />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          fill="url(#valueGradient)"
          dot={{ r: 4, fill: "var(--color-primary)", strokeWidth: 2, stroke: "var(--color-card)" }}
          activeDot={{ r: 6, fill: "var(--color-primary)", strokeWidth: 2, stroke: "var(--color-card)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
