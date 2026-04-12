'use client'

import { Sidebar } from './sidebar'
import { Navbar } from './navbar'
import { SidebarProvider, useSidebar } from './sidebar-context'
import { cn } from '@/lib/utils'

import { Footer } from './footer'

function AppShellContent({ children }) {
  const { isOpen } = useSidebar()
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div 
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col",
          isOpen ? "lg:pl-64" : "lg:pl-[72px]"
        )}
      >
        <Navbar />
        <main className="flex-1 p-4 md:p-6 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}

export function AppShell({ children }) {
  return (
    <SidebarProvider>
      <AppShellContent>{children}</AppShellContent>
    </SidebarProvider>
  )
}
