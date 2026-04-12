'use client'
import { toast } from 'sonner'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Monitor,
  MicOff,
  Square,
  Clock,
  Sparkles,
  CheckSquare,
  Users,
  Settings,
  Maximize2,
  ExternalLink,
  Info,
} from 'lucide-react'
import { fetchApi } from '@/lib/api'
import { cn } from '@/lib/utils'

const SPEAKER_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
]

function getSpeakerColor(speakerName, index) {
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length]
}

export default function ExternalMeetingPage() {
  const [status, setStatus] = useState('idle') // idle, ready, recording, processing, completed
  const [elapsedTime, setElapsedTime] = useState(0)
  const [transcript, setTranscript] = useState([])
  const [liveSummary, setLiveSummary] = useState('')
  const [actionItems, setActionItems] = useState([])
  const [liveMeetingId, setLiveMeetingId] = useState(null)
  const [meetingUrl, setMeetingUrl] = useState('')
  
  const transcriptRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunkIndexRef = useRef(0)
  const timeElapsedRef = useRef(0)
  const recordingIntervalRef = useRef(null)
  const videoRef = useRef(null)
  const micStreamRef = useRef(null)
  const audioContextRef = useRef(null)

  // Timer effect
  useEffect(() => {
    let interval
    if (status === 'recording') {
      interval = setInterval(() => {
        setElapsedTime((prev) => {
          timeElapsedRef.current = prev + 1
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [status])

  // Check for existing meeting on mount
  useEffect(() => {
    const checkExistingMeeting = async () => {
      try {
        const data = await fetchApi('/api/live/start/')
        if (data.exists) {
          setLiveMeetingId(data.live_meeting_id)
          
          if (data.status === 'active' || data.status === 'processing') {
            setStatus(data.status === 'active' ? 'recording' : 'processing')
            // Fetch current transcript if restoring
            const details = await fetchApi(`/api/live/${data.live_meeting_id}/`)
            if (details.chunks && details.chunks.length > 0) {
               setTranscript(details.chunks.map(c => ({
                  id: c.index,
                  speaker: 'Speaker',
                  timestamp: formatTime(c.timestamp),
                  text: c.text
               })))
            }
          }
        }
      } catch (error) {
        console.error('Failed to check existing meeting:', error)
      }
    }
    checkExistingMeeting()
  }, [])

  // Poll for updates from backend
  useEffect(() => {
    let interval
    const shouldPoll = liveMeetingId && (status === 'recording' || status === 'processing');
    
    if (shouldPoll) {
      interval = setInterval(async () => {
        try {
          const data = await fetchApi(`/api/live/${liveMeetingId}/`)
          
          if (data.status === 'completed') {
             setStatus('completed')
          }
          
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
                speaker: 'Speaker',
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
  }, [status, liveMeetingId])

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

  const handleOpenUrl = () => {
    if (meetingUrl) {
      const url = meetingUrl.trim();
      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(finalUrl, '_blank');
    }
  }

  const handleConnectTab = async () => {
    try {
      // Step 1: Get Microphone access (optional but recommended)
      let micStream = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: false 
        });
        // Defensively stop any video tracks if they were somehow opened
        micStream.getVideoTracks().forEach(track => track.stop());
        micStreamRef.current = micStream;
      } catch (micErr) {
        console.warn("Microphone access denied or not available. Recording will only include tab audio.", micErr);
      }

      // Step 2: Get display media (requires user selection)
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true 
      });

      // Check if audio track exists in the tab capture
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0 && !micStream) {
        stream.getTracks().forEach(t => t.stop());
        toast.error("No audio detected from tab and microphone access denied. Please make sure to check 'Share tab audio' in the selection box.");
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Listen for ending from the browser bar
      stream.getVideoTracks()[0].onended = () => {
        if (status === 'recording') {
            handleStopRecording();
        } else {
            handleReset();
        }
      };

      setStatus('ready');
    } catch (err) {
      console.error("Could not capture tab:", err)
    }
  }

  const handleStartRecording = async () => {
    if (!streamRef.current) return;

    try {
      const response = await fetchApi('/api/live/start/', {
        method: 'POST',
        body: JSON.stringify({ 
          title: 'External Meeting',
          meeting_url: meetingUrl.trim()
        })
      })
      
      const meetingId = response.live_meeting_id
      setLiveMeetingId(meetingId)
      
      const options = { mimeType: 'audio/webm' }
      
      // MIXING AUDIO: Tab Audio + Microphone Audio
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      audioContextRef.current = audioContext
      
      const dest = audioContext.createMediaStreamDestination()
      
      // Add Tab Audio Source
      const tabAudioTracks = streamRef.current.getAudioTracks()
      if (tabAudioTracks.length > 0) {
        const tabSource = audioContext.createMediaStreamSource(new MediaStream(tabAudioTracks))
        tabSource.connect(dest)
      }
      
      // Add Microphone Audio Source
      if (micStreamRef.current) {
        const micSource = audioContext.createMediaStreamSource(micStreamRef.current)
        micSource.connect(dest)
      }
      
      const mixedStream = dest.stream
      const mr = new MediaRecorder(mixedStream, options)
      
      mr.ondataavailable = async (e) => {
        if (e.data.size > 0 && meetingId) {
          const cIndex = chunkIndexRef.current
          chunkIndexRef.current += 1
          
          const formData = new FormData()
          formData.append('audio', new Blob([e.data], { type: 'audio/webm' }), 'chunk.webm')
          formData.append('chunk_index', cIndex)
          formData.append('timestamp', timeElapsedRef.current)
          
          try {
            await fetchApi(`/api/live/${meetingId}/upload-chunk/`, {
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

      const interval = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.start()
        }
      }, 3000)
      recordingIntervalRef.current = interval

      setStatus('recording')
      setElapsedTime(0)
      setTranscript([])
      setLiveSummary('')
      setActionItems([])
      chunkIndexRef.current = 0
      timeElapsedRef.current = 0

    } catch (err) {
      console.error("Could not start recording:", err)
      if (err.message && err.message.includes('already have a live meeting')) {
        toast.info("You already have a session in progress. Reconnecting to your active meeting...")
        window.location.reload() // Force a reload to trigger the mount check and reconnect
      } else {
        toast.error("Could not start session. Please ensure your microphone is enabled.")
      }
    }

  }

  const handleStopRecording = async () => {
    if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    // Explicitly stop all tracks to close the browser sharing prompt
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks()
      tracks.forEach((track) => {
        track.stop()
        track.enabled = false
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop())
      micStreamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    setStatus('processing')

    // Wait for final chunk
    setTimeout(async () => {
      if (liveMeetingId) {
        try {
          await fetchApi(`/api/live/${liveMeetingId}/end/`, { 
              method: 'POST',
              body: JSON.stringify({ total_chunks: chunkIndexRef.current })
          })
        } catch (err) {
          console.error('Error ending meeting:', err)
        }
      }
    }, 2000)
  }

  const handleReset = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    setStatus('idle');
    setLiveMeetingId(null);
    setTranscript([]);
    setElapsedTime(0);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">External Meeting</h1>
          <p className="text-muted-foreground">
            Capture audio from Zoom, Google Meet, or any browser tab
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Setup Step Card */}
      {status === 'idle' && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Info className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Setup meeting capture</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To capture audio from another meeting, follow these steps:
                </p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>Open your meeting in another browser tab (or use the link below).</li>
                  <li>Click <strong>"Connect to Meeting Tab"</strong> and allow <strong>Microphone</strong> access.</li>
                  <li>Select the meeting tab and check the <strong>"Share tab audio"</strong> checkbox.</li>
                  <li><strong>Tip:</strong> Use headphones to prevent echo in the recording.</li>
                </ol>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <div className="flex-1 max-w-sm">
                    <Input 
                      placeholder="Paste Zoom/Google Meet link..." 
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <Button variant="outline" onClick={handleOpenUrl} disabled={!meetingUrl} className="shrink-0">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Meeting
                  </Button>
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col gap-3">
                <Button onClick={handleConnectTab} size="lg" className="h-24 w-64 text-lg shadow-lg hover:shadow-primary/20 transition-all">
                  <Monitor className="h-8 w-8 mr-3" />
                  Connect to Tab
                </Button>
                <p className="text-[10px] text-center text-muted-foreground max-w-[256px]">
                  * Required: Select the meeting tab and check <b>"Share tab audio"</b> in the browser popup.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ready / Active Status Bar */}
      {status !== 'idle' && (
        <Card className={cn(status === 'recording' && "border-red-500/50 bg-red-500/5")}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-6">
              {/* Recording indicator */}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-3 w-3 rounded-full',
                    status === 'recording'
                      ? 'bg-red-500 animate-pulse-recording'
                      : status === 'ready'
                      ? 'bg-amber-500'
                      : 'bg-muted'
                  )}
                />
                <span className="font-semibold capitalize">
                  {status === 'ready' ? 'Ready to transcribe' : status}
                </span>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
              </div>

              {/* Participants indicator */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{new Set(transcript.map((t) => t.speaker)).size} detected</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {status === 'ready' && (
                <Button onClick={handleStartRecording} className="bg-primary hover:bg-primary/90 px-8">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Transcription
                </Button>
              )}
              {status === 'recording' && (
                <Button
                  variant="destructive"
                  onClick={handleStopRecording}
                  className="px-8"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop & Save
                </Button>
              )}
              {(status === 'ready' || status === 'completed') && (
                <Button variant="ghost" onClick={handleReset}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Section (Only during Setup/Early Recording) */}
      {status === 'ready' && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30 py-2 border-b">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Monitor className="h-3 w-3" />
              Tab Capture Preview (Muted)
            </p>
          </CardHeader>
          <CardContent className="p-0 flex justify-center bg-black aspect-video max-h-[300px]">
            <video ref={videoRef} autoPlay muted playsInline className="h-full object-contain" />
          </CardContent>
        </Card>
      )}

      {/* Main content - Visible when recording or processing */}
      {(status === 'recording' || status === 'processing' || status === 'completed') && (
        <div className="grid gap-6 lg:grid-cols-3 animate-in fade-in duration-500">
          <div className="lg:col-span-2">
            <Card className="flex h-[600px] flex-col overflow-hidden p-0 gap-0">
              <CardHeader className="shrink-0 border-b px-6 py-4">
                <CardTitle className="text-base">Live Transcript</CardTitle>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                <div
                  ref={transcriptRef}
                  className="flex-1 overflow-y-auto p-4"
                >
                  {transcript.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <Sparkles className="h-8 w-8 text-muted-foreground animate-pulse" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">
                        Optimizing AI Engine
                      </h3>
                      <p className="max-w-sm text-muted-foreground">
                        Listening to the meeting tab... Transcript will appear shortly.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transcript.map((item, i) => (
                        <div
                          key={item.id || i}
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
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Live Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {liveSummary ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {liveSummary}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    AI summary will be generated as more data is processed...
                  </p>
                )}
              </CardContent>
            </Card>

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
                        className="flex items-start gap-3 rounded-lg border p-3 bg-muted/20"
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
                  <p className="text-sm text-muted-foreground italic">
                    Detecting action items...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
