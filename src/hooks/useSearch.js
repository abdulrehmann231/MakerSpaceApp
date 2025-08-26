'use client'

import { useState } from 'react'

export function useSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const openSearch = () => {
    setIsSearchOpen(true)
    const searchControl = document.querySelector('.searchcontrol')
    if (searchControl) {
      searchControl.classList.add('active')
    }
  }

  const closeSearch = () => {
    setIsSearchOpen(false)
    const searchControl = document.querySelector('.searchcontrol')
    if (searchControl) {
      searchControl.classList.remove('active')
    }
  }

  return { isSearchOpen, openSearch, closeSearch }
}
