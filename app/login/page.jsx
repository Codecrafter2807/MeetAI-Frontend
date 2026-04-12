'use client'
import { toast } from 'sonner'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { fetchApi } from '@/lib/api'
import { useGoogleLogin } from '@react-oauth/google'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true)
      try {
        const data = await fetchApi('/api/auth/google/', {
          method: 'POST',
          body: JSON.stringify({ token: tokenResponse.access_token })
        })

        if (data.token) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          window.dispatchEvent(new Event('storage'))
          router.push('/meetings')
        }
      } catch (err) {
        toast.error("Google login failed: " + err.message)
      } finally {
        setIsLoading(false)
      }
    },
    onError: () => toast.error("Google Login Failed")
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const data = await fetchApi('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      router.push('/')
    } catch (err) {
      if (err.name === 'AbortError') {
        toast.error("Request timed out. Please check if the backend is running and try again.")
      } else {
        toast.error(err.message || "Invalid credentials")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">MeetingAI</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-bold text-card-foreground">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 w-full rounded-lg border border-input bg-background pl-11 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 w-full rounded-lg border border-input bg-background pl-11 pr-12 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full text-sm font-medium"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Social login */}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              className="h-12 w-full" 
              onClick={() => googleLogin()}
              disabled={isLoading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>
          </div>
        </div>

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  )
}
