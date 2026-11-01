import { Metadata } from 'next'
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
}