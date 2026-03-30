'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/Loader'
import { accountInfo } from '@/lib/api'

export default function AdminBookingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [firstname, setFirstname] = useState('User')
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const data = await accountInfo()
      if (!data || data.code !== 'FOUND') {
        router.push('/login')
        return
      }

      const info = data.msg || {}
      setFirstname(info.firstname || 'User')
      if ((info.user || '') !== 'admin') {
        router.push('/account')
        return
      }

      try {
        const response = await fetch('/api/admin-bookings', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
        const payload = await response.json()

        if (!response.ok || payload.code !== 'FOUND') {
          setError(payload.msg || 'Failed to load bookings')
          setBookings([])
        } else {
          setBookings(payload.msg || [])
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load bookings')
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) return <Loader />

  return (
    <div className="no-top-gap">
      <div className="col-12 mt-3 mb-4">
        <p className="text-uppercase font-weight-bold text-primary">Admin</p>
        <h1>
          <span className="font-weight-light small">Future bookings in DB</span>
          <br />
          <b className="text-primary">{firstname}</b>
        </h1>
      </div>

      {error && <p className="text-danger">{error}</p>}

      <h2 className="block-title">Upcoming bookings ({bookings.length})</h2>
      {bookings.length === 0 ? (
        <div className="col">no future bookings</div>
      ) : (
        <ul className="list-group media-list">
          {bookings.map((booking) => (
            <li key={booking.id} className="list-group-item">
              <div className="media shadow-15">
                <div className="media-body">
                  <p className="mb-1"><b>id:</b> {String(booking.id)}</p>
                  <p className="mb-1"><b>date:</b> {String(booking.date)}</p>
                  <p className="mb-1"><b>start-end:</b> {String(booking.start)}-{String(booking.end)}</p>
                  <p className="mb-1"><b>user:</b> {String(booking.user || '')}</p>
                  <p className="mb-1"><b>npeople:</b> {String(booking.npeople ?? '')}</p>
                  <p className="mb-0"><b>description:</b> {String(booking.description || '')}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

