'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { toast } from 'sonner'
import {
  FileBarChart, Download, Calendar, Filter,
  Clock, Briefcase, TrendingUp, Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { PageHeader } from '@/components/layouts/page-header'
import { cn } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import dynamic from 'next/dynamic'

const ProjectPieChart = dynamic(() => import('./project-pie-chart'), { ssr: false, loading: () => <div className="h-[300px] bg-muted/30 rounded-lg animate-pulse" /> })
const DailyBarChart = dynamic(() => import('./daily-bar-chart'), { ssr: false, loading: () => <div className="h-[300px] bg-muted/30 rounded-lg animate-pulse" /> })

interface ReportData {
  entries: any[]
  summary: {
    totalEntries: number
    totalDuration: number
    totalHours: number
    projectBreakdown: { name: string; seconds: number; hours: number }[]
    dailyBreakdown: { date: string; seconds: number; hours: number }[]
  }
}

type DateRange = 'today' | 'week' | 'month' | 'custom'

export function ReportsClient({ userRole }: { userRole: string }) {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [exporting, setExporting] = useState(false)

  // Set initial dates based on month
  useEffect(() => {
    applyDateRange('month')
  }, [])

  const applyDateRange = (range: DateRange) => {
    setDateRange(range)
    const now = new Date()
    switch (range) {
      case 'today':
        setStartDate(format(now, 'yyyy-MM-dd'))
        setEndDate(format(now, 'yyyy-MM-dd'))
        break
      case 'week':
        setStartDate(format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'))
        setEndDate(format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'))
        break
      case 'month':
        setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'))
        setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'))
        break
      case 'custom':
        break
    }
  }

  const fetchReport = useCallback(async () => {
    if (!startDate || !endDate) return
    setLoading(true)
    try {
      let url = `/api/reports?startDate=${new Date(startDate).toISOString()}&endDate=${new Date(endDate).toISOString()}`
      if (selectedUserId) url += `&userId=${selectedUserId}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setReportData(data ?? null)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [startDate, endDate, selectedUserId])

  useEffect(() => { fetchReport() }, [fetchReport])

  // Fetch users for admin
  useEffect(() => {
    if (userRole === 'ADMIN') {
      fetch('/api/users').then((r: Response) => r.ok ? r.json() : []).then((d: any) => setUsers(d ?? [])).catch(() => {})
    }
  }, [userRole])

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      let url = `/api/reports/export?startDate=${new Date(startDate).toISOString()}&endDate=${new Date(endDate).toISOString()}`
      if (selectedUserId) url += `&userId=${selectedUserId}`
      const res = await fetch(url)
      if (res.ok) {
        const blob = await res.blob()
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `time-report-${startDate}-to-${endDate}.csv`
        a.click()
        URL.revokeObjectURL(a.href)
        toast.success('Report exported!')
      } else {
        toast.error('Failed to export')
      }
    } catch {
      toast.error('Failed to export')
    } finally {
      setExporting(false)
    }
  }

  const summary = reportData?.summary
  const avgDaily = (summary?.dailyBreakdown?.length ?? 0) > 0
    ? ((summary?.totalHours ?? 0) / (summary?.dailyBreakdown?.length ?? 1))
    : 0

  return (
    <div className="space-y-6">
      <FadeIn>
        <PageHeader
          title="Reports"
          description="Detailed analysis of time tracking data"
          actions={
            <Button onClick={handleExportCSV} loading={exporting} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          }
        />
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.1}>
        <Card style={{ boxShadow: 'var(--shadow-sm)' }}>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex gap-2">
                {(['today', 'week', 'month', 'custom'] as DateRange[]).map((r: DateRange) => (
                  <Button
                    key={r}
                    variant={dateRange === r ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyDateRange(r)}
                    className="capitalize"
                  >
                    {r}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setStartDate(e.target.value); setDateRange('custom') }}
                    className="h-8 text-sm w-[140px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEndDate(e.target.value); setDateRange('custom') }}
                    className="h-8 text-sm w-[140px]"
                  />
                </div>
              </div>
              {userRole === 'ADMIN' && (users ?? []).length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs">Employee</Label>
                  <select
                    value={selectedUserId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedUserId(e.target.value)}
                    className="h-8 text-sm px-2 rounded-md border border-input bg-background"
                  >
                    <option value="">All Employees</option>
                    {(users ?? []).map((u: any) => (
                      <option key={u?.id} value={u?.id}>{u?.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Summary Stats */}
      <Stagger>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Hours', value: (summary?.totalHours ?? 0).toFixed(1), icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Total Entries', value: (summary?.totalEntries ?? 0).toString(), icon: FileBarChart, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Avg. Daily', value: avgDaily.toFixed(1) + 'h', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { label: 'Projects', value: (summary?.projectBreakdown?.length ?? 0).toString(), icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          ].map((stat: any, i: number) => (
            <StaggerItem key={i}>
              <Card style={{ boxShadow: 'var(--shadow-sm)' }}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat?.bg)}>
                      <stat.icon className={cn('w-5 h-5', stat?.color)} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat?.label}</p>
                      <p className="text-2xl font-bold font-mono tracking-tight">{stat?.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </div>
      </Stagger>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.2}>
          <Card style={{ boxShadow: 'var(--shadow-sm)' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Daily Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {loading ? (
                  <div className="h-full bg-muted/30 rounded-lg animate-pulse" />
                ) : (
                  <DailyBarChart data={summary?.dailyBreakdown ?? []} />
                )}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card style={{ boxShadow: 'var(--shadow-sm)' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Project Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {loading ? (
                  <div className="h-full bg-muted/30 rounded-lg animate-pulse" />
                ) : (
                  <ProjectPieChart data={summary?.projectBreakdown ?? []} />
                )}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Detailed Table */}
      <FadeIn delay={0.4}>
        <Card style={{ boxShadow: 'var(--shadow-sm)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Detailed Entries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i: number) => (
                  <div key={i} className="h-10 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (reportData?.entries ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No entries for the selected period</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {userRole === 'ADMIN' && <TableHead>Employee</TableHead>}
                      <TableHead>Date</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Task</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(reportData?.entries ?? []).map((entry: any) => (
                      <TableRow key={entry?.id}>
                        {userRole === 'ADMIN' && <TableCell className="text-sm">{entry?.user?.name ?? '-'}</TableCell>}
                        <TableCell className="text-sm font-mono">
                          {entry?.date ? format(new Date(entry.date), 'MMM d') : '-'}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {entry?.startTime ? format(new Date(entry.startTime), 'h:mm a') : '-'}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {entry?.endTime ? format(new Date(entry.endTime), 'h:mm a') : '-'}
                        </TableCell>
                        <TableCell className="text-sm font-mono font-medium">
                          {entry?.duration ? `${Math.floor(entry.duration / 3600)}h ${Math.floor((entry.duration % 3600) / 60)}m` : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="secondary" className="text-xs">{entry?.project ?? '-'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{entry?.task ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
