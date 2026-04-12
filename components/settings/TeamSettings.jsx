'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Link as LinkIcon,
  Check,
  Copy,
  Loader2,
  Trash2,
  LogOut
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { fetchApi } from '@/lib/api'
import { toast } from 'sonner'

export function TeamSettings() {
  const [workspace, setWorkspace] = useState(null)
  const [allWorkspaces, setAllWorkspaces] = useState([])
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
    loadWorkspace()
  }, [])

  const loadWorkspace = async () => {
    setIsLoading(true)
    try {
      const workspaces = await fetchApi('/api/workspaces/')
      if (workspaces && workspaces.length > 0) {
        setAllWorkspaces(workspaces)
        const savedSlug = localStorage.getItem('activeWorkspaceSlug')
        const ws = workspaces.find(w => w.slug === savedSlug) || workspaces[0]
        setWorkspace(ws)
        if (ws) {
          const memberData = await fetchApi(`/api/workspaces/${ws.slug}/members/`)
          setMembers(memberData)
          if (!savedSlug) localStorage.setItem('activeWorkspaceSlug', ws.slug)
        }
      } else {
        console.warn('No workspaces found for user')
        setWorkspace(null)
      }
    } catch (error) {
      console.error('Failed to load workspace:', error)
      toast.error('Failed to load team members')
    } finally {
      setIsLoading(false)
    }
  }

  const switchWorkspace = async (slug) => {
    setIsLoading(true)
    try {
      const targetWs = allWorkspaces.find(w => w.slug === slug)
      setWorkspace(targetWs)
      localStorage.setItem('activeWorkspaceSlug', slug)
      window.dispatchEvent(new Event('workspaceChanged'))
      const memberData = await fetchApi(`/api/workspaces/${targetWs.slug}/members/`)
      setMembers(memberData)
    } catch (error) {
      toast.error('Failed to switch workspace')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateInvite = async () => {
    if (!workspace) return
    setInviteLoading(true)
    try {
      const response = await fetchApi(`/api/workspaces/${workspace.slug}/invite/`, {
        method: 'POST'
      })
      // In a real app, this would be the full URL
      const fullUrl = `${window.location.origin}/invite/${response.token}`
      setInviteLink(fullUrl)
    } catch (error) {
      toast.error('Failed to generate invite link')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleRemoveMember = async (userId, isSelf) => {
    if (!workspace || !window.confirm(isSelf ? "Are you sure you want to leave this workspace?" : "Are you sure you want to remove this member?")) return
    
    try {
      await fetchApi(`/api/workspaces/${workspace.slug}/members/${userId}/`, {
        method: 'DELETE'
      })
      toast.success(isSelf ? "You have left the workspace" : "Member removed successfully")
      
      if (isSelf) {
        // If leaving, reload to switch to active personal workspace
        loadWorkspace()
      } else {
        // Refresh members list
        const memberData = await fetchApi(`/api/workspaces/${workspace.slug}/members/`)
        setMembers(memberData)
      }
    } catch (error) {
      toast.error(error.message || "Failed to remove member")
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success('Invite link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredMembers = members.filter(m => 
    m.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight">Members and groups</h2>
            {allWorkspaces.length > 1 && (
              <select 
                className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={workspace?.slug || ''}
                onChange={(e) => switchWorkspace(e.target.value)}
              >
                {allWorkspaces.map(ws => (
                  <option key={ws.slug} value={ws.slug}>{ws.name}</option>
                ))}
              </select>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your team members and their access levels in <strong>{workspace?.name}</strong>.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20" disabled={!workspace}>
              <UserPlus className="h-4 w-4" />
              Invite Teammate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a Teammate</DialogTitle>
              <DialogDescription>
                Generate a public invitation link. Only users with a MeetAI account can join.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!inviteLink ? (
                <Button 
                  onClick={handleGenerateInvite} 
                  className="w-full" 
                  disabled={inviteLoading}
                >
                  {inviteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                  Generate Invitation Link
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Public Invitation Link</p>
                  <div className="flex items-center gap-2">
                    <Input readOnly value={inviteLink} className="bg-muted font-mono text-xs" />
                    <Button size="icon" variant="outline" onClick={copyToClipboard}>
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    This link allows anyone with a MeetAI account to join this workspace.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden border-none bg-card/50 shadow-md">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search teammates..." 
                className="pl-9 bg-background/50 border-none shadow-none focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {filteredMembers.length} Teammates
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredMembers.map((member, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <Link href={`/profile/${member.user.id}`}>
                    <Avatar className="h-10 w-10 border shadow-sm hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
                      <AvatarImage src={member.user.avatar_url} />
                      <AvatarFallback className="bg-primary/5 text-primary font-bold">
                        {member.user.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/profile/${member.user.id}`} className="hover:underline cursor-pointer decoration-primary/30 underline-offset-4">
                        <p className="font-semibold text-sm">{member.user.full_name}</p>
                      </Link>
                      {member.role === 'admin' && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 uppercase tracking-wider bg-blue-500/10 text-blue-600 border-blue-500/20">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase">Joined</p>
                    <p className="text-xs">{new Date(member.joined_at).toLocaleDateString()}</p>
                  </div>
                  
                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {workspace?.owner === currentUser?.id ? (
                        <>
                          {member.user.id !== currentUser.id && (
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                              onClick={() => handleRemoveMember(member.user.id, false)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove Member
                            </DropdownMenuItem>
                          )}
                          {member.user.id === currentUser.id && (
                            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                              You are the Host
                            </DropdownMenuItem>
                          )}
                        </>
                      ) : (
                        <>
                          {member.user.id === currentUser.id ? (
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                              onClick={() => handleRemoveMember(member.user.id, true)}
                            >
                              <LogOut className="h-4 w-4" />
                              Leave Workspace
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                              No actions available
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            {filteredMembers.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <p className="text-sm font-medium text-muted-foreground">No teammates found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
