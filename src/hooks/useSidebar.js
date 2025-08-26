'use client'

import { useState, useEffect } from 'react'

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(document.body.classList.contains('menu-left-open'))
  }, [document])


  const openSidebar = () => {
    console.log('openSidebar')

    document.body.classList.add('menu-left-open')
    setIsOpen(true)
  }

  const closeSidebar = () => {
    console.log('closeSidebar')

    document.body.classList.remove('menu-left-open')
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
