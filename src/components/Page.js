'use client'

import { useEffect } from 'react'
import SearchBar from './SearchBar'
import Header from './Header'
import Footer from './Footer'
import { useStickyFooter } from '@/hooks/useStickyFooter'

export default function Page({ children }) {
  useStickyFooter()

  return (
    <div className="page">
      <SearchBar />
      <Header />
      <div className="page-content">
        <div className="content-sticky-footer">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  )
}
