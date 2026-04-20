import { InfoPageContainer } from '@/components/layout/InfoPageContainer'

export default function CommunityPage() {
  return (
    <InfoPageContainer 
      title="Community" 
      subtitle="The MeetAI global community hub is currently under development."
    >
      <div className="py-20 text-center flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-8">
              <span className="text-4xl animate-bounce">🚧</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed">
            We are building a space for productive teams to share workflows, templates, and insights. 
            Stay tuned for our official forum and community workspace launches coming in late 2026.
          </p>
          
          <div className="mt-12 flex gap-4">
              <button className="px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors font-semibold">
                  Follow on Twitter
              </button>
              <button className="px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors font-semibold">
                  Join Beta Newsletter
              </button>
          </div>
      </div>
    </InfoPageContainer>
  )
}
