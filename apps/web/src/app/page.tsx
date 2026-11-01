import ToolCard from '@/components/shared/ToolCard'
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
}