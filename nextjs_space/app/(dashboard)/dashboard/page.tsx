import { DashboardClient } from './_components/dashboard-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role ?? 'EMPLOYEE'
  return <DashboardClient userRole={role} />
}
