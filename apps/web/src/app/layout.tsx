import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import AppSmartBanner from '@/components/shared/AppSmartBanner'

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: 'PDF Suite - Solve any PDF problem',
  description: 'Instantly, privately, free.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans min-h-screen flex flex-col bg-background text-text-primary`}>
        <AppSmartBanner />
        <header className="border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-primary-to bg-clip-text text-transparent">
              PDF Suite
            </Link>
            <button className="bg-primary hover:bg-primary-to transition-colors px-4 py-2 rounded-lg text-sm font-medium">
              Get the App
            </button>
          </div>
        </header>
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <footer className="border-t border-white/10 py-8 text-center text-text-secondary text-sm">
          <p>© 2026 PDF Suite. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </footer>
      </body>
    </html>
  )
}