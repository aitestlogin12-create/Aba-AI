import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ReportsClient } from './_components/reports-client'

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role ?? 'EMPLOYEE'
  return <ReportsClient userRole={role} />
}
