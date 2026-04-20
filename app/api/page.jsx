import { InfoPageContainer } from '@/components/layout/InfoPageContainer'

export default function ApiReferencePage() {
  return (
    <InfoPageContainer 
      title="API Reference" 
      subtitle="Integrate MeetAI's transcription and intelligence engine into your own applications."
    >
      <section className="mb-16">
        <h2>Authentication</h2>
        <p>
          All API requests must be authenticated using a Bearer Token. You can generate and manage your API keys in the <strong>Settings</strong> section of your dashboard.
        </p>
        <div className="not-prose bg-muted p-4 rounded-xl font-mono text-sm border">
            Authorization: Bearer YOUR_API_KEY
        </div>
      </section>

      <section className="mb-16">
        <h2>Endpoints</h2>
        
        <h3>GET /v1/meetings</h3>
        <p>Retrieve a list of all your processed meetings with pagination support.</p>
        
        <h3>GET /v1/meetings/:id</h3>
        <p>Fetch detailed metadata, transcripts, and action items for a specific meeting.</p>
        
        <h3>POST /v1/upload</h3>
        <p>Upload an audio or video file for asynchronous processing. Requires multipart/form-data.</p>
      </section>

      <section className="mb-16">
        <h2>Webhook Integration</h2>
        <p>
          Subscribe to <code>meeting.completed</code> events to receive automated notifications as soon as your summaries and action items are ready.
        </p>
      </section>

      <div className="p-12 rounded-3xl border border-dashed border-primary/40 bg-primary/5 text-center flex flex-col items-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-xl font-bold mb-2">Request Early Access</h3>
          <p className="text-muted-foreground mb-6 max-w-md">Our Public API is currently in Beta. Contact our engineering team for early access keys and sandbox environments.</p>
          <a href="mailto:codecrafter.2807@gmail.com" className="text-primary font-bold hover:underline">
                Contact Engineering
          </a>
      </div>
    </InfoPageContainer>
  )
}
