'use client'

import { useEffect } from 'react'

export default function ScriptLoader() {
  useEffect(() => {
    // Load CSS files
    const loadCSS = (href, id = null) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      if (id) link.id = id
      document.head.appendChild(link)
    }

    // Load script files
    const loadScript = (src, async = true) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.async = async
        script.onload = resolve
        script.onerror = reject
        document.body.appendChild(script)
      })
    }

    // Load CSS files
    loadCSS('/vendor/bootstrap-4.1.3/css/bootstrap.min.css')
    loadCSS('/vendor/materializeicon/material-icons.css')
    loadCSS('/css/style.css', 'theme')

    // Load scripts in order
    const loadScripts = async () => {
      try {
        await loadScript('/js/jquery-3.2.1.min.js', false)
        await loadScript('/vendor/bootstrap-4.1.3/js/bootstrap.min.js')
        await loadScript('/vendor/cookie/jquery.cookie.js')
        await loadScript('/js/main.js')
      } catch (error) {
        console.error('Error loading scripts:', error)
      }
    }

    loadScripts()

    return () => {
      // Cleanup is handled automatically by the browser
    }
  }, [])

  return null
}
