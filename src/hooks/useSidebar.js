'use client'

import { useState, useEffect } from 'react'

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  const openSidebar = () => {
    console.log('openSidebar')
    if (typeof document !== 'undefined') {
      document.body.classList.add('menu-left-open')
    }
    setIsOpen(true)
  }

  const closeSidebar = () => {
    console.log('closeSidebar')
    if (typeof document !== 'undefined') {
      document.body.classList.remove('menu-left-open')
    }
    setIsOpen(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isOpen) {
        closeSidebar()
      }
    }
  }, [])

  return { isOpen, openSidebar, closeSidebar }
}
