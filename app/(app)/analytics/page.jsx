'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Users,
  CheckSquare,
  BarChart3,
  PieChart,
  Loader2
} from 'lucide-react'
import { fetchApi } from '@/lib/api'

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState({
    stats: {
      totalMeetings: 0,
      hoursProcessed: 0,
      tasksPending: 0,
      accuracyRate: '0%',
      avgDuration: '0 min'
    },
    weeklyData: [],
    topSpeakers: [],
    actionItemStats: {
      total: 0,
      completed: 0,
      pending: 0,
      rate: 0
    }
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await fetchApi('/api/dashboard/stats/')
        setData(result)
      } catch (error) {
        console.error("Failed to fetch analytics", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Gathering insights...</p>
      </div>
    )
  }

  const maxMeetings = Math.max(...data.weeklyData.map((d) => d.meetings), 1)
  const speakerColors = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#9ca3af']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Insights and statistics about your meetings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="border-primary/10 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1">
              Total Meetings
            </CardTitle>
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary opacity-70 shrink-0 ml-1" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="text-2xl sm:text-3xl font-bold">{data.stats.totalMeetings}</div>
            <div className="mt-1 flex items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              Active
            </div>
          </CardContent>
        </Card>
 
        <Card className="border-primary/10 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1">
              Hours Transcribed
            </CardTitle>
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary opacity-70 shrink-0 ml-1" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="text-2xl sm:text-3xl font-bold">{data.stats.hoursProcessed}</div>
            <div className="mt-1 flex items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              Real-time
            </div>
          </CardContent>
        </Card>
 
        <Card className="border-primary/10 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1">
              Avg. Duration
            </CardTitle>
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary opacity-70 shrink-0 ml-1" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="text-2xl sm:text-3xl font-bold whitespace-nowrap">{data.stats.avgDuration}</div>
            <div className="mt-1 flex items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Per Audio
            </div>
          </CardContent>
        </Card>
 
        <Card className="border-primary/10 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1">
              Accuracy Rate
            </CardTitle>
            <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary opacity-70 shrink-0 ml-1" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="text-2xl sm:text-3xl font-bold">{data.stats.accuracyRate}</div>
            <div className="mt-1 flex items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              AI Verified
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.weeklyData.length === 0 ? (
                <p className="py-20 text-center text-muted-foreground">No data for this week</p>
              ) : (
                data.weeklyData.map((day) => (
                  <div key={day.day} className="flex items-center gap-4">
                    <span className="w-8 text-sm text-muted-foreground">{day.day}</span>
                    <div className="flex-1">
                      <div className="relative h-8 overflow-hidden rounded-lg bg-muted/50">
                        <div
                          className="absolute inset-y-0 left-0 rounded-lg bg-primary/80 transition-all duration-500"
                          style={{ width: `${(day.meetings / maxMeetings) * 100}%` }}
                        />
                        <span className="absolute inset-0 flex items-center pl-3 text-[10px] font-bold uppercase text-foreground">
                          {day.meetings} {day.meetings === 1 ? 'meeting' : 'meetings'}
                        </span>
                      </div>
                    </div>
                    <span className="w-24 text-right text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {day.hours}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Speaker Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="h-4 w-4" />
              Speaker Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-center justify-center">
              {data.topSpeakers.length === 0 ? (
                <div className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-dashed border-muted">
                  <span className="text-xs text-muted-foreground">No records</span>
                </div>
              ) : (
                <div className="relative h-44 w-44">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    {data.topSpeakers.reduce(
                      (acc, speaker, index) => {
                        const startAngle = acc.offset
                        const angle = (speaker.percentage / 100) * 360
                        if (angle === 0) return acc
                        const endAngle = startAngle + angle
                        const largeArc = angle > 180 ? 1 : 0
  
                        const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
                        const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
                        const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
                        const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)
  
                        acc.paths.push(
                          <path
                            key={index}
                            d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
                            fill={speakerColors[index % speakerColors.length]}
                            className="transition-opacity hover:opacity-80"
                          />
                        )
                        acc.offset = endAngle
                        return acc
                      },
                      { paths: [], offset: 0 }
                    ).paths}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-32 w-32 rounded-full bg-card shadow-inner" />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-xl font-bold leading-tight">{data.stats.hoursProcessed}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</span>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {data.topSpeakers.map((speaker, index) => (
                <div key={speaker.name} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: speakerColors[index % speakerColors.length] }}
                    />
                    <span className="text-sm font-medium">{speaker.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{speaker.time}</span>
                    <span className="w-12 text-right text-sm font-bold text-primary">
                      {speaker.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-800">Action Items Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 sm:gap-6">
            <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-2 sm:p-6 text-center shadow-sm">
              <CheckSquare className="mx-auto mb-1 sm:mb-3 h-5 w-5 sm:h-8 sm:w-8 text-blue-500" />
              <p className="text-xl sm:text-4xl font-extrabold tracking-tight text-blue-600">{data.actionItemStats?.total || 0}</p>
              <p className="text-[10px] sm:text-sm font-medium text-blue-600/70 mt-0.5">Total</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-2 sm:p-6 text-center shadow-sm">
              <CheckSquare className="mx-auto mb-1 sm:mb-3 h-5 w-5 sm:h-8 sm:w-8 text-emerald-500" />
              <p className="text-xl sm:text-4xl font-extrabold tracking-tight text-emerald-600">{data.actionItemStats?.completed || 0}</p>
              <p className="text-[10px] sm:text-sm font-medium text-emerald-600/70 mt-0.5">Completed</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-2 sm:p-6 text-center shadow-sm">
              <CheckSquare className="mx-auto mb-1 sm:mb-3 h-5 w-5 sm:h-8 sm:w-8 text-amber-500" />
              <p className="text-xl sm:text-4xl font-extrabold tracking-tight text-amber-600">{data.actionItemStats?.pending || 0}</p>
              <p className="text-[10px] sm:text-sm font-medium text-amber-600/70 mt-0.5">Pending</p>
            </div>
          </div>
          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">Completion Rate</span>
              <span className="text-sm font-extrabold text-emerald-600">{data.actionItemStats?.rate || 0}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20 transition-all duration-1000"
                style={{ width: `${data.actionItemStats?.rate || 0}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
