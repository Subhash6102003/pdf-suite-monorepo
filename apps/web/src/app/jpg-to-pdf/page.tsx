import { Metadata } from 'next'
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
}