import { TeamSettings } from '@/components/settings/TeamSettings'

export const metadata = {
  title: 'Team | MeetingAI',
  description: 'Manage your team workspaces and access levels',
}

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Workspace</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and team preferences
        </p>
      </div>
      <div className="my-6">
        <TeamSettings />
      </div>
    </div>
  )
}
