'use client'
import { useState } from 'react'

export default function DropZone({ tool, multi = false, accept = '.pdf' }: { tool: string, multi?: boolean, accept?: string }) {
  const [drag, setDrag] = useState(false)
  
  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${drag ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-white/20 hover:border-white/40'}`}
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
}