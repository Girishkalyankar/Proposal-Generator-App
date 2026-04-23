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
}

const COLORS = ["hsl(142, 71%, 45%)", "hsl(0, 84%, 60%)", "hsl(217, 91%, 60%)", "hsl(220, 9%, 46%)"]

export function WinRateChart({ accepted, declined, sent, draft }: WinRateChartProps) {
  const data = [
    { name: "Accepted", value: accepted },
    { name: "Declined", value: declined },
    { name: "Sent", value: sent },
    { name: "Draft", value: draft },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
        No data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
