'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface Props {
  data: { date: string; hours: number }[]
}

export default function DailyBarChart({ data }: Props) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data available</div>
  }

  const formatted = (data ?? []).map((d: any) => ({
    ...(d ?? {}),
    label: d?.date ? format(new Date(d.date), 'MMM d') : '',
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={formatted} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
        <XAxis
          dataKey="label"
          tickLine={false}
          tick={{ fontSize: 10 }}
          axisLine={false}
          interval="preserveStartEnd"
          angle={-45}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tickLine={false}
          tick={{ fontSize: 10 }}
          axisLine={false}
          label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
        />
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          formatter={(value: any) => [`${value} hrs`, 'Hours']}
        />
        <Bar dataKey="hours" fill="#60B5FF" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
