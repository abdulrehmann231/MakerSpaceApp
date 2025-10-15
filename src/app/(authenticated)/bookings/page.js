'use client'

import { useState, useEffect } from 'react'
import { bookings, cancelBooking, accountInfo, formatDate } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Loader from '@/components/Loader'
export default function BookingsPage() {
  const [bookingsData, setBookingsData] = useState([])
  const [firstname, setFirstname] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  useEffect(() => {
    // Load bookings data
    const loadBookings = async () => {
      try {
        const data = await bookings()
        if (data && data.code === "FOUND") { 
          setBookingsData(data.msg || [])
        } else if (data && data.code === "UNAUTHORIZED" || data && data.code === "ERROR") {
          router.push('/login')
          setBookingsData([])
        }
        else{
          console.log('No bookings found or other error')
          setBookingsData([])
        }
      } catch (error) {
        console.error('Error loading bookings:', error)
        setBookingsData([])
      }
    }

    // Load account info
    const loadAccountInfo = async () => {
      try {
        const data = await accountInfo()
        if (data && data.msg) {
          setFirstname(data.msg.firstname || "User")
        }
        else if (data && data.code === "UNAUTHORIZED" || data && data.code === "ERROR") {
          router.push('/login')
          setFirstname("")
        }
        else{
          setFirstname("")
        }
      } catch (error) {
        console.error('Error loading account info:', error)
      }
    }

    const loadData = async () => {
      await Promise.all([loadBookings(), loadAccountInfo()])
      setLoading(false)
    }
    
    loadData()
  }, [])

  const handleCancelBooking = async (e) => {
    e.preventDefault()
    const bookingId = parseInt(e.target.dataset.id)
    
    try {
      const data = await cancelBooking(bookingId)
      
      if (data ) {
      // Reload bookings after cancellation
      setTimeout(async () => {
        try {
          const data = await bookings()
          if (data && data.code === "FOUND") {
             setBookingsData(data.msg || [])
          }
          else{
            setBookingsData([])
          }
        } catch (error) {
          console.error('Error reloading bookings:', error)
        }
      }, 500)
    }
    else{
      console.log('Failed to cancel booking, redirecting to login')
      router.push('/login')
    }
    } catch (error) {
      console.error('Error cancelling booking:', error)
    }
  }

  const printBooking = (booking, filter) => {
    const oneHour = 1000 * 60 * 60
    const bookingTime = Date.parse(booking.date) + parseInt(booking.start) * oneHour
    const date = new Date()
    const time = date

    if (filter === undefined || 
        (filter === "upcoming" && bookingTime > time) || 
        (filter === "past" && bookingTime <= time)) {
      return (
        <li key={booking.id} className="list-group-item">
          <div className="media shadow-15">
            <div className="media-body">
              <h5>{formatDate(new Date(bookingTime))}</h5>
              <p className="mb-0">{booking.start}-{booking.end}</p>
              {booking.description && (
                <p className="mt-1 text-muted mb-0" style={{whiteSpace: 'pre-wrap'}}>
                  {booking.description}
                </p>
              )}
              <h2 className="title-number-carousel color-primary">
                <span className="text-primary">{booking.npeople}</span>
                <small> people</small>
              </h2>
            </div>
            <div className="w-auto">
              {(bookingTime > time) && (
                <a 
                  href="#" 
                  onClick={handleCancelBooking} 
                  data-id={booking.id} 
                  className="text-danger effort-time"
                >
                  Cancel
                </a>
              )}
            </div>
          </div>
        </li>
      )
    }
    return null
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div>
          <div className="col-12 mt-3 mb-4">
            <p className="text-uppercase font-weight-bold text-primary">Welcome,</p>
            <h1>
              <span className="font-weight-light small">Good Morning</span>
              <br />
              <b className="text-primary">{firstname}</b>
            </h1>
          </div>
          
          <div className="row mx-0 mt-3">
            <div className="col">
              <a 
                 
                className="btn btn-block btn-primary rounded border-0" 
                data-toggle="modal" 
                data-target="#hireme"
              >
                New booking
              </a>
            </div>
          </div>
          
          <h2 className="block-title">upcoming bookings</h2>
          {bookingsData && bookingsData.length > 0 ? (
            <ul className="list-group media-list" id="bookings-list">
              {bookingsData.map((booking) => printBooking(booking, "upcoming"))}
            </ul>
          ) : (
            <div className="col">no bookings</div>
          )}
          
          <h2 className="block-title">past bookings</h2>
          {bookingsData && bookingsData.length > 0 ? (
            <ul className="list-group media-list" id="bookings-list">
              {bookingsData.map((booking) => printBooking(booking, "past"))}
            </ul>
          ) : (
            <div className="col">no bookings</div>
          )}

        </div>
  )
}
