import { InfoPageContainer } from '@/components/layout/InfoPageContainer'

export default function CookiePolicyPage() {
  return (
    <InfoPageContainer 
      title="Cookie Policy" 
      subtitle="How we use cookies and similar technologies to improve your MeetAI experience."
    >
      <section className="mb-12">
        <h2>What are cookies?</h2>
        <p>
          Cookies are small text files that are stored on your device when you visit a website. They help us remember your preferences, keep you signed in, and analyze how you use our platform.
        </p>
      </section>

      <section className="mb-12">
        <h2>Types of Cookies We Use</h2>
        <div className="grid gap-6 md:grid-cols-2 mt-8 not-prose">
            <div className="p-6 rounded-2xl border border-border/40 bg-card/50">
                <h4 className="font-bold mb-2">Essential Cookies</h4>
                <p className="text-sm text-muted-foreground">Required for core functionality like secure login and workspace access. These cannot be disabled.</p>
            </div>
            <div className="p-6 rounded-2xl border border-border/40 bg-card/50">
                <h4 className="font-bold mb-2">Performance Cookies</h4>
                <p className="text-sm text-muted-foreground">Anonymous data about page usage and error rates to help us optimize the platform experience.</p>
            </div>
        </div>
      </section>

      <section className="mb-12">
        <h2>Managing Your Preferences</h2>
        <p>
          Most browsers allow you to control cookies through their settings. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience since it will no longer be personalized to you.
        </p>
      </section>
    </InfoPageContainer>
  )
}
