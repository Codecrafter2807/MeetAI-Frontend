'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, X, Bot, User, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { fetchApi } from '@/lib/api'

export function ChatBotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am **MeetAI**, your strategic meeting assistant. I can now help you with **Team Workspaces**, the **Strategic Insight Hub**, the **AI Simulator**, account security (Single Session, Password Reset), and **Dual-Audio External Meetings**. How can I help you today?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetchApi('/api/chatbot/chat/', {
        method: 'POST',
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      })

      if (response && response.response) {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.response }])
      } else {
        throw new Error('Invalid response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I am having trouble connecting to my brain right now. Please try again later.' }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Simple Markdown-ish formatter for bold and bullets
  const formatContent = (text) => {
    return text.split('\n').map((line, i) => {
      // Bold
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullets
      if (formattedLine.trim().startsWith('- ')) {
          return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: formattedLine.replace('- ', '') }} />
      }
      return <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div 
          className={cn(
            "mb-4 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5",
            "sm:w-[400px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-primary p-4 text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white/20 p-1.5 backdrop-blur-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold tracking-tight">MeetAI</h3>
                <div className="flex items-center gap-1.5 text-[10px] opacity-90">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Always Active
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 hover:bg-white/10 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden bg-muted/5">
            <ScrollArea className="h-full p-4" viewportRef={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex gap-3 animate-in fade-in duration-300",
                      msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm",
                      msg.role === 'assistant' ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {msg.role === 'assistant' ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all",
                      msg.role === 'assistant' 
                        ? "rounded-tl-none bg-card border" 
                        : "rounded-tr-none bg-primary text-primary-foreground"
                    )}>
                      {formatContent(msg.content)}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-primary text-primary-foreground shadow-sm animate-pulse">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl border bg-card px-4 py-2 text-sm text-yellow-500 shadow-sm italic">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      MeetAI is thinking...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="border-t p-4 bg-background">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <Input 
                placeholder="Ask MeetAI anything..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 focus-visible:ring-primary"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || isLoading}
                className="shrink-0 transition-transform active:scale-95 shadow-md"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Powered by MeetAI Smart Engine
            </p>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl transition-all duration-500 transform",
          isOpen ? "rotate-90 bg-muted text-muted-foreground hover:bg-muted/80" : "bg-primary hover:scale-110 shadow-primary/30"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </Button>
    </div>
  )
}
