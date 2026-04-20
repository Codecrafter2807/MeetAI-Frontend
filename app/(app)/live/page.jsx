'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Mic,
  MicOff,
  Square,
  Clock,
  Sparkles,
  CheckSquare,
  Users,
  Settings,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { fetchApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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

export default function LiveMeetingPage() {
  const router = useRouter()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [transcript, setTranscript] = useState([])
  const [liveSummary, setLiveSummary] = useState('')
  const [actionItems, setActionItems] = useState([])
  const [isMeetingEnded, setIsMeetingEnded] = useState(false)
  const [isMeetingProcessed, setIsMeetingProcessed] = useState(false)
  const [liveMeetingId, setLiveMeetingId] = useState(null)
  
  const transcriptRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunkIndexRef = useRef(0)
  const timeElapsedRef = useRef(0)
  const recordingIntervalRef = useRef(null)
  const liveMeetingIdRef = useRef(null)
  const isMountedRef = useRef(false)

  // Check for existing meeting on mount
  useEffect(() => {
    if (isMountedRef.current) return
    isMountedRef.current = true

    const checkExistingMeeting = async () => {
      try {
        const data = await fetchApi('/api/live/start/')
        if (data.exists) {
          setLiveMeetingId(data.live_meeting_id)
          liveMeetingIdRef.current = data.live_meeting_id
          
          // Fetch full details to restore transcript and chunk index
          const details = await fetchApi(`/api/live/${data.live_meeting_id}/`)
          
          if (details.speaker_segments && details.speaker_segments.length > 0) {
              setTranscript(details.speaker_segments.map((s, i) => ({
                 id: s.id || Math.random(),
                 speaker: s.speaker,
                 timestamp: formatTime(s.start),
                 text: s.text
              })))
          } else if (details.chunks && details.chunks.length > 0) {
              setTranscript(details.chunks.map(c => ({
                 id: c.index,
                 speaker: 'Speaker',
                 timestamp: formatTime(c.timestamp),
                 text: c.text
              })))
          }

          if (details.chunk_count) {
            chunkIndexRef.current = details.chunk_count
          }

          if (data.status === 'active') {
            setIsRecording(true)
            setIsPaused(true) // Start as paused because we need user gesture to resume mic
          } else if (data.status === 'processing') {
            setIsMeetingEnded(true)
          }

          if (data.started_at) {
            const start = new Date(data.started_at).getTime()
            const end = data.ended_at ? new Date(data.ended_at).getTime() : new Date().getTime()
            const elapsed = Math.floor((end - start) / 1000)
            setElapsedTime(elapsed)
            timeElapsedRef.current = elapsed
          }
        }
      } catch (error) {
        console.error('Failed to check existing meeting:', error)
      }
    }
    checkExistingMeeting()
  }, [])

  // Timer effect
  useEffect(() => {
    let interval
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime((prev) => {
          timeElapsedRef.current = prev + 1
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording, isPaused])

  // Poll for updates from backend
  useEffect(() => {
    let interval
    // We should poll if we are recording OR if the meeting is ended but not yet fully processed
    const shouldPoll = liveMeetingId && ((isRecording && !isPaused) || (isMeetingEnded && !isMeetingProcessed));
    
    if (shouldPoll) {
      interval = setInterval(async () => {
        try {
          const data = await fetchApi(`/api/live/${liveMeetingId}/`)
          
          if (data.status === 'completed') {
             setIsMeetingProcessed(true)
          }
          
          // Use speaker_segments if available (post-processing), otherwise use chunks
          if (data.speaker_segments && data.speaker_segments.length > 0) {
             setTranscript(data.speaker_segments.map(s => ({
                id: s.id || Math.random(),
                speaker: s.speaker,
                timestamp: formatTime(s.start),
                text: s.text
             })))
          } else if (data.chunks && data.chunks.length > 0) {
             setTranscript(data.chunks.map(c => ({
                id: c.index,
                speaker: 'Speaker', // live chunks typically don't have speaker diarization immediately
                timestamp: formatTime(c.timestamp),
                text: c.text
             })))
          }
          
          if (data.summary_detailed || data.summary_short) {
             setLiveSummary(data.summary_detailed || data.summary_short)
          }
          
          if (data.action_items && Array.isArray(data.action_items)) {
             setActionItems(data.action_items)
          }
        } catch (error) {
          console.error('Failed to fetch live updates:', error)
        }
      }, 3000)
    }
    return () => {
        if (interval) clearInterval(interval)
    }
  }, [isRecording, isPaused, liveMeetingId, isMeetingEnded, isMeetingProcessed])

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript])

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartRecording = async (resumeId = null) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false
      })
      
      // Defensively stop any video tracks if they were somehow opened
      stream.getVideoTracks().forEach(track => track.stop());
      
      let meetingId = resumeId
      let isResuming = !!resumeId

      if (!meetingId) {
        try {
          const response = await fetchApi('/api/live/start/', {
            method: 'POST',
            body: JSON.stringify({ title: 'Live Meeting' })
          })
          meetingId = response.live_meeting_id
        } catch (apiErr) {
          // Parse "already in progress" 400 — extract the existing meeting ID and resume
          const match = String(apiErr.message).match(/\{.*\}/s)
          if (match) {
            try {
              const body = JSON.parse(match[0])
              if (body.live_meeting_id) {
                meetingId = body.live_meeting_id
                isResuming = true
                toast.info('Resuming your previous live session.')
              }
            } catch (_) { /* not JSON */ }
          }
          if (!meetingId) throw apiErr // re-throw if we couldn't recover
        }
      }
      
      setLiveMeetingId(meetingId)
      liveMeetingIdRef.current = meetingId
      
      const options = { mimeType: 'audio/webm' }
      const mr = new MediaRecorder(stream, options)
      
      mr.ondataavailable = async (e) => {
        if (e.data.size > 0 && liveMeetingIdRef.current) {
          const cIndex = chunkIndexRef.current
          chunkIndexRef.current += 1
          
          const formData = new FormData()
          formData.append('audio', new Blob([e.data], { type: 'audio/webm' }), 'chunk.webm')
          formData.append('chunk_index', cIndex)
          formData.append('timestamp', timeElapsedRef.current)
          
          try {
            await fetchApi(`/api/live/${liveMeetingIdRef.current}/upload-chunk/`, {
              method: 'POST',
              body: formData
            })
          } catch (err) {
            console.error('Failed to upload chunk:', err)
          }
        }
      }
      
      mr.start()
      mediaRecorderRef.current = mr
      streamRef.current = stream

      // Restart MediaRecorder every 3s so every chunk gets a full WebM header
      const interval = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.start()
        }
      }, 3000)
      recordingIntervalRef.current = interval

      setIsRecording(true)
      setIsPaused(false)
      // Only reset state for brand-new meetings
      if (!isResuming) {
        setElapsedTime(0)
        setTranscript([])
        setLiveSummary('')
        setActionItems([])
        setIsMeetingEnded(false)
        setIsMeetingProcessed(false)
        chunkIndexRef.current = 0
        timeElapsedRef.current = 0
      }

    } catch (err) {
      console.error("Could not start recording:", err)
      toast.error("Microphone permission denied or could not start recording.")
    }
  }

  const handleStopRecording = async () => {
    if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    
    setIsRecording(false)
    setIsPaused(false)
    setIsMeetingEnded(true)

    // Wait for the final chunk to finish uploading
    setTimeout(async () => {
      if (liveMeetingIdRef.current) {
        try {
          await fetchApi(`/api/live/${liveMeetingIdRef.current}/end/`, { 
              method: 'POST',
              body: JSON.stringify({ total_chunks: chunkIndexRef.current })
          })
        } catch (err) {
          console.error('Error ending meeting:', err)
        }
      }
    }, 2000)
  }

  const handleTogglePause = () => {
    if (isPaused) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume()
      }
      setIsPaused(false)
      // Resume the interval
      const interval = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.start()
        }
      }, 3000)
      recordingIntervalRef.current = interval
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause()
      }
      setIsPaused(true)
      // Clear interval when paused so it doesn't interrupt pause
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
    }
  }

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error enabling full-screen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  return (
    <div ref={containerRef} className={cn("space-y-6 flex flex-col min-h-full", isFullscreen && "bg-background p-6 overflow-y-auto")}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Live Meeting</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Record and transcribe meetings in real-time
          </p>
        </div>
        <div className="flex items-center self-end sm:self-auto gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.push('/settings')}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <Card>
        <CardContent className="flex flex-col md:flex-row items-stretch md:items-center justify-between p-4 gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4 w-full md:w-auto">
            {/* Recording indicator */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-3 w-3 rounded-full shrink-0',
                  isRecording && !isPaused
                    ? 'bg-red-500 animate-pulse-recording'
                    : isPaused
                    ? 'bg-amber-500'
                    : 'bg-muted'
                )}
              />
              <span className="font-medium text-sm sm:text-base whitespace-nowrap">
                {isRecording
                  ? isPaused
                    ? 'Paused'
                    : 'Recording'
                  : isMeetingEnded && !isMeetingProcessed
                  ? 'Processing AI...'
                  : 'Ready'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="font-mono text-sm sm:text-lg">{formatTime(elapsedTime)}</span>
              </div>

              {/* Participants indicator */}
              {(isRecording || isMeetingEnded) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="text-sm sm:text-base whitespace-nowrap hidden sm:inline">{new Set(transcript.map((t) => t.speaker)).size} detected</span>
                  <span className="text-sm sm:text-base whitespace-nowrap sm:hidden">{new Set(transcript.map((t) => t.speaker)).size} spkrs</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-row items-center gap-2 w-full md:w-auto">
            {!isRecording ? (
              <Button onClick={() => handleStartRecording()} className="gap-2 w-full">
                <Mic className="h-4 w-4 shrink-0" />
                Start Recording
              </Button>
            ) : (
              <>
                {(!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') ? (
                  <Button onClick={() => handleStartRecording(liveMeetingId)} className="gap-2 bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
                    <Mic className="h-4 w-4 shrink-0" />
                    Resume Session
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleTogglePause}
                    className="gap-2 flex-1"
                  >
                    {isPaused ? (
                      <>
                        <Mic className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Resume</span>
                      </>
                    ) : (
                      <>
                        <MicOff className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Pause</span>
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={handleStopRecording}
                  className="gap-2 flex-1"
                >
                  <Square className="h-4 w-4 shrink-0" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transcript Panel */}
        <div className="lg:col-span-2">
          <Card className="flex h-[55vh] min-h-[400px] sm:h-[600px] flex-col overflow-hidden p-0 gap-0">
            <CardHeader className="shrink-0 border-b px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className="text-base">Live Transcript</CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col p-0">
              {/* Audio waveform visualization */}
              {isRecording && !isPaused && (
                <div className="flex h-16 shrink-0 items-center justify-center gap-1 border-b bg-muted/30 px-4">
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      className="h-8 w-1 rounded-full bg-primary"
                      style={{
                        animation: `waveform 0.8s ease-in-out infinite`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Transcript content */}
              <div
                ref={transcriptRef}
                className="flex-1 overflow-y-auto p-4"
              >
                {transcript.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Mic className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {isRecording ? 'Listening...' : 'Ready to record'}
                    </h3>
                    <p className="max-w-sm text-muted-foreground">
                      {isRecording
                        ? 'Transcript will appear here as people speak'
                        : 'Click "Start Recording" to begin transcribing your meeting in real-time'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transcript.filter(item => item.text && item.text.trim()).map((item, i) => (
                      <div
                        key={item.id}
                        className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
                      >
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getSpeakerColor(item.speaker, i) }}
                        >
                          {item.speaker.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="mb-0.5 flex items-center gap-2">
                            <span className="text-sm font-semibold">{item.speaker}</span>
                            <span className="text-xs text-muted-foreground">
                              {item.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.text}</p>
                        </div>
                      </div>
                    ))}
                    {isRecording && !isPaused && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                        Listening...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Summary & Actions */}
        <div className="space-y-6">
          {/* Live Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                Live Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {liveSummary ? (
                <p className="text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-500">
                  {liveSummary}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isRecording || (isMeetingEnded && !isMeetingProcessed)
                    ? 'AI summary will appear as the conversation develops...'
                    : 'Start recording to generate a live summary'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckSquare className="h-4 w-4 text-primary" />
                Action Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {actionItems.length > 0 ? (
                <div className="space-y-3">
                  {actionItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border p-3 animate-in fade-in slide-in-from-right-2 duration-300"
                    >
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input" />
                      <div>
                        <p className="text-sm font-medium">{item.task || item.text}</p>
                        {(item.assigned_to || item.assignee) && (
                          <p className="text-xs text-muted-foreground">
                            Assigned to {item.assigned_to || item.assignee}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isRecording || (isMeetingEnded && !isMeetingProcessed)
                    ? 'Action items will appear as they are detected...'
                    : 'Start recording to detect action items'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Session Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">{transcript.length}</p>
                  <p className="text-xs text-muted-foreground">Segments</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">
                    {new Set(transcript.map((t) => t.speaker)).size}
                  </p>
                  <p className="text-xs text-muted-foreground">Speakers</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">
                    {transcript.reduce((acc, t) => acc + (t.text ? t.text.split(' ').length : 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Words</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold">{actionItems.length}</p>
                  <p className="text-xs text-muted-foreground">Actions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
