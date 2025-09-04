'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSidebar } from '@/hooks/useSidebar'
import { signout } from '@/lib/api'

export default function Sidebar({ firstname = "User", userRole = "user" }) {
  const pathname = usePathname()
  const router = useRouter()
  const { closeSidebar, isOpen } = useSidebar()

  const handleLogout = async (e) => {
    e.preventDefault()
    await signout()
    router.push('/login')
    handleSidebarClose()
  }

  const handleSidebarClose = () => {
    closeSidebar()
  }

  // Handle click outside sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      
      // Check if sidebar is open
      if (document.body.classList.contains('menu-left-open')) {
        // Check if click is outside sidebar and not on sidebar elements
        const isSidebarClick = event.target.closest('.sidebar') || 
                              event.target.closest('.profile-link') || 
                              event.target.closest('.navbar') || 
                              event.target.closest('.nav-item') || 
                              event.target.closest('.item-title') || 
                              event.target.closest('.material-icons') || 
                              event.target.closest('.btn') || 
                              event.target.closest('.btn-link') || 
                              event.target.closest('.btn-block')

        if (!isSidebarClick) {
          closeSidebar()
        }
      }
    }

    // Add event listener
    document.addEventListener('click', handleClickOutside)

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen, closeSidebar])

  return (
    <div className="sidebar sidebar-left">
      <div className="profile-link">
        <a href="/account" className="media" style={{ display: "true" }}>
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
              onClick={handleSidebarClose}
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
              onClick={handleSidebarClose}
            >
              <div className="item-title">
                <i className="material-icons ">menu</i>Bookings
              </div>
            </Link>
          </li>
          {userRole === 'admin' && (
            <li className="nav-item">
              <Link 
                href="/availability" 
                className={`sidebar-close ${pathname === '/availability' ? 'active' : ''}`}
                onClick={handleSidebarClose}
              >
                <div className="item-title">
                  <i className="material-icons">schedule</i>Availability
                </div>
              </Link>
            </li>
          )}
          <li className="nav-item">
            <Link 
              href="/contact" 
              className={`sidebar-close ${pathname === '/contact' ? 'active' : ''}`}
              onClick={handleSidebarClose}
            >
              <div className="item-title">
                <i className="material-icons">add_location</i> Contact Us
              </div>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="profile-link text-center">
        <a href="#" onClick={handleLogout} className="btn btn-link text-white btn-block">Logout</a>
      </div>
    </div>
  )
}
