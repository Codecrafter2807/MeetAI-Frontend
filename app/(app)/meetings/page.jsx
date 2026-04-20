'use client'
import { toast } from 'sonner'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  Clock,
  Users,
  MoreVertical,
  Play,
  Trash2,
  Share2,
  Download,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { fetchApi, API_URL } from '@/lib/api'
import { cn } from '@/lib/utils'

const statusFilters = ['All', 'Uploaded', 'Active', 'Processing', 'Completed', 'Ended', 'Failed']

function formatDateTime(isoString) {
  if (!isoString) return { date: 'N/A', time: 'N/A' }
  const d = new Date(isoString)
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
}

function formatDuration(seconds) {
  if (!seconds) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function MeetingsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [statusFilter, setStatusFilter] = useState('All')
  const [meetings, setMeetings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check URL parameters for initial search query
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const q = params.get('q')
      if (q && !searchQuery) {
        setSearchQuery(q)
      }
    }
  }, [])

  useEffect(() => {
    async function loadMeetings() {
      try {
        setIsLoading(true)
        const qParam = searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : ''
        const data = await fetchApi(`/api/meetings/${qParam}`)
        setMeetings(data)
      } catch (error) {
        console.error('Failed to fetch meetings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const delayDebounceFn = setTimeout(() => {
      loadMeetings()
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const filteredMeetings = meetings.filter((meeting) => {
    const status = meeting.status || ''
    const matchesStatus =
      statusFilter === 'All' || status.toLowerCase() === statusFilter.toLowerCase()
    return matchesStatus
  })

  const handleDelete = async (meeting) => {
    if (!window.confirm(`Are you sure you want to delete "${meeting.title}"?`)) return;
    try {
      await fetchApi(`/api/meetings/${meeting.id}/delete/`, { method: 'DELETE' });
      setMeetings((prev) => prev.filter((m) => m.id !== meeting.id));
      toast.success('Meeting deleted successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete meeting.');
    }
  };

  const handleDownload = async (meeting) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const url = `${API_URL}/api/meetings/${meeting.id}/download/`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Token ${token}` } : {},
      });
      
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      toast.error('Failed to download meeting files.');
    }
  };

  const handleShare = async (meeting) => {
    try {
      const data = await fetchApi(`/api/meetings/${meeting.id}/share/`);
      const shareText = `Meeting: ${data.title}\nDate: ${new Date(data.date).toLocaleDateString()}\n\nSummary:\n${data.summary}\n`;
      await navigator.clipboard.writeText(shareText);
      toast.success('Meeting details copied to clipboard!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate share link/data.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Meetings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Browse and manage all your meeting recordings
          </p>
        </div>
        <Link href="/upload" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto gap-2">
            <Play className="h-4 w-4 shrink-0" />
            Upload Recording
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {statusFilter}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {statusFilters.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(statusFilter === status && 'bg-accent')}
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 w-8 p-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Meetings Grid/List */}
      {isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Loading meetings...</h3>
          </CardContent>
        </Card>
      ) : filteredMeetings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No meetings found</h3>
            <p className="mb-4 text-center text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Start by recording or uploading a meeting'}
            </p>
            <Link href="/upload">
              <Button>Upload Recording</Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMeetings.map((meeting) => (
            <MeetingCard 
              key={meeting.id} 
              meeting={meeting} 
              onDelete={() => handleDelete(meeting)}
              onDownload={() => handleDownload(meeting)}
              onShare={() => handleShare(meeting)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMeetings.map((meeting) => (
            <MeetingListItem 
              key={meeting.id} 
              meeting={meeting} 
              onDelete={() => handleDelete(meeting)}
              onDownload={() => handleDownload(meeting)}
              onShare={() => handleShare(meeting)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MeetingCard({ meeting, onDelete, onDownload, onShare }) {
  const { date, time } = formatDateTime(meeting.created_at)
  
  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-md">
      <Link href={`/meeting/${meeting.id}`}>
        <CardContent className="p-0">
          {/* Thumbnail placeholder */}
          <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background/90 shadow-lg transition-transform group-hover:scale-110">
                <Play className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 rounded-md bg-background/90 px-2 py-1 text-xs font-medium">
              {formatDuration(meeting.duration)}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold line-clamp-1">{meeting.title}</h3>
                {!meeting.is_host && (
                  <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Shared
                  </span>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {meeting.is_host && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(); }}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownload(); }}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  {meeting.is_host && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {time}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {meeting.speaker_count || 0} speakers
                </span>
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                  meeting.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                )}
              >
                {meeting.status}
              </span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

function MeetingListItem({ meeting, onDelete, onDownload, onShare }) {
  const { date, time } = formatDateTime(meeting.created_at)

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <Link href={`/meeting/${meeting.id}`}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Play className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{meeting.title}</h3>
                {!meeting.is_host && (
                  <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Shared
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {time}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {meeting.speaker_count || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{formatDuration(meeting.duration)}</span>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                meeting.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              )}
            >
              {meeting.status}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {meeting.is_host && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(); }}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownload(); }}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                {meeting.is_host && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
