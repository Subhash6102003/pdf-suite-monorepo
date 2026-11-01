import { Metadata } from 'next'
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
}