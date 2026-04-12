'use client'

import { AppShell } from '@/components/layout/app-shell'
import { WorkspaceChatWidget } from '@/components/WorkspaceChatWidget'

export default function AppLayout({ children }) {
  return (
    <AppShell>
      {children}
      <WorkspaceChatWidget />
    </AppShell>
  )
}
