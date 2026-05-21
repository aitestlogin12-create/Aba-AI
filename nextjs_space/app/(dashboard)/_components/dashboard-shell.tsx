'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  Timer, LayoutDashboard, Clock, FileBarChart, LogOut,
  PanelLeft, ChevronRight, User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Time Entry', href: '/time-entry', icon: Clock },
  { label: 'Reports', href: '/reports', icon: FileBarChart },
]

export function DashboardShell({
  children,
  userName,
  userEmail,
  userRole,
}: {
  children: React.ReactNode
  userName: string
  userEmail: string
  userRole: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const initials = (userName ?? 'U')?.split(' ')?.map((n: string) => n?.[0])?.join('')?.toUpperCase() ?? 'U'

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform duration-300 ease-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 p-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Timer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg tracking-tight">TimeTrack</h2>
              <p className="text-xs text-muted-foreground">Pro</p>
            </div>
          </div>

          <Separator />

          <nav className="flex-1 p-4 space-y-1">
            {(navItems ?? []).map((item: any) => {
              const isActive = pathname === item?.href || pathname?.startsWith(item?.href + '/')
              return (
                <button
                  key={item?.href}
                  onClick={() => {
                    router.push(item?.href)
                    setSidebarOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item?.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <Badge variant={userRole === 'ADMIN' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                  {userRole}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => signOut({ callbackUrl: '/auth' })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card/80 backdrop-blur-md px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{userEmail}</span>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
