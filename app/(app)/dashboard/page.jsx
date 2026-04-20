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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your meetings.
          </p>
        </div>
        <Link href="/live" className="shrink-0 w-full sm:w-auto">
          <Button className="w-full sm:w-auto gap-2 shadow-sm h-11 sm:h-10">
            <Mic className="h-4 w-4" />
            Start Live Meeting
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statsConfigs.map((stat) => (
          <Card key={stat.title} className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-primary/10 relative overflow-hidden group">
            <div className="absolute inset-x-0 -bottom-1 h-1 bg-gradient-to-r from-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10 px-4 sm:px-6 pt-5 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1 pr-2">
                {stat.title}
              </CardTitle>
              <div className="flex shrink-0 h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary opacity-80" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 px-4 pb-5 sm:px-6 sm:pb-6 pt-2">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
              <p
                className={cn(
                  'mt-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider line-clamp-1',
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
        <CardHeader className="pb-4">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/live">
              <div className="group flex flex-col sm:flex-row cursor-pointer items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4 rounded-lg border p-3 sm:p-4 transition-all hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm sm:text-base leading-tight mt-1 sm:mt-0">Start Recording</h3>
                  <p className="text-xs text-muted-foreground hidden sm:block mt-0.5">Begin a live meeting</p>
                </div>
              </div>
            </Link>
            <Link href="/upload">
              <div className="group flex flex-col sm:flex-row cursor-pointer items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4 rounded-lg border p-3 sm:p-4 transition-all hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm sm:text-base leading-tight mt-1 sm:mt-0">Upload Recording</h3>
                  <p className="text-xs text-muted-foreground hidden sm:block mt-0.5">Transcribe audio files</p>
                </div>
              </div>
            </Link>
            <Link href="/meetings">
              <div className="group flex flex-col sm:flex-row cursor-pointer items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4 rounded-lg border p-3 sm:p-4 transition-all hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm sm:text-base leading-tight mt-1 sm:mt-0">View Meetings</h3>
                  <p className="text-xs text-muted-foreground hidden sm:block mt-0.5">Browse all meetings</p>
                </div>
              </div>
            </Link>
            <Link href="/analytics">
              <div className="group flex flex-col sm:flex-row cursor-pointer items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4 rounded-lg border p-3 sm:p-4 transition-all hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm sm:text-base leading-tight mt-1 sm:mt-0">View Analytics</h3>
                  <p className="text-xs text-muted-foreground hidden sm:block mt-0.5">Meeting insights</p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
