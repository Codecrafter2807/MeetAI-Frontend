'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  CheckSquare,
  TrendingUp,
  Mic,
  ArrowRight,
  Play,
  Users,
  FileText,
  Loader2
} from 'lucide-react'
import { fetchApi } from '@/lib/api'
import { mockActivityFeed } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredMeeting, setHoveredMeeting] = useState(null)
  const [data, setData] = useState({
    stats: {
      totalMeetings: 0,
      hoursProcessed: 0,
      tasksPending: 0,
      accuracyRate: '0%',
    },
    recentMeetings: []
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await fetchApi('/api/dashboard/stats/')
        setData(result)
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const statsConfigs = [
    {
      title: 'Total Meetings',
      value: data.stats.totalMeetings,
      icon: Calendar,
      change: '+1 from last week',
      trend: 'up',
    },
    {
      title: 'Hours Processed',
      value: data.stats.hoursProcessed,
      icon: Clock,
      change: 'Real-time calculation',
      trend: 'up',
    },
    {
      title: 'Tasks Pending',
      value: data.stats.tasksPending,
      icon: CheckSquare,
      change: 'Active items',
      trend: 'up',
    },
    {
      title: 'Accuracy Rate',
      value: data.stats.accuracyRate,
      icon: TrendingUp,
      change: 'AI confidence',
      trend: 'up',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Preparing your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your meetings.
          </p>
        </div>
        <Link href="/live">
          <Button className="gap-2">
            <Mic className="h-4 w-4" />
            Start Live Meeting
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfigs.map((stat) => (
          <Card key={stat.title} className="transition-all duration-200 hover:shadow-md border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-primary opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p
                className={cn(
                  'mt-1 text-[10px] font-medium uppercase tracking-wider',
                  stat.trend === 'up' ? 'text-emerald-500' : 'text-amber-500'
                )}
              >
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Meetings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Meetings</CardTitle>
              <Link href="/meetings">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentMeetings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <Mic className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No meetings yet.</p>
                    <Link href="/upload" className="mt-2 text-sm text-primary hover:underline font-medium">
                      Upload your first recording
                    </Link>
                  </div>
                ) : (
                  data.recentMeetings.map((meeting) => (
                    <Link
                      key={meeting.id}
                      href={`/meeting/${meeting.id}`}
                      className="block"
                      onMouseEnter={() => setHoveredMeeting(meeting.id)}
                      onMouseLeave={() => setHoveredMeeting(null)}
                    >
                      <div
                        className={cn(
                          'flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 transition-all duration-200 gap-4 sm:gap-0',
                          hoveredMeeting === meeting.id
                            ? 'border-primary/50 bg-accent/50'
                            : 'hover:bg-accent/30'
                        )}
                      >
                        <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto min-w-0">
                          <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mt-0.5 sm:mt-0">
                            <Play className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium truncate">{meeting.title}</h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1 whitespace-nowrap">
                                <Calendar className="h-3 w-3" />
                                {meeting.date}
                              </span>
                              <span className="flex items-center gap-1 whitespace-nowrap">
                                <Clock className="h-3 w-3" />
                                {meeting.duration}
                              </span>
                              <span className="flex items-center gap-1 whitespace-nowrap">
                                <Users className="h-3 w-3" />
                                {meeting.participants_count}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center self-end sm:self-auto gap-3 shrink-0">
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight',
                              meeting.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            )}
                          >
                            {meeting.status}
                          </span>
                          <ArrowRight
                            className={cn(
                              'h-4 w-4 text-muted-foreground transition-transform',
                              hoveredMeeting === meeting.id && 'translate-x-1'
                            )}
                          />
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto pr-1">
                <div className="space-y-4">
                {!data.activityFeed || data.activityFeed.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No recent activity.
                  </div>
                ) : (
                  data.activityFeed.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="relative">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        {index < data.activityFeed.length - 1 && (
                          <div className="absolute left-4 top-8 h-full w-px bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{activity.subject}</p>
                        <p className="mt-1 text-xs text-muted-foreground/70">{activity.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/live">
              <div className="group flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-accent/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Start Recording</h3>
                  <p className="text-sm text-muted-foreground">Begin a live meeting</p>
                </div>
              </div>
            </Link>
            <Link href="/upload">
              <div className="group flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-accent/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Upload Recording</h3>
                  <p className="text-sm text-muted-foreground">Transcribe audio files</p>
                </div>
              </div>
            </Link>
            <Link href="/meetings">
              <div className="group flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-accent/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">View Meetings</h3>
                  <p className="text-sm text-muted-foreground">Browse all meetings</p>
                </div>
              </div>
            </Link>
            <Link href="/analytics">
              <div className="group flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-accent/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">View Analytics</h3>
                  <p className="text-sm text-muted-foreground">Meeting insights</p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
