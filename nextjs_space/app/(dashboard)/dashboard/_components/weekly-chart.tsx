'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface WeeklyChartProps {
  data: { day: string; hours: number }[]
}

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#FF6363', '#80D8C3', '#A19AD3']

export default function WeeklyChart({ data }: WeeklyChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data ?? []} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
        <XAxis
          dataKey="day"
          tickLine={false}
          tick={{ fontSize: 11 }}
          axisLine={false}
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
        <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
          {(data ?? []).map((_: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS?.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
