import { InfoPageContainer } from '@/components/layout/InfoPageContainer'

export default function PrivacyPage() {
    return (
        <InfoPageContainer 
            title="Privacy Policy" 
            subtitle="Your data security and privacy are our highest priorities. Learn how we handle your information."
        >
            <section className="mb-12">
                <h2>1. Data We Collect</h2>
                <p>
                    We collect meeting audio and transcripts solely to provide our AI services. This includes metadata such as participant names (if provided) and meeting timestamps.
                </p>
                <p>
                    We also collect basic account information like your name, email address, and professional role to personalize your experience.
                </p>
            </section>

            <section className="mb-12">
                <h2>2. How We Use Data</h2>
                <p>
                    Transcripts are processed to generate summaries, action items, and strategic insights exclusively for your account. We do not sell your data to third parties.
                </p>
            </section>

            <section className="mb-12">
                <h2>3. Security Measures</h2>
                <p>
                    We use industry-standard encryption protocols (TLS 1.3 for data in transit and AES-256 for data at rest) to protect your information from unauthorized access.
                </p>
            </section>
        </InfoPageContainer>
    );
}
