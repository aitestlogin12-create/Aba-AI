'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Clock, Mail, Lock, User, ArrowRight, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FadeIn, ScaleIn } from '@/components/ui/animate'

export function AuthPageClient() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })
        if (result?.error) {
          toast.error('Invalid email or password')
        } else {
          router.replace('/dashboard')
        }
      } else {
        if (!name?.trim()) {
          toast.error('Name is required')
          setLoading(false)
          return
        }
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data?.error ?? 'Signup failed')
        } else {
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
          })
          if (result?.error) {
            toast.error('Account created but login failed. Please try logging in.')
            setIsLogin(true)
          } else {
            toast.success('Account created successfully!')
            router.replace('/dashboard')
          }
        }
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="w-full max-w-md">
        <ScaleIn>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Timer className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl tracking-tight font-bold">TimeTrack Pro</h1>
            <p className="text-muted-foreground mt-2">Effortless time tracking for modern teams</p>
          </div>
        </ScaleIn>

        <FadeIn delay={0.1}>
          <Card className="shadow-lg border-0" style={{ boxShadow: 'var(--shadow-lg)' }}>
            <CardHeader className="text-center pb-2">
              <CardTitle className="font-display text-xl tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription>
                {isLogin ? 'Sign in to continue tracking' : 'Start tracking your time today'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Your full name"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        className="pl-10"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" loading={loading}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:underline"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}
