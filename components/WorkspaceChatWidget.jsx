'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Users,
  Send,
  Paperclip,
  X,
  File as FileIcon,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { fetchApi } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function WorkspaceChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [workspace, setWorkspace] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [attachment, setAttachment] = useState(null)
  const [currentUserEmail, setCurrentUserEmail] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  
  const fileInputRef = useRef(null)
  const chatScrollRef = useRef(null)
  const prevMsgCountRef = useRef(0)

  const loadChat = async (wsSlug) => {
    try {
      const chatData = await fetchApi(`/api/workspaces/${wsSlug}/chat/`)
      setMessages(chatData)
      
      // Calculate unread if closed
      if (!isOpen) {
        if (prevMsgCountRef.current > 0 && chatData.length > prevMsgCountRef.current) {
          setUnreadCount(prev => prev + (chatData.length - prevMsgCountRef.current))
        }
      } else {
        setUnreadCount(0)
      }
      prevMsgCountRef.current = chatData.length
    } catch {
      console.error("Failed to load chat")
    }
  }

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setCurrentUserEmail(JSON.parse(userStr).email)
    }

    const loadWorkspaceAndChat = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const savedSlug = localStorage.getItem('activeWorkspaceSlug')
        const workspaces = await fetchApi('/api/workspaces/')
        if (workspaces && workspaces.length > 0) {
          const ws = workspaces.find(w => w.slug === savedSlug) || workspaces[0]
          if (ws) {
            setWorkspace(ws)
            // If we found a workspace but no slug was saved, save it
            if (!savedSlug) {
              localStorage.setItem('activeWorkspaceSlug', ws.slug)
            }
            await loadChat(ws.slug)
          }
        } else {
          setWorkspace(null)
        }
      } catch (e) {
        console.error(e)
      }
    }

    // Initial load
    loadWorkspaceAndChat()

    // Setup polling
    const interval = setInterval(() => {
      const token = localStorage.getItem('token')
      if (!token) return

      const savedSlug = localStorage.getItem('activeWorkspaceSlug')
      
      // If we don't have a workspace yet, or the slug changed, reload everything
      if (!workspace || (workspace && savedSlug && workspace.slug !== savedSlug)) {
        loadWorkspaceAndChat()
      } else if (savedSlug) {
        loadChat(savedSlug)
      }
    }, 5000)

    // Listen for storage changes or custom events
    const handleWorkspaceChange = () => {
      loadWorkspaceAndChat()
    }
    
    window.addEventListener('storage', (e) => {
      if (e.key === 'activeWorkspaceSlug') handleWorkspaceChange()
    })
    window.addEventListener('workspaceChanged', handleWorkspaceChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleWorkspaceChange)
      window.removeEventListener('workspaceChanged', handleWorkspaceChange)
    }
  }, [isOpen, workspace?.slug])

  useEffect(() => {
    if (isOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setUnreadCount(0)
    }
  }

  const sendMessage = async (e) => {
    e?.preventDefault()
    if ((!newMessage.trim() && !attachment) || !workspace) return
    setChatLoading(true)
    try {
      const formData = new FormData()
      if (newMessage.trim()) formData.append('content', newMessage.trim())
      if (attachment) formData.append('file', attachment)
      
      const response = await fetchApi(`/api/workspaces/${workspace.slug}/chat/`, {
        method: 'POST',
        body: formData
      })
      const newMessages = [...messages, response]
      setMessages(newMessages)
      prevMsgCountRef.current = newMessages.length
      setNewMessage('')
      setAttachment(null)
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setChatLoading(false)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0])
    }
  }

  if (!workspace) return null;

  return (
    <div className="fixed bottom-[5rem] right-4 sm:bottom-6 sm:right-24 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="flex flex-col mb-3 sm:mb-4 overflow-hidden border bg-background shadow-2xl h-[60vh] max-h-[420px] sm:max-h-none sm:h-[550px] w-[calc(100vw-2rem)] sm:w-[400px] rounded-2xl relative animate-in slide-in-from-bottom-5 fade-in duration-300">
          <CardHeader className="border-b bg-muted/30 pb-3 pt-4 px-5 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Workspace Chat</CardTitle>
                <CardDescription className="text-xs truncate max-w-[180px]">{workspace.name}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs text-muted-foreground font-normal">
                {messages.length} msgs
              </Badge>
              <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8 rounded-full">
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col min-h-0 bg-secondary/5">
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-5 flex flex-col"
              ref={chatScrollRef}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground/50">
                  <MessageSquare className="h-12 w-12 mb-3 stroke-1" />
                  <p className="text-sm font-medium">Start the conversation</p>
                  <p className="text-xs mt-1 text-center">Messages and files will appear here</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender?.email === currentUserEmail;
                  const showAvatar = i === 0 || messages[i - 1].sender?.email !== msg.sender?.email;
                  
                  return (
                    <div key={msg.id || i} className={cn("flex items-end gap-2 max-w-[85%]", isMe ? "self-end flex-row-reverse" : "self-start")}>
                      {showAvatar ? (
                        <Avatar className="h-7 w-7 mb-1 shrink-0 border border-border shadow-sm">
                          <AvatarImage src={msg.sender?.avatar_url} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {msg.sender?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-7 shrink-0" />
                      )}
                      
                      <div className={cn("flex flex-col", isMe ? "items-end" : "items-start", "min-w-0")}>
                        {showAvatar && (
                          <div className="flex items-baseline gap-2 mb-1 px-1">
                            <span className="text-[11px] font-semibold text-foreground/80 truncate max-w-[120px]">{isMe ? 'You' : msg.sender?.full_name}</span>
                            <span className="text-[9px] text-muted-foreground whitespace-nowrap">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        )}
                        
                        <div className={cn(
                          "rounded-2xl px-3.5 py-2 shadow-sm text-sm whitespace-pre-wrap leading-snug break-words",
                          isMe 
                            ? "bg-primary text-primary-foreground rounded-tr-sm" 
                            : "bg-background border rounded-tl-sm text-foreground",
                          "w-full overflow-hidden"
                        )}>
                          {msg.content}
                          
                          {msg.file_url && (
                            <div className={cn("mt-2 p-1.5 rounded-lg border flex items-center gap-1.5", isMe ? "bg-primary-foreground/10 border-primary-foreground/20" : "bg-muted/50")}>
                              <div className={cn("p-1 rounded-md shrink-0", isMe ? "bg-primary-foreground/10" : "bg-background shadow-sm")}>
                                <FileIcon className={cn("h-3.5 w-3.5", isMe ? "text-primary-foreground" : "text-primary")} />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <a 
                                  href={msg.file_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[11px] font-medium hover:underline truncate"
                                    title={msg.file_url.split('/').pop()}
                                >
                                  {msg.file_url.split('/').pop() || 'Attachment'}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="p-3 bg-background border-t rounded-b-2xl">
              {attachment && (
                <div className="mb-2 flex items-center gap-2 bg-muted/50 w-fit pl-3 pr-2 py-1 rounded-full border">
                  <FileIcon className="h-3 w-3 text-primary" />
                  <span className="text-[11px] text-muted-foreground text-ellipsis max-w-[150px] whitespace-nowrap overflow-hidden">
                    {attachment.name}
                  </span>
                  <button 
                    onClick={() => setAttachment(null)}
                    className="p-1 hover:bg-background rounded-full transition-colors"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              )}
              <div className="flex gap-2 items-end">
                <div className="flex-1 flex gap-1 items-center bg-muted/40 border focus-within:ring-1 focus-within:ring-primary/40 focus-within:border-primary/40 rounded-xl px-2 py-1 transition-all">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors hover:bg-background rounded-lg shrink-0"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <textarea
                    placeholder="Message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { 
                      if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      } 
                    }}
                    className="bg-transparent border-none flex-1 focus-visible:ring-0 shadow-none resize-none py-1.5 text-sm outline-none px-1"
                    rows={1}
                    style={{ minHeight: '32px', maxHeight: '100px' }}
                  />
                </div>
                <Button 
                  onClick={sendMessage} 
                  disabled={chatLoading || (!newMessage.trim() && !attachment)} 
                  className="shrink-0 rounded-xl h-10 w-10 shadow-md hover:shadow-lg transition-all active:scale-95 p-0 flex items-center justify-center"
                >
                  {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 translate-x-0.5" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className="relative flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 bg-emerald-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:scale-95 ring-4 ring-emerald-500/20"
      >
        <Users className="h-5 w-5 sm:h-6 sm:w-6" />
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background animate-in zoom-in-50">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}
