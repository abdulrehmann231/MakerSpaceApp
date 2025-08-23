'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar({ firstname = "User" }) {
  const pathname = usePathname()

  return (
    <div className="sidebar sidebar-left">
      <div className="profile-link">
        <a href="#account" className="media" style={{ display: "true" }}>
          <div className="w-auto h-100">
            <figure className="avatar avatar-40">
              <img src="/img/user1.png" alt="" />
            </figure>
          </div>
          <div className="media-body">
            <h5 className="mb-0">
              {firstname} <span className="status-online bg-success"></span>
            </h5>
            <p>Delft</p>
          </div>
        </a>
      </div>
      <nav className="navbar">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link 
              href="/account" 
              className={`sidebar-close ${pathname === '/account' ? 'active' : ''}`}
            >
              <div className="item-title">
                <i className="material-icons">account_circle</i>Account
              </div>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              href="/bookings" 
              className={`sidebar-close ${pathname === '/bookings' ? 'active' : ''}`}
            >
              <div className="item-title">
                <i className="material-icons">menu</i>Bookings
              </div>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              href="/contact" 
              className={`sidebar-close ${pathname === '/contact' ? 'active' : ''}`}
            >
              <div className="item-title">
                <i className="material-icons">add_location</i> Contact Us
              </div>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="profile-link text-center">
        <a href="/login" className="btn btn-link text-white btn-block">Logout</a>
      </div>
    </div>
  )
}
