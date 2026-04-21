import Link from 'next/link'
import { Sparkles, Twitter, Github, Linkedin, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2 lg:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center">
              <div className="flex h-20 w-80 items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="MeetAI" className="h-full w-full object-contain scale-110 dark:hidden" />
                <img src="/logo_d.png" alt="MeetAI" className="hidden h-full w-full object-contain scale-110 dark:block" />
              </div>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Empowering high-performance teams with precise meeting intelligence and automated workspace solutions.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Link href="#" className="text-muted-foreground transition-all hover:text-primary hover:scale-110">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground transition-all hover:text-primary hover:scale-110">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground transition-all hover:text-primary hover:scale-110">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground transition-all hover:text-primary hover:scale-110">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Product</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/meetings" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Meetings
                </Link>
              </li>
              <li>
                <Link href="/live" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Live Capture
                </Link>
              </li>
              <li>
                <Link href="/external" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  External Tab
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Resources</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/docs" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/50 pt-8 text-center sm:flex sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MeetingAI. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-6 sm:mt-0">
            <span className="text-xs text-muted-foreground/60">Built for the future of work</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
