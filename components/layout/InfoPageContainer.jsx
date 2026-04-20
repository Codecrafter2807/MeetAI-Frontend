'use client'

import Link from 'next/link'
import { ChevronRight, Home, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function InfoPageContainer({ 
  title, 
  subtitle, 
  children, 
  breadcrumb = [], 
  className 
}) {
  return (
    <div className="min-h-screen bg-background isolate">
      {/* Background Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-30">
          <div className="h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-[100px] animate-pulse" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 opacity-30">
          <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-primary/20 to-blue-400/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumbs */}
        <nav className="mb-12 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4 opacity-50" />
          {breadcrumb.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.name}
              </Link>
              {index < breadcrumb.length - 1 && <ChevronRight className="h-4 w-4 opacity-50" />}
            </div>
          ))}
          {breadcrumb.length > 0 && <ChevronRight className="h-4 w-4 opacity-50" />}
          <span className="text-foreground font-medium">{title}</span>
        </nav>

        {/* Header */}
        <div className="mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 backdrop-blur-md">
            <Sparkles className="h-3 w-3" />
            Official Resource
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content Area */}
        <div className={cn(
          "prose prose-blue dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground",
          className
        )}>
          {children}
        </div>
        
        {/* Footer Polish */}
        <div className="mt-32 pt-12 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <Link href="/help" className="text-xs font-semibold text-primary hover:underline">
                    Still need help? Contact Support
                </Link>
            </div>
        </div>
      </div>
    </div>
  )
}
