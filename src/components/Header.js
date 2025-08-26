'use client'

import Link from "next/link"
import { useSidebar } from '@/hooks/useSidebar'
import { useSearch } from '@/hooks/useSearch'

export default function Header() {
  const { openSidebar } = useSidebar()
  const { openSearch } = useSearch()

  return (
    <header className="row m-0 fixed-header">
      <div className="left">
        <a className="menu-left cursor-pointer" onClick={openSidebar}>
          <i className="material-icons text-white">menu</i>
        </a>
      </div>
      <div className="col center">
        <Link href="/" className="logo">
          <figure><img src="/img/logo-w.png" alt="" /></figure> My Bookings
        </Link>
      </div>
      <div className="right">
        <a className="searchbtn cursor-pointer" onClick={openSearch}>
          <i className="material-icons text-white">search</i>
        </a>
      </div>
    </header>
  )
}
