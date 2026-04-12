'use client'

import { useEffect, useState, use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Loader2, ArrowLeft } from 'lucide-react'
import { fetchApi } from '@/lib/api'
import Link from 'next/link'

export default function PublicProfilePage({ params: paramsPromise }) {
  const params = use(paramsPromise)
  const userId = params.id
  
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchApi(`/api/auth/profile/${userId}/`)
        setData(profileData)
      } catch (err) {
        console.error("Failed to load public profile", err)
        setError('Failed to load profile data. The user may not exist or you might not have access.')
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-red-100 p-3 text-red-600">
           <User className="h-8 w-8" />
        </div>
        <p className="text-destructive font-medium">{error || 'User not found'}</p>
        <Link href="/team">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Team
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Member Profile</h1>
          <p className="text-muted-foreground">
            Viewing details for {data.full_name}
          </p>
        </div>
        <Link href="/team">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Team
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardContent className="flex flex-col items-center p-8">
            <div className="relative mb-6">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-primary text-4xl font-bold text-primary-foreground shadow-xl ring-4 ring-primary/5">
                {data.avatar_url ? (
                  <img 
                    src={data.avatar_url} 
                    alt={data.full_name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  data.full_name ? data.full_name.charAt(0) : '?'
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-center">{data.full_name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{data.email}</p>
            
            {data.role && (
              <div className="mt-4">
                <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                  {data.role}
                </span>
              </div>
            )}
            
            <div className="w-full mt-8 pt-6 border-t space-y-3">
               <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Gender</span>
                  <span className="capitalize">{data.gender || 'Not specified'}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Member Since</span>
                  <span>{data.stats.member_since}</span>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Column */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider">Platform Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                  <div className="rounded-2xl bg-secondary/50 p-6 flex flex-col items-center justify-center text-center transition-all hover:bg-secondary/80">
                    <p className="text-3xl font-bold text-foreground">{data.stats.meetings_count}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Meetings</p>
                  </div>
                  <div className="rounded-2xl bg-secondary/50 p-6 flex flex-col items-center justify-center text-center transition-all hover:bg-secondary/80">
                    <p className="text-3xl font-bold text-foreground">{data.stats.total_duration}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Time Transcribed</p>
                  </div>
                  <div className="rounded-2xl bg-secondary/50 p-6 flex flex-col items-center justify-center text-center transition-all hover:bg-secondary/80">
                    <p className="text-3xl font-bold text-foreground">{data.stats.action_items_count}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action Items</p>
                  </div>
                </div>
                
                <div className="mt-8 p-6 rounded-2xl border bg-muted/30 border-dashed text-center">
                   <p className="text-sm text-muted-foreground">
                      This user is a member of your active workspace. You can share meetings and chat with them in the team channel.
                   </p>
                </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
