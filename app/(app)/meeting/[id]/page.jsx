'use client'
import { toast } from 'sonner'

import { useState, useEffect, useRef } from 'react'
import JSZip from 'jszip'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Play,
  Pause,
  Calendar,
  Clock,
  Users,
  Download,
  Share2,
  Copy,
  Check,
  FileText,
  CheckSquare,
  Sparkles,
  Loader2,
  Star,
  MessageSquare,
  Globe,
  Radio,
  Twitter,
  Linkedin,
  Instagram,
  MessageCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { fetchApi } from '@/lib/api'
import { cn } from '@/lib/utils'

// Fixed colors for speakers to keep it consistent
const SPEAKER_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
]

function getSpeakerColor(speakerName, index) {
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length]
}

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function MeetingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [meeting, setMeeting] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('transcript')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [copiedId, setCopiedId] = useState(null)
  const audioRef = useRef(null)
  const isProcessing = meeting?.status === 'processing'

  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackQuote, setFeedbackQuote] = useState('')
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const handleFeedbackSubmit = async () => {
    if (!feedbackQuote.trim()) {
      toast.error("Please enter a short review.")
      return
    }
    setIsSubmittingFeedback(true)
    try {
      await fetchApi('/api/testimonials/', {
        method: 'POST',
        body: JSON.stringify({
          quote: feedbackQuote,
          rating: feedbackRating,
          meeting_uuid: params.id
        })
      })
      toast.success("Thank you! Your review may be featured on our homepage.")
      setShowFeedback(false)
      setFeedbackQuote('')
      setFeedbackRating(5)
    } catch (error) {
      console.error("Failed to submit review", error)
      toast.error("Could not submit review at this time.")
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const handleToggleActionItem = async (itemId, taskName, currentStatus) => {
    const action = currentStatus ? 'pending' : 'completed';
    if (!window.confirm(`Mark this task as ${action}? \n\n"${taskName}"`)) {
      return
    }

    try {
      const response = await fetchApi(`/api/action-items/${itemId}/toggle/`, {
        method: 'POST'
      })

      setMeeting(prev => ({
        ...prev,
        action_items: prev.action_items.map(item =>
          item.id === itemId ? { ...item, completed: response.completed } : item
        )
      }))
    } catch (error) {
      console.error("Failed to toggle action item", error)
      toast.error("Could not update task status. Please try again.")
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Meeting link copied to clipboard!')
  }

  const handleWorkspaceToggle = async () => {
    try {
      const response = await fetchApi(`/api/meetings/${params.id}/toggle-share/`, {
        method: 'POST',
        body: JSON.stringify({ is_shared: !meeting.is_shared })
      })
      setMeeting(prev => ({...prev, is_shared: response.is_shared}))
    } catch (error) {
      toast.error("Could not update workspace sharing setting.")
    }
  }

  const handleExport = async () => {
    if (!meeting || !meeting.speaker_segments) {
      toast.error("Nothing to export yet.")
      return
    }

    try {
      const zip = new JSZip()
      
      // 1. Text Summary & Transcript
      const transcriptText = meeting.speaker_segments
        .map(s => `[${formatDuration(s.start)} - ${formatDuration(s.end)}] ${s.speaker}: ${s.text}`)
        .join('\n\n')
      
      const summaryText = `MEETING SUMMARY\n================\n${meeting.summary?.detailed || meeting.summary?.short || 'No summary available.'}\n\nKEY POINTS:\n${(meeting.summary?.key_points || []).map(p => `- ${p}`).join('\n')}`
      
      const fullExport = `MEETING: ${meeting.meeting_id}\nDATE: ${new Date().toLocaleDateString()}\n\nAUDIO SOURCE: ${meeting.audio_url || 'N/A'}\n\nTRANSCRIPT\n==========\n${transcriptText}\n\n\n${summaryText}`
      
      zip.file(`meeting_${meeting.meeting_id}_report.txt`, fullExport)

      // 2. Add Audio File (fetch it first)
      if (meeting.audio_url) {
        try {
          const response = await fetch(meeting.audio_url)
          const blob = await response.blob()
          const filename = meeting.audio_url.split('/').pop() || `audio.wav`
          zip.file(filename, blob)
        } catch (err) {
          console.error("Failed to fetch audio for ZIP", err)
          // Continue even if audio fails to bundle
        }
      }

      // 3. Generate and Download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meeting_${meeting.meeting_id}_archive.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error("Export failed", error)
      toast.error("Export failed. Proceeding with separate text download...")
      
      // Fallback: Just download the text report
      const transcriptText = meeting.speaker_segments
        .map(s => `[${formatDuration(s.start)} - ${formatDuration(s.end)}] ${s.speaker}: ${s.text}`)
        .join('\n\n')
      const fullExport = `MEETING: ${meeting.meeting_id}\n\nTRANSCRIPT\n==========\n${transcriptText}`
      const blob = new Blob([fullExport], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meeting_${meeting.meeting_id}_export.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration)
  }

  const handleSeek = (e) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const clickedPercentage = x / rect.width
      audioRef.current.currentTime = clickedPercentage * duration
    }
  }

  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      // Auto-play when seeking from transcript
      audioRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  const handleStartScheduled = async (mode = 'live') => {
    try {
      setIsLoading(true)
      // Call start api
      await fetchApi('/api/live/start/', {
        method: 'POST',
        body: JSON.stringify({ existing_id: params.id })
      })
      
      if (mode === 'live') {
        router.push('/live')
      } else {
        router.push('/external')
      }
    } catch (error) {
      console.error("Failed to start session", error)
      toast.error(error.message || "Failed to start meeting session.")
      setIsLoading(false)
    }
  }


  const fetchMeeting = async () => {
    try {
      const data = await fetchApi(`/api/meetings/${params.id}/`)
      setMeeting(data)

        // If still processing, poll again in 5 seconds
        if (data && data.status === 'processing') {
          setTimeout(fetchMeeting, 5000)
        } else {
          setIsLoading(false)
          // Default to summary for upcoming meetings that have a prep brief
          if (data && data.status === 'scheduled' && data.is_prep_brief) {
            setActiveTab('summary')
          }
        }
    } catch (error) {
      console.error("Failed to fetch meeting", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMeeting()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const tabs = [
    { id: 'transcript', label: 'Transcript', icon: FileText },
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'actions', label: 'Action Items', icon: CheckSquare },
  ]

  if (isLoading && !meeting) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading meeting data...</p>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold">Meeting not found</h2>
        <Link href="/meetings" className="mt-4">
          <Button variant="outline">Back to Meetings</Button>
        </Link>
      </div>
    )
  }



  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link href="/meetings">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Meetings
          </Button>
        </Link>

        {meeting.status === 'scheduled' && (
          <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
            <Button 
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
              onClick={() => handleStartScheduled('live')}
            >
              <Radio className="h-4 w-4" />
              Start Live Recording
            </Button>
            <Button 
              variant="outline"
              className="gap-2 border-primary text-primary hover:bg-primary/5 shadow-sm"
              onClick={() => handleStartScheduled('external')}
            >
              <Globe className="h-4 w-4" />
              External Meeting
            </Button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{meeting.title || `Meeting ${meeting.meeting_id}`}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {meeting.speaker_count || 0} participants
            </span>
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
        <div className="flex flex-wrap items-center gap-2">
          {meeting.status === 'completed' && (
            <Button 
              variant="outline" 
              className="gap-2 bg-blue-50/50 hover:bg-blue-100 text-blue-600 border-blue-200" 
              onClick={() => setShowFeedback(true)}
            >
              <Star className="h-4 w-4 fill-current" />
              Rate Experience
            </Button>
          )}
          {(!isProcessing && meeting.is_host) && (
            <Button 
              variant={meeting.is_shared ? "secondary" : "default"} 
              className={cn("gap-2 shadow-sm transition-colors", meeting.is_shared ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200" : "")} 
              onClick={handleWorkspaceToggle}
            >
              <Users className="h-4 w-4" />
              {meeting.is_shared ? "Shared with Workspace" : "Share with Workspace"}
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="gap-2" 
                disabled={isProcessing}
              >
                <Share2 className="h-4 w-4" />
                Share Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Meeting</DialogTitle>
                <DialogDescription>
                  Anyone with this link can view the transcript and summary.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2 py-4">
                <div className="grid flex-1 gap-2">
                  <Input
                    id="meeting-link"
                    defaultValue={typeof window !== 'undefined' ? window.location.href : ''}
                    readOnly
                    className="h-9 font-mono text-xs bg-muted"
                  />
                </div>
                <Button size="sm" className="px-3" onClick={handleShare}>
                  <span className="sr-only">Copy</span>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-4 border-t pt-4">
                <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-widest">Share on Social</p>
                <div className="flex items-center justify-center gap-4">
                  {/* WhatsApp */}
                  <Button 
                    size="icon" 
                    className="h-12 w-12 rounded-full bg-[#25D366] hover:bg-[#25D366]/90 text-white shadow-lg transition-all hover:-translate-y-1"
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this meeting summary on MeetAI: ${window.location.href}`)}`, '_blank')}
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  
                  {/* Twitter / X */}
                  <Button 
                    size="icon" 
                    className="h-12 w-12 rounded-full bg-black hover:bg-black/90 text-white shadow-lg transition-all hover:-translate-y-1"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Reviewing my meeting on @MeetAI!`)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                  >
                    <Twitter className="h-6 w-6" />
                  </Button>
                  
                  {/* LinkedIn */}
                  <Button 
                    size="icon" 
                    className="h-12 w-12 rounded-full bg-[#0077b5] hover:bg-[#0077b5]/90 text-white shadow-lg transition-all hover:-translate-y-1"
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                  >
                    <Linkedin className="h-6 w-6" />
                  </Button>
                  
                  {/* Instagram */}
                  <Button 
                    size="icon" 
                    className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] hover:opacity-90 text-white shadow-lg transition-all hover:-translate-y-1"
                    onClick={() => {
                      handleShare();
                      toast.info('Link copied! You can now paste it in your Instagram story or bio.');
                    }}
                  >
                    <Instagram className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline" 
            className="gap-2" 
            disabled={isProcessing}
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                How was your AI summary?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-2 py-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 transition-all hover:scale-110"
                  >
                    <Star className={cn("h-8 w-8", feedbackRating >= star ? "fill-blue-500 text-blue-500" : "text-muted-foreground stroke-1")} />
                  </button>
                ))}
              </div>
              <textarea 
                value={feedbackQuote}
                onChange={(e) => setFeedbackQuote(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Write a short review about how MeetingAI helped you today. (This may be featured publicly on our homepage!)"
                rows={4}
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setShowFeedback(false)} disabled={isSubmittingFeedback}>Cancel</Button>
                <Button onClick={handleFeedbackSubmit} disabled={isSubmittingFeedback}>
                  {isSubmittingFeedback ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                  Submit Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isProcessing && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 text-amber-800 dark:text-amber-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="font-medium">The AI is currently analyzing your meeting audio. This can take a few minutes...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audio Player */}
      {!isProcessing && meeting.audio_url && (
        <Card className="overflow-hidden border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-110 active:scale-95 hover:bg-primary/90"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 fill-current" />
                  ) : (
                    <Play className="h-6 w-6 fill-current translate-x-0.5" />
                  )}
                </button>
                <div>
                  <p className="text-sm font-semibold text-primary">Meeting Recording</p>
                  <p className="text-xs text-muted-foreground">
                    {isPlaying ? "Playing session audio..." : "Click to listen to the recording"}
                  </p>
                </div>
              </div>
              <div className="flex-1">
                <audio
                  ref={audioRef}
                  src={meeting.audio_url}
                  preload="auto"
                  crossOrigin="anonymous"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-primary tabular-nums">
                    {formatDuration(currentTime)}
                  </span>
                  <div
                    className="relative h-2 flex-1 rounded-full bg-primary/10 overflow-hidden cursor-pointer group"
                    onClick={handleSeek}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-primary group-hover:bg-primary/80 transition-all"
                      style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                    />
                    <div
                      className="absolute h-full w-0.5 bg-primary-foreground opacity-0 group-hover:opacity-50 transition-opacity"
                      style={{ left: `${(currentTime / duration) * 100 || 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground tabular-nums">
                    {formatDuration(duration)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Participants */}
      {!isProcessing && meeting.speakers && meeting.speakers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {meeting.speakers.map((participant, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5"
                >
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: getSpeakerColor(participant, index) }}
                  >
                    {participant.charAt(0)}
                  </div>
                  <span className="text-sm">{participant}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={isProcessing}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
                isProcessing && 'opacity-50 cursor-not-allowed'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={cn("transition-opacity", isProcessing && "opacity-50 pointer-events-none")}>
        {activeTab === 'transcript' && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {!meeting.speaker_segments || meeting.speaker_segments.length === 0 ? (
                  <p className="text-muted-foreground italic text-center py-8">No transcript available.</p>
                ) : (
                  meeting.speaker_segments.map((item, i) => {
                    // Find speaker index for color
                    const speakerIndex = meeting.speakers?.indexOf(item.speaker) || 0
                    const color = getSpeakerColor(item.speaker, speakerIndex)

                    return (
                      <div 
                        key={i} 
                        className={cn(
                          "group flex gap-4 rounded-xl p-3 transition-all hover:bg-muted/50 cursor-pointer",
                          currentTime >= item.start && currentTime <= item.end ? "bg-primary/5 ring-1 ring-primary/20" : ""
                        )}
                        onClick={() => seekTo(item.start)}
                      >
                        <div className="shrink-0 pt-1">
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm transition-transform group-hover:scale-105",
                              currentTime >= item.start && currentTime <= item.end ? "ring-2 ring-primary ring-offset-2" : ""
                            )}
                            style={{ backgroundColor: color }}
                          >
                            {item.speaker.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-bold text-foreground/90">{item.speaker}</span>
                            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono font-medium text-muted-foreground transition-colors group-hover:bg-primary/20 group-hover:text-primary">
                              {formatDuration(item.start)} - {formatDuration(item.end)}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCopy(item.text, i); }}
                              className="ml-auto rounded-full p-1.5 opacity-0 transition-all hover:bg-background group-hover:opacity-100"
                            >
                              {copiedId === i ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              )}
                            </button>
                          </div>
                          <p className={cn(
                            "text-sm leading-relaxed transition-colors",
                            currentTime >= item.start && currentTime <= item.end ? "text-foreground font-medium" : "text-muted-foreground"
                          )}>
                            {item.text || "(Inaudible)"}
                          </p>
                        </div>
                      </div>
                    )

                  })
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-4">
            <Card className={cn(meeting.is_prep_brief && "border-primary/40 bg-primary/5")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {meeting.is_prep_brief ? "Strategic Preparation Briefing" : "AI Summary"}
                </CardTitle>
                {meeting.is_prep_brief && (
                  <p className="text-xs text-primary font-medium">AI-generated context based on your past meeting history</p>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {meeting.summary?.detailed || meeting.summary?.short || (meeting.is_prep_brief ? "No strategic context found for this topic." : "No summary generated for this meeting.")}
                </p>
              </CardContent>
            </Card>

            {meeting.summary?.key_points && meeting.summary.key_points.length > 0 && (
              <Card className={cn(meeting.is_prep_brief && "border-primary/20")}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {meeting.is_prep_brief ? "Suggested Agenda" : "Key Points"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {meeting.summary.key_points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <span className="text-muted-foreground">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              {!meeting.action_items || meeting.action_items.length === 0 ? (
                <p className="text-muted-foreground italic">No action items detected.</p>
              ) : (
                <div className="space-y-3">
                  {meeting.action_items.map((item, i) => (
                    <div
                      key={item.id || i}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-4 transition-all duration-200',
                        item.completed ? 'bg-muted/30 border-muted opacity-80' : 'hover:border-primary/30'
                      )}
                    >
                      <button
                        onClick={() => handleToggleActionItem(item.id, item.task, item.completed)}
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all cursor-pointer hover:scale-110 active:scale-90',
                          item.completed
                            ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                            : 'border-input hover:border-primary bg-background'
                        )}
                      >
                        {item.completed && <Check className="h-3 w-3" />}
                      </button>
                      <div className="flex-1">
                        <p className={cn('font-medium transition-all', item.completed && 'line-through text-muted-foreground')}>
                          {item.task}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.assigned_to && `Assigned to ${item.assigned_to}`}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight',
                          item.completed
                            ? 'bg-muted text-muted-foreground'
                            : item.priority === 'high'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        )}
                      >
                        {item.completed ? 'Done' : `${item.priority} Priority`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
