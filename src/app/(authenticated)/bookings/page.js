'use client'

import { useState, useEffect } from 'react'
import { bookings, cancelBooking } from '@/lib/api'
import { accountInfo } from '@/lib/api'
import { formatDate } from '@/lib/api'

export default function BookingsPage() {
  const [bookingsData, setBookingsData] = useState([])
  const [firstname, setFirstname] = useState("User")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load account info
      const accountData = await accountInfo()
      if (accountData && accountData.code === 'FOUND' && accountData.msg && accountData.msg.firstname) {
        setFirstname(accountData.msg.firstname)
      }

      // Load bookings
      const data = await bookings()
      if (data && data.code === "FOUND") {
        setBookingsData(data.msg || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleCancelBooking = async (e) => {
    e.preventDefault()
    const bookingId = e.target.getAttribute('data-id')
    
    try {
      await cancelBooking(bookingId)
      // Reload bookings after cancellation
      setTimeout(async () => {
        try {
          const data = await bookings()
          if (data && data.code === "FOUND") {
            setBookingsData(data.msg || [])
          }
        } catch (error) {
          console.error('Error reloading bookings:', error)
        }
      }, 500)
    } catch (error) {
      console.error('Error cancelling booking:', error)
    }
  }

  const openBookingModal = () => {
    // Dispatch custom event to open modal
    window.dispatchEvent(new Event('openBookingModal'))
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
              <button 
                className="btn btn-block btn-primary rounded border-0" 
                onClick={openBookingModal}
              >
                New booking
              </button>
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
