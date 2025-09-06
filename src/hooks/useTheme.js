'use client'

import { useState, useEffect } from 'react'

// Simple cookie utility functions
const getCookie = (name) => {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const setCookie = (name, value, days = 1) => {
  if (typeof document === 'undefined') return
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

export function useTheme() {
  const [themeColor, setThemeColor] = useState('color-theme-blue')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize theme from cookies
  useEffect(() => {
    if (typeof document === 'undefined') return

    const savedThemeColor = getCookie('theme-color')
    const savedThemeLayout = getCookie('theme-color-layout')
    
    // Apply saved theme color
    if (savedThemeColor) {
      setThemeColor(savedThemeColor)
      document.body.classList.remove('color-theme-blue')
      document.body.classList.add(savedThemeColor)
    }
    
    // Apply saved layout mode
    if (savedThemeLayout) {
      const isDark = savedThemeLayout === 'theme-dark'
      setIsDarkMode(isDark)
      document.body.classList.remove('theme-light')
      document.body.classList.add(savedThemeLayout)
    } else {
      // If no saved layout, check current DOM state
      const isCurrentlyDark = document.body.classList.contains('theme-dark')
      setIsDarkMode(isCurrentlyDark)
    }

    setIsInitialized(true)
  }, [])

  // Listen for theme changes from other components
  useEffect(() => {
    if (typeof document === 'undefined' || !isInitialized) return

    const observer = new MutationObserver(() => {
      const isCurrentlyDark = document.body.classList.contains('theme-dark')
      if (isCurrentlyDark !== isDarkMode) {
        setIsDarkMode(isCurrentlyDark)
      }
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [isInitialized, isDarkMode])

  const changeThemeColor = (newThemeColor) => {
    if (typeof document === 'undefined') return

    // Remove old theme classes
    document.body.classList.remove('color-theme-blue')
    document.body.classList.remove(themeColor)
    
    // Add new theme class
    document.body.classList.add(newThemeColor)
    
    // Update state and cookie
    setThemeColor(newThemeColor)
    setCookie('theme-color', newThemeColor)
  }

  const toggleDarkMode = (isDark) => {
    if (typeof document === 'undefined') return
    
    setIsDarkMode(isDark)
    
    if (isDark) {
      document.body.classList.remove('theme-light')
      document.body.classList.add('theme-dark')
      setCookie('theme-color-layout', 'theme-dark')
    } else {
      document.body.classList.remove('theme-dark')
      document.body.classList.add('theme-light')
      setCookie('theme-color-layout', 'theme-light')
    }
  }

  return {
    themeColor,
    isDarkMode,
    isInitialized,
    changeThemeColor,
    toggleDarkMode
  }
}
