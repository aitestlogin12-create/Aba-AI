export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as any)?.id
    const role = (session.user as any)?.role
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const filterUserId = searchParams.get('userId')

    const where: any = {}
    if (role !== 'ADMIN') {
      where.userId = userId
    } else if (filterUserId) {
      where.userId = filterUserId
    }
    if (startDate) where.date = { ...(where.date ?? {}), gte: new Date(startDate) }
    if (endDate) where.date = { ...(where.date ?? {}), lte: new Date(endDate) }

    const entries = await prisma.timeEntry.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { date: 'asc' },
    })

    const formatDur = (s: number | null) => {
      if (!s) return '0:00'
      const h = Math.floor(s / 3600)
      const m = Math.floor((s % 3600) / 60)
      return `${h}:${m.toString().padStart(2, '0')}`
    }

    const csvRows = [
      ['Employee', 'Email', 'Date', 'Start Time', 'End Time', 'Duration', 'Project', 'Task', 'Notes'].join(','),
      ...(entries ?? []).map((e: any) =>
        [
          `"${e?.user?.name ?? ''}"`,
          `"${e?.user?.email ?? ''}"`,
          e?.date?.toISOString?.()?.split('T')?.[0] ?? '',
          e?.startTime?.toISOString?.() ?? '',
          e?.endTime?.toISOString?.() ?? '',
          formatDur(e?.duration),
          `"${e?.project ?? ''}"`,
          `"${e?.task ?? ''}"`,
          `"${(e?.notes ?? '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ]

    return new NextResponse(csvRows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="time-report.csv"',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}
