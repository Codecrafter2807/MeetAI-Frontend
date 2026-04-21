'use client'

import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md transition-all">
      <div className="relative flex flex-col items-center gap-4">
        {/* Logo Container with Pulse */}
        <div className="relative h-24 w-60 animate-pulse overflow-hidden">
          <img src="/logo.png" alt="MeetAI" className="h-full w-full object-contain dark:hidden" />
          <img src="/logo_d.png" alt="MeetAI" className="hidden h-full w-full object-contain dark:block" />
        </div>
        
        {/* Spinner and Text */}
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium tracking-widest uppercase">Loading Experience...</span>
        </div>
        
        {/* Decorative background glow */}
        <div className="absolute -z-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      </div>
    </div>
  )
}
