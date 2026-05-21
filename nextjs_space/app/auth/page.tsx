import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AuthPageClient } from './_components/auth-page-client'

export default async function AuthPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')
  return <AuthPageClient />
}
