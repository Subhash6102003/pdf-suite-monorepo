const fs = require('fs');
const path = require('path');

const files = {
  'postcss.config.js': `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
  'src/app/layout.tsx': `import type { Metadata } from 'next'
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
      <body className={\`\${outfit.variable} font-sans min-h-screen flex flex-col bg-background text-text-primary\`}>
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
}`,
  'src/app/page.tsx': `import ToolCard from '@/components/shared/ToolCard'
import { FileDown, Layers, Scissors, FileText, Image as ImageIcon } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />
      
      <div className="max-w-4xl w-full text-center space-y-6 mb-16 z-10 pt-12">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Solve any PDF problem — <br/>
          <span className="bg-gradient-to-r from-primary to-primary-to bg-clip-text text-transparent">
            instantly, privately, free
          </span>
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          No account required for basic tools. Process files securely in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full z-10">
        <ToolCard 
          href="/compress-pdf" 
          icon={<FileDown className="w-8 h-8" />} 
          title="Compress PDF" 
          description="Reduce file size while maintaining quality." 
        />
        <ToolCard 
          href="/merge-pdf" 
          icon={<Layers className="w-8 h-8" />} 
          title="Merge PDF" 
          description="Combine multiple PDFs into one document." 
        />
        <ToolCard 
          href="/split-pdf" 
          icon={<Scissors className="w-8 h-8" />} 
          title="Split PDF" 
          description="Extract pages or split into multiple files." 
        />
        <ToolCard 
          href="/pdf-to-word" 
          icon={<FileText className="w-8 h-8" />} 
          title="PDF to Word" 
          description="Convert PDFs to editable DOCX documents." 
        />
        <ToolCard 
          href="/jpg-to-pdf" 
          icon={<ImageIcon className="w-8 h-8" />} 
          title="JPG to PDF" 
          description="Convert images to a single PDF document." 
        />
      </div>
      
      <div className="mt-24 text-center z-10">
        <p className="text-success font-medium flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Privacy Promise: Browser-based tools never send your files to our servers.
        </p>
      </div>
    </div>
  )
}`,
  'src/components/shared/ToolCard.tsx': `import Link from 'next/link'

export default function ToolCard({ href, icon, title, description }: { href: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <Link href={href} className="group flex flex-col p-6 bg-surface border border-white/10 rounded-xl hover:border-primary/50 hover:bg-white/5 transition-all duration-200 hover:-translate-y-1">
      <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary text-sm flex-1">{description}</p>
      <div className="mt-4 text-primary font-medium text-sm flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        Try it →
      </div>
    </Link>
  )
}`,
  'src/components/shared/AppSmartBanner.tsx': `'use client'
import { useState, useEffect } from 'react'

export default function AppSmartBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const dismissed = localStorage.getItem('banner-dismissed')
    if (isMobile && !dismissed) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  return (
    <div className="bg-primary px-4 py-3 flex items-center justify-between">
      <p className="text-sm font-medium">Open in PDF Suite App for the best experience.</p>
      <div className="flex items-center gap-4">
        <button className="bg-white text-primary px-3 py-1 rounded text-xs font-bold">OPEN</button>
        <button 
          onClick={() => { setShow(false); localStorage.setItem('banner-dismissed', '1') }}
          className="text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  )
}`,
  'src/components/shared/ErrorMessage.tsx': `export default function ErrorMessage({ message, onRetry }: { message: string, onRetry?: () => void }) {
  return (
    <div className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-center justify-between text-error">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 bg-error/20 rounded-lg hover:bg-error/30 transition-colors text-sm font-medium">
          Retry
        </button>
      )}
    </div>
  )
}`,
  'src/app/compress-pdf/page.tsx': `import { Metadata } from 'next'
import DropZone from '@/components/upload/DropZone'

export const metadata: Metadata = {
  title: 'Compress PDF - Reduce PDF size online free',
  description: 'Reduce PDF file size while maintaining quality.',
}

export default function CompressPDF() {
  return (
    <div className="max-w-4xl mx-auto w-full p-8 pt-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Compress PDF</h1>
        <p className="text-text-secondary">Reduce file size while maintaining quality.</p>
      </div>
      
      <div className="bg-surface border border-white/10 rounded-2xl p-8 mb-16">
        <DropZone tool="compress" />
      </div>
      
      <div className="space-y-16">
        <section>
          <h2 className="text-2xl font-bold mb-4">How it works</h2>
          <p className="text-text-secondary">Our client-side compression technology reduces your PDF size without sending the file to any server.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-4">FAQ</h2>
          <div className="space-y-4">
            <details className="bg-surface p-4 rounded-lg border border-white/5">
              <summary className="font-medium cursor-pointer">Is it safe?</summary>
              <p className="mt-2 text-text-secondary text-sm">Yes. Files never leave your browser.</p>
            </details>
          </div>
        </section>
      </div>
    </div>
  )
}`,
  'src/app/merge-pdf/page.tsx': `import { Metadata } from 'next'
import DropZone from '@/components/upload/DropZone'

export const metadata: Metadata = {
  title: 'Merge PDF - Combine multiple PDFs',
  description: 'Combine multiple PDFs into one document.',
}

export default function MergePDF() {
  return (
    <div className="max-w-4xl mx-auto w-full p-8 pt-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Merge PDF</h1>
        <p className="text-text-secondary">Combine multiple PDFs into one document.</p>
      </div>
      <div className="bg-surface border border-white/10 rounded-2xl p-8">
        <DropZone tool="merge" multi />
      </div>
    </div>
  )
}`,
  'src/app/split-pdf/page.tsx': `import { Metadata } from 'next'
import DropZone from '@/components/upload/DropZone'

export const metadata: Metadata = {
  title: 'Split PDF - Extract pages from PDF',
  description: 'Extract pages or split into multiple files.',
}

export default function SplitPDF() {
  return (
    <div className="max-w-4xl mx-auto w-full p-8 pt-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Split PDF</h1>
        <p className="text-text-secondary">Extract pages or split into multiple files.</p>
      </div>
      <div className="bg-surface border border-white/10 rounded-2xl p-8">
        <DropZone tool="split" />
      </div>
    </div>
  )
}`,
  'src/app/pdf-to-word/page.tsx': `import { Metadata } from 'next'
import DropZone from '@/components/upload/DropZone'

export const metadata: Metadata = {
  title: 'PDF to Word - Convert PDF to DOCX',
  description: 'Convert PDFs to editable DOCX documents.',
}

export default function PDFToWord() {
  return (
    <div className="max-w-4xl mx-auto w-full p-8 pt-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">PDF to Word</h1>
        <p className="text-text-secondary">Convert PDFs to editable DOCX documents.</p>
      </div>
      <div className="bg-surface border border-white/10 rounded-2xl p-8">
        <p className="mb-4 text-sm text-center text-primary bg-primary/10 py-2 rounded">
          Note: Your file will be securely uploaded to our servers for conversion.
        </p>
        <DropZone tool="pdf-to-word" />
      </div>
    </div>
  )
}`,
  'src/app/jpg-to-pdf/page.tsx': `import { Metadata } from 'next'
import DropZone from '@/components/upload/DropZone'

export const metadata: Metadata = {
  title: 'JPG to PDF - Convert images to PDF',
  description: 'Convert images to a single PDF document.',
}

export default function JPGToPDF() {
  return (
    <div className="max-w-4xl mx-auto w-full p-8 pt-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">JPG to PDF</h1>
        <p className="text-text-secondary">Convert images to a single PDF document.</p>
      </div>
      <div className="bg-surface border border-white/10 rounded-2xl p-8">
        <DropZone tool="jpg-to-pdf" multi accept="image/jpeg, image/png" />
      </div>
    </div>
  )
}`,
  'src/app/(legal)/privacy/page.tsx': `export default function Privacy() {
  return <div className="max-w-4xl mx-auto p-8 prose prose-invert pt-16"><h1>Privacy Policy</h1><p>We process basic tools locally. Server tools upload securely.</p></div>
}`,
  'src/app/(legal)/terms/page.tsx': `export default function Terms() {
  return <div className="max-w-4xl mx-auto p-8 prose prose-invert pt-16"><h1>Terms of Service</h1><p>By using PDF Suite, you agree to these terms.</p></div>
}`,
  'src/components/upload/DropZone.tsx': `'use client'
import { useState } from 'react'

export default function DropZone({ tool, multi = false, accept = '.pdf' }: { tool: string, multi?: boolean, accept?: string }) {
  const [drag, setDrag] = useState(false)
  
  return (
    <div 
      className={\`border-2 border-dashed rounded-xl p-12 text-center transition-all \${drag ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-white/20 hover:border-white/40'}\`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); }}
    >
      <p className="mb-4 text-xl font-medium">Drag & drop files here</p>
      <label className="bg-primary hover:bg-primary-to px-6 py-3 rounded-lg cursor-pointer font-medium inline-block transition-colors">
        Select Files
        <input type="file" multiple={multi} accept={accept} className="hidden" />
      </label>
    </div>
  )
}`,
  'src/components/upload/MultiFileList.tsx': `export default function MultiFileList() { return null; }`,
  'src/components/processing/StageIndicator.tsx': `export default function StageIndicator() { return null; }`,
  'src/components/processing/JobPoller.tsx': `export default function JobPoller() { return null; }`,
  'src/components/results/SizeComparison.tsx': `export default function SizeComparison() { return null; }`,
  'src/components/results/DownloadButton.tsx': `export default function DownloadButton() { return null; }`,
  'src/components/tools/compress/CompressionLevelPicker.tsx': `export default function CompressionLevelPicker() { return null; }`,
  'src/components/tools/split/PageRangeInput.tsx': `export default function PageRangeInput() { return null; }`,
  'src/lib/pdf/compress.client.ts': `export const compressPDF = async () => {}`,
  'src/lib/pdf/merge.client.ts': `export const mergePDF = async () => {}`,
  'src/lib/pdf/split.client.ts': `export const splitPDF = async () => {}`,
  'src/lib/pdf/jpg-to-pdf.client.ts': `export const jpgToPdf = async () => {}`,
  'src/lib/api/client.ts': `export const api = {}`,
  'src/lib/api/jobs.ts': `export const jobs = {}`,
  'src/lib/errors.ts': `export const errors = {}`,
  'src/hooks/useFileProcessor.ts': `export const useFileProcessor = () => {}`,
  'src/hooks/useJob.ts': `export const useJob = () => {}`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
