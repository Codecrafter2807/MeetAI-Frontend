'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { fetchApi } from '@/lib/api'
import Link from 'next/link'

export default function InvitePage({ params }) {
  const { token } = use(params)
  const router = useRouter()
  const [status, setStatus] = useState('loading') // loading, valid, invalid, success, error
  const [invitation, setInvitation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    checkLoginStatus()
    verifyInvite()
  }, [token])

  const checkLoginStatus = () => {
    const userToken = localStorage.getItem('token')
    setIsLoggedIn(!!userToken)
  }

  const verifyInvite = async () => {
    try {
      // We don't have a specific "verify" endpoint, but we can try to get details 
      // or just assume it's valid if the accept request will handle it.
      // For now, let's try to join directly if logged in, or show the prompt.
      setStatus('valid')
    } catch (error) {
      setStatus('invalid')
    }
  }

  const handleJoin = async () => {
    setIsLoading(true)
    try {
      const result = await fetchApi('/api/workspaces/accept-invite/', {
        method: 'POST',
        body: JSON.stringify({ token })
      })
      // Save the workspace slug so chat widget activates immediately
      if (result?.workspace?.slug) {
        localStorage.setItem('activeWorkspaceSlug', result.workspace.slug)
        window.dispatchEvent(new Event('workspaceChanged'))
      }
      setStatus('success')
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Join error:', error)
      setStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full shadow-2xl border-none">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-24 w-full items-center justify-center overflow-hidden mb-4">
            <img src="/logo.png" alt="MeetAI" className="h-full w-full object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold">Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a collaborative workspace on MeetingAI.
          </CardDescription>
        </CardHeader>

        <CardContent className="py-8 text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verifying invitation...</p>
            </div>
          )}

          {status === 'valid' && (
            <div className="space-y-6">
              <div className="rounded-xl bg-primary/5 p-6 border border-primary/10">
                <UserPlus className="h-10 w-10 text-primary mx-auto mb-3" />
                <p className="text-lg font-semibold">Join the team!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect with your teammates and start sharing meeting recaps and resources.
                </p>
              </div>

              {!isLoggedIn ? (
                <div className="space-y-4">
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 font-medium">
                    You need to be logged in to accept this invitation.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                      <Link href={`/login?callback=/invite/${token}`}>Sign In to Join</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/register?callback=/invite/${token}`}>Create Account</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleJoin}
                  className="w-full h-12 text-md shadow-lg shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Accept Invitation
                </Button>
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4 animate-in zoom-in duration-300">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Welcome onboard!</h3>
              <p className="text-muted-foreground">
                You have successfully joined the workspace. Redirecting you to your dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <XCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Failed to Join</h3>
              <p className="text-muted-foreground text-sm">
                This invitation might be expired, already used, or invalid. Please ask the admin for a new link.
              </p>
              <Button variant="outline" asChild className="mt-4">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t bg-muted/20 py-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MeetingAI. All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
