import { InfoPageContainer } from '@/components/layout/InfoPageContainer'

export default function TermsPage() {
    return (
        <InfoPageContainer 
            title="Terms of Service" 
            subtitle="Please read these terms carefully before using the MeetAI platform."
        >
            <section className="mb-12">
                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing or using MeetAI, you agree to be bound by these terms. If you do not agree to all of the terms and conditions, you may not use the service.
                </p>
            </section>

            <section className="mb-12">
                <h2>2. User Responsibilities</h2>
                <p>
                    You are responsible for obtaining all necessary consents from participants before recording or uploading meeting audio. You agree not to use MeetAI for any unauthorized monitoring or illegal activities.
                </p>
            </section>

            <section className="mb-12">
                <h2>3. Intellectual Property</h2>
                <p>
                    You retain full ownership of the content you upload. MeetAI owns the underlying algorithms, interface, and software that power the analysis.
                </p>
            </section>

            <section className="mb-12">
                <h2>4. Termination</h2>
                <p>
                    We reserve the right to suspend or terminate access to our service for users who violate these terms or engage in fraudulent activity.
                </p>
            </section>
        </InfoPageContainer>
    );
}
