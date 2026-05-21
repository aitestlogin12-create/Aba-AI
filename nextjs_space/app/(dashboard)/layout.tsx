import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardShell } from './_components/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth')
  return (
    <DashboardShell
      userName={session?.user?.name ?? 'User'}
      userEmail={session?.user?.email ?? ''}
      userRole={(session?.user as any)?.role ?? 'EMPLOYEE'}
    >
      {children}
    </DashboardShell>
  )
}
