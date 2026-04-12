'use client'
import { toast } from 'sonner'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, 
  MicOff, 
  Square, 
  Loader2, 
  Send, 
  ChevronLeft,
  Volume2,
  Brain,
  MessageSquare,
  Sparkles,
  Trophy
} from 'lucide-react'
import { fetchApi } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function SimulatorRoomPage() {
  const router = useRouter()
  const { sessionId } = useParams()
  
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('idle') // idle, recording, processing, ai_speaking, completed
  const [isLoading, setIsLoading] = useState(true)
  const [isFinishing, setIsFinishing] = useState(false)
  
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const chatEndRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const [volume, setVolume] = useState(0)

  useEffect(() => {
    async function initSession() {
      try {
        // In a real app we might fetch existing messages, but here we assume a fresh session
        // or we could add a SimulatorDetail view
        const scenarioData = localStorage.getItem(`sim_session_${sessionId}`)
        if (scenarioData) {
          setSession(JSON.parse(scenarioData))
        } else {
          // Fallback if refresh
          const scenarios = await fetchApi('/api/simulator/scenarios/')
          // This is a bit hacky - we'd ideally have a GetSession endpoint
          setSession({ id: sessionId, ai_role: 'AI Mentor' })
        }
      } catch (error) {
        console.error("Failed to init session", error)
      } finally {
        setIsLoading(false)
      }
    }
    initSession()
  }, [sessionId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Setup audio visualizer
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 256
      analyserRef.current = analyser
      audioContextRef.current = audioContext

      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      audioChunksRef.current = []

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mr.onstop = handleAudioStop
      mr.start()
      setStatus('recording')

      // Visualizer loop
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      const updateVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setVolume(average)
          if (mediaRecorderRef.current?.state === 'recording') {
            requestAnimationFrame(updateVolume)
          }
        }
      }
      updateVolume()

    } catch (err) {
      console.error("Mic access denied", err)
      toast.error("Please allow microphone access to use the simulator.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }

  const handleAudioStop = async () => {
    setStatus('processing')
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
    
    const formData = new FormData()
    formData.append('audio', audioBlob, 'turn.webm')

    try {
      const data = await fetchApi(`/api/simulator/${sessionId}/turn/`, {
        method: 'POST',
        body: formData
      })

      // Add user turn
      setMessages(prev => [...prev, { role: 'user', content: data.user_text }])
      
      // AI Thinking delay simulation
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', content: data.ai_response }])
        speakText(data.ai_response)
      }, 500)

    } catch (error) {
      console.error("Turn failed", error)
      setStatus('idle')
    }
  }

  const speakText = (text) => {
    if (!window.speechSynthesis) {
      setStatus('idle')
      return
    }

    setStatus('ai_speaking')
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Find a nice voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0]
    if (preferredVoice) utterance.voice = preferredVoice
    
    utterance.rate = 1.0
    utterance.pitch = 1.0
    
    utterance.onend = () => setStatus('idle')
    utterance.onerror = () => setStatus('idle')
    
    window.speechSynthesis.speak(utterance)
  }

  const handleFinish = async () => {
    setIsFinishing(true)
    try {
      await fetchApi(`/api/simulator/${sessionId}/feedback/`, { method: 'POST' })
      router.push(`/simulator/feedback/${sessionId}`)
    } catch (error) {
      console.error("Finish failed", error)
      setIsFinishing(false)
    }
  }

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col gap-4 max-w-5xl mx-auto px-4">
      {/* Simulation Header */}
      <div className="flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-20 py-2 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/simulator')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-bold text-lg leading-none">{session?.scenario_name || 'AI Simulator'}</h2>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Against: {session?.ai_role}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50"
          onClick={handleFinish}
          disabled={isFinishing || messages.length < 2}
        >
          {isFinishing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trophy className="h-4 w-4 mr-2" />}
          Finish & Get Feedback
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pt-4 px-2 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-60">
            <div className="p-6 rounded-full bg-primary/5 ring-1 ring-primary/10">
              <Brain className="h-12 w-12 text-primary" />
            </div>
            <div className="max-w-sm">
              <h3 className="text-xl font-bold">The Stage is Set</h3>
              <p className="text-sm mt-2 leading-relaxed">
                Take a deep breath. When you're ready, hold the microphone button to start your first turn.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={cn(
              "flex w-full mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
               "max-w-[85%] rounded-2xl px-5 py-3 shadow-sm",
               msg.role === 'user' 
                ? "bg-primary text-primary-foreground rounded-tr-none" 
                : "bg-white dark:bg-slate-900 border border-border rounded-tl-none"
            )}>
              <div className="flex items-center gap-2 mb-1">
                {msg.role === 'ai' && <Sparkles className="h-3 w-3 text-primary" />}
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                  {msg.role === 'user' ? 'You' : session?.ai_role}
                </span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text_content}</p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Control Panel */}
      <div className="bg-card border-t p-6 rounded-t-3xl shadow-2xl relative overflow-hidden">
        {/* Simple Audio Wave effect when recording */}
        {status === 'recording' && (
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-75"
              style={{ width: `${Math.min(100, volume * 3)}%` }}
            />
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 w-full justify-center">
            {status === 'idle' && (
              <Button 
                size="lg" 
                className="h-20 w-20 rounded-full shadow-xl shadow-primary/20 scale-110"
                onClick={startRecording}
              >
                <Mic className="h-8 w-8" />
              </Button>
            )}
            
            {status === 'recording' && (
              <Button 
                size="lg" 
                variant="destructive"
                className="h-20 w-20 rounded-full shadow-xl shadow-red-500/20 animate-pulse"
                onClick={stopRecording}
              >
                <Square className="h-8 w-8" />
              </Button>
            )}

            {(status === 'processing' || status === 'ai_speaking') && (
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-bold tracking-tight">
              {status === 'idle' && "Hold to Speak"}
              {status === 'recording' && "I'm listening..."}
              {status === 'processing' && "Transcribing turn..."}
              {status === 'ai_speaking' && `${session?.ai_role} is responding...`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {status === 'idle' && "Click to start your turn"}
              {status === 'recording' && "Release whenever you're finished"}
              {status === 'ai_speaking' && "Volume auto-adjusted for TTS"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
