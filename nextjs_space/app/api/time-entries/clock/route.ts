export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Check if user has an active clock-in
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as any)?.id

    const activeEntry = await prisma.timeEntry.findFirst({
      where: { userId, isClockIn: true, endTime: null },
      orderBy: { startTime: 'desc' },
    })
    return NextResponse.json({ active: !!activeEntry, entry: activeEntry })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}

// POST: Clock in
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as any)?.id
    const body = await req.json()
    const { project, task } = body ?? {}

    // Check if already clocked in
    const activeEntry = await prisma.timeEntry.findFirst({
      where: { userId, isClockIn: true, endTime: null },
    })
    if (activeEntry) {
      return NextResponse.json({ error: 'Already clocked in' }, { status: 400 })
    }

    const now = new Date()
    const entry = await prisma.timeEntry.create({
      data: {
        userId,
        date: now,
        startTime: now,
        project: project ?? 'General',
        task: task ?? '',
        isClockIn: true,
      },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}

// PUT: Clock out
export async function PUT() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as any)?.id

    const activeEntry = await prisma.timeEntry.findFirst({
      where: { userId, isClockIn: true, endTime: null },
    })
    if (!activeEntry) {
      return NextResponse.json({ error: 'Not clocked in' }, { status: 400 })
    }

    const now = new Date()
    const duration = Math.round((now.getTime() - activeEntry.startTime.getTime()) / 1000)

    const entry = await prisma.timeEntry.update({
      where: { id: activeEntry.id },
      data: { endTime: now, duration },
    })
    return NextResponse.json(entry)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}
