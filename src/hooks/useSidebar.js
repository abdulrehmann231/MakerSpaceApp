'use client'

import { useState, useEffect } from 'react'

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof document !== 'undefined') {
      setIsOpen(document.body.classList.contains('menu-left-open'))
    }
  }, []) // Remove document from dependencies

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
  }, []) // Add closeSidebar to dependencies for stability

  return { isOpen, openSidebar, closeSidebar }
}
