import { Metadata } from 'next'
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
}