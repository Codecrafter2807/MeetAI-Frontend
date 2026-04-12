'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSidebar } from './sidebar-context'
import {
  LayoutDashboard,
  Mic,
  Calendar,
  Clock,
  Upload,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Monitor,
  X,
  Users,
  Target,
  Brain,
} from 'lucide-react'


const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'History', href: '/meetings', icon: Clock },
  { name: 'Strategic Hub', href: '/strategy', icon: Target },

  { name: 'Live Meeting', href: '/live', icon: Mic },

  { name: 'External Meeting', href: '/external', icon: Monitor },
  { name: 'AI Simulator', href: '/simulator', icon: Brain },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const { isOpen, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar()
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen border-r border-border bg-sidebar transition-all duration-300',
          // Mobile state: Hide completely when closed, otherwise 64 width
          isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop state
          !isMobileOpen && (isOpen ? 'lg:w-64' : 'lg:w-[72px]'),
          !isMobileOpen && 'w-0 lg:w-auto overflow-hidden lg:overflow-visible'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <Link href="/" className="flex items-center gap-2" onClick={closeMobileSidebar}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              {(isOpen || isMobileOpen) && (
                <span className="text-lg font-semibold text-sidebar-foreground">
                  MeetingAI
                </span>
              )}
            </Link>
            <button 
              onClick={closeMobileSidebar}
              className="rounded-lg p-1.5 hover:bg-sidebar-accent lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileSidebar}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
                  {(isOpen || isMobileOpen) && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Collapse toggle (Desktop only) */}
          <div className="hidden lg:block border-t border-sidebar-border p-3">
            <button
              onClick={toggleSidebar}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              {!isOpen ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
