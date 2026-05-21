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
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) }
    } else if (startDate) {
      where.date = { gte: new Date(startDate) }
    } else if (endDate) {
      where.date = { lte: new Date(endDate) }
    }

    const entries = await prisma.timeEntry.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { startTime: 'desc' },
    })
    return NextResponse.json(entries)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as any)?.id
    const body = await req.json()
    const { date, startTime, endTime, project, task, notes, isClockIn } = body ?? {}

    if (!date || !startTime) {
      return NextResponse.json({ error: 'Date and start time are required' }, { status: 400 })
    }

    let duration: number | null = null
    if (endTime) {
      duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)
    }

    const entry = await prisma.timeEntry.create({
      data: {
        userId,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration,
        project: project ?? 'General',
        task: task ?? '',
        notes: notes ?? '',
        isClockIn: isClockIn ?? false,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}
