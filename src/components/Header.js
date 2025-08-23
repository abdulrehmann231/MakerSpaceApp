'use client'

import Link from "next/link"

export default function Header() {
  return (
    <header className="row m-0 fixed-header">
      <div className="left">
        <a  className="menu-left">
          <i className="material-icons text-white">menu</i>
        </a>
      </div>
      <div className="col center">
        <Link href="/" className="logo">
          <figure><img src="/img/logo-w.png" alt="" /></figure> My Bookings
        </Link>
      </div>
      <div className="right">
        <a  className="searchbtn">
          <i className="material-icons text-white">search</i>
        </a>
      </div>
    </header>
  )
}
