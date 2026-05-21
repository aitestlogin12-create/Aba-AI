'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  Plus, Pencil, Trash2, Clock, Briefcase, FileText,
  Calendar, Search, X, Save, ChevronDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FadeIn, Stagger, StaggerItem } from '@/components/ui/animate'
import { PageHeader } from '@/components/layouts/page-header'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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

const defaultForm = {
  date: '',
  startTime: '',
  endTime: '',
  project: 'General',
  task: '',
  notes: '',
}

export function TimeEntryClient() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(defaultForm)

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/time-entries')
      if (res.ok) {
        const data = await res.json()
        setEntries(data ?? [])
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const handleOpenNew = () => {
    const now = new Date()
    const dateStr = format(now, 'yyyy-MM-dd')
    const timeStr = format(now, 'HH:mm')
    setForm({
      date: dateStr,
      startTime: timeStr,
      endTime: '',
      project: 'General',
      task: '',
      notes: '',
    })
    setEditingId(null)
    setDialogOpen(true)
  }

  const handleEdit = (entry: TimeEntry) => {
    setForm({
      date: entry?.date ? format(new Date(entry.date), 'yyyy-MM-dd') : '',
      startTime: entry?.startTime ? format(new Date(entry.startTime), 'HH:mm') : '',
      endTime: entry?.endTime ? format(new Date(entry.endTime), 'HH:mm') : '',
      project: entry?.project ?? 'General',
      task: entry?.task ?? '',
      notes: entry?.notes ?? '',
    })
    setEditingId(entry?.id)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form?.date || !form?.startTime) {
      toast.error('Date and start time are required')
      return
    }
    setSaving(true)
    try {
      const dateObj = new Date(form.date)
      const [sh, sm] = (form.startTime ?? '00:00').split(':')
      const startDt = new Date(dateObj)
      startDt.setHours(parseInt(sh ?? '0', 10), parseInt(sm ?? '0', 10), 0, 0)

      let endDt: Date | null = null
      if (form?.endTime) {
        const [eh, em] = form.endTime.split(':')
        endDt = new Date(dateObj)
        endDt.setHours(parseInt(eh ?? '0', 10), parseInt(em ?? '0', 10), 0, 0)
        if (endDt <= startDt) {
          toast.error('End time must be after start time')
          setSaving(false)
          return
        }
      }

      const body = {
        date: dateObj.toISOString(),
        startTime: startDt.toISOString(),
        endTime: endDt?.toISOString() ?? null,
        project: form?.project ?? 'General',
        task: form?.task ?? '',
        notes: form?.notes ?? '',
      }

      const url = editingId ? `/api/time-entries/${editingId}` : '/api/time-entries'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editingId ? 'Entry updated!' : 'Entry created!')
        setDialogOpen(false)
        fetchEntries()
      } else {
        const d = await res.json()
        toast.error(d?.error ?? 'Failed to save')
      }
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/time-entries/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Entry deleted')
        fetchEntries()
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleteDialogOpen(false)
      setDeleteId(null)
    }
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h}h ${m}m`
  }

  const filtered = (entries ?? []).filter((e: TimeEntry) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      (e?.project ?? '').toLowerCase().includes(s) ||
      (e?.task ?? '').toLowerCase().includes(s) ||
      (e?.notes ?? '').toLowerCase().includes(s)
    )
  })

  return (
    <div className="space-y-6">
      <FadeIn>
        <PageHeader
          title="Time Entries"
          description="Add, edit, and manage your time entries"
          actions={
            <Button onClick={handleOpenNew}>
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          }
        />
      </FadeIn>

      {/* Search */}
      <FadeIn delay={0.1}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by project, task, or notes..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </FadeIn>

      {/* Entries List */}
      <Card style={{ boxShadow: 'var(--shadow-sm)' }}>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i: number) => (
                <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No time entries found</p>
              <Button onClick={handleOpenNew} variant="outline" className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add your first entry
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((entry: TimeEntry) => (
                <div key={entry?.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{entry?.project ?? 'General'}</p>
                      {entry?.isClockIn && (
                        <Badge variant="secondary" className="text-[10px]">
                          <Clock className="w-2.5 h-2.5 mr-0.5" />
                          Clock
                        </Badge>
                      )}
                      {!entry?.endTime && (
                        <Badge className="text-[10px] bg-green-500/10 text-green-600">Active</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {entry?.date ? format(new Date(entry.date), 'MMM d, yyyy') : ''}
                      {' • '}
                      {entry?.startTime ? format(new Date(entry.startTime), 'h:mm a') : ''}
                      {entry?.endTime ? ` - ${format(new Date(entry.endTime), 'h:mm a')}` : ''}
                    </p>
                    {entry?.task && <p className="text-xs text-muted-foreground mt-0.5">{entry.task}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono font-medium">
                      {entry?.duration ? formatDuration(entry.duration) : '--'}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(entry)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setDeleteId(entry?.id); setDeleteDialogOpen(true) }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editingId ? 'Edit Time Entry' : 'New Time Entry'}</DialogTitle>
            <DialogDescription>{editingId ? 'Update the details of this entry' : 'Add a new manual time entry'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={form?.date ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...(form ?? {}), date: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={form?.startTime ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...(form ?? {}), startTime: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={form?.endTime ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...(form ?? {}), endTime: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Project name"
                  value={form?.project ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...(form ?? {}), project: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Task</Label>
              <Input
                placeholder="Task description"
                value={form?.task ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...(form ?? {}), task: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                placeholder="Optional notes"
                value={form?.notes ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...(form ?? {}), notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>
              <Save className="w-4 h-4 mr-2" />
              {editingId ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this time entry? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
