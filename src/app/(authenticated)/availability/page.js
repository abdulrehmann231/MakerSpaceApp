'use client'

import { useState, useEffect } from 'react'
import { getAvailability, accountInfo } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function AvailabilityPage() {
  const [availabilityData, setAvailabilityData] = useState([])
  const [firstname, setFirstname] = useState("")
  const [userRole, setUserRole] = useState("user")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
    const checkUserRole = async () => {
      try {
        const data = await accountInfo()
        if (data && data.code === 'FOUND' && data.msg) {
          setFirstname(data.msg.firstname || "")
          setUserRole(data.msg.user || "user")
          
          // If not admin, redirect to bookings
          if (data.msg.user !== 'admin') {
            router.push('/bookings')
            return
          }
          
          // Load availability data for admin
          await loadAvailability()
        } else if (data && data.code === "UNAUTHORIZED") {
          router.push('/login')
        } else {
          router.push('/bookings')
        }
      } catch (error) {
        console.error('Error checking user role:', error)
        router.push('/bookings')
      } finally {
        setLoading(false)
      }
    }

    checkUserRole()
  }, [router])

  const loadAvailability = async () => {
    try {
      const from = new Date().toISOString().split('T')[0]
      const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const data = await getAvailability(from, to)
      if (data && Array.isArray(data)) {
        setAvailabilityData(data)
      } else {
        setAvailabilityData([])
      }
    } catch (error) {
      console.error('Error loading availability:', error)
      setAvailabilityData([])
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTimeSlot = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }

  if (userRole !== 'admin') {
    return null // Will redirect in useEffect
  }

  return (
    <div>
      <h1>Availability</h1>
    </div>
  )
}
