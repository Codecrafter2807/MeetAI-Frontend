'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Mic,
  FileText,
  Zap,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Play,
  Moon,
  Sun,
  Bell,
  User,
} from 'lucide-react'
import { Footer } from '@/components/layout/footer'

const features = [
  {
    icon: Mic,
    title: 'Real-time Transcription',
    description: 'Capture every word with AI-powered speech recognition that works across accents and languages.',
  },
  {
    icon: FileText,
    title: 'Smart Summaries',
    description: 'Get instant AI-generated summaries highlighting key points, decisions, and action items.',
  },
  {
    icon: Users,
    title: 'Speaker Identification',
    description: 'Automatically identify and label different speakers for easy reference and attribution.',
  },
  {
    icon: Zap,
    title: 'Action Item Extraction',
    description: 'Never miss a task again. AI automatically extracts and tracks action items from your meetings.',
  },
  {
    icon: BarChart3,
    title: 'Meeting Analytics',
    description: 'Gain insights into meeting patterns, participation rates, and productivity metrics.',
  },
  {
    icon: CheckCircle,
    title: 'Integration Ready',
    description: 'Connect with Zoom, Google Meet, Teams, and your favorite productivity tools.',
  },
]


export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [testimonials, setTestimonials] = useState([])

  const defaultTestimonials = [
    {
      quote: "MeetingAI completely changed how we run product syncs. Having instant transcriptions and action items means no one is stuck taking manual notes.",
      name: "Sarah Jenkins",
      role: "Product Manager at TechFlow",
      rating: 5,
      avatar: "/avatars/avatar_1.png"
    },
    {
      quote: "The speaker identification is insanely accurate. I can finally search through weeks of client calls to find exactly what was promised.",
      name: "David Chen",
      role: "Sales Director, CloudScale",
      rating: 5,
      avatar: "/avatars/avatar_2.png"
    },
    {
      quote: "We've saved easily 10+ hours a week across our engineering team. It integrates perfectly into our highly asynchronous culture.",
      name: "Elena Rodriguez",
      role: "VP of Engineering, BuildOps",
      rating: 5,
      avatar: "/avatars/avatar_3.png"
    }
  ]

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setIsLoggedIn(true)
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) { }
      }
    }

    const fetchTestimonials = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/public/testimonials/`)
        if (res.ok) {
          const data = await res.json()
          if (data.testimonials && data.testimonials.length > 0) {
            setTestimonials(data.testimonials)
          } else {
            setTestimonials(defaultTestimonials)
          }
        } else {
          setTestimonials(defaultTestimonials)
        }
      } catch (err) {
        console.error("Failed to fetch testimonials:", err)
        setTestimonials(defaultTestimonials)
      }
    }
    fetchTestimonials()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-20 w-44 items-center justify-start overflow-hidden -ml-12">
              <img src="/logo.png" alt="MeetAI" className="h-full w-full object-contain scale-150" />
            </div>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Testimonials
            </Link>
            <Link href={isLoggedIn ? "/upload" : "/login"} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Upload Meeting
            </Link>
            <Link href={isLoggedIn ? "/meetings" : "/login"} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              My Meetings
            </Link>
          </div>
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary border-2 border-background" />
                </Button>
              </Link>
              <Link href="/meetings">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground hover:ring-2 hover:ring-primary/20 transition-all">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : 'N')}
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32 isolate">
        {/* Dynamic Background */}
        <div className="absolute inset-0 -z-10 bg-background">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
            <div className="h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-[100px] mix-blend-screen animate-pulse" />
          </div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
            <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-primary/20 to-blue-400/20 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 backdrop-blur-md transition-all hover:bg-blue-500/20 hover:scale-105 cursor-default">
              <Sparkles className="h-4 w-4" />
              Supercharge Your Workflow
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-7xl text-balance bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground/90 to-muted-foreground pb-4 leading-tight">
              Meetings That Actually <br className="hidden sm:block" /> Drive <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 filter drop-shadow-sm">Results</span>
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-muted-foreground text-pretty max-w-2xl mx-auto">
              Stop taking notes. Let our advanced AI instantly transcribe, summarize, and organize your calls into assigned tasks so your team can move faster.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
              <Link href={isLoggedIn ? "/meetings" : "/register"}>
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-semibold bg-foreground hover:bg-foreground/90 text-background border-0 shadow-2xl transition-all hover:-translate-y-1 hover:shadow-blue-500/25 rounded-xl">
                  {isLoggedIn ? 'Access Dashboard' : 'Start Free Trial'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-semibold border-border bg-background/50 backdrop-blur-md hover:bg-muted/50 transition-all hover:-translate-y-1 hover:text-foreground rounded-xl shadow-sm">
                  <Play className="mr-2 h-5 w-5 text-blue-500" />
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Everything You Need for Better Meetings
            </h2>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              Our AI-powered platform handles the heavy lifting so you can focus on what matters.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Large Box 1 */}
             <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl p-8 transition-all hover:shadow-2xl hover:border-blue-500/30">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl transition-all group-hover:bg-blue-500/20" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 shadow-sm ring-1 ring-inset ring-blue-500/20">
                  <Mic className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-foreground">Real-time Transcription</h3>
                <p className="mt-3 text-lg leading-relaxed text-muted-foreground max-w-sm">Capture every word with AI-powered speech recognition that works across accents and languages.</p>
             </div>

             {/* Small Box 1 */}
             <div className="group relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-bl from-card to-card/50 backdrop-blur-xl p-8 transition-all hover:shadow-2xl hover:border-purple-500/30">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 mb-6">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Smart Summaries</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Get instant AI-generated summaries highlighting key points, decisions, and action items.</p>
             </div>

             {/* Small Box 2 */}
             <div className="group relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-tr from-card to-card/50 backdrop-blur-xl p-8 transition-all hover:shadow-2xl hover:border-emerald-500/30">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-6">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Speaker Identification</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Automatically identify and label different speakers for easy reference.</p>
             </div>

             {/* Small Box 3 */}
             <div className="group relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-t from-card to-card/50 backdrop-blur-xl p-8 transition-all hover:shadow-2xl hover:border-amber-500/30">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Action Items</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">AI automatically extracts and tracks action items from your meetings.</p>
             </div>

             {/* Small Box 4 (was Large Box 2) */}
             <div className="group relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-tl from-card to-card/50 backdrop-blur-xl p-8 transition-all hover:shadow-2xl hover:border-indigo-500/30">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 mb-6">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Meeting Analytics</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Gain insights into meeting patterns, participation rates, and productivity metrics.</p>
             </div>

             {/* Full Width Box */}
             <div className="md:col-span-3 group relative overflow-hidden rounded-3xl border border-border/40 bg-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-2xl hover:border-primary/30">
                <div className="flex-1">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Integration Ready</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-xl">Connect with Zoom, Google Meet, Teams, and your favorite productivity tools.</p>
                </div>
                <div className="flex-shrink-0 flex items-center justify-start md:justify-end gap-2 sm:gap-4 opacity-70">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-border flex items-center justify-center bg-background"><CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"/></div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-border flex items-center justify-center bg-background"><Zap className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"/></div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-border flex items-center justify-center bg-background"><ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"/></div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Temporarily Disabled) */}
      {false && (
      <section id="pricing" className="border-t border-border py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that fits your team. Start free, upgrade when you need more.
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {/* Free Plan */}
            <div className="flex flex-col rounded-2xl border border-border bg-card p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-card-foreground">Free</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Perfect for experiencing the power of AI assistance natively.</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-card-foreground">₹0</span>
                <span className="text-muted-foreground font-medium">/mo</span>
              </div>
              <ul className="mb-8 flex flex-col gap-4 text-sm text-foreground/80 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  5 meetings per month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  30 min max per meeting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Basic transcription
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  AI summaries
                </li>
              </ul>
              <div className="mt-auto">
                <Link href="/register">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative flex flex-col rounded-3xl border border-blue-500/50 bg-card p-8 shadow-2xl shadow-blue-500/10 ring-1 ring-blue-500/20 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-blue-500/20">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-r from-blue-500 to-primary px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-500/30">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-card-foreground">Pro</h3>
                <p className="mt-1 text-sm text-muted-foreground">For professionals and small teams</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-card-foreground">₹1,499</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mb-8 flex flex-col gap-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Unlimited meetings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  2 hour max per meeting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Advanced transcription
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  AI summaries & action items
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Speaker identification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Export to PDF & Word
                </li>
              </ul>
              <div className="mt-auto relative z-10 w-full">
                <Link href="/register">
                  <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-primary hover:from-blue-500 hover:to-blue-500 border-0 shadow-md transition-all hover:scale-[1.02] text-white">Get Started</Button>
                </Link>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="flex flex-col rounded-2xl border border-border bg-card p-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-card-foreground">Enterprise</h3>
                <p className="mt-1 text-sm text-muted-foreground">For large teams and organizations</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-card-foreground">₹3,999</span>
                <span className="text-muted-foreground">/user/month</span>
              </div>
              <ul className="mb-8 flex flex-col gap-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Unlimited meeting length
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Custom AI training
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  SSO & advanced security
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  API access
                </li>
              </ul>
              <div className="mt-auto">
                <Link href="/register">
                  <Button variant="outline" className="w-full">Contact Sales</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 sm:py-32 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-background to-background" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-20">
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Trusted by Innovative Teams
            </h2>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              Don't just take our word for it. See how MeetingAI is transforming workflows.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="relative flex flex-col rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl transition-all duration-300 hover:bg-card hover:-translate-y-1 hover:shadow-blue-500/10 hover:border-blue-500/30">
                <div className="mb-6 flex gap-1">
                  {[...Array(testimonial.rating || 5)].map((_, j) => (
                    <Sparkles key={j} className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 fill-current drop-shadow-sm" />
                  ))}
                </div>
                <p className="text-foreground/90 leading-relaxed flex-grow text-base sm:text-lg italic tracking-wide">
                  "{testimonial.quote}"
                </p>
                <div className="mt-8 flex items-center gap-4">
                  {testimonial.avatar ? (
                    <img src={testimonial.avatar} alt={testimonial.name} className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border-2 border-background shadow-md" />
                  ) : (
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg sm:text-xl border-2 border-background shadow-md">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-foreground text-base sm:text-lg">{testimonial.name}</h4>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative overflow-hidden border-t border-border/50 py-24 sm:py-32 bg-muted/10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-blue-900/5" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-3xl text-center mb-24">
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              How MeetingAI Works
            </h2>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              Three simple steps to transform your chaotic conversations into organized, actionable blueprints.
            </p>
          </div>
          
          <div className="grid gap-12 md:grid-cols-3 relative">
            {/* Connecting Line (Only visible on medium+ screens) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0" />
            
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-background border border-border/50 shadow-xl shadow-blue-500/5 mb-8 transition-all duration-500 group-hover:scale-110 group-hover:border-blue-500/30 group-hover:shadow-blue-500/20">
                <Mic className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">1. Record or Upload</h3>
              <p className="text-muted-foreground leading-relaxed text-lg px-2">Capture live meetings directly in your browser or instantly upload your existing audio files.</p>
            </div>
            
            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-background border border-border/50 shadow-xl shadow-blue-500/5 mb-8 transition-all duration-500 group-hover:scale-110 group-hover:border-blue-500/30 group-hover:shadow-blue-500/20">
                <Zap className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">2. Deep AI Processing</h3>
              <p className="text-muted-foreground leading-relaxed text-lg px-2">Our advanced neural networks instantly transcribe audio, identify distinct speakers, and extract context.</p>
            </div>
            
            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-background border border-border/50 shadow-xl shadow-blue-500/5 mb-8 transition-all duration-500 group-hover:scale-110 group-hover:border-blue-500/30 group-hover:shadow-blue-500/20">
                <FileText className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">3. Instant Clarity</h3>
              <p className="text-muted-foreground leading-relaxed text-lg px-2">Receive a perfectly formatted summary alongside assigned tasks, key points, and detailed analytics.</p>
            </div>
          </div>
          
        </div>
      </section>

      <Footer />
    </div>
  )
}
