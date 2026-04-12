'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb,
  ArrowRight,
  Loader2,
  RefreshCw,
  Home
} from 'lucide-react'
import { fetchApi } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function SimulatorFeedbackPage() {
  const router = useRouter()
  const { sessionId } = useParams()
  const [feedback, setFeedback] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadFeedback() {
      try {
        const data = await fetchApi(`/api/simulator/${sessionId}/feedback/`)
        setFeedback(data)
      } catch (error) {
        console.error("Failed to load feedback", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadFeedback()
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center">
          <h2 className="text-xl font-bold">Generating Insightful Feedback</h2>
          <p className="text-muted-foreground">Our AI coach is analyzing your session performance...</p>
        </div>
      </div>
    )
  }

  // Fallback for missing data
  const score = feedback?.confidence_score || 0
  const strengths = feedback?.strengths || []
  const weaknesses = feedback?.weaknesses || []
  const improvements = feedback?.improvements || []

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10 animate-in fade-in zoom-in-95 duration-700">
      {/* Header / Score Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-2">
          <Trophy className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Performance Summary</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Exceptional effort! Your session has been analyzed based on clarity, confidence, and objective alignment.
        </p>

        <div className="relative inline-flex items-center justify-center p-12">
            {/* Simple Gauge Logic */}
            <svg className="w-48 h-48 transform -rotate-90">
                <circle
                    cx="96" cy="96" r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                />
                <circle
                    cx="96" cy="96" r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={552.9}
                    strokeDashoffset={552.9 - (552.9 * score) / 100}
                    className="text-primary transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-6xl font-black text-primary">{score}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Confidence Score</span>
            </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <Card className="border-emerald-100 bg-emerald-50/10 dark:bg-emerald-950/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {strengths.map((s, i) => (
              <div key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                {s}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card className="border-rose-100 bg-rose-50/10 dark:bg-rose-950/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="h-5 w-5" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weaknesses.map((w, i) => (
              <div key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                {w}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Suggested Improvements */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Strategic Recommendations
          </CardTitle>
          <CardDescription>Actionable tips to improve your next interaction.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {improvements.map((imp, i) => (
              <div key={i} className="group relative p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-all">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold">
                  {i+1}
                </div>
                <p className="text-sm font-medium ml-2">{imp}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
        <Button variant="outline" size="lg" className="h-12 px-8 font-bold gap-2" onClick={() => router.push('/simulator')}>
          <Home className="h-4 w-4" />
          Back to Scenarios
        </Button>
        <Button size="lg" className="h-12 px-8 font-bold gap-2" onClick={() => router.push('/simulator')}>
          <RefreshCw className="h-4 w-4" />
          Try Another One
        </Button>
      </div>

      {/* Analytics Hook */}
      <div className="text-center pt-10">
        <p className="text-xs text-muted-foreground">
          Performance data is saved to your profile for long-term progress tracking.
        </p>
      </div>
    </div>
  )
}
