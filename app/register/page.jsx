'use client'
import { toast } from 'sonner'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react'
import { fetchApi } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState('register') // 'register' or 'verify'
  const [otp, setOtp] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (step !== 'register') return

    // Check if script already exists
    if (document.getElementById('google-gsi-script')) {
      // Script already loaded, just render button
      if (window.google) {
        renderGoogleButton()
      }
      return
    }

    // Load Google Identity Services script
    const script = document.createElement('script')
    script.id = 'google-gsi-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    script.onload = () => {
      renderGoogleButton()
    }
  }, [step])

  const renderGoogleButton = () => {
    const container = document.getElementById('googleSignInDiv')
    if (window.google && container) {
      // Calculate available width, capping at Google's max of 400
      const width = Math.min(container.offsetWidth || 350, 400)

      // Prevent multiple initializations which cause console warnings
      if (!window.__google_gsi_initialized) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        })
        window.__google_gsi_initialized = true
      }
      window.google.accounts.id.renderButton(
        container,
        { theme: 'outline', size: 'large', width: width, text: 'signup_with' }
      )
    }
  }

  const handleGoogleResponse = async (response) => {
    setIsLoading(true)
    try {
      const data = await fetchApi('/api/auth/google/', {
        method: 'POST',
        body: JSON.stringify({ token: response.credential })
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }
    
    setIsLoading(true)
    try {
      await fetchApi('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })
      
      setStep('verify')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const data = await fetchApi('/api/auth/verify-otp/', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        })
      })
      
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        window.dispatchEvent(new Event('storage'))
        router.push('/meetings')
      }
    } catch (err) {
      toast.error(err.message || 'Verification failed')
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
        <Link href="/" className="mb-14 flex flex-col items-center justify-center gap-2">
          <div className="flex h-32 md:h-40 w-full items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="MeetAI" className="h-full w-full object-contain scale-125 md:scale-150 dark:hidden transition-transform duration-300" />
            <img src="/logo_d.png" alt="MeetAI" className="hidden h-full w-full object-contain scale-125 md:scale-150 dark:block transition-transform duration-300" />
          </div>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-bold text-card-foreground">
              {step === 'register' ? 'Create your account' : 'Verify your email'}
            </h1>
            <p className="text-muted-foreground">
              {step === 'register' 
                ? 'Get started with your free account' 
                : `We've sent a 6-digit code to ${formData.email}`}
            </p>
          </div>

          {step === 'register' ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 w-full rounded-lg border border-input bg-background pl-11 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

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
                  <label htmlFor="password" className="mb-2 block text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-12 w-full rounded-lg border border-input bg-background pl-11 pr-12 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Create a strong password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Must be at least 8 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="h-12 w-full rounded-lg border border-input bg-background pl-11 pr-12 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Confirm your password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
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
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create account
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
              <div id="googleSignInDiv" className="mt-2 flex justify-center"></div>
            </>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label htmlFor="otp" className="mb-2 block text-sm font-medium">
                  One-Time Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-12 w-full rounded-lg border border-input bg-background pl-11 pr-4 text-center text-lg font-bold tracking-[0.5em] outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="000000"
                    required
                    maxLength={6}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Please enter the 6-digit code sent to your email.
                </p>
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
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Verify Email
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('register')}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Change email address
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
