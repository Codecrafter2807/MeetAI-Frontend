'use client'
import { toast } from 'sonner'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, KeyRound } from 'lucide-react'
import { fetchApi } from '@/lib/api'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Email, 2: Reset Form
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    new_password: '',
  })

  const requestOTP = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await fetchApi('/api/auth/password-reset-otp/', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email })
      })
      
      setStep(2)
    } catch (err) {
      toast.error(err.message || "Failed to request OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await fetchApi('/api/auth/password-reset-confirm/', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          new_password: formData.new_password
        })
      })
      
      toast.success('Password reset successfully! You can now log in.')
      router.push('/login')
    } catch (err) {
      toast.error(err.message || "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <Link href="/" className="mb-14 flex flex-col items-center justify-center gap-2">
          <div className="flex h-32 w-full items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="MeetAI" className="h-full w-full object-contain scale-125 dark:hidden" />
            <img src="/logo_d.png" alt="MeetAI" className="hidden h-full w-full object-contain scale-125 dark:block" />
          </div>
        </Link>

        {step === 1 ? (
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-2xl font-bold text-card-foreground">Reset Password</h1>
              <p className="text-muted-foreground">
                Enter your email address and we&apos;ll send you an OTP to reset your password.
              </p>
            </div>

            <form onSubmit={requestOTP} className="space-y-5">
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
                    Sending request...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Get OTP
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-2xl font-bold text-card-foreground">Enter OTP</h1>
              <p className="text-muted-foreground">
                We sent a 6-digit code to <span className="font-semibold text-foreground">{formData.email}</span>. Please enter it below along with your new password.
              </p>
            </div>

            <form onSubmit={resetPassword} className="space-y-5">
              <div>
                <label htmlFor="otp" className="mb-2 block text-sm font-medium">
                  OTP Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="otp"
                    type="text"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="h-12 w-full rounded-lg border border-input bg-background pl-11 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 text-center tracking-widest text-lg font-semibold"
                    placeholder="123456"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="new_password" className="text-sm font-medium block mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="new_password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    className="h-12 w-full rounded-lg border border-input bg-background pl-11 pr-12 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter your new password"
                    required
                    minLength={6}
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
                    Resetting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Reset Password
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
