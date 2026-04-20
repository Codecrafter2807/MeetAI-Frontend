'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Calendar, 
  Target, 
  Map, 
  Zap, 
  ChevronRight, 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  Sparkles,
  TrendingUp,
  History,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react'
import { fetchApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function MeetingHubPage() {
  const router = useRouter()
  const [data, setData] = useState({ timeline: [], actions: [], preparation: [], topic_nodes: [] })
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    scheduled_at: '',
    time: ''
  })

  const loadHubData = async () => {
    try {
      const hub = await fetchApi('/api/meetings/hub/')
      setData(hub)
    } catch (error) {
      console.error('Failed to load hub data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTarget = async (id, e) => {
    if (e) e.stopPropagation()
    if (!confirm('Remove this strategic target?')) return
    
    try {
      await fetchApi('/api/meetings/hub/', {
        method: 'DELETE',
        body: JSON.stringify({ id })
      })
      toast.success('Target removed from roadmap')
      loadHubData()
    } catch (error) {
      toast.error('Failed to remove target')
    }
  }

  const handleEditTarget = (item, e) => {
    if (e) e.stopPropagation()
    setEditId(item.id)
    
    // Attempt to parse existing date/time if available (mock values usually have friendly strings)
    // Actually, it's better to just set defaults or show empty if we don't have the raw ISO stored in the item yet
    // For now, we'll let them re-fill or just prefill the title
    setFormData({
      title: item.title,
      scheduled_at: '', // Requires ISO date from backend for perfect pre-fill
      time: ''
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ title: '', scheduled_at: '', time: '' })
    setEditId(null)
    setIsDialogOpen(false)
  }

  useEffect(() => {
    loadHubData()
    document.title = 'Strategic Hub | MeetAI'
  }, [])


  const handleSaveTarget = async () => {
    if (!formData.title || !formData.scheduled_at || !formData.time) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setIsAdding(true)
      const scheduledDateTime = `${formData.scheduled_at}T${formData.time}:00`
      
      const method = editId ? 'PATCH' : 'POST'
      const payload = {
        title: formData.title,
        scheduled_at: scheduledDateTime
      }
      if (editId) payload.id = editId

      await fetchApi('/api/meetings/hub/', {
        method,
        body: JSON.stringify(payload)
      })

      toast.success(editId ? 'Strategic target updated' : 'Strategic target added')
      resetForm()
      loadHubData()
    } catch (error) {
      toast.error('Failed to save target')
    } finally {
      setIsAdding(false)
    }
  }

  const handleStartScheduled = async (id) => {
    try {
      setLoading(true)
      const res = await fetchApi('/api/live/start/', {
        method: 'POST',
        body: JSON.stringify({ existing_id: id })
      })
      toast.success('Activating strategic session...')
      router.push('/live')
    } catch (error) {
      toast.error(error.message || 'Failed to start session')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground font-medium">Analyzing Meeting Intelligence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editId ? 'Modify Strategic Target' : 'Link Upcoming Meeting'}</DialogTitle>
            <DialogDescription>
              {editId ? 'Update the details for this strategic roadmap item.' : 'Add a meeting to your roadmap so AI can prepare context and agendas.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Weekly Marketing Sync" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({...formData, scheduled_at: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input 
                  id="time" 
                  type="time" 
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSaveTarget} disabled={isAdding}>
              {isAdding ? "Saving..." : editId ? "Update Target" : "Add to Hub"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Strategic Insight Hub
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg mt-1 sm:mt-0">
            Preparation, Execution, and Post-Meeting Intelligence.
          </p>
        </div>
        <div className="flex w-full sm:w-auto shrink-0">
          <Button 
            className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 h-11 sm:h-10"
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
          >
            <Plus className="h-4 w-4" />
            Add Insight Target
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Preparation Radar */}
        <Card className="lg:col-span-2 border-primary/10 bg-gradient-to-br from-background to-accent/50">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-2 gap-3 sm:gap-0">
            <div className="space-y-0.5">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                Preparation Radar
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Strategic context for your upcoming sessions</CardDescription>
            </div>
            <Badge variant="secondary" className="w-fit px-2.5 py-1 sm:px-3 bg-primary/10 text-primary border-none shadow-sm">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
              <span className="text-[10px] sm:text-xs font-semibold">AI Prep Enabled</span>
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4 p-4 max-h-[550px] overflow-y-auto custom-scrollbar">
              {data.preparation.map((item, idx) => (
                <div key={idx} className="group relative flex flex-col gap-3 sm:gap-4 rounded-xl border bg-card/50 p-4 sm:p-5 hover:border-primary/30 transition-all cursor-pointer shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0">
                    <div className="flex items-start sm:items-center gap-3 w-full min-w-0">
                      <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base sm:text-lg truncate tracking-tight pr-8 sm:pr-0">{item.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-0.5 sm:mt-0">
                          <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{item.time}</span>
                          </p>
                          <Button 
                            size="sm" 
                            className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 w-fit shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartScheduled(item.id);
                            }}
                          >
                            <Zap className="h-3 w-3 shrink-0" />
                            Run Session
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={(e) => handleEditTarget(item, e)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDeleteTarget(item.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
                    <div className="flex items-start gap-2 text-sm">
                      {item.context.includes('history') || item.context.includes('mention') || item.context.includes('task') ? (
                        <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      ) : (
                        <Zap className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      )}
                      <p className="text-muted-foreground leading-relaxed italic">
                        {item.context}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2">Strategic Objectives</p>
                    {item.suggested_agenda.map((topic, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg bg-background/50 border border-border/40 p-3 hover:bg-background transition-colors group/item">
                        <div className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span className="text-sm font-medium leading-tight group-hover/item:text-primary transition-colors">
                          {topic}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Item Ledger */}
        <Card className="border-border/50">
          <CardHeader className="pb-3 border-b border-border/50 space-y-0.5">
            <CardTitle className="text-xl flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Strategic Tasks
            </CardTitle>
            <CardDescription>Pending items from all sources</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
              {data.actions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground italic">No pending tasks found.</div>
              ) : (
                data.actions.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors">
                    <div className={cn(
                      "mt-1.5 h-3 w-3 rounded-full shrink-0",
                      item.priority === 'high' ? 'bg-red-500' : item.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                    )} />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-tight">{item.task}</p>
                      <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground">
                        <span className="text-primary truncate max-w-[120px]">{item.meeting_title}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Strategic Roadmap */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Map className="h-6 w-6 text-primary" />
              Strategic Roadmap
            </h2>
          </div>
          
          <div className="relative space-y-4 pl-8 before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border/60">
            {data.timeline.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No recent decisions documented.</div>
            ) : (
              data.timeline.map((event, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -left-8 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border bg-background shadow-sm hover:border-primary transition-colors">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <Card className="border-primary/5 hover:border-primary/20 transition-all hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                             <h4 className="font-bold text-lg leading-none cursor-pointer hover:text-primary" onClick={() => router.push(`/meeting/${event.id}`)}>
                               {event.title}
                             </h4>
                             <Badge variant="outline" className="text-[10px] h-5 uppercase tracking-wider bg-transparent">
                                {event.type}
                             </Badge>
                          </div>
                          <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Decision Network */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 px-2">
            <Zap className="h-6 w-6 text-amber-500" />
            Decision Network
          </h2>
          <Card className="overflow-hidden border-border/50 sticky top-4">
            <CardContent className="p-6">
              <div className="flex flex-col gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Active Semantic Clusters</p>
                  <p className="text-xs text-muted-foreground">Topics driving decisions</p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {data.topic_nodes.map((node, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-2 rounded-lg border bg-card p-3 hover:bg-accent cursor-default transition-all shadow-sm"
                      style={{ flexGrow: node.weight }}
                    >
                      <span className="font-bold capitalize">{node.name}</span>
                      <Badge variant="secondary" className="px-1.5 h-5 text-[10px] bg-primary text-white border-none">
                        {node.weight}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
