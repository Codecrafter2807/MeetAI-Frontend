'use client'
import { toast } from 'sonner'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Mail,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { fetchApi } from '@/lib/api'


export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [copied, setCopied] = useState(false)

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordStep, setPasswordStep] = useState('request') // 'request' or 'verify'
  const [passwordData, setPasswordData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    meetingComplete: true,
    actionItems: true,
    weeklyDigest: false,
  })

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const apiKey = 'your_api_key_here'

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ]

  const handleRequestOTP = async () => {
    setIsLoading(true)
    try {
      // Get user email from local storage or context if possible
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const email = user.email || ''

      await fetchApi('/api/auth/password-reset-otp/', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
      setPasswordData({ ...passwordData, email })
      setPasswordStep('verify')
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      await fetchApi('/api/auth/password-reset-confirm/', {
        method: 'POST',
        body: JSON.stringify({
          email: passwordData.email,
          otp: passwordData.otp,
          new_password: passwordData.newPassword
        })
      })
      toast.success('Password changed successfully!')
      setIsChangingPassword(false)
      setPasswordStep('request')
      setPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and team preferences
        </p>
      </div>

      <div className="space-y-6 mt-0">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>
              Choose how MeetingAI looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-4 transition-all hover:bg-muted/50',
                    theme === t.id && 'border-primary bg-primary/5'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      theme === t.id ? 'bg-primary/10' : 'bg-muted'
                    )}
                  >
                    <t.icon
                      className={cn(
                        'h-5 w-5',
                        theme === t.id ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.id === 'light' && 'Light background'}
                      {t.id === 'dark' && 'Dark background'}
                      {t.id === 'system' && 'Match system'}
                    </p>
                  </div>
                  {theme === t.id && (
                    <Check className="ml-auto h-5 w-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setNotifications((prev) => ({ ...prev, email: !prev.email }))
                }
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  notifications.email ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                    notifications.email && 'translate-x-5'
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Browser push notifications
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setNotifications((prev) => ({ ...prev, push: !prev.push }))
                }
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  notifications.push ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                    notifications.push && 'translate-x-5'
                  )}
                />
              </button>
            </div>

            <div className="border-t pt-4">
              <h4 className="mb-3 text-sm font-medium">Notification Types</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Meeting Completed</span>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        meetingComplete: !prev.meetingComplete,
                      }))
                    }
                    className={cn(
                      'relative h-5 w-9 rounded-full transition-colors',
                      notifications.meetingComplete ? 'bg-primary' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                        notifications.meetingComplete && 'translate-x-4'
                      )}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Action Items Due</span>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        actionItems: !prev.actionItems,
                      }))
                    }
                    className={cn(
                      'relative h-5 w-9 rounded-full transition-colors',
                      notifications.actionItems ? 'bg-primary' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                        notifications.actionItems && 'translate-x-4'
                      )}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weekly Digest</span>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        weeklyDigest: !prev.weeklyDigest,
                      }))
                    }
                    className={cn(
                      'relative h-5 w-9 rounded-full transition-colors',
                      notifications.weeklyDigest ? 'bg-primary' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                        notifications.weeklyDigest && 'translate-x-4'
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Key Settings - Commented out for now
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Key</CardTitle>
          <CardDescription>
            Use this key to integrate MeetingAI with other services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                readOnly
                className="h-10 w-full rounded-lg border border-input bg-muted/50 pl-10 pr-20 font-mono text-sm"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={handleCopyApiKey}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Keep this key secret. Do not share it publicly.
          </p>
        </CardContent>
      </Card>
      */}

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">
                  Update your password regularly for security
                </p>
              </div>
              <Button variant="outline" onClick={() => setIsChangingPassword(true)}>Change</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <Button variant="outline">Enable</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export Data</p>
                <p className="text-sm text-muted-foreground">
                  Download all your meetings and transcripts
                </p>
              </div>
              <Button variant="outline">Export</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              {passwordStep === 'request'
                ? "We'll send a verification code to your email to verify your identity."
                : "Enter the 6-digit code sent to your email and your new password."}
            </DialogDescription>
          </DialogHeader>

          {passwordStep === 'request' ? (
            <div className="py-4 text-center">
              <Key className="mx-auto h-12 w-12 text-primary/20 mb-4" />
              <p className="text-sm text-muted-foreground mb-6">
                Verification email will be sent to your registered email address.
              </p>
              <Button
                onClick={handleRequestOTP}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={passwordData.otp}
                  onChange={(e) => setPasswordData({ ...passwordData, otp: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">New Password</label>
                <input
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <input
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>
              <Button
                onClick={handleResetPassword}
                className="w-full mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Change Password'}
              </Button>
              <Button
                variant="link"
                onClick={() => setPasswordStep('request')}
                className="text-xs text-muted-foreground"
                disabled={isLoading}
              >
                Didn't get a code? Send again
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
