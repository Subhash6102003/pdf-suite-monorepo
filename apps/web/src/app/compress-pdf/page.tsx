import { Metadata } from 'next'
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
}