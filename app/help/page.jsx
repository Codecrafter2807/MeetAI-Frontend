import { InfoPageContainer } from '@/components/layout/InfoPageContainer'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Mail, Phone, MessageSquare } from 'lucide-react'

const faqs = [
  {
    question: "How secure is my meeting data?",
    answer: "We use enterprise-grade encryption (AES-256) for all stored audio and transcripts. Your data is encrypted at rest and in transit, and we never use your proprietary data to train models for other users."
  },
  {
    question: "Which meeting platforms do you support?",
    answer: "MeetAI works with Zoom, Microsoft Teams, and Google Meet through our external tab capture and direct upload features. We also support standard audio/video formats for manual uploads."
  },
  {
    question: "Can I manage speaker identification manually?",
    answer: "Yes. In the meeting detail view, you can rename speakers and even merge segments if the AI misidentifies distinct speakers due to audio quality."
  },
  {
    question: "What languages are supported for transcription?",
    answer: "We currently support over 50 languages with native-level accuracy, including English, Spanish, French, German, Chinese, and Hindi."
  }
]

export default function HelpCenterPage() {
  return (
    <InfoPageContainer 
      title="Help Center" 
      subtitle="Find answers to common questions or reach out to our dedicated support team."
    >
      <section className="mb-20">
        <h2>Frequently Asked Questions</h2>
        <div className="mt-8 not-prose border rounded-2xl overflow-hidden bg-card/30">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="px-6 border-b-0 border-t first:border-t-0">
                <AccordionTrigger className="text-left font-semibold py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="mb-20">
        <h2>Direct Support</h2>
        <p className="mb-10">Our support engineers are available Monday through Friday, 9 AM - 6 PM IST, to help with technical integration or billing inquiries.</p>
        
        <div className="grid gap-6 md:grid-cols-2 not-prose">
          <div className="flex items-start gap-5 p-6 rounded-3xl border border-border/40 bg-gradient-to-br from-blue-500/5 to-transparent">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold">Email Support</h4>
              <p className="text-muted-foreground text-sm mb-4">Expect a response within 2-4 business hours.</p>
              <a href="mailto:codecrafter.2807@gmail.com" className="text-primary font-bold hover:underline">
                codecrafter.2807@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-5 p-6 rounded-3xl border border-border/40 bg-gradient-to-br from-purple-500/5 to-transparent">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-lg shadow-purple-500/20">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold">Direct Line</h4>
              <p className="text-muted-foreground text-sm mb-4">Available for critical issues and enterprise support.</p>
              <a href="tel:8968850149" className="text-primary font-bold hover:underline">
                +91 89688-50149
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="p-8 rounded-3xl bg-primary text-primary-foreground text-center not-prose shadow-2xl shadow-primary/20">
        <h3 className="text-2xl font-bold mb-3">Enterprise Solutions</h3>
        <p className="mb-6 opacity-90 max-w-xl mx-auto italic">"We provide custom AI training and dedicated account managers for organizations with over 50 seats."</p>
        <button className="bg-white text-primary font-bold px-8 py-3 rounded-xl transition-transform hover:scale-105">
            Upgrade to Enterprise
        </button>
      </section>
    </InfoPageContainer>
  )
}
