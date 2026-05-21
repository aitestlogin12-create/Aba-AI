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
    const groupBy = searchParams.get('groupBy') ?? 'day' // day, week, month

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
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { date: 'asc' },
    })

    // Group by project
    const projectSummary: Record<string, number> = {}
    let totalDuration = 0
    for (const entry of entries) {
      const dur = entry.duration ?? 0
      totalDuration += dur
      const proj = entry.project ?? 'General'
      projectSummary[proj] = (projectSummary[proj] ?? 0) + dur
    }

    // Group by date
    const dailySummary: Record<string, number> = {}
    for (const entry of entries) {
      const dateStr = entry.date?.toISOString?.()?.split('T')?.[0] ?? 'unknown'
      dailySummary[dateStr] = (dailySummary[dateStr] ?? 0) + (entry.duration ?? 0)
    }

    return NextResponse.json({
      entries,
      summary: {
        totalEntries: entries?.length ?? 0,
        totalDuration,
        totalHours: Math.round((totalDuration / 3600) * 100) / 100,
        projectBreakdown: Object.entries(projectSummary ?? {}).map(([name, seconds]: [string, any]) => ({
          name,
          seconds: seconds ?? 0,
          hours: Math.round(((seconds ?? 0) / 3600) * 100) / 100,
        })),
        dailyBreakdown: Object.entries(dailySummary ?? {}).map(([date, seconds]: [string, any]) => ({
          date,
          seconds: seconds ?? 0,
          hours: Math.round(((seconds ?? 0) / 3600) * 100) / 100,
        })),
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}
