'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { toast } from 'sonner'
import {
  Clock, Timer, CalendarDays, TrendingUp, Play, Square,
  ChevronLeft, ChevronRight, Briefcase
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FadeIn, SlideIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { PageHeader } from '@/components/layouts/page-header'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

const WeeklyChart = dynamic(() => import('./weekly-chart'), { ssr: false, loading: () => <div className="h-[250px] bg-muted/30 rounded-lg animate-pulse" /> })

interface TimeEntry {
  id: string
  date: string
  startTime: string
  endTime: string | null
  duration: number | null
  project: string
  task: string
  notes: string
  isClockIn: boolean
  user?: { id: string; name: string; email: string }
}

export function DashboardClient({ userRole }: { userRole: string }) {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [clockedIn, setClockedIn] = useState(false)
  const [activeEntry, setActiveEntry] = useState<any>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [clockLoading, setClockLoading] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const fetchEntries = useCallback(async () => {
    try {
      const start = startOfMonth(currentMonth)
      const end = endOfMonth(currentMonth)
      const res = await fetch(`/api/time-entries?startDate=${start.toISOString()}&endDate=${end.toISOString()}`)
      if (res.ok) {
        const data = await res.json()
        setEntries(data ?? [])
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [currentMonth])

  const checkClockStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/time-entries/clock')
      if (res.ok) {
        const data = await res.json()
        setClockedIn(data?.active ?? false)
        setActiveEntry(data?.entry ?? null)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchEntries()
    checkClockStatus()
  }, [fetchEntries, checkClockStatus])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (clockedIn && activeEntry?.startTime) {
      const updateElapsed = () => {
        const start = new Date(activeEntry.startTime).getTime()
        setElapsed(Math.floor((Date.now() - start) / 1000))
      }
      updateElapsed()
      interval = setInterval(updateElapsed, 1000)
    } else {
      setElapsed(0)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [clockedIn, activeEntry])

  const handleClockIn = async () => {
    setClockLoading(true)
    try {
      const res = await fetch('/api/time-entries/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: 'General' }),
      })
      if (res.ok) {
        toast.success('Clocked in!')
        await checkClockStatus()
        fetchEntries()
      } else {
        const d = await res.json()
        toast.error(d?.error ?? 'Failed to clock in')
      }
    } catch { toast.error('Failed to clock in') } finally { setClockLoading(false) }
  }

  const handleClockOut = async () => {
    setClockLoading(true)
    try {
      const res = await fetch('/api/time-entries/clock', { method: 'PUT' })
      if (res.ok) {
        toast.success('Clocked out!')
        setClockedIn(false)
        setActiveEntry(null)
        fetchEntries()
      } else {
        const d = await res.json()
        toast.error(d?.error ?? 'Failed to clock out')
      }
    } catch { toast.error('Failed to clock out') } finally { setClockLoading(false) }
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Stats
  const todayEntries = (entries ?? []).filter((e: TimeEntry) => {
    try { return isToday(new Date(e?.date)) } catch { return false }
  })
  const todayHours = todayEntries.reduce((sum: number, e: TimeEntry) => sum + (e?.duration ?? 0), 0) / 3600
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEntries = (entries ?? []).filter((e: TimeEntry) => {
    try {
      const d = new Date(e?.date)
      return d >= weekStart && d <= weekEnd
    } catch { return false }
  })
  const weekHours = weekEntries.reduce((sum: number, e: TimeEntry) => sum + (e?.duration ?? 0), 0) / 3600
  const monthHours = (entries ?? []).reduce((sum: number, e: TimeEntry) => sum + (e?.duration ?? 0), 0) / 3600
  const uniqueProjects = [...new Set((entries ?? []).map((e: TimeEntry) => e?.project).filter(Boolean))]

  // Calendar days
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPadding = (monthStart.getDay() + 6) % 7

  const getHoursForDay = (day: Date) => {
    return (entries ?? []).filter((e: TimeEntry) => {
      try { return isSameDay(new Date(e?.date), day) } catch { return false }
    }).reduce((sum: number, e: TimeEntry) => sum + (e?.duration ?? 0), 0) / 3600
  }

  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const weeklyChartData = weekDays.map((day: Date) => ({
    day: format(day, 'EEE'),
    hours: Math.round(getHoursForDay(day) * 100) / 100,
  }))

  return (
    <div className="space-y-6">
      <FadeIn>
        <PageHeader
          title="Dashboard"
          description="Overview of your time tracking activity"
        />
      </FadeIn>

      {/* Clock In/Out Card */}
      <SlideIn from="top">
        <Card className={cn('border-2 transition-all', clockedIn ? 'border-green-500/30 bg-green-50/50 dark:bg-green-950/20' : 'border-primary/10')} style={{ boxShadow: 'var(--shadow-md)' }}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors',
                  clockedIn ? 'bg-green-500/10' : 'bg-primary/10'
                )}>
                  <Timer className={cn('w-8 h-8', clockedIn ? 'text-green-600' : 'text-primary')} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {clockedIn ? 'Currently Working' : 'Ready to Work?'}
                  </p>
                  <p className="font-mono text-3xl font-bold tracking-tight">
                    {clockedIn ? formatDuration(elapsed) : '00:00:00'}
                  </p>
                  {clockedIn && activeEntry?.project && (
                    <Badge variant="secondary" className="mt-1">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {activeEntry.project}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                size="lg"
                onClick={clockedIn ? handleClockOut : handleClockIn}
                loading={clockLoading}
                className={cn(
                  'min-w-[140px] transition-all',
                  clockedIn
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                )}
              >
                {clockedIn ? (
                  <><Square className="w-4 h-4 mr-2" />Clock Out</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" />Clock In</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </SlideIn>

      {/* Stats Cards */}
      <Stagger>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Today', value: todayHours.toFixed(1), unit: 'hours', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'This Week', value: weekHours.toFixed(1), unit: 'hours', icon: CalendarDays, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'This Month', value: monthHours.toFixed(1), unit: 'hours', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { label: 'Projects', value: (uniqueProjects?.length ?? 0).toString(), unit: 'active', icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          ].map((stat: any, i: number) => (
            <StaggerItem key={i}>
              <Card style={{ boxShadow: 'var(--shadow-sm)' }} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat?.bg)}>
                      <stat.icon className={cn('w-5 h-5', stat?.color)} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat?.label}</p>
                      <p className="text-2xl font-bold font-mono tracking-tight">{stat?.value}</p>
                      <p className="text-xs text-muted-foreground">{stat?.unit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </div>
      </Stagger>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.2}>
          <Card style={{ boxShadow: 'var(--shadow-sm)' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Weekly Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <WeeklyChart data={weeklyChartData} />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card style={{ boxShadow: 'var(--shadow-sm)' }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display">
                  {format(currentMonth, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d: string) => (
                  <div key={d} className="text-xs font-medium text-muted-foreground py-1">{d}</div>
                ))}
                {Array.from({ length: startPadding }).map((_: any, i: number) => (
                  <div key={`pad-${i}`} />
                ))}
                {calendarDays.map((day: Date) => {
                  const hours = getHoursForDay(day)
                  const todayCheck = isToday(day)
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'aspect-square flex flex-col items-center justify-center rounded-md text-xs transition-colors',
                        todayCheck && 'ring-2 ring-primary',
                        hours > 0 ? 'bg-primary/10 font-medium' : 'hover:bg-muted/50'
                      )}
                    >
                      <span>{format(day, 'd')}</span>
                      {hours > 0 && (
                        <span className="text-[9px] text-primary font-mono">{hours.toFixed(1)}h</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Recent entries */}
      <FadeIn delay={0.4}>
        <Card style={{ boxShadow: 'var(--shadow-sm)' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Recent Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i: number) => (
                  <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (entries ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No time entries yet. Start by clocking in!</p>
            ) : (
              <div className="space-y-2">
                {(entries ?? []).slice(0, 5).map((entry: TimeEntry) => (
                  <div key={entry?.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry?.project ?? 'General'}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry?.date ? format(new Date(entry.date), 'MMM d, yyyy') : ''}
                        {entry?.task ? ` • ${entry.task}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-medium">
                        {entry?.duration ? formatDuration(entry.duration) : 'In progress'}
                      </p>
                      {entry?.isClockIn && !entry?.endTime && (
                        <Badge variant="default" className="text-[10px]">Active</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
