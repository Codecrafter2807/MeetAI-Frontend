
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { GoogleProvider } from '@/components/google-provider'
import { ChatBotWidget } from '@/components/chatbot/ChatBotWidget'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'MeetingAI - AI Meeting Assistant',
  description: 'AI-powered meeting transcription, summaries, and action items',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo (1).png',
    apple: '/logo (1).png',
    shortcut: '/logo (1).png',
  },
  openGraph: {
    title: 'MeetingAI - AI Meeting Assistant',
    description: 'AI-powered meeting transcription, summaries, and action items',
    images: [{ url: '/logo (1).png' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeetingAI - AI Meeting Assistant',
    description: 'AI-powered meeting transcription, summaries, and action items',
    images: ['/logo (1).png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GoogleProvider>
            {children}
            <ChatBotWidget />
            <Toaster richColors position="top-right" />
          </GoogleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

