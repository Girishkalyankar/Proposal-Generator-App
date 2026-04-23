"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"

interface WinRateChartProps {
  accepted: number
  declined: number
  sent: number
  draft: number
  viewed: number
}

const STATUS_CONFIG = [
  { name: "Accepted", key: "accepted", color: "#10b981" },
  { name: "Declined", key: "declined", color: "#ef4444" },
  { name: "Sent", key: "sent", color: "#3b82f6" },
  { name: "Viewed", key: "viewed", color: "#f59e0b" },
  { name: "Draft", key: "draft", color: "#94a3b8" },
]

export function WinRateChart({ accepted, declined, sent, draft, viewed }: WinRateChartProps) {
  const counts: Record<string, number> = { accepted, declined, sent, viewed, draft }

  const data = STATUS_CONFIG
    .map((s) => ({ name: s.name, value: counts[s.key], color: s.color }))
    .filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">
        No data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={2}
          stroke="var(--color-card)"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "10px",
            border: "1px solid var(--color-border)",
            background: "var(--color-card)",
            fontSize: "12px",
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => [`${value} proposals`, name]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
