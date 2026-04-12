'use client'
import { toast } from 'sonner'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Save, User, Loader2 } from 'lucide-react'
import { fetchApi } from '@/lib/api'

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    gender: '',
    avatar_url: '',
    stats: {
      meetings_count: 0,
      action_items_count: 0,
      total_duration: '0 min',
      member_since: ''
    }
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchApi('/api/auth/profile/')
        setFormData({
          name: data.full_name || '',
          email: data.email || '',
          role: data.role || '',
          gender: data.gender || '',
          avatar_url: data.avatar_url || '',
          stats: data.stats || { meetings_count: 0, action_items_count: 0, total_duration: '0min', member_since: '' }
        })
      } catch (error) {
        console.error("Failed to load profile", error)
        setMessage({ type: 'error', text: 'Failed to load profile data' })
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      const uploadData = new FormData()
      uploadData.append('full_name', formData.name)
      uploadData.append('role', formData.role)
      uploadData.append('gender', formData.gender)
      if (avatarFile) {
        uploadData.append('avatar', avatarFile)
      }

      const response = await fetchApi('/api/auth/profile/', {
        method: 'PUT',
        body: uploadData
      })
      
      // Update local storage for other components
      const updatedUser = {
        id: response.id,
        name: response.full_name,
        email: response.email,
        avatar_url: response.avatar_url
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      setFormData(prev => ({
        ...prev,
        avatar_url: response.avatar_url || prev.avatar_url
      }))
      setAvatarFile(null)
      setPreviewUrl(null)
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      console.error("Failed to update profile", error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm("Are you ABSOLUTELY sure you want to delete your account? This action cannot be undone and all your meetings will be lost.")) {
      try {
        await fetchApi('/api/auth/profile/', {
          method: 'DELETE'
        })
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/'
      } catch (error) {
        console.error("Failed to delete account", error)
        toast.error("Failed to delete account. Please try again.")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar Card */}
        <Card>
          <CardContent className="flex flex-col items-center p-6">
            <div className="relative mb-4">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-primary text-4xl font-bold text-primary-foreground shadow-xl">
                {previewUrl || formData.avatar_url ? (
                  <img 
                    src={previewUrl || formData.avatar_url} 
                    alt={formData.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  formData.name ? formData.name.charAt(0) : '?'
                )}
              </div>
              <label 
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-background shadow-lg transition-all hover:bg-muted hover:scale-110 active:scale-95"
              >
                <Camera className="h-5 w-5 text-primary" />
                <input 
                  id="avatar-upload"
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <h3 className="text-lg font-semibold">{formData.name || 'User'}</h3>
            <p className="text-sm text-muted-foreground">{formData.email}</p>
            {formData.role && (
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {formData.role}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-primary">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg text-sm ${
                message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {message.text}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="mb-2 block text-sm font-medium">
                    Role
                  </label>
                  <input
                    id="role"
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="mb-2 block text-sm font-medium">
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving} className="gap-2 px-8">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-primary/5 p-6 text-center transition-colors hover:bg-primary/10">
              <p className="text-3xl font-medium text-foreground">{formData.stats.meetings_count}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Meetings</p>
            </div>
            <div className="rounded-xl bg-primary/5 p-6 text-center transition-colors hover:bg-primary/10">
              <p className="text-3xl font-medium text-foreground">{formData.stats.total_duration}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Time Transcribed</p>
            </div>
            <div className="rounded-xl bg-primary/5 p-6 text-center transition-colors hover:bg-primary/10">
              <p className="text-3xl font-medium text-foreground">{formData.stats.action_items_count}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Action Items</p>
            </div>
            <div className="rounded-xl bg-primary/5 p-6 text-center transition-colors hover:bg-primary/10">
              <p className="text-3xl font-medium text-foreground">{formData.stats.member_since}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Member Since</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button 
              variant="destructive"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
