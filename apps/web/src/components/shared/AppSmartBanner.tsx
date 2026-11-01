'use client'
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
}