'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#FF6363', '#80D8C3', '#A19AD3', '#72BF78']

interface Props {
  data: { name: string; hours: number }[]
}

export default function ProjectPieChart({ data }: Props) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="hours"
          nameKey="name"
        >
          {(data ?? []).map((_: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          formatter={(value: any) => [`${value} hrs`, 'Hours']}
        />
        <Legend
          verticalAlign="top"
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
