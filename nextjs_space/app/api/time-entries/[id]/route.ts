export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as any)?.id
    const role = (session.user as any)?.role

    const existing = await prisma.timeEntry.findUnique({ where: { id: params?.id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (role !== 'ADMIN' && existing.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { date, startTime, endTime, project, task, notes } = body ?? {}
    let duration: number | null = existing.duration
    if (endTime && startTime) {
      duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)
    } else if (endTime && existing.startTime) {
      duration = Math.round((new Date(endTime).getTime() - existing.startTime.getTime()) / 1000)
    }

    const entry = await prisma.timeEntry.update({
      where: { id: params?.id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { endTime: endTime ? new Date(endTime) : null }),
        ...(duration !== undefined && { duration }),
        ...(project !== undefined && { project }),
        ...(task !== undefined && { task }),
        ...(notes !== undefined && { notes }),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    return NextResponse.json(entry)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = (session.user as any)?.id
    const role = (session.user as any)?.role

    const existing = await prisma.timeEntry.findUnique({ where: { id: params?.id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (role !== 'ADMIN' && existing.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.timeEntry.delete({ where: { id: params?.id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}
