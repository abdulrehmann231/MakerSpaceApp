'use client'

import SearchBar from './SearchBar'
import Header from './Header'
import Footer from './Footer'

export default function Page({ children }) {
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
