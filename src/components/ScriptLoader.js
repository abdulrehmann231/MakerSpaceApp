'use client'

import { useEffect } from 'react'

export default function ScriptLoader() {
  useEffect(() => {
    // Load main.js script after component mounts
    const script = document.createElement('script')
    script.src = '/js/main.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  return null
}
