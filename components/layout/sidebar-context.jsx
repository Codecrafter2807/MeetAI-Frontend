'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const SidebarContext = createContext()

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // On mobile, close sidebar by default
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => setIsOpen(!isOpen)
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen)
  const closeMobileSidebar = () => setIsMobileOpen(false)

  return (
    <SidebarContext.Provider 
      value={{ 
        isOpen, 
        toggleSidebar, 
        isMobileOpen, 
        toggleMobileSidebar, 
        closeMobileSidebar 
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
