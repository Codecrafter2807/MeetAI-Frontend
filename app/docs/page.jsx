import { InfoPageContainer } from '@/components/layout/InfoPageContainer'
import { Card } from '@/components/ui/card'
import { Mic, Zap, BarChart3, Target, Brain, Users } from 'lucide-react'

const documentationSections = [
  {
    title: 'Getting Started',
    icon: Mic,
    content: 'Learn how to capture your first meeting. Whether you are using our browser-based live capture or uploading an existing file, we make it seamless to get your audio into MeetAI.'
  },
  {
    title: 'Strategic Hub',
    icon: Target,
    content: 'Maximize your preparation for upcoming high-stakes meetings. Set insight targets and let AI analyze your history to give you the competitive edge.'
  },
  {
    title: 'AI Insights & Analytics',
    icon: BarChart3,
    content: 'Dive deep into your team performance. Understand talk-to-listen ratios, sentiment trends, and track action items across multiple projects.'
  },
  {
    title: 'AI Simulator',
    icon: Brain,
    content: 'Practice your pitches and negotiations. Our AI simulator provides a safe environment to rehearse and receive real-time feedback on your performance.'
  }
]

export default function DocumentationPage() {
  return (
    <InfoPageContainer 
      title="Documentation" 
      subtitle="Master the tools and workflows that power the next generation of productive teams."
    >
      <section className="mb-16">
        <h2>System Overview</h2>
        <p>
          MeetAI is a comprehensive intelligence platform designed to transform raw meeting data into structured, actionable business value. Our ecosystem consists of several core components that work together to ensure you never miss a detail.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2 mt-12 not-prose">
          {documentationSections.map((section, index) => (
            <Card key={index} className="p-6 border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 transition-all group-hover:scale-110">
                <section.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{section.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{section.content}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2>Recording Best Practices</h2>
        <p>To ensure 99%+ transcription accuracy, we recommend the following:</p>
        <ul>
          <li><strong>External Microphones:</strong> Use a dedicated USB microphone instead of built-in laptop mics when possible.</li>
          <li><strong>Quiet Environments:</strong> Minimize background noise to help our diarization engine identify speakers more effectively.</li>
          <li><strong>Stable Connection:</strong> For live captures, ensure you have a stable internet connection for real-time processing.</li>
        </ul>
      </section>

      <section>
        <h2>Developer Resources</h2>
        <p>
            Looking to automate your workflow? Explore our <a href="/api" className="text-primary hover:underline">API Reference</a> for details on pulling meeting data into your own dashboard or CRM.
        </p>
      </section>
    </InfoPageContainer>
  )
}
