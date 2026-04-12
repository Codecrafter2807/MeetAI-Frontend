'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  TrendingUp, 
  UserCheck, 
  Handshake, 
  Play, 
  Loader2,
  Clock,
  Target
} from 'lucide-react'
import { fetchApi } from '@/lib/api'

const IconMap = {
  'users': Users,
  'trending-up': TrendingUp,
  'user-check': UserCheck,
  'handshake': Handshake
}

export default function SimulatorPage() {
  const router = useRouter()
  const [scenarios, setScenarios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(null)

  useEffect(() => {
    async function loadScenarios() {
      try {
        const data = await fetchApi('/api/simulator/scenarios/')
        setScenarios(data)
      } catch (error) {
        console.error("Failed to load scenarios", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadScenarios()
  }, [])

  const handleStartSession = async (scenarioId) => {
    try {
      setIsStarting(scenarioId)
      const result = await fetchApi('/api/simulator/start/', {
        method: 'POST',
        body: JSON.stringify({ scenario_id: scenarioId })
      })
      router.push(`/simulator/${result.session_id}`)
    } catch (error) {
      console.error("Failed to start session", error)
      setIsStarting(null)
    }
  }

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'beginner': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'intermediate': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'advanced': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading interactive scenarios...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-wider px-3 py-1">
            Skill Builder
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">AI Meeting Simulator</h1>
          <p className="text-xl text-muted-foreground max-w-2xl font-light">
            Engage in realistic roleplay conversations with AI personas to sharpen your communication skills and handle high-pressure scenarios.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-accent/50 p-4 rounded-2xl border border-primary/5 shadow-inner">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold">Practice Mode</p>
            <p className="text-xs text-muted-foreground">Voice-enabled feedback</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        {scenarios.map((scenario) => {
          const Icon = IconMap[scenario.icon_type] || Users
          return (
            <Card key={scenario.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-primary/10">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={120} />
              </div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge className={cn("px-3 py-1 capitalize border-none shadow-sm", getDifficultyColor(scenario.difficulty))}>
                    {scenario.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">{scenario.name}</CardTitle>
                <p className="text-sm font-medium text-primary/80 uppercase tracking-widest mt-1">{scenario.ai_role}</p>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-base leading-relaxed line-clamp-3">
                  {scenario.description}
                </CardDescription>
                
                <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    ~10 mins
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    AI Persona
                  </span>
                </div>
              </CardContent>
              <CardFooter className="relative z-10 bg-slate-50/50 dark:bg-slate-900/20 border-t pt-6">
                <Button 
                  className="w-full h-12 text-base font-bold gap-2 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-70"
                  onClick={() => handleStartSession(scenario.id)}
                  disabled={isStarting !== null}
                >
                  {isStarting === scenario.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Play className="h-5 w-5 fill-current" />
                  )}
                  {isStarting === scenario.id ? "Preparing Room..." : "Enter Session"}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
